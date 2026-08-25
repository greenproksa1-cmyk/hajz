import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('green 2026', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'green' },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Green Admin'
    },
    create: {
      email: 'green',
      name: 'Green Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'greenpro.ksa1@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Green Projects'
    },
    create: {
      email: 'greenpro.ksa1@gmail.com',
      name: 'Green Projects',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Admin user 1:', user1.email);
  console.log('Admin user 2:', user2.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
