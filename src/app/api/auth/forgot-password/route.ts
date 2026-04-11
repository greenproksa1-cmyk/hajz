import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      return NextResponse.json({ message: "إذا كان البريد الإلكتروني مسجلاً، فستصلك رسالة لاستعادة كلمة المرور" }, { status: 200 });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to DB
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send the email
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
      return NextResponse.json({ message: "فشل في إرسال البريد الإلكتروني" }, { status: 500 });
    }

    return NextResponse.json({ message: "تم إرسال رابط استعادة كلمة المرور بنجاح" }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
