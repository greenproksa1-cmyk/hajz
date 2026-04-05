import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const userBookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { booths: true },
  });

  return <DashboardClient user={session.user} userBookings={userBookings} />;
}
