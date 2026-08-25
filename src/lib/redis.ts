import { db } from './db';

const LOCK_TTL = 2 * 60 * 60 * 1000; // 2 hours

export async function setLock(bookingId: string, boothIds: string[], email: string): Promise<void> {
  // 1. Remove any existing locks for these booths to allow takeover/overlap resolution
  await db.boothLock.deleteMany({
    where: { boothId: { in: boothIds } },
  });

  // 2. Create new locks
  const expiresAt = new Date(Date.now() + LOCK_TTL);
  
  // Use createMany for performance
  await db.boothLock.createMany({
    data: boothIds.map(boothId => ({
      boothId,
      bookingId,
      email,
      expiresAt,
    })),
    skipDuplicates: true,
  });
}

export async function removeLock(bookingId: string): Promise<void> {
  await db.boothLock.deleteMany({
    where: { bookingId },
  });
}

export async function isBoothLocked(boothId: string): Promise<boolean> {
  const lock = await db.boothLock.findUnique({
    where: { boothId },
  });

  if (!lock) return false;

  if (new Date() > lock.expiresAt) {
    await db.boothLock.delete({ where: { boothId } });
    return false;
  }

  return true;
}

export async function getLockedBoothIds(): Promise<string[]> {
  // Clean up expired locks first
  await db.boothLock.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const locks = await db.boothLock.findMany({
    select: { boothId: true },
  });

  return locks.map(l => l.boothId);
}
