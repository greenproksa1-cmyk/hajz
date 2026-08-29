import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLockedBoothIds } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get the currently active floor plan (single optimized query)
    let activePlan = await db.floorPlan.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        width: true,
        height: true,
        booths: {
          select: {
            id: true,
            label: true,
            area: true,
            status: true,
            boothType: true,
            price: true,
            x: true,
            y: true,
            width: true,
            height: true,
            floorPlanId: true,
          },
          orderBy: [{ y: 'asc' }, { x: 'asc' }],
        },
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 2. Fallback to the latest plan if none is active
    if (!activePlan) {
      activePlan = await db.floorPlan.findFirst({
        select: {
          id: true,
          name: true,
          width: true,
          height: true,
          booths: {
            select: {
              id: true,
              label: true,
              area: true,
              status: true,
              boothType: true,
              price: true,
              x: true,
              y: true,
              width: true,
              height: true,
              floorPlanId: true,
            },
            orderBy: [{ y: 'asc' }, { x: 'asc' }],
          },
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!activePlan) {
      return NextResponse.json({ success: true, data: [] });
    }

    const lockedIds = await getLockedBoothIds();

    // 3. Process booths for the active plan (already sorted from DB)
    const enrichedBooths = activePlan.booths.map((booth) => ({
      ...booth,
      status: lockedIds.includes(booth.id) ? 'pending' : booth.status,
      isLocked: lockedIds.includes(booth.id),
    }));

    return NextResponse.json(
      {
        success: true,
        data: enrichedBooths,
        floorPlan: {
          id: activePlan.id,
          name: activePlan.name,
          width: activePlan.width,
          height: activePlan.height
        }
      },
      {
        headers: {
          // Public cache for 20s - shared between all users
          // stale-while-revalidate allows serving stale while fetching fresh data
          'Cache-Control': 'public, max-age=20, stale-while-revalidate=40',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching booths:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch booths',
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}

