import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'email and otp are required' },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(email, otp);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
