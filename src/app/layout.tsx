import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";
import { TranslationProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "منصة قرين بروجكتس لحجز الأجنحة والمعارض | Green Projects Booth Booking",
  description:
    "منصة شركة قرين بروجكتس لتنظيم المعارض والمؤتمرات - المنصة المتكاملة لحجز وتخصيص أجنحة المعارض والفعاليات بسهولة واحترافية.",
  keywords: [
    "قرين بروجكتس",
    "تنظيم معارض ومؤتمرات",
    "حجز أجنحة",
    "حجز بوثات",
    "معارض",
    "Green Projects",
    "Exhibition Booking",
    "Booth Reservation",
    "Event Management",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <AuthProvider>
          <TranslationProvider>
            {children}
            <Toaster richColors />
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
