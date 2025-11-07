import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Criar evento
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, amount, type, date } = req.body;
    const event = await prisma.event.create({
      data: { title, description, amount, type, date: new Date(date), userId: req.user.id },
    });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Editar evento
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, amount, type, date } = req.body;
    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: { title, description, amount, type, date: new Date(date) },
    });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Excluir evento
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Evento excluído" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir evento" });
  }
});

// Listar eventos do mês
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const events = await prisma.event.findMany({
      where: {
        userId: req.user.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});

export default router;
