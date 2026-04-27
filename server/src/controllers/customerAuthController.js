const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await prisma.customer.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    const hashedPassword = await hashPassword(password);
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    const token = generateToken({ id: customer.id, role: 'customer' });
    const { password: _, ...customerData } = customer;
    
    res.status(201).json({ token, user: customerData });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ message: 'Erro ao cadastrar cliente' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    
    if (!customer) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    const isMatch = await comparePassword(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    const token = generateToken({ id: customer.id, role: 'customer' });
    const { password: _, ...customerData } = customer;
    
    res.json({ token, user: customerData });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

const getMe = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Cliente não encontrado' });
    const { password: _, ...customerData } = customer;
    res.json(customerData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customer_id: req.user.id },
      include: { Barber: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (error) {
    console.error('getMyAppointments error:', error);
    res.status(500).json({ message: 'Erro ao buscar seu histórico' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    // Check if email is already taken by another customer
    if (email) {
      const existing = await prisma.customer.findFirst({
        where: { email, NOT: { id: req.user.id } }
      });
      if (existing) return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    const updated = await prisma.customer.update({
      where: { id: req.user.id },
      data: { name, phone, email }
    });
    
    const { password: _, ...customerData } = updated;
    res.json(customerData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

module.exports = { register, login, getMe, getMyAppointments, updateProfile };
