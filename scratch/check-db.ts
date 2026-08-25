import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const floorPlans = await prisma.floorPlan.findMany({
    include: {
      _count: {
        select: { booths: true }
      }
    }
  })
  console.log(JSON.stringify(floorPlans, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
