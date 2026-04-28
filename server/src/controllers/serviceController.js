const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getServices = async (req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
};

const createService = async (req, res) => {
  const service = await prisma.service.create({ data: req.body });
  res.json(service);
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const service = await prisma.service.update({ where: { id: Number(id) }, data: req.body });
  res.json(service);
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  await prisma.service.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
};

module.exports = { getServices, createService, updateService, deleteService };

