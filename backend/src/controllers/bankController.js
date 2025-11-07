import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  // Listar todos os bancos de um usuário
  async index(req, res) {
    try {
      const { userId } = req.params;
      
      // Verificar se o userId do token corresponde ao userId da rota
      if (Number(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado.' });
      }

      const banks = await prisma.bank.findMany({
        where: { userId: Number(userId) },
        orderBy: { id: 'asc' },
      });
      
      res.json(banks);
    } catch (error) {
      console.error('Erro ao listar bancos:', error);
      res.status(500).json({ error: 'Erro ao listar bancos.' });
    }
  },

  // Criar novo banco
  async store(req, res) {
    try {
      const { name, accountType, balance, logo } = req.body;
      const userId = req.user.id;

      const bank = await prisma.bank.create({
        data: {
          userId: Number(userId),
          name,
          accountType,
          balance: Number(balance) || 0,
          logo: logo || null,
        },
      });
      res.status(201).json(bank);
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      res.status(500).json({ error: 'Erro ao criar banco.' });
    }
  },

  // Atualizar banco
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, accountType, balance, logo } = req.body;

      // Verificar se o banco pertence ao usuário
      const existingBank = await prisma.bank.findFirst({
        where: { 
          id: Number(id),
          userId: req.user.id 
        }
      });

      if (!existingBank) {
        return res.status(404).json({ error: 'Banco não encontrado.' });
      }

      const bank = await prisma.bank.update({
        where: { id: Number(id) },
        data: { 
          name, 
          accountType, 
          balance: Number(balance), 
          logo 
        },
      });
      res.json(bank);
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      res.status(500).json({ error: 'Erro ao atualizar banco.' });
    }
  },

  // Deletar banco
  async destroy(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o banco pertence ao usuário
      const existingBank = await prisma.bank.findFirst({
        where: { 
          id: Number(id),
          userId: req.user.id 
        }
      });

      if (!existingBank) {
        return res.status(404).json({ error: 'Banco não encontrado.' });
      }

      await prisma.bank.delete({ 
        where: { id: Number(id) } 
      });
      
      res.json({ message: 'Banco removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
      res.status(500).json({ error: 'Erro ao excluir banco.' });
    }
  },
};