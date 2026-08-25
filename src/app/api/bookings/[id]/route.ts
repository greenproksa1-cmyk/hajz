import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status },
    });

    // If approved, update booth statuses to booked
    if (status === 'approved') {
      const boothIds: string[] = JSON.parse(booking.boothIds);
      await db.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { status: 'booked' },
      });
    }

    // If rejected, reset booth statuses to available
    if (status === 'rejected') {
      const boothIds: string[] = JSON.parse(booking.boothIds);
      await db.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { status: 'available' },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
