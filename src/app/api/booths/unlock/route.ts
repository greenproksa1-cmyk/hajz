import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { removeLock, getLock } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      );
    }

    // Get the lock to know which booths to unlock
    const lock = getLock(bookingId);
    if (!lock) {
      return NextResponse.json(
        { success: false, error: 'No active lock found for this bookingId' },
        { status: 404 }
      );
    }

    // Remove the lock
    removeLock(bookingId);

    // Reset booth statuses to available in DB (only those that were pending)
    await db.booth.updateMany({
      where: {
        id: { in: lock.boothIds },
        status: 'pending',
      },
      data: { status: 'available' },
    });

    return NextResponse.json({
      success: true,
      message: 'Booths unlocked successfully',
    });
  } catch (error) {
    console.error('Error unlocking booths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlock booths' },
      { status: 500 }
    );
  }
}
