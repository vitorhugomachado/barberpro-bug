const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const data = {
      name: "Test Person 100",
      email: "test100@test.com",
      password: "123",
      role: "Barbeiro",
      status: "Ativo",
      permissions: ["scheduler", "clients"]
    };
    
    console.log("Creating barber...");
    const barber = await prisma.barber.create({
      data: { 
        ...data, 
        password: "hashed_dummy",
        shifts: undefined
      },
      include: { shifts: true }
    });
    console.log("Success:", barber);
    
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
