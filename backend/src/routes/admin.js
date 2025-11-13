import express from "express";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Listar usuários
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

// 🔹 Criar novo usuário (mesma lógica do /register)
router.post("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nome, email e senha são obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ message: "Erro interno ao criar usuário." });
  }
});

// 🔹 Atualizar role
router.put("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role, name, email, password } = req.body;
    const dataToUpdate = {};

    if (role) dataToUpdate.role = role;
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ message: "Usuário atualizado com sucesso", user: updated });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});


// 🔹 Excluir usuário
router.delete("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  try {
    console.log("➡️ Iniciando exclusão do usuário ID:", userId);

    // 1️⃣ Remover membros de famílias criadas pelo usuário
    await prisma.familyMember.deleteMany({
      where: {
        family: { ownerId: userId }
      }
    });
    console.log("✅ Membros das famílias do usuário removidos");

    // 2️⃣ Remover famílias que ele criou
    await prisma.family.deleteMany({
      where: { ownerId: userId }
    });
    console.log("✅ Famílias do usuário removidas");

    // 3️⃣ Remover vínculos diretos com outras famílias
    await prisma.familyMember.deleteMany({ where: { userId } });
    console.log("✅ Vínculos do usuário em outras famílias removidos");

    // 4️⃣ Remover registros dependentes
    await prisma.finance.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    await prisma.event.deleteMany({ where: { userId } });
    await prisma.bank.deleteMany({ where: { userId } });
    console.log("✅ Registros dependentes removidos");

    // 5️⃣ Finalmente, remover o usuário
    await prisma.user.delete({
      where: { id: userId },
    });
    console.log("✅ Usuário deletado");

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao excluir usuário:", error);
    res.status(500).json({
      message: "Erro ao excluir usuário.",
      error: error.message,
    });
  }
});

export default router;
