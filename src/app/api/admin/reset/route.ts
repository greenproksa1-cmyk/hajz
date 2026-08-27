import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

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

// POST: Delete ALL bookings and reset all booths to available
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db.$executeRawUnsafe(`DELETE FROM "_BookingToBooth";`);
    await db.$executeRawUnsafe(`DELETE FROM "Payment";`);
    const deletedBookings = await db.$executeRawUnsafe(`DELETE FROM "Booking";`);
    const resetBooths = await db.$executeRawUnsafe(`UPDATE "Booth" SET "status" = 'available';`);
    await db.$executeRawUnsafe(`DELETE FROM "VerificationToken";`);
    await db.$executeRawUnsafe(`DELETE FROM "BoothLock";`);

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully',
      data: {
        deletedBookings,
        resetBooths,
      },
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset database' }, { status: 500 });
  }
}
