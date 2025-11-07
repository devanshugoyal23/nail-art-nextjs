import { NextResponse } from 'next/server';
import { getAllStatesWithSalons } from '@/lib/nailSalonService';

export async function GET() {
  try {
    const states = await getAllStatesWithSalons();
    
    return NextResponse.json({
      success: true,
      data: states,
      count: states.length,
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch states',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

