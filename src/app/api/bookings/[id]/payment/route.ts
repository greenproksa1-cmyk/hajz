import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Create payment record for a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { amount, iban, bankName, receiptPath } = body;

    if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists for this booking
    const existingPayment = await db.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'A payment record already exists for this booking' },
        { status: 409 }
      );
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId,
        amount,
        status: 'pending',
        iban: iban || null,
        bankName: bankName || null,
        receiptPath: receiptPath || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment record created successfully',
        data: payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment record' },
      { status: 500 }
    );
  }
}

// PATCH: Update payment status (verify/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { status, verifiedBy } = body;

    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find existing payment
    const payment = await db.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment record not found for this booking' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'verified') {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = verifiedBy || 'admin';
    }

    if (body.receiptPath !== undefined) {
      updateData.receiptPath = body.receiptPath || null;
    }

    if (body.iban !== undefined) {
      updateData.iban = body.iban || null;
    }

    if (body.bankName !== undefined) {
      updateData.bankName = body.bankName || null;
    }

    const updatedPayment = await db.payment.update({
      where: { bookingId },
      data: updateData,
    });

    // If payment is verified, update booking status to completed
    if (status === 'verified') {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'completed' },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: updatedPayment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
