import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLockedBoothIds } from '@/lib/redis';

export async function GET() {
  try {
    const booths = await db.booth.findMany({
      orderBy: [{ y: 'asc' }, { x: 'asc' }],
    });

    const lockedIds = getLockedBoothIds();

    // Mark locked booths as pending in the response
    const enrichedBooths = booths.map((booth) => ({
      ...booth,
      status: lockedIds.includes(booth.id) ? 'pending' : booth.status,
      isLocked: lockedIds.includes(booth.id),
    }));

    return NextResponse.json({
      success: true,
      data: enrichedBooths,
    });
  } catch (error) {
    console.error('Error fetching booths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booths' },
      { status: 500 }
    );
  }
}
