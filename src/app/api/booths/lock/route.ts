import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setLock, isBoothLocked } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boothIds, email, bookingId } = body;

    if (!boothIds || !Array.isArray(boothIds) || boothIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'boothIds is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    // Check if any booth is already booked (not just locked)
    const booths = await db.booth.findMany({
      where: { id: { in: boothIds } },
    });

    const alreadyBooked = booths.filter(
      (b) => b.status === 'booked' && !isBoothLocked(b.id)
    );

    if (alreadyBooked.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Booth(s) already booked: ${alreadyBooked.map((b) => b.label).join(', ')}`,
        },
        { status: 409 }
      );
    }

    // Set lock (this also removes any existing locks for these booths)
    const lockId = bookingId || `lock-${Date.now()}`;
    setLock(lockId, boothIds, email);

    // Update booth statuses to pending in DB
    await db.booth.updateMany({
      where: { id: { in: boothIds } },
      data: { status: 'pending' },
    });

    return NextResponse.json({
      success: true,
      message: 'Booths locked successfully',
      bookingId: lockId,
    });
  } catch (error) {
    console.error('Error locking booths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lock booths' },
      { status: 500 }
    );
  }
}
