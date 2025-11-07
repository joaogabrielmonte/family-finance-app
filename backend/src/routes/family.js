import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ GET: Listar membros da família do usuário logado
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // busca o usuário logado e sua família
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return res.status(404).json({ message: "Usuário não pertence a nenhuma família." });
    }

    // busca todos os membros dessa família
    const members = await prisma.familyMember.findMany({
      where: { familyId: user.familyId },
    });

    res.json(members);
  } catch (err) {
    console.error("Erro ao buscar membros:", err);
    res.status(500).json({ message: "Erro ao buscar membros da família." });
  }
});

// ✅ POST: Adicionar membro à família do usuário logado
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, role, avatar } = req.body;

    // pega a família do usuário logado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user?.familyId) {
      return res.status(400).json({ message: "Usuário não pertence a nenhuma família." });
    }

    const newMember = await prisma.familyMember.create({
      data: {
        familyId: user.familyId,
        userId: null, // membro externo por padrão
        name,
        role,
        avatar,
      },
    });

    res.status(201).json(newMember);
  } catch (err) {
    console.error("Erro ao adicionar membro:", err);
    res.status(500).json({ message: "Erro ao adicionar membro." });
  }
});

// ✅ PUT: Atualizar membro
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, avatar } = req.body;
    const userId = req.user.id;

    // verifica se o membro pertence à família do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    const member = await prisma.familyMember.findUnique({
      where: { id: parseInt(id) },
    });

    if (!member || member.familyId !== user.familyId)
      return res.status(403).json({ message: "Acesso negado" });

    const updated = await prisma.familyMember.update({
      where: { id: parseInt(id) },
      data: { name, role, avatar },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar membro:", err);
    res.status(500).json({ message: "Erro ao atualizar membro." });
  }
});

// ✅ DELETE: Remover membro
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    const member = await prisma.familyMember.findUnique({
      where: { id: parseInt(id) },
    });

    if (!member || member.familyId !== user.familyId)
      return res.status(403).json({ message: "Acesso negado" });

    await prisma.familyMember.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Membro removido com sucesso" });
  } catch (err) {
    console.error("Erro ao remover membro:", err);
    res.status(500).json({ message: "Erro ao remover membro." });
  }
});

// Criar transação para um membro
router.post("/:familyId/member/:memberId/finance", authenticateToken, async (req, res) => {
  try {
    const { familyId, memberId } = req.params;
    const userId = req.user.id;
    const { description, amount, type } = req.body;

    // valida se o membro pertence à família do usuário
    const member = await prisma.familyMember.findUnique({
      where: { id: parseInt(memberId) },
    });

    if (!member || member.familyId !== parseInt(familyId))
      return res.status(403).json({ message: "Acesso negado" });

    // cria transação
    const transaction = await prisma.finance.create({
      data: {
        userId,
        memberId: member.id,
        description,
        amount,
        type,
        date: new Date(),
      },
    });

    // atualiza saldo parcial do membro
    const delta = type === "entrada" ? amount : -amount;
    await prisma.familyMember.update({
      where: { id: member.id },
      data: { partialBalance: { increment: delta } },
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar transação para o membro." });
  }
});


export default router;
