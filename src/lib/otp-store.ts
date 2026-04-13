import { db } from './db';

const OTP_TTL = 5 * 60 * 1000; // 5 minutes

export async function generateOTP(email: string): Promise<string> {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  await db.verificationToken.upsert({
    where: { email },
    update: {
      otp,
      verified: false,
      expiresAt: new Date(Date.now() + OTP_TTL),
    },
    create: {
      email,
      otp,
      verified: false,
      expiresAt: new Date(Date.now() + OTP_TTL),
    },
  });
  return otp;
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const entry = await db.verificationToken.findUnique({
    where: { email },
  });

  if (!entry) return false;
  if (new Date() > entry.expiresAt) {
    await db.verificationToken.delete({ where: { email } });
    return false;
  }

  if (entry.otp === otp) {
    await db.verificationToken.update({
      where: { email },
      data: { verified: true },
    });
    return true;
  }
  return false;
}

export async function isVerified(email: string): Promise<boolean> {
  const entry = await db.verificationToken.findUnique({
    where: { email },
  });
  return entry?.verified === true;
}

export async function clearOTP(email: string): Promise<void> {
  await db.verificationToken.delete({ where: { email } }).catch(() => {});
}
