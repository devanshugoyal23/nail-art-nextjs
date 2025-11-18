import { NextResponse } from 'next/server';
import { getCityDataFromR2 } from '@/lib/salonDataService';

/**
 * Analytics Endpoint: Review Distribution
 *
 * Provides insights into salon review counts across all cities:
 * - Total salons by review count thresholds (50+, 100+, 200+, 500+)
 * - Top cities by high-review salon count
 * - Average reviews per city
 * - Geographic distribution insights
 */
export async function GET() {
  try {
    console.log('📊 Starting review distribution analysis...');
    const startTime = Date.now();

    // Import consolidated city data
    const { getAllStateCityData } = await import('@/lib/consolidatedCitiesData');
    const statesMap = getAllStateCityData();

    // Collect all cities
    const allCities: Array<{
      state: string;
      city: string;
      cityName: string;
      stateName: string;
      population?: number;
    }> = [];

    for (const [stateSlug, data] of statesMap.entries()) {
      if (!data.cities || !Array.isArray(data.cities)) continue;

      for (const city of data.cities) {
        allCities.push({
          state: stateSlug,
          city: city.slug,
          cityName: city.name,
          stateName: data.state,
          population: city.population,
        });
      }
    }

    // Sort by population to process major cities first
    const sortedCities = allCities.sort((a, b) => (b.population || 0) - (a.population || 0));

    // Process top 200 cities (same as sitemap)
    const citiesToProcess = sortedCities.slice(0, 200);

    let totalSalons = 0;
    let salonsWithReviews = 0;
    const reviewBuckets = {
      '50+': 0,
      '100+': 0,
      '200+': 0,
      '500+': 0,
      '1000+': 0,
    };

    interface CityStats {
      city: string;
      state: string;
      totalSalons: number;
      highReviewSalons: number; // 100+
      topReviewSalons: number; // 200+
      avgReviews: number;
    }

    const cityStats: CityStats[] = [];

    // Process each city
    for (let i = 0; i < citiesToProcess.length; i++) {
      const { cityName, stateName } = citiesToProcess[i];

      try {
        const cityData = await getCityDataFromR2(stateName, cityName);

        if (!cityData || !cityData.salons || cityData.salons.length === 0) {
          continue;
        }

        const salons = cityData.salons;
        totalSalons += salons.length;

        let cityHighReviewCount = 0;
        let cityTopReviewCount = 0;
        let cityTotalReviews = 0;

        for (const salon of salons) {
          const reviewCount = salon.reviewCount || 0;

          if (reviewCount > 0) {
            salonsWithReviews++;
            cityTotalReviews += reviewCount;
          }

          // Count by thresholds
          if (reviewCount >= 50) reviewBuckets['50+']++;
          if (reviewCount >= 100) {
            reviewBuckets['100+']++;
            cityHighReviewCount++;
          }
          if (reviewCount >= 200) {
            reviewBuckets['200+']++;
            cityTopReviewCount++;
          }
          if (reviewCount >= 500) reviewBuckets['500+']++;
          if (reviewCount >= 1000) reviewBuckets['1000+']++;
        }

        cityStats.push({
          city: cityName,
          state: stateName,
          totalSalons: salons.length,
          highReviewSalons: cityHighReviewCount,
          topReviewSalons: cityTopReviewCount,
          avgReviews: salons.length > 0 ? Math.round(cityTotalReviews / salons.length) : 0,
        });
      } catch (error) {
        console.error(`Error processing ${cityName}, ${stateName}:`, error);
        continue;
      }
    }

    // Sort city stats by high-review salon count
    const topCitiesByHighReviews = [...cityStats]
      .sort((a, b) => b.highReviewSalons - a.highReviewSalons)
      .slice(0, 20);

    const topCitiesByTopReviews = [...cityStats]
      .sort((a, b) => b.topReviewSalons - a.topReviewSalons)
      .slice(0, 20);

    const duration = Date.now() - startTime;

    const analytics = {
      summary: {
        totalCitiesAnalyzed: citiesToProcess.length,
        totalSalons,
        salonsWithReviews,
        percentageWithReviews: totalSalons > 0 ? ((salonsWithReviews / totalSalons) * 100).toFixed(1) : '0',
      },
      reviewThresholds: reviewBuckets,
      thresholdPercentages: {
        '50+': totalSalons > 0 ? ((reviewBuckets['50+'] / totalSalons) * 100).toFixed(1) + '%' : '0%',
        '100+': totalSalons > 0 ? ((reviewBuckets['100+'] / totalSalons) * 100).toFixed(1) + '%' : '0%',
        '200+': totalSalons > 0 ? ((reviewBuckets['200+'] / totalSalons) * 100).toFixed(1) + '%' : '0%',
        '500+': totalSalons > 0 ? ((reviewBuckets['500+'] / totalSalons) * 100).toFixed(1) + '%' : '0%',
        '1000+': totalSalons > 0 ? ((reviewBuckets['1000+'] / totalSalons) * 100).toFixed(1) + '%' : '0%',
      },
      estimatedCosts: {
        'all': `$${(totalSalons * 0.03).toFixed(2)}`,
        '50+': `$${(reviewBuckets['50+'] * 0.03).toFixed(2)}`,
        '100+': `$${(reviewBuckets['100+'] * 0.03).toFixed(2)}`,
        '200+': `$${(reviewBuckets['200+'] * 0.03).toFixed(2)}`,
        '500+': `$${(reviewBuckets['500+'] * 0.03).toFixed(2)}`,
      },
      topCitiesByHighReviews: topCitiesByHighReviews.map(c => ({
        city: `${c.city}, ${c.state}`,
        highReviewSalons: c.highReviewSalons,
        totalSalons: c.totalSalons,
        percentage: c.totalSalons > 0 ? ((c.highReviewSalons / c.totalSalons) * 100).toFixed(1) + '%' : '0%',
      })),
      topCitiesByTopReviews: topCitiesByTopReviews.map(c => ({
        city: `${c.city}, ${c.state}`,
        topReviewSalons: c.topReviewSalons,
        totalSalons: c.totalSalons,
        percentage: c.totalSalons > 0 ? ((c.topReviewSalons / c.totalSalons) * 100).toFixed(1) + '%' : '0%',
      })),
      processingTime: `${duration}ms`,
    };

    console.log('📊 Review Distribution Analysis Complete:');
    console.log(`   Total salons: ${totalSalons}`);
    console.log(`   100+ reviews: ${reviewBuckets['100+']} (${analytics.thresholdPercentages['100+']})`);
    console.log(`   200+ reviews: ${reviewBuckets['200+']} (${analytics.thresholdPercentages['200+']})`);
    console.log(`   Processing time: ${duration}ms`);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('❌ Error generating review analytics:', error);
    return NextResponse.json(
      { error: `Failed to generate analytics: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
