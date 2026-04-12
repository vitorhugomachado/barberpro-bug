const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const payload = {
      name: "Teste Complete Payload",
      role: "Barbeiro",
      email: "teste_completo@test.com",
      password: "123",
      foto_perfil: "",
      status: "Ativo",
      permissions: ["scheduler", "clients"],
      shifts: [
        { dia_semana: 1, hora_inicio: '09:00', hora_fim: '18:00', ativo: true },
        { dia_semana: 2, hora_inicio: '09:00', hora_fim: '18:00', ativo: true }
      ]
    };
    
    const { password, shifts, ...data } = payload;
    const hashedPassword = 'hashed';

    console.log("Creating barber with exact frontend structure...");
    const barber = await prisma.barber.create({
      data: { 
        ...data, 
        password: hashedPassword,
        shifts: shifts && shifts.length > 0 ? {
          create: shifts.map(s => ({
            dia_semana: s.dia_semana,
            hora_inicio: s.hora_inicio,
            hora_fim: s.hora_fim,
            ativo: s.ativo !== undefined ? s.ativo : true
          }))
        } : undefined
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
