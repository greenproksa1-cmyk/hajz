import nodemailer from 'nodemailer';

// Check if SMTP is properly configured
export function getTransportInfo(): { configured: boolean; host?: string; user?: string } {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      configured: true,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
    };
  }
  return { configured: false };
}

// Create a reusable transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Connection timeout and retry settings
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

// Send email with retry logic
async function sendWithRetry(
  transporter: nodemailer.Transporter,
  mailOptions: nodemailer.SendMailOptions,
  maxRetries: number = 2
): Promise<boolean> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[Email] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('[Email] All retry attempts failed:', lastError?.message);
  return false;
}

// In production, configure SMTP via environment variables
// For demo, we log the OTP to console
export async function sendOTPEmail(email: string, otp: string, lang: string = 'ar'): Promise<boolean> {
  const subjectAr = 'رمز التحقق - معرض مقاولي الرياض 2026';
  const subjectEn = 'Verification Code - Riyadh Contractors Exhibition 2026';

  const htmlAr = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1>معرض مقاولي الرياض 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
        <h2>رمز التحقق</h2>
        <p style="font-size: 18px; color: #666;">استخدم الكود التالي لإكمال عملية الحجز:</p>
        <div style="font-size: 36px; font-weight: bold; color: #f97316; letter-spacing: 8px; margin: 20px 0;">${otp}</div>
        <p style="color: #999; font-size: 14px;">صلاحية الكود: 5 دقائق</p>
      </div>
    </div>
  `;

  const htmlEn = `
    <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1>Riyadh Contractors Exhibition 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
        <h2>Verification Code</h2>
        <p style="font-size: 18px; color: #666;">Use the following code to complete your booking:</p>
        <div style="font-size: 36px; font-weight: bold; color: #f97316; letter-spacing: 8px; margin: 20px 0;">${otp}</div>
        <p style="color: #999; font-size: 14px;">Code valid for: 5 minutes</p>
      </div>
    </div>
  `;

  // Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Riyadh Exhibition" <noreply@exhibition.sa>',
        to: email,
        subject: lang === 'ar' ? subjectAr : subjectEn,
        html: lang === 'ar' ? htmlAr : htmlEn,
      };

      console.log(`[Email] Sending OTP to ${email} via ${process.env.SMTP_HOST}`);
      const sent = await sendWithRetry(transporter, mailOptions);

      if (sent) {
        console.log(`[Email] OTP sent successfully to ${email}`);
      } else {
        console.error(`[Email] Failed to send OTP to ${email} after retries`);
      }
      return sent;
    } catch (error) {
      console.error('[Email] Error sending OTP email:', error);
      return false;
    }
  }

  // Demo mode: log OTP to console
  console.log(`[DEMO MODE] OTP for ${email}: ${otp}`);
  return true;
}

// Send confirmation email
export async function sendConfirmationEmail(email: string, bookingId: string, entityName: string, lang: string = 'ar'): Promise<boolean> {
  const subjectAr = 'تأكيد الحجز - معرض مقاولي الرياض 2026';
  const subjectEn = 'Booking Confirmed - Riyadh Contractors Exhibition 2026';

  const htmlAr = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1>معرض مقاولي الرياض 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="text-align: center;">تم تأكيد حجزك</h2>
        <p>عزيزي/عزيزتي <strong>${entityName}</strong>،</p>
        <p>يسعدنا إعلامكم بأنه تم تأكيد حجزكم في معرض مقاولي الرياض 2026.</p>
        <p><strong>رقم الحجز:</strong> ${bookingId}</p>
        <p style="color: #666; font-size: 14px;">سيتم إرسال تفاصيل إضافية عبر البريد الإلكتروني.</p>
      </div>
    </div>
  `;

  const htmlEn = `
    <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1>Riyadh Contractors Exhibition 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="text-align: center;">Your Booking is Confirmed</h2>
        <p>Dear <strong>${entityName}</strong>,</p>
        <p>We are pleased to confirm your booking at the Riyadh Contractors Exhibition 2026.</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="color: #666; font-size: 14px;">Additional details will be sent via email.</p>
      </div>
    </div>
  `;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Riyadh Exhibition" <noreply@exhibition.sa>',
        to: email,
        subject: lang === 'ar' ? subjectAr : subjectEn,
        html: lang === 'ar' ? htmlAr : htmlEn,
      };

      console.log(`[Email] Sending confirmation to ${email} via ${process.env.SMTP_HOST}`);
      const sent = await sendWithRetry(transporter, mailOptions);

      if (sent) {
        console.log(`[Email] Confirmation sent successfully to ${email}`);
      } else {
        console.error(`[Email] Failed to send confirmation to ${email} after retries`);
      }
      return sent;
    } catch (error) {
      console.error('[Email] Error sending confirmation email:', error);
      return false;
    }
  }

  // Demo mode
  console.log(`[DEMO MODE] Confirmation email for ${email}, booking: ${bookingId}`);
  return true;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string, lang: string = 'ar'): Promise<boolean> {
  const subjectAr = 'استعادة كلمة المرور - معرض مقاولي الرياض 2026';
  const subjectEn = 'Password Reset - Riyadh Contractors Exhibition 2026';

  const htmlAr = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e40af; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0;">معرض مقاولي الرياض 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 40px; border-radius: 0 0 10px 10px; text-align: center; background: white;">
        <h2 style="color: #1e293b; margin-top: 0;">طلب استعادة كلمة المرور</h2>
        <p style="font-size: 16px; color: #64748b; line-height: 1.6;">تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        <div style="margin: 35px 0;">
          <a href="${resetLink}" style="background: #1e40af; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">تعيين كلمة مرور جديدة</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px;">إذا كنت تواجه مشكلة في النقر على الزر، انسخ الرابط التالي وألصقه في متصفحك:</p>
        <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">${resetLink}</p>
      </div>
    </div>
  `;

  const htmlEn = `
    <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e40af; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0;">Riyadh Contractors Exhibition 2026</h1>
      </div>
      <div style="border: 1px solid #ddd; padding: 40px; border-radius: 0 0 10px 10px; text-align: center; background: white;">
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #64748b; line-height: 1.6;">We received a request to reset your account password. If you didn't make this request, you can ignore this email.</p>
        <div style="margin: 35px 0;">
          <a href="${resetLink}" style="background: #1e40af; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Set New Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This link is valid for 1 hour only.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px;">If you're having trouble clicking the button, copy and paste the link below into your browser:</p>
        <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">${resetLink}</p>
      </div>
    </div>
  `;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Riyadh Exhibition" <noreply@exhibition.sa>',
        to: email,
        subject: lang === 'ar' ? subjectAr : subjectEn,
        html: lang === 'ar' ? htmlAr : htmlEn,
      };

      const sent = await sendWithRetry(transporter, mailOptions);
      return sent;
    } catch (error) {
      console.error('[Email] Error sending reset email:', error);
      return false;
    }
  }

  // Demo mode
  console.log(`[DEMO MODE] Password reset email for ${email}\nReset Link: ${resetLink}`);
  return true;
}

