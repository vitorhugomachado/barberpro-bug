const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
  console.log('--- Startup Test ---');
  const email = 'admin@admin.com';
  const password = 'admin';

  console.log(`Checking email: ${email}`);
  const barber = await prisma.barber.findUnique({ where: { email } });

  if (!barber) {
    console.log('ERROR: Barber not found in database.');
    return;
  }

  console.log('Barber found:', {
    id: barber.id,
    name: barber.name,
    role: barber.role,
    status: barber.status,
    passwordHash: barber.password
  });

  const isMatch = await bcrypt.compare(password, barber.password);
  console.log(`Password match for "${password}": ${isMatch}`);

  if (isMatch) {
    console.log('SUCCESS: Logic matches. Login should work.');
  } else {
    console.log('FAILURE: Password hash does not match.');
  }
}

test()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
