import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const activePlan = await prisma.floorPlan.findFirst({
    where: { isActive: true },
    include: { booths: true }
  })
  
  if (!activePlan) {
    console.log("No active plan found")
    return
  }
  
  console.log(`Active Plan: ${activePlan.name} (${activePlan.id})`)
  console.log(`Booth count in object: ${activePlan.booths.length}`)
  
  const actualBooths = await prisma.booth.findMany({
    where: { floorPlanId: activePlan.id }
  })
  console.log(`Actual booths in DB for this ID: ${actualBooths.length}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
