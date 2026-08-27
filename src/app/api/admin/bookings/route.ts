import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

// Helper: verify admin from request header
function checkAdminAuth(request: NextRequest): boolean {
  const adminKey = request.headers.get('x-admin-key');
  if (!adminKey) return false;
  try {
    const { username, password } = JSON.parse(atob(adminKey));
    return verifyAdmin(username, password);
  } catch {
    return false;
  }
}

// GET: Return ALL bookings for admin enriched with booth details and documents
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booths: true,
        payment: true,
      },
    });

    // 1. Gather all unique booth IDs to resolve any booths not linked via relation
    const allBoothIds = new Set<string>();
    const parsedBoothsMap = new Map<string, string[]>();

    for (const booking of bookings) {
      try {
        const ids = typeof booking.boothIds === 'string' ? JSON.parse(booking.boothIds) : booking.boothIds;
        if (Array.isArray(ids)) {
          parsedBoothsMap.set(booking.id, ids);
          ids.forEach(id => allBoothIds.add(id));
        }
      } catch {
        // ignore parse error
      }
    }

    const boothsList = await db.booth.findMany({
      where: { id: { in: Array.from(allBoothIds) } },
      select: { id: true, label: true, area: true, boothType: true, status: true },
    });

    const boothsById = new Map<string, any>();
    boothsList.forEach(b => boothsById.set(b.id, b));

    const enrichedBookings = bookings.map(booking => {
      let booths = booking.booths;
      if (!booths || booths.length === 0) {
        const ids = parsedBoothsMap.get(booking.id) || [];
        booths = ids.map(id => boothsById.get(id)).filter(Boolean) as any;
      }
      return {
        ...booking,
        booths,
      };
    });

    return NextResponse.json({ success: true, data: enrichedBookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// PATCH: Update booking status (approve / reject / pending) with booth status sync
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status },
    });

    // Extract booth IDs
    let boothIds: string[] = [];
    try {
      boothIds = typeof booking.boothIds === 'string' ? JSON.parse(booking.boothIds) : booking.boothIds;
    } catch {
      boothIds = [];
    }

    if (Array.isArray(boothIds) && boothIds.length > 0) {
      if (status === 'approved' || status === 'completed') {
        // Mark booths as booked
        await db.booth.updateMany({
          where: { id: { in: boothIds } },
          data: { status: 'booked' },
        });
      } else {
        // When rejected or pending, release the booths back to available
        await db.booth.updateMany({
          where: { id: { in: boothIds } },
          data: { status: 'available' },
        });
      }
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}
