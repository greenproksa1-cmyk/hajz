import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { removeLock } from '@/lib/redis';
import { isVerified, clearOTP } from '@/lib/otp-store';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Return all bookings (for admin)
export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Enrich bookings with booth details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        let boothDetails: { id: string; label: string; area: number }[] = [];
        try {
          const boothIds: string[] = JSON.parse(booking.boothIds);
          boothDetails = await db.booth.findMany({
            where: { id: { in: boothIds } },
            select: { id: true, label: true, area: true },
          });
        } catch {
          // boothIds might not be valid JSON
        }

        return {
          ...booking,
          booths: boothDetails,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST: Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      'entityName', 'unifiedNumber', 'address', 'contactName',
      'jobTitle', 'mobile', 'email', 'boothIds', 'totalPrice',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify OTP
    if (!isVerified(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Email not verified. Please verify your OTP first.' },
        { status: 403 }
      );
    }

    const boothIds: string[] = typeof body.boothIds === 'string' ? JSON.parse(body.boothIds) : body.boothIds;

    // Verify all booths are available or pending
    const booths = await db.booth.findMany({
      where: { id: { in: boothIds } },
    });

    const unavailableBooths = booths.filter(
      (b) => b.status === 'booked'
    );

    if (unavailableBooths.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Some booths are already booked: ${unavailableBooths.map((b) => b.label).join(', ')}`,
        },
        { status: 409 }
      );
    }

    if (booths.length !== boothIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some booth IDs are invalid' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    let userId = null;
    if (session && session.user) {
      userId = (session.user as any).id;
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        entityName: body.entityName,
        unifiedNumber: body.unifiedNumber,
        address: body.address,
        contactName: body.contactName,
        jobTitle: body.jobTitle,
        mobile: body.mobile,
        phone: body.phone || '',
        email: body.email,
        boothIds: typeof body.boothIds === 'string' ? body.boothIds : JSON.stringify(body.boothIds),
        totalPrice: body.totalPrice,
        status: 'pending',
        contractPath: body.contractPath || null,
        receiptPath: body.receiptPath || null,
        otpVerified: true,
        userId: userId,
      },
    });

    // Remove the lock since booking is now created
    removeLock(body.bookingId || '');

    // Clear OTP for this email
    clearOTP(body.email);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
