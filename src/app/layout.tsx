import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "معرض مقاولي الرياض 2026 | Riyadh Contractors Exhibition 2026",
  description:
    "معرض مقاولي الرياض 2026 - أكبر معرض متخصص في قطاع المقاولات والبناء في المملكة العربية السعودية. احجز جناحك الآن.",
  keywords: [
    "معرض مقاولي الرياض",
    "Riyadh Contractors Exhibition",
    "مقاولات",
    "بناء",
    "حجز أجنحة",
    "exhibition",
    "contractors",
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
          {children}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
