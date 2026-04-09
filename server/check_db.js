const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const barbers = await prisma.barber.findMany();
  console.log('Barbers in DB:', barbers.map(b => ({ email: b.email, role: b.role, status: b.status })));
  process.exit(0);
}

check();
