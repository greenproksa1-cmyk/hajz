import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLockedBoothIds } from '@/lib/redis';

export async function GET() {
  try {
    // 1. Get the currently active floor plan
    let activePlan = await db.floorPlan.findFirst({
      where: { isActive: true },
      include: { booths: true },
      orderBy: { updatedAt: 'desc' }
    });

    // 2. Fallback to the latest plan if none is active
    if (!activePlan) {
      activePlan = await db.floorPlan.findFirst({
        include: { booths: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!activePlan) {
      return NextResponse.json({ success: true, data: [] });
    }

    const lockedIds = await getLockedBoothIds();

    // 3. Process booths for the active plan
    const enrichedBooths = activePlan.booths.map((booth) => ({
      ...booth,
      status: lockedIds.includes(booth.id) ? 'pending' : booth.status,
      isLocked: lockedIds.includes(booth.id),
    }));

    // Sort for consistency
    enrichedBooths.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    return NextResponse.json({
      success: true,
      data: enrichedBooths,
      floorPlan: {
        id: activePlan.id,
        name: activePlan.name,
        width: activePlan.width,
        height: activePlan.height
      }
    });
  } catch (error) {
    console.error('Error fetching booths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booths' },
      { status: 500 }
    );
  }
}
