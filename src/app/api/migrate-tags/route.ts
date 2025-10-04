import { NextResponse } from 'next/server';
import { migrateExistingItemsWithTags } from '@/lib/galleryService';

export async function POST() {
  try {
    console.log('Starting tag migration...');
    
    const result = await migrateExistingItemsWithTags();
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. Success: ${result.success}, Failed: ${result.failed}`,
      data: result
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Migration failed', 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}
