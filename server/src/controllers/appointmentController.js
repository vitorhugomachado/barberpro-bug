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
      include: { Barber: { select: { name: true } } }
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
    
    // Sanatize and Map fields
    delete data.id; // Ensure we don't try to manually insert an ID

    // Map camelCase customerId to snake_case customer_id
    if (data.customerId !== undefined) {
      data.customer_id = data.customerId ? Number(data.customerId) : null;
      delete data.customerId;
    }

    // Ensure numeric types
    if (data.barberId) data.barberId = Number(data.barberId);
    if (data.price) data.price = parseFloat(data.price);
    
    console.log('FINAL DATA FOR PRISMA:', data);
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
      
      const isOwnerBarber = existing && Number(existing.barberId) === Number(req.user.id);
      const isOwnerCustomer = existing && Number(existing.customer_id) === Number(req.user.id);

      console.log('DEBUG PERMISSION CHECK:', {
        userId: req.user.id,
        userRole: req.user.role,
        existingBarberId: existing?.barberId,
        existingCustomerId: existing?.customer_id,
        isOwnerBarber,
        isOwnerCustomer
      });

      if (!existing || (!isOwnerBarber && !isOwnerCustomer)) {
        return res.status(403).json({ message: 'Sem permissão para alterar este agendamento' });
      }
    }

    const data = { ...req.body };
    
    // Remove read-only/relation fields that Prisma rejects in 'data'
    delete data.id;
    delete data.barber;
    delete data.Barber;
    
    // Map camelCase to snake_case if present
    if (data.customerId !== undefined) {
      data.customer_id = data.customerId ? Number(data.customerId) : null;
      delete data.customerId;
    }

    if (data.barberId) data.barberId = Number(data.barberId);
    if (data.price) data.price = parseFloat(data.price);

    const appointment = await prisma.appointment.update({ where: { id: Number(id) }, data });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento' });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment };
