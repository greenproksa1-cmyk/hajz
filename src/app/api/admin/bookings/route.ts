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

// GET: Return ALL bookings for admin (no NextAuth session required)
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { booths: true },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// PATCH: Update booking status (approve/reject)
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

    // Update booth statuses based on action
    if (status === 'approved') {
      const boothIds: string[] = JSON.parse(booking.boothIds);
      await db.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { status: 'booked' },
      });
    }

    if (status === 'rejected') {
      const boothIds: string[] = JSON.parse(booking.boothIds);
      await db.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { status: 'available' },
      });
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}
