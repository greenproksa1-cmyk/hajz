import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function clearAll() {
  console.log('🔄 Executing fast database reset via SQL...');
  try {
    // Truncate / delete relations and tables cleanly
    await db.$executeRawUnsafe(`DELETE FROM "_BookingToBooth";`);
    console.log('✅ Cleared _BookingToBooth');

    await db.$executeRawUnsafe(`DELETE FROM "Payment";`);
    console.log('✅ Cleared Payment');

    await db.$executeRawUnsafe(`DELETE FROM "Booking";`);
    console.log('✅ Cleared Booking');

    await db.$executeRawUnsafe(`UPDATE "Booth" SET "status" = 'available';`);
    console.log('✅ Reset Booths to available');

    await db.$executeRawUnsafe(`DELETE FROM "VerificationToken";`);
    console.log('✅ Cleared VerificationToken');

    await db.$executeRawUnsafe(`DELETE FROM "BoothLock";`);
    console.log('✅ Cleared BoothLock');

    console.log('\n🎉 ALL OLD BOOKINGS HAVE BEEN COMPLETELY REMOVED!');
    console.log('🎉 ALL BOOTHS ARE NOW 100% AVAILABLE FOR NEW BOOKINGS!');
  } catch (error) {
    console.error('❌ Error during reset:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

clearAll();
