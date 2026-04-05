import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clear existing data in reverse dependency order
    await db.payment.deleteMany();
    await db.booking.deleteMany();
    await db.booth.deleteMany();
    await db.floorPlan.deleteMany();

    // Create default floor plan
    const floorPlan = await db.floorPlan.create({
      data: {
        name: 'الخطة الرئيسية - معرض مقاولي الرياض 2026',
        description: 'خطة المعرض الرئيسية مع 17 كشكاً في 3 صفوف + قسم VIP',
        width: 800,
        height: 560,
        isActive: true,
      },
    });

    // Define booth data associated with the floor plan
    const boothsData = [
      // Row A (y=40)
      { label: 'A1', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 60, y: 40, width: 100, height: 80 },
      { label: 'A2', area: 9, status: 'booked', boothType: 'standard', price: 15300, x: 200, y: 40, width: 100, height: 80 },
      { label: 'A3', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 340, y: 40, width: 100, height: 80 },
      { label: 'A4', area: 9, status: 'booked', boothType: 'standard', price: 15300, x: 480, y: 40, width: 100, height: 80 },
      { label: 'A5', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 620, y: 40, width: 100, height: 80 },

      // Row B (y=160)
      { label: 'B1', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 60, y: 160, width: 100, height: 80 },
      { label: 'B2', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 200, y: 160, width: 100, height: 80 },
      { label: 'B3', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 340, y: 160, width: 100, height: 80 },
      { label: 'B4', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 480, y: 160, width: 100, height: 80 },
      { label: 'B5', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 620, y: 160, width: 100, height: 80 },

      // Row C (y=280)
      { label: 'C1', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 60, y: 280, width: 100, height: 80 },
      { label: 'C2', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 200, y: 280, width: 100, height: 80 },
      { label: 'C3', area: 9, status: 'booked', boothType: 'standard', price: 15300, x: 340, y: 280, width: 100, height: 80 },
      { label: 'C4', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 480, y: 280, width: 100, height: 80 },
      { label: 'C5', area: 9, status: 'available', boothType: 'standard', price: 15300, x: 620, y: 280, width: 100, height: 80 },

      // VIP Row (y=400)
      { label: 'VIP1', area: 18, status: 'available', boothType: 'vip', price: 30600, x: 60, y: 400, width: 280, height: 100 },
      { label: 'VIP2', area: 18, status: 'available', boothType: 'vip', price: 30600, x: 380, y: 400, width: 280, height: 100 },
    ];

    // Create booths associated with the floor plan
    const createdBooths = [];
    for (const booth of boothsData) {
      const created = await db.booth.create({
        data: {
          ...booth,
          floorPlanId: floorPlan.id,
        },
      });
      createdBooths.push(created);
    }

    // Create demo bookings for the "booked" booths
    const bookedBooths = createdBooths.filter((b) => b.status === 'booked');

    const demoBookings = [];

    // Demo booking 1: A2
    const boothA2 = bookedBooths.find((b) => b.label === 'A2');
    if (boothA2) {
      const bk = await db.booking.create({
        data: {
          entityName: 'شركة الأفق للمقاولات',
          unifiedNumber: '1098765432',
          address: 'الرياض، حي العليا، شارع الأمير محمد بن عبدالعزيز',
          contactName: 'أحمد الشمري',
          jobTitle: 'مدير التطوير',
          mobile: '0501234567',
          phone: '0112345678',
          email: 'ahmed@alofuq.sa',
          boothIds: JSON.stringify([boothA2.id]),
          totalPrice: 9000,
          status: 'approved',
          otpVerified: true,
        },
      });
      demoBookings.push(bk);

      // Payment for booking 1 (verified)
      await db.payment.create({
        data: {
          bookingId: bk.id,
          amount: 9000,
          status: 'verified',
          iban: 'SA0380000000608010167519',
          bankName: 'البنك الأهلي السعودي',
          verifiedAt: new Date(),
          verifiedBy: 'admin',
        },
      });
    }

    // Demo booking 2: A4
    const boothA4 = bookedBooths.find((b) => b.label === 'A4');
    if (boothA4) {
      const bk = await db.booking.create({
        data: {
          entityName: 'مؤسسة البناء الحديث',
          unifiedNumber: '1087654321',
          address: 'الرياض، حي الملقا، طريق أنس بن مالك',
          contactName: 'محمد العتيبي',
          jobTitle: 'المدير التنفيذي',
          mobile: '0559876543',
          phone: '0119876543',
          email: 'info@modern-build.sa',
          boothIds: JSON.stringify([boothA4.id]),
          totalPrice: 9000,
          status: 'approved',
          otpVerified: true,
        },
      });
      demoBookings.push(bk);

      // Payment for booking 2 (pending)
      await db.payment.create({
        data: {
          bookingId: bk.id,
          amount: 9000,
          status: 'pending',
          iban: 'SA6610000000000000001234',
          bankName: 'بنك الراجحي',
        },
      });
    }

    // Demo booking 3: C3
    const boothC3 = bookedBooths.find((b) => b.label === 'C3');
    if (boothC3) {
      const bk = await db.booking.create({
        data: {
          entityName: 'Al Rashed Building Materials Co.',
          unifiedNumber: '1056789012',
          address: 'Riyadh, Olaya District, King Fahd Road',
          contactName: 'Khalid Al Rashed',
          jobTitle: 'General Manager',
          mobile: '0551122334',
          phone: '0113344556',
          email: 'contact@alrashed-bm.com',
          boothIds: JSON.stringify([boothC3.id]),
          totalPrice: 9000,
          status: 'completed',
          otpVerified: true,
        },
      });
      demoBookings.push(bk);

      // Payment for booking 3 (verified)
      await db.payment.create({
        data: {
          bookingId: bk.id,
          amount: 9000,
          status: 'verified',
          iban: 'SA4420000000000000005678',
          bankName: 'البنك السعودي الفرنسي',
          receiptPath: '/uploads/receipts/c3-receipt.pdf',
          verifiedAt: new Date(),
          verifiedBy: 'admin',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        floorPlan: { id: floorPlan.id, name: floorPlan.name },
        boothsCount: createdBooths.length,
        bookingsCount: demoBookings.length,
        paymentsCount: demoBookings.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
