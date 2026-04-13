import { removeLock } from '@/lib/redis';

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

    // 1. Get the locks for this bookingId to know which booths to reset
    const locks = await db.boothLock.findMany({
      where: { bookingId },
      select: { boothId: true },
    });

    if (locks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active locks found, nothing to unlock.',
      });
    }

    const boothIds = locks.map(l => l.boothId);

    // 2. Remove the locks
    await removeLock(bookingId);

    // 3. Reset booth statuses to available in DB (only those that were pending)
    await db.booth.updateMany({
      where: {
        id: { in: boothIds },
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
