interface OTPEntry {
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

const otpStore = new Map<string, OTPEntry>();
const OTP_TTL = 5 * 60 * 1000; // 5 minutes

export function generateOTP(email: string): string {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(email, {
    email,
    otp,
    expiresAt: Date.now() + OTP_TTL,
    verified: false,
  });
  return otp;
}

export function verifyOTP(email: string, otp: string): boolean {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  if (entry.otp === otp) {
    entry.verified = true;
    return true;
  }
  return false;
}

export function isVerified(email: string): boolean {
  const entry = otpStore.get(email);
  return entry?.verified === true;
}

export function clearOTP(email: string): void {
  otpStore.delete(email);
}
