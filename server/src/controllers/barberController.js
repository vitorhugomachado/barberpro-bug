const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/auth');

const prisma = new PrismaClient();

const getBarbers = async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, role: true, status: true, permissions: true, foto_perfil: true, shifts: true }
    });
    res.json(barbers);
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ message: 'Erro ao buscar barbeiros' });
  }
};

const createBarber = async (req, res) => {
  try {
    const { password, shifts, ...data } = req.body;
    
    // Garantir tipos e remover campos proibidos
    delete data.id;
    if (data.commission) data.commission = parseFloat(data.commission);

    // Regra: Limpar e-mail antigo de barbeiro removido (Soft delete legacy fix)
    if (data.email) {
      const existingBarber = await prisma.barber.findUnique({ where: { email: data.email } });
      if (existingBarber) {
        if (existingBarber.deletedAt) {
          // O e-mail pertence a um barbeiro excluído cuja conta não teve o e-mail liberado
          await prisma.barber.update({
            where: { id: existingBarber.id },
            data: { email: `${existingBarber.email}_deleted_legacy_${Date.now()}` }
          });
        } else {
          // Barbeiro está ativo, barrar cadastro
          return res.status(400).json({ message: 'E-mail já cadastrado' });
        }
      }
    }

    const hashedPassword = await hashPassword(password || '123');    
    const barber = await prisma.barber.create({
      data: { 
        ...data, 
        password: hashedPassword,
        shifts: shifts && shifts.length > 0 ? {
          create: shifts.map(s => ({
            dia_semana: s.dia_semana,
            hora_inicio: s.hora_inicio,
            hora_fim: s.hora_fim,
            almoco_inicio: s.almoco_inicio,
            almoco_fim: s.almoco_fim,
            ativo: s.ativo !== undefined ? s.ativo : true
          }))
        } : undefined
      },
      include: { shifts: true }
    });
    
    const { password: _, ...barberData } = barber;
    res.status(201).json(barberData);
  } catch (error) {
    console.error("Erro ao criar barbeiro:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }
    res.status(500).json({ message: 'Erro ao criar barbeiro', details: error.message });
  }
};

const updateBarber = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, shifts, ...data } = req.body;
    
    // Garantir tipos e remover campos proibidos
    delete data.id;
    if (data.commission) data.commission = parseFloat(data.commission);
    
    if (password) {
      data.password = await hashPassword(password);
    }

    const barber = await prisma.$transaction(async (tx) => {
      if (shifts) {
        // Excluir turnos antigos e inserir novos para simplificar a sincronização
        await tx.workingShifts.deleteMany({ where: { id_barbeiro: Number(id) } });
        if (shifts.length > 0) {
          await tx.workingShifts.createMany({
            data: shifts.map(s => ({
              id_barbeiro: Number(id),
              dia_semana: s.dia_semana,
              hora_inicio: s.hora_inicio,
              hora_fim: s.hora_fim,
              almoco_inicio: s.almoco_inicio,
              almoco_fim: s.almoco_fim,
              ativo: s.ativo !== undefined ? s.ativo : true
            }))
          });
        }
      }

      return await tx.barber.update({
        where: { id: Number(id) },
        data,
        include: { shifts: true }
      });
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
    
    // Buscar barbeiro antes de excluir para pegar o e-mail atual
    const barber = await prisma.barber.findUnique({ where: { id: Number(id) } });
    if (!barber) return res.status(404).json({ message: 'Barbeiro não encontrado' });

    await prisma.barber.update({
      where: { id: Number(id) },
      data: { 
        deletedAt: new Date(), 
        status: 'Removido',
        email: `${barber.email}_deleted_${Date.now()}` // Libera o e-mail
      }
    });
    res.sendStatus(204);
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Erro ao excluir barbeiro' });
  }
};

module.exports = {
  getBarbers,
  createBarber,
  updateBarber,
  deleteBarber
};
