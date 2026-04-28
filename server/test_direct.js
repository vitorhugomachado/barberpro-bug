const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Temporary client with DIRECT_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log('Testing DIRECT connection (5432)...');
  const barbers = await prisma.barber.findMany({});
  console.log('Success!', JSON.stringify(barbers));
}

main()
  .catch((e) => {
    console.error('Direct connection failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
