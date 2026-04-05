import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/lib/otp-store';
import { sendOTPEmail, getTransportInfo } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, lang } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP(email);

    // Send email
    let emailSent = false;
    try {
      emailSent = await sendOTPEmail(email, otp, lang || 'ar');
    } catch (err) {
      console.warn('[OTP] Email sending failed, falling back to demo mode:', err);
    }

    // If email fails, fall back to demo mode (OTP shown on screen)
    const isDemo = !emailSent;

    return NextResponse.json({
      success: true,
      message: isDemo ? 'OTP generated in demo mode' : 'OTP sent successfully',
      demoMode: isDemo,
      otp, // Always include OTP for user convenience
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
