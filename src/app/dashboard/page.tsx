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

  return (
    <TranslationProvider>
      <DashboardClient user={session.user} userBookings={userBookings} />
    </TranslationProvider>
  );
}
