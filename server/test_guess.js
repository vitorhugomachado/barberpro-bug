const { PrismaClient } = require('@prisma/client');

const uri = "postgresql://postgres.cibzqalnxezwlzafjdow:%40Stefani27160722@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: uri,
    },
  },
});

async function main() {
  console.log('Testing Pooled connection (6543) via SA-EAST-1...');
  // Just try to connect, even if table doesn't exist yet
  await prisma.$connect();
  console.log('Success! Connection established.');
}

main()
  .catch((e) => {
    console.error('Connection failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
