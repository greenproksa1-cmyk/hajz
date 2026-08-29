import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { removeLock } from '@/lib/redis';
import { isVerified, clearOTP } from '@/lib/otp-store';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Return bookings for the current user (filtered to active floor plans only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'admin';
    const userId = (session.user as any).id;

    // Run both queries in parallel for speed
    const [bookings, activeFloorPlans] = await Promise.all([
      db.booking.findMany({
        where: isAdmin ? {} : { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          entityName: true,
          unifiedNumber: true,
          contactName: true,
          jobTitle: true,
          mobile: true,
          email: true,
          boothIds: true,
          totalPrice: true,
          status: true,
          contractPath: true,
          receiptPath: true,
          signedContractPath: true,
          createdAt: true,
          userId: true,
        },
      }),
      db.floorPlan.findMany({
        where: { isActive: true },
        select: { id: true },
      }),
    ]);

    const activePlanIds = new Set(activeFloorPlans.map(fp => fp.id));

    // 1. Gather all unique booth IDs to prevent N+1 queries
    const allBoothIds = new Set<string>();
    const parsedBoothsMap = new Map<string, string[]>();
    
    for (const booking of bookings) {
      try {
        const ids = JSON.parse(booking.boothIds);
        if (Array.isArray(ids)) {
          parsedBoothsMap.set(booking.id, ids);
          ids.forEach(id => allBoothIds.add(id));
        }
      } catch {
        // boothIds might not be valid JSON
      }
    }

    // 2. Fetch all involved booths in one fast query
    const boothsList = await db.booth.findMany({
      where: { id: { in: Array.from(allBoothIds) } },
      select: { id: true, label: true, area: true, floorPlanId: true },
    });

    const boothsById = new Map<string, any>();
    boothsList.forEach(b => boothsById.set(b.id, b));

    const enrichedBookings: any[] = [];

    // 3. Process bookings purely in-memory (no extra DB calls)
    for (const booking of bookings) {
      const ids = parsedBoothsMap.get(booking.id) || [];
      const boothDetails = ids.map(id => boothsById.get(id)).filter(Boolean);
      
      // A booking is active if ANY of its booths belong to an active floor plan
      const isBookingActive = boothDetails.some(b => b.floorPlanId && activePlanIds.has(b.floorPlanId));

      if (isBookingActive) {
        enrichedBookings.push({
          ...booking,
          booths: boothDetails,
        });
      }
    }


    return NextResponse.json(
      { success: true, data: enrichedBookings },
      {
        headers: {
          // Cache for 30s on client, allow stale for 60s while revalidating
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
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
    const verified = await isVerified(body.email);
    if (!verified) {
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
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to create a booking' },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

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
    await removeLock(body.bookingId || '');

    // Clear OTP for this email
    await clearOTP(body.email);

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
