import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Listar metas do usuário logado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar metas.' });
  }
});

// 🔹 Criar nova meta
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body; 

    if (!title || !targetAmount)
      return res.status(400).json({ error: 'Título e valor-alvo são obrigatórios.' });

    console.log({ title, targetAmount, currentAmount, deadline, userId: req.user.id });

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        userId: req.user.id,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar meta.' });
  }
});

// 🔹 Atualizar meta
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, currentAmount, deadline } = req.body;

    const goal = await prisma.goal.updateMany({
      where: { id: parseInt(id), userId: req.user.id },
      data: {
        title,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    if (goal.count === 0)
      return res.status(404).json({ error: 'Meta não encontrada ou não pertence a você.' });

    res.json({ message: 'Meta atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar meta.' });
  }
});

// 🔹 Excluir meta
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.goal.deleteMany({
      where: { id: parseInt(id), userId: req.user.id },
    });

    if (deleted.count === 0)
      return res.status(404).json({ error: 'Meta não encontrada ou não pertence a você.' });

    res.json({ message: 'Meta excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir meta.' });
  }
});

export default router;
