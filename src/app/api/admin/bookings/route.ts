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

    // Single optimized query - booths are always included via relation
    // No need for a second booth fetch since the relation covers all cases
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        entityName: true,
        unifiedNumber: true,
        address: true,
        contactName: true,
        jobTitle: true,
        mobile: true,
        phone: true,
        email: true,
        boothIds: true,
        totalPrice: true,
        status: true,
        contractPath: true,
        receiptPath: true,
        signedContractPath: true,
        adminNotes: true,
        createdAt: true,
        userId: true,
        booths: {
          select: {
            id: true,
            label: true,
            area: true,
            boothType: true,
            status: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            receiptPath: true,
            bankName: true,
            verifiedAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: bookings },
      {
        headers: {
          // Short cache since admins need fresh data, but allow revalidation
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      }
    );
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
