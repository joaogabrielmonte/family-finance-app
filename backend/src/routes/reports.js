import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";
import dayjs from "dayjs";

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Gastos por categoria (PieChart)
router.get("/expenses-by-category", authenticateToken, async (req, res) => {
  try {
    const data = await prisma.finance.groupBy({
      by: ["description"], // aqui usamos a descrição como "categoria"
      where: { userId: req.user.id, type: "saida" },
      _sum: { amount: true },
    });

    const formatted = data.map((item) => ({
      category: item.description,
      value: item._sum.amount || 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar gastos por categoria" });
  }
});

// 🔹 Evolução mensal do saldo (LineChart)
router.get("/monthly-balance", authenticateToken, async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "asc" },
    });

    const map = {};
    finances.forEach((f) => {
      const key = dayjs(f.date).format("MM/YYYY");
      if (!map[key]) map[key] = 0;
      map[key] += f.type === "entrada" ? f.amount : -f.amount;
    });

    const result = Object.entries(map).map(([month, balance]) => ({
      month,
      balance,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar evolução mensal" });
  }
});

// 🔹 Entradas x Saídas (BarChart)
router.get("/entries-vs-exits", authenticateToken, async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "asc" },
    });

    const map = {};
    finances.forEach((f) => {
      const key = dayjs(f.date).format("MM/YYYY");
      if (!map[key]) map[key] = { month: key, entries: 0, exits: 0 };
      if (f.type === "entrada") map[key].entries += f.amount;
      if (f.type === "saida") map[key].exits += f.amount;
    });

    res.json(Object.values(map));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar entradas x saídas" });
  }
});

export default router;
