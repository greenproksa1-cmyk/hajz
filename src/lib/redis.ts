// In-memory booth lock system simulating Redis with TTL
interface LockEntry {
  bookingId: string;
  boothIds: string[];
  expiresAt: number; // timestamp in ms
  email: string;
}

const locks = new Map<string, LockEntry>();
const LOCK_TTL = 2 * 60 * 60 * 1000; // 2 hours

export function setLock(bookingId: string, boothIds: string[], email: string): void {
  // Remove any existing locks for these booths
  for (const [key, entry] of locks.entries()) {
    if (entry.boothIds.some(id => boothIds.includes(id))) {
      locks.delete(key);
    }
  }
  locks.set(bookingId, {
    bookingId,
    boothIds,
    expiresAt: Date.now() + LOCK_TTL,
    email,
  });
}

export function getLock(bookingId: string): LockEntry | undefined {
  return locks.get(bookingId);
}

export function removeLock(bookingId: string): boolean {
  return locks.delete(bookingId);
}

export function isBoothLocked(boothId: string): boolean {
  cleanupExpired();
  for (const [, entry] of locks.entries()) {
    if (entry.boothIds.includes(boothId)) return true;
  }
  return false;
}

export function getLockedBoothIds(): string[] {
  cleanupExpired();
  const ids: string[] = [];
  for (const [, entry] of locks.entries()) {
    ids.push(...entry.boothIds);
  }
  return [...new Set(ids)];
}

export function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of locks.entries()) {
    if (now > entry.expiresAt) {
      locks.delete(key);
    }
  }
}
