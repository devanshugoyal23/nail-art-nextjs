import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { listDataFiles } from '../src/lib/r2Service';

async function countEnriched() {
    console.log('Counting enriched salons in R2...');
    const files = await listDataFiles('data/nail-salons/enriched/');

    // R2 list might include the folder itself sometimes or subpaths
    // Filter for .json files
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log(`\n📊 ENRICHMENT PROGRESS:`);
    console.log(`   Enriched Salons: ${jsonFiles.length}`);

    const totalQuality = 3468;
    const progress = (jsonFiles.length / totalQuality) * 100;

    console.log(`   Total Quality Salons: ${totalQuality}`);
    console.log(`   Progress: ${progress.toFixed(2)}%`);
}

countEnriched().catch(console.error);
