import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.floorPlan.deleteMany();
  console.log('Cleared existing data');

  // Create default floor plan
  const floorPlan = await prisma.floorPlan.create({
    data: {
      name: 'المعرض الرئيسي - 2026',
      description: 'خطة أرضية المعرض الرئيسي',
      width: 1200,
      height: 800,
      isActive: true,
    },
  });
  console.log(`Created floor plan: ${floorPlan.name}`);

  // Define booth data with boothType and price
  const boothsData = [
    // Row A (y=40) - standard
    { label: 'A1', area: 9, status: 'available', x: 60, y: 40, width: 100, height: 80, boothType: 'standard' },
    { label: 'A2', area: 9, status: 'booked', x: 200, y: 40, width: 100, height: 80, boothType: 'standard' },
    { label: 'A3', area: 9, status: 'available', x: 340, y: 40, width: 100, height: 80, boothType: 'standard' },
    { label: 'A4', area: 9, status: 'booked', x: 480, y: 40, width: 100, height: 80, boothType: 'standard' },
    { label: 'A5', area: 9, status: 'available', x: 620, y: 40, width: 100, height: 80, boothType: 'standard' },

    // Row B (y=160) - standard
    { label: 'B1', area: 9, status: 'available', x: 60, y: 160, width: 100, height: 80, boothType: 'standard' },
    { label: 'B2', area: 9, status: 'available', x: 200, y: 160, width: 100, height: 80, boothType: 'standard' },
    { label: 'B3', area: 9, status: 'available', x: 340, y: 160, width: 100, height: 80, boothType: 'standard' },
    { label: 'B4', area: 9, status: 'available', x: 480, y: 160, width: 100, height: 80, boothType: 'standard' },
    { label: 'B5', area: 9, status: 'available', x: 620, y: 160, width: 100, height: 80, boothType: 'standard' },

    // Row C (y=280) - standard
    { label: 'C1', area: 9, status: 'available', x: 60, y: 280, width: 100, height: 80, boothType: 'standard' },
    { label: 'C2', area: 9, status: 'available', x: 200, y: 280, width: 100, height: 80, boothType: 'standard' },
    { label: 'C3', area: 9, status: 'booked', x: 340, y: 280, width: 100, height: 80, boothType: 'standard' },
    { label: 'C4', area: 9, status: 'available', x: 480, y: 280, width: 100, height: 80, boothType: 'standard' },
    { label: 'C5', area: 9, status: 'available', x: 620, y: 280, width: 100, height: 80, boothType: 'standard' },

    // VIP Row (y=400) - vip type
    { label: 'VIP1', area: 18, status: 'available', x: 60, y: 400, width: 280, height: 100, boothType: 'vip' },
    { label: 'VIP2', area: 18, status: 'available', x: 380, y: 400, width: 280, height: 100, boothType: 'vip' },
  ];

  // Create booths associated with the floor plan
  const PRICE_PER_SQM = 1700;
  const createdBooths = [];
  for (const booth of boothsData) {
    const created = await prisma.booth.create({
      data: {
        ...booth,
        floorPlanId: floorPlan.id,
        price: booth.area * PRICE_PER_SQM,
      },
    });
    createdBooths.push(created);
  }
  console.log(`Created ${createdBooths.length} booths`);

  // Create demo bookings for the "booked" booths
  const bookedBooths = createdBooths.filter(b => b.status === 'booked');

  // Demo booking 1: A2 (approved)
  const boothA2 = bookedBooths.find(b => b.label === 'A2');
  if (boothA2) {
    const booking1 = await prisma.booking.create({
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
        totalPrice: boothA2.price,
        status: 'approved',
        otpVerified: true,
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: booking1.id,
        amount: booking1.totalPrice,
        status: 'verified',
      },
    });
    console.log(`Created demo booking for booth ${boothA2.label} with payment`);
  }

  // Demo booking 2: A4 (approved)
  const boothA4 = bookedBooths.find(b => b.label === 'A4');
  if (boothA4) {
    const booking2 = await prisma.booking.create({
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
        totalPrice: boothA4.price,
        status: 'approved',
        otpVerified: true,
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: booking2.id,
        amount: booking2.totalPrice,
        status: 'verified',
      },
    });
    console.log(`Created demo booking for booth ${boothA4.label} with payment`);
  }

  // Demo booking 3: C3 (completed)
  const boothC3 = bookedBooths.find(b => b.label === 'C3');
  if (boothC3) {
    const booking3 = await prisma.booking.create({
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
        totalPrice: boothC3.price,
        status: 'completed',
        otpVerified: true,
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: booking3.id,
        amount: booking3.totalPrice,
        status: 'pending',
      },
    });
    console.log(`Created demo booking for booth ${boothC3.label} with payment`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
