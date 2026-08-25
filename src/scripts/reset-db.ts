import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting full database reset...')

  try {
    // Order matters because of relations
    console.log('🗑️ Deleting Payments...')
    const paymentResult = await prisma.payment.deleteMany({})
    console.log(`✅ Deleted ${paymentResult.count} payments.`)

    console.log('🗑️ Deleting Bookings...')
    const bookingResult = await prisma.booking.deleteMany({})
    console.log(`✅ Deleted ${bookingResult.count} bookings.`)

    console.log('🗑️ Deleting Booths...')
    const boothResult = await prisma.booth.deleteMany({})
    console.log(`✅ Deleted ${boothResult.count} booths.`)

    console.log('\n✨ Database tables reset successfully!')
    console.log('--------------------------------------')
    console.log(`Final Counts:`)
    console.log(`Payments: ${await prisma.payment.count()}`)
    console.log(`Bookings: ${await prisma.booking.count()}`)
    console.log(`Booths:   ${await prisma.booth.count()}`)
    console.log('--------------------------------------')

  } catch (error) {
    console.error('❌ Error during reset:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
