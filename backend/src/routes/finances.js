import express from 'express';
import prisma from '../prismaClient.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Listar finanças do usuário logado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({
      where: { userId: req.user.id },
      include: {
        Bank: { // Alterado de 'bank' para 'Bank' (maiúsculo)
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: { id: 'desc' },
    });
    res.json(finances);
  } catch (error) {
    console.error('Erro ao carregar finanças:', error);
    res.status(500).json({ error: 'Erro ao carregar finanças' });
  }
});

// Criar lançamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { description, amount, type, bankId } = req.body;
    
    // Validar campos obrigatórios
    if (!description || !amount || !type) {
      return res.status(400).json({ error: 'Descrição, valor e tipo são obrigatórios' });
    }

    let data = {
      description, 
      amount: Number(amount), 
      type, 
      userId: req.user.id 
    };

    // Se bankId foi fornecido, validar e incluir
    if (bankId) {
      // Verificar se o banco pertence ao usuário
      const bank = await prisma.bank.findFirst({
        where: { 
          id: Number(bankId),
          userId: req.user.id 
        }
      });

      if (!bank) {
        return res.status(404).json({ error: 'Banco não encontrado' });
      }

      data.bankId = Number(bankId);
    }

    const finance = await prisma.finance.create({
      data,
      include: {
        Bank: { // Alterado de 'bank' para 'Bank' (maiúsculo)
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });
    res.status(201).json(finance);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Deletar lançamento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a transação pertence ao usuário
    const finance = await prisma.finance.findFirst({
      where: { 
        id: Number(id),
        userId: req.user.id 
      }
    });

    if (!finance) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await prisma.finance.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;