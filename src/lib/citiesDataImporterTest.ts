/**
 * Simplified test to see if JSON imports work at all
 */

// Test importing a single JSON file
import californiaData from '@/data/cities/california.json';

export function testSingleImport() {
  console.log('Testing single California import...');
  console.log('California data type:', typeof californiaData);
  console.log('California data:', californiaData);
  console.log('Cities count:', californiaData?.cities?.length);
  return californiaData;
}
