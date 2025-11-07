// backend/src/routes/database.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 🔹 Listar todas as tabelas do Prisma
 */
router.get('/tables', async (req, res) => {
  try {
    const prismaModels = Object.keys(prisma).filter(
      key => typeof prisma[key] === 'object' && prisma[key].findMany
    );
    res.json(prismaModels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tabelas' });
  }
});

/**
 * 🔹 Listar registros de uma tabela
 */
router.get('/:table', async (req, res) => {
  const { table } = req.params;
  if (!prisma[table] || !prisma[table].findMany) {
    return res.status(400).json({ error: 'Tabela inválida' });
  }

  try {
    const records = await prisma[table].findMany();
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

/**
 * 🔹 Criar registro em uma tabela
 */
router.post('/:table', async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  if (!prisma[table] || !prisma[table].create) {
    return res.status(400).json({ error: 'Tabela inválida' });
  }

  try {
    const created = await prisma[table].create({ data });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar registro' });
  }
});

/**
 * 🔹 Atualizar registro em uma tabela
 * ⚠️ Aqui é necessário enviar no body um campo "id"
 */
router.put('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  if (!prisma[table] || !prisma[table].update) {
    return res.status(400).json({ error: 'Tabela inválida' });
  }

  try {
    const updated = await prisma[table].update({
      where: { id: Number(id) },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

/**
 * 🔹 Deletar registro em uma tabela
 */
router.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  if (!prisma[table] || !prisma[table].delete) {
    return res.status(400).json({ error: 'Tabela inválida' });
  }

  try {
    await prisma[table].delete({ where: { id: Number(id) } });
    res.json({ message: 'Registro deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

export default router;
