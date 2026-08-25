import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('green 2026', 10);
  
  const user = await prisma.user.upsert({
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
  console.log('Admin user created successfully:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
