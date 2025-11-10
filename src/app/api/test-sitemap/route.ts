import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  salonCount?: number;
  error?: string;
  files?: string[];
}

/**
 * Test endpoint to verify R2 data and sitemap generation
 * Visit: /api/test-sitemap
 */
export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as TestResult[],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
    }
  };

  // Test 1: Check R2 credentials
  const hasR2Creds = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
  results.tests.push({
    test: 'R2 Credentials',
    passed: hasR2Creds,
    details: hasR2Creds ? 'Credentials are set' : 'Credentials are missing',
  });

  // Test 2-4: Try to fetch data for a few major cities
  const testCities = [
    { state: 'California', city: 'Los Angeles' },
    { state: 'New York', city: 'New York' },
    { state: 'Texas', city: 'Houston' },
  ];

  for (const testCity of testCities) {
    try {
      console.log(`Testing ${testCity.city}, ${testCity.state}...`);
      const cityData = await getCityDataFromR2(testCity.state, testCity.city);

      const passed = !!(cityData && cityData.salons && cityData.salons.length > 0);
      results.tests.push({
        test: `R2 Data: ${testCity.city}, ${testCity.state}`,
        passed,
        details: passed
          ? `Found ${cityData?.salons?.length} salons`
          : 'No data found in R2',
        salonCount: cityData?.salons?.length || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorString = error instanceof Error ? error.toString() : String(error);
      results.tests.push({
        test: `R2 Data: ${testCity.city}, ${testCity.state}`,
        passed: false,
        details: `Error: ${errorMessage}`,
        error: errorString,
      });
    }
  }

  // Test 5: Check VERCEL_URL environment variable
  results.tests.push({
    test: 'VERCEL_URL Environment',
    passed: !!process.env.VERCEL_URL,
    details: process.env.VERCEL_URL
      ? `VERCEL_URL = ${process.env.VERCEL_URL}`
      : 'VERCEL_URL not set (may be issue in local dev)',
  });

  // Test 6: Check if city JSON files exist using VERCEL_URL approach
  try {
    // Use same logic as citiesDataFetcher
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://nailartai.app');

    const testUrl = `${baseUrl}/data/cities/california.json`;
    console.log(`Testing city JSON fetch from: ${testUrl}`);

    const response = await fetch(testUrl);

    if (response.ok) {
      const data = await response.json();
      const hasValidStructure = data.state && Array.isArray(data.cities);

      results.tests.push({
        test: 'City JSON Files (VERCEL_URL)',
        passed: hasValidStructure,
        details: hasValidStructure
          ? `California JSON accessible with ${data.cities.length} cities from ${baseUrl}`
          : 'JSON file accessible but invalid structure',
        files: [`URL used: ${testUrl}`],
      });
    } else {
      results.tests.push({
        test: 'City JSON Files (VERCEL_URL)',
        passed: false,
        details: `HTTP fetch failed: ${response.status} ${response.statusText} from ${testUrl}`,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.tests.push({
      test: 'City JSON Files (VERCEL_URL)',
      passed: false,
      details: `Error fetching JSON: ${errorMessage}`,
    });
  }

  // Test 7: Try to import JSON modules directly (NEW APPROACH - what sitemaps use now)
  try {
    const { getAllStateCityData } = await import('@/lib/citiesDataImporter');
    console.log('Testing citiesDataImporter (module imports)...');
    const statesMap = getAllStateCityData();

    const statesCount = statesMap.size;
    const totalCities = Array.from(statesMap.values()).reduce((sum, state) => sum + (state.cities?.length || 0), 0);

    results.tests.push({
      test: 'Import JSON Modules (NEW)',
      passed: statesCount > 0,
      details: statesCount > 0
        ? `✅ Successfully imported ${statesCount} states with ${totalCities} total cities (bundled as modules)`
        : 'Failed to import JSON modules',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.tests.push({
      test: 'Import JSON Modules (NEW)',
      passed: false,
      details: `Error: ${errorMessage}`,
      error: error instanceof Error ? error.stack : String(error),
    });
  }

  // Test 8: Try OLD HTTP fetch approach (deprecated, for comparison)
  try {
    const { fetchAllStateCityData } = await import('@/lib/citiesDataFetcher');
    console.log('Testing citiesDataFetcher (HTTP fetching - OLD)...');
    const statesMap = await fetchAllStateCityData();

    const statesCount = statesMap.size;
    const totalCities = Array.from(statesMap.values()).reduce((sum, state) => sum + (state.cities?.length || 0), 0);

    results.tests.push({
      test: 'HTTP Fetch States (OLD - deprecated)',
      passed: statesCount > 0,
      details: statesCount > 0
        ? `Fetched ${statesCount} states with ${totalCities} total cities via HTTP`
        : 'Failed to fetch any state data via HTTP (expected - has 401 issue)',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.tests.push({
      test: 'HTTP Fetch States (OLD - deprecated)',
      passed: false,
      details: `Error: ${errorMessage} (expected - sitemaps now use module imports instead)`,
    });
  }

  // Calculate summary
  results.summary.totalTests = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.passed).length;
  results.summary.failed = results.tests.filter(t => !t.passed).length;

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
