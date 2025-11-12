import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js'; // 🔒 middleware JWT (ver abaixo)

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ GET /menus → lista menus ativos conforme o role do usuário logado
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role || 'user'; // padrão: usuário comum

    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
        OR: [
          { role: null },        // público
          { role: userRole },    // compatível com role do usuário
        ],
      },
      include: { submenus: true },
      orderBy: { orderIndex: 'asc' },
    });

    res.json(menus);
  } catch (err) {
    console.error('Erro ao buscar menus:', err);
    res.status(500).json({ error: 'Erro ao buscar menus' });
  }
});

/**
 * 🔐 POST /menus → criar menu (somente admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

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

/**
 * 🔐 PUT /menus/:id → atualizar menu (somente admin)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const { name, path, icon, role, parentId, isActive, orderIndex } = req.body;

  const parentIdInt =
    parentId !== undefined && parentId !== null && !isNaN(parseInt(parentId))
      ? parseInt(parentId)
      : null;

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

/**
 * 🔐 DELETE /menus/:id → excluir menu (somente admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

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
