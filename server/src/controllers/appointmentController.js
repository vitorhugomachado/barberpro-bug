const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAppointments = async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: { barber: { select: { name: true } } }
  });
  res.json(appointments);
};

const createAppointment = async (req, res) => {
  try {
    const appointment = await prisma.appointment.create({ data: req.body });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({ where: { id: Number(id) }, data: req.body });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento' });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment };
