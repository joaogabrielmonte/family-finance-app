import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Cria o usuário e já retorna o id
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 🔹 Cria a família associada
    const family = await prisma.family.create({
      data: {
        name: `${user.name.split(" ")[0]} Family`,
        ownerId: user.id,
      },
    });

    // 🔹 Atualiza o usuário com o familyId
    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

    // 🔹 Adiciona o usuário como membro "owner"
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        name: user.name,
        role: "owner",
        avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${
          user.name.split(" ")[0]
        }`,
      },
    });

    res.status(201).json({
      message: "Usuário e família criados com sucesso",
      user,
      family,
    });
  } catch (error) {
    console.error("❌ Erro ao registrar usuário:", error);
    res.status(500).json({
      message: "Erro ao criar usuário e família",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Senha inválida" });

  const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", {
    expiresIn: "1h",
  });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

export default router;
