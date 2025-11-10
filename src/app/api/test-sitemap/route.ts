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

  // Test 5: Check if city JSON files exist
  try {
    // In serverless, public/ is served via CDN, not filesystem
    // So we fetch via HTTP instead
    const testUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nailartai.app'}/data/cities/california.json`;
    const response = await fetch(testUrl);

    if (response.ok) {
      const data = await response.json();
      const hasValidStructure = data.state && Array.isArray(data.cities);

      results.tests.push({
        test: 'City JSON Files',
        passed: hasValidStructure,
        details: hasValidStructure
          ? `California JSON accessible with ${data.cities.length} cities`
          : 'JSON file accessible but invalid structure',
        files: ['Accessible via HTTP at /data/cities/*.json'],
      });
    } else {
      results.tests.push({
        test: 'City JSON Files',
        passed: false,
        details: `HTTP fetch failed: ${response.status} ${response.statusText}`,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.tests.push({
      test: 'City JSON Files',
      passed: false,
      details: `Error fetching JSON: ${errorMessage}`,
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
