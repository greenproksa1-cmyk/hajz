import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { db } from "@/lib/db";
import { TranslationProvider } from "@/i18n";

// Revalidate page every 60 seconds instead of every request
export const revalidate = 60;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Optimized: select only the fields needed instead of include: { booths: true }
  // This avoids fetching unnecessary columns and reduces data transfer significantly
  const userBookings = await db.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      entityName: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      contractPath: true,
      signedContractPath: true,
      booths: {
        select: {
          id: true,
          label: true,
          area: true,
        },
      },
    },
  });

  return (
    <TranslationProvider>
      <DashboardClient user={session.user} userBookings={userBookings} />
    </TranslationProvider>
  );
}
