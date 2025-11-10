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
    const fs = await import('fs/promises');
    const path = await import('path');
    const citiesDir = path.join(process.cwd(), 'public', 'data', 'cities');
    const files = await fs.readdir(citiesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    results.tests.push({
      test: 'City JSON Files',
      passed: jsonFiles.length > 0,
      details: `Found ${jsonFiles.length} state JSON files`,
      files: jsonFiles.slice(0, 10),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.tests.push({
      test: 'City JSON Files',
      passed: false,
      details: `Error reading files: ${errorMessage}`,
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
