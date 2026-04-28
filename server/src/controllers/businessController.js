const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBusinessInfo = async (req, res) => {
  const info = await prisma.businessInfo.findUnique({ where: { id: 1 } });
  res.json(info);
};

const updateBusinessInfo = async (req, res) => {
  const info = await prisma.businessInfo.upsert({
    where: { id: 1 },
    update: req.body,
    create: { id: 1, ...req.body }
  });
  res.json(info);
};

module.exports = { getBusinessInfo, updateBusinessInfo };
