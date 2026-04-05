import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Send confirmation email when admin approves booking
// In demo mode, just log to console
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, email, lang } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build confirmation message based on language
    const isArabic = lang === 'ar';

    const subject = isArabic
      ? 'تأكيد حجز المعرض - معرض مقاولي الرياض 2026'
      : 'Exhibition Booking Confirmation - Riyadh Contractors Exhibition 2026';

    const message = isArabic
      ? `عزيزي/عزيزتي ${booking.contactName}،

نود إعلامك بأن حجزكم في معرض مقاولي الرياض 2026 قد تمت الموافقة عليه.

تفاصيل الحجز:
- اسم الكيان: ${booking.entityName}
- رقم الحجز: ${booking.id}
- الأكشاك المحجوزة: ${booking.boothIds}
- المبلغ الإجمالي: ${booking.totalPrice} ريال سعودي

يرجى متابعة إجراءات الدفع لإتمام الحجز.

مع تحيات فريق معرض مقاولي الرياض 2026`
      : `Dear ${booking.contactName},

We are pleased to inform you that your booking for the Riyadh Contractors Exhibition 2026 has been approved.

Booking Details:
- Entity Name: ${booking.entityName}
- Booking Reference: ${booking.id}
- Booked Booths: ${booking.boothIds}
- Total Amount: SAR ${booking.totalPrice}

Please proceed with the payment to finalize your booking.

Best regards,
Riyadh Contractors Exhibition 2026 Team`;

    // Demo mode: log to console instead of sending actual email
    console.log('=== CONFIRMATION EMAIL (Demo Mode) ===');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Language: ${lang || 'ar'}`);
    console.log('---');
    console.log(message);
    console.log('=== END CONFIRMATION EMAIL ===');

    return NextResponse.json({
      success: true,
      message: isArabic
        ? 'تم إرسال بريد التأكيد بنجاح (وضع العرض التوضيحي)'
        : 'Confirmation email sent successfully (demo mode)',
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
