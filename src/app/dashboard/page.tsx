import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { db } from "@/lib/db";
import { TranslationProvider } from "@/i18n";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const userBookings = await db.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { booths: true },
  });

  // Scope to active floor plans
  const activeFloorPlans = await db.floorPlan.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  const activePlanIds = activeFloorPlans.map(fp => fp.id);

  // 1. Gather all unique booth IDs to prevent N+1 queries
  const allBoothIds = new Set<string>();
  const parsedBoothsMap = new Map<string, string[]>();
  
  for (const booking of userBookings) {
    try {
      const ids = JSON.parse(booking.boothIds);
      if (Array.isArray(ids)) {
        parsedBoothsMap.set(booking.id, ids);
        ids.forEach(id => allBoothIds.add(id));
      }
    } catch {
      // ignore parsing errors
    }
  }

  // 2. Fetch all involved booths in one fast aggregated query
  const boothsList = await db.booth.findMany({
    where: { id: { in: Array.from(allBoothIds) } },
    select: { id: true, floorPlanId: true },
  });

  const boothsById = new Map<string, any>();
  boothsList.forEach(b => boothsById.set(b.id, b));

  const filteredBookings = [];
  
  // 3. Process bookings purely in-memory
  for (const booking of userBookings) {
    const ids = parsedBoothsMap.get(booking.id) || [];
    const boothDetails = ids.map(id => boothsById.get(id)).filter(Boolean);
    
    const isBookingActive = boothDetails.some(b => b.floorPlanId && activePlanIds.includes(b.floorPlanId));
    
    if (isBookingActive) {
      filteredBookings.push(booking);
    }
  }

  return (
    <TranslationProvider>
      <DashboardClient user={session.user} userBookings={filteredBookings} />
    </TranslationProvider>
  );
}
