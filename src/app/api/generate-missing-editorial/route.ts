import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEditorialContentForNailArt } from '@/lib/geminiService';
import { upsertEditorial } from '@/lib/editorialService';

/**
 * Check if there's an active stop signal
 */
async function checkStopSignal(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/global-stop`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.activeSignals > 0) {
        console.log('🚨 STOP SIGNAL DETECTED - Halting editorial generation immediately');
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking stop signal:', error);
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 5, maxItems = 50, delayMs = 3000 } = await request.json();
    
    console.log('🚀 Starting editorial content generation...');
    
    // Get items that need editorial content
    const { data: allItems, error: itemsError } = await supabase
      .from('gallery_items')
      .select(`
        id,
        design_name,
        category,
        prompt,
        created_at
      `)
      .not('design_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(maxItems);

    if (itemsError) {
      throw new Error(`Failed to fetch items: ${itemsError.message}`);
    }

    // Get items that already have editorial content
    const { data: existingEditorials, error: editorialError } = await supabase
      .from('gallery_editorials')
      .select('item_id');

    if (editorialError) {
      throw new Error(`Failed to fetch existing editorials: ${editorialError.message}`);
    }

    const existingEditorialIds = new Set(
      existingEditorials?.map(e => e.item_id) || []
    );

    const itemsNeedingEditorial = allItems.filter(item => 
      !existingEditorialIds.has(item.id)
    );

    console.log(`📊 Found ${allItems.length} total items`);
    console.log(`📊 ${itemsNeedingEditorial.length} items need editorial content`);

    if (itemsNeedingEditorial.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All items already have editorial content!',
        data: {
          totalItems: allItems.length,
          itemsNeedingEditorial: 0,
          processed: 0,
          successful: 0,
          failed: 0
        }
      });
    }

    let totalSuccessful = 0;
    let totalFailed = 0;
    const processedItems: string[] = [];

    // Process items in batches
    for (let i = 0; i < itemsNeedingEditorial.length; i += batchSize) {
      // Check for stop signal before each batch
      const isStopped = await checkStopSignal();
      if (isStopped) {
        console.log('🚨 Editorial generation stopped by global stop signal');
        return NextResponse.json({
          success: false,
          message: 'Editorial generation stopped by user',
          data: {
            totalItems: allItems.length,
            itemsNeedingEditorial: itemsNeedingEditorial.length,
            processed: totalSuccessful + totalFailed,
            successful: totalSuccessful,
            failed: totalFailed,
            stopped: true
          }
        });
      }

      const batch = itemsNeedingEditorial.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} items`);

      const batchPromises = batch.map(async (item) => {
        try {
          console.log(`📝 Generating editorial for: ${item.design_name}`);
          
          // Extract related keywords from the item's tags
          const relatedKeywords = [
            item.category,
            ...(item.prompt?.toLowerCase().match(/\b(red|blue|green|purple|pink|gold|silver|black|white|french|ombre|marble|glitter|chrome|geometric|watercolor|stamping|hand-painting|floral|abstract|minimalist|glamour|vintage|modern|classic|trendy|romantic|elegant|sophisticated|playful|fun|cute|wedding|party|work|date|casual|formal|holiday|spring|summer|autumn|winter|christmas|halloween|valentine|easter|thanksgiving|new-year|almond|coffin|square|oval|stiletto|round|short|medium|long)\b/g) || [])
          ].filter(Boolean);

          const editorialData = await generateEditorialContentForNailArt(
            item.design_name,
            item.category,
            item.prompt,
            relatedKeywords
          );

          const success = await upsertEditorial(item.id, editorialData);
          
          if (success) {
            console.log(`✅ Editorial generated for: ${item.design_name}`);
            return { success: true, itemId: item.id, designName: item.design_name };
          } else {
            throw new Error('Failed to save editorial to database');
          }
        } catch (error) {
          console.error(`❌ Failed to generate editorial for ${item.design_name}:`, error);
          return { success: false, itemId: item.id, designName: item.design_name, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      const batchSuccessful = batchResults.filter(r => 
        r.status === 'fulfilled' && r.value.success === true
      ).length;
      
      const batchFailed = batchResults.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && r.value.success === false)
      ).length;

      totalSuccessful += batchSuccessful;
      totalFailed += batchFailed;

      // Add processed items to the list
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          processedItems.push(result.value.designName);
        }
      });

      console.log(`✅ Batch completed: ${batchSuccessful} successful, ${batchFailed} failed`);

      // Add delay between batches (except for the last batch)
      if (i + batchSize < itemsNeedingEditorial.length) {
        console.log(`⏳ Waiting ${delayMs/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Check for stop signal after delay
        const isStoppedAfterDelay = await checkStopSignal();
        if (isStoppedAfterDelay) {
          console.log('🚨 Editorial generation stopped by global stop signal after delay');
          return NextResponse.json({
            success: false,
            message: 'Editorial generation stopped by user',
            data: {
              totalItems: allItems.length,
              itemsNeedingEditorial: itemsNeedingEditorial.length,
              processed: totalSuccessful + totalFailed,
              successful: totalSuccessful,
              failed: totalFailed,
              stopped: true
            }
          });
        }
      }
    }

    console.log('\n🎉 Editorial generation completed!');
    console.log(`✅ Successfully generated: ${totalSuccessful} editorials`);
    console.log(`❌ Failed: ${totalFailed} editorials`);

    return NextResponse.json({
      success: true,
      message: `Editorial generation completed! Generated ${totalSuccessful} editorials, ${totalFailed} failed`,
      data: {
        totalItems: allItems.length,
        itemsNeedingEditorial: itemsNeedingEditorial.length,
        processed: totalSuccessful + totalFailed,
        successful: totalSuccessful,
        failed: totalFailed,
        processedItems: processedItems.slice(0, 10) // Show first 10 for reference
      }
    });

  } catch (error) {
    console.error('💥 Editorial generation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate editorial content',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current stats
    const { count: totalItems, error: itemsError } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact', head: true });

    if (itemsError) {
      throw new Error(`Failed to get total items: ${itemsError.message}`);
    }

    const { count: itemsWithEditorial, error: editorialError } = await supabase
      .from('gallery_editorials')
      .select('*', { count: 'exact', head: true });

    if (editorialError) {
      throw new Error(`Failed to get editorial count: ${editorialError.message}`);
    }

    const itemsNeedingEditorial = (totalItems || 0) - (itemsWithEditorial || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalItems: totalItems || 0,
        itemsWithEditorial: itemsWithEditorial || 0,
        itemsNeedingEditorial,
        percentageComplete: totalItems ? Math.round(((itemsWithEditorial || 0) / totalItems) * 100) : 0
      }
    });

  } catch (error) {
    console.error('💥 Failed to get editorial stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get editorial stats',
        data: null
      },
      { status: 500 }
    );
  }
}
