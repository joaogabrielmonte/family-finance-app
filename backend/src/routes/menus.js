import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /menus → lista todos os menus ativos com submenus
router.get('/', async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { isActive: true },
      include: { submenus: true },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar menus' });
  }
});

// POST /menus → criar menu
router.post('/', async (req, res) => {
  const { name, path, icon, role, parentId, isActive, orderIndex } = req.body;

  const parentIdInt =
    parentId !== undefined && parentId !== null && !isNaN(parseInt(parentId))
      ? parseInt(parentId)
      : null;

  try {
    const menu = await prisma.menu.create({
      data: {
        name,
        path: path || null,
        icon: icon || null,
        role: role || null,
        parentId: parentIdInt,
        isActive: isActive ?? true,
        orderIndex: orderIndex ?? 0,
      },
    });
    res.json(menu);
  } catch (err) {
    console.error('Erro ao criar menu:', err);
    res.status(500).json({ error: 'Erro ao criar menu' });
  }
});

// PUT /menus/:id → atualizar menu
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, path, icon, role, parentId, isActive, orderIndex } = req.body;

  let parentIdInt = null;
  if (parentId !== undefined && parentId !== null && !isNaN(parseInt(parentId))) {
    parentIdInt = parseInt(parentId);
  }

  try {
    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        path: path || null,
        icon: icon || null,
        role: role || null,
        parentId: parentIdInt,
        isActive: isActive ?? true,
        orderIndex: orderIndex ?? 0,
      },
    });

    res.json(menu);
  } catch (err) {
    console.error('Erro ao atualizar menu:', err);
    res.status(500).json({ error: 'Erro ao atualizar menu' });
  }
});

// DELETE /menus/:id → excluir menu
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.menu.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Menu deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar menu:', err);
    res.status(500).json({ error: 'Erro ao deletar menu' });
  }
});

export default router;
