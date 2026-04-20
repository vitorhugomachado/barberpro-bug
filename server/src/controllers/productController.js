const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProducts = async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

const createProduct = async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.update({ where: { id: Number(id) }, data: req.body });
  res.json(product);
};

const getSales = async (req, res) => {
  try {
    const { barberId } = req.query;
    const where = {};

    // Role-based filtering: Barbers only see their own sales
    if (req.user.role !== 'Gerente') {
      where.barberId = req.user.id;
    } else {
      // Manager can filter by barberId via query param
      if (barberId === 'null' || barberId === 'barbershop') {
        where.barberId = null;
      } else if (barberId) {
        where.barberId = Number(barberId);
      }
    }

    const sales = await prisma.productSale.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        Barber: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas' });
  }
};

const createSale = async (req, res) => {
  try {
    const { barberId, ...rest } = req.body;
    const data = {
      ...rest,
      barberId: barberId ? Number(barberId) : null
    };
    const sale = await prisma.productSale.create({
      data,
      include: { Barber: { select: { id: true, name: true } } }
    });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar venda' });
  }
};

module.exports = { getProducts, createProduct, deleteProduct, updateProduct, getSales, createSale };
