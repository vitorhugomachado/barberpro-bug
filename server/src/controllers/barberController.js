const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/auth');

const prisma = new PrismaClient();

const getBarbers = async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, permissions: true }
    });
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar barbeiros' });
  }
};

const createBarber = async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const hashedPassword = await hashPassword(password || '123');
    
    const barber = await prisma.barber.create({
      data: { ...data, password: hashedPassword }
    });
    
    const { password: _, ...barberData } = barber;
    res.status(201).json(barberData);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }
    res.status(500).json({ message: 'Erro ao criar barbeiro' });
  }
};

const updateBarber = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...data } = req.body;
    
    if (password) {
      data.password = await hashPassword(password);
    }

    const barber = await prisma.barber.update({
      where: { id: Number(id) },
      data
    });
    
    const { password: _, ...barberData } = barber;
    res.json(barberData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar barbeiro' });
  }
};

const deleteBarber = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.barber.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir barbeiro' });
  }
};

module.exports = {
  getBarbers,
  createBarber,
  updateBarber,
  deleteBarber
};
