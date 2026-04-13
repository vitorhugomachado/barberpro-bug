const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAppointments = async (req, res) => {
  try {
    // Role-based filtering: Barbers only see their own appointments
    const where = {};
    if (req.user.role !== 'Gerente') {
      where.barberId = req.user.id;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { barber: { select: { name: true } } }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
};

const createAppointment = async (req, res) => {
  try {
    console.log('CREATE APPOINTMENT BODY:', req.body);
    const data = { ...req.body };
    if (data.customerId) data.customerId = Number(data.customerId);
    
    const appointment = await prisma.appointment.create({ data });
    console.log('CREATED APPOINTMENT IN DB:', appointment);
    res.json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    if (req.user.role !== 'Gerente') {
      const existing = await prisma.appointment.findUnique({ where: { id: Number(id) } });
      
      const isOwnerBarber = existing && existing.barberId === req.user.id;
      const isOwnerCustomer = existing && existing.customerId === req.user.id;
      
      if (!existing || (!isOwnerBarber && !isOwnerCustomer)) {
        return res.status(403).json({ message: 'Sem permissão para alterar este agendamento' });
      }
    }

    const appointment = await prisma.appointment.update({ where: { id: Number(id) }, data: req.body });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento' });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment };
