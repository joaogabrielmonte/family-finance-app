import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import axios from "axios"; // ✅ obrigatório

const router = express.Router();

const ABSTRACT_API_KEY =
  process.env.ABSTRACT_API_KEY || "38f56175656d4a9bb34763f7ff05ea92";

async function validarEmail(email) {
  return validator.isEmail(email);
}

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1️⃣ Campos obrigatórios
    if (!name || !email || !password)
      return res.status(400).json({ message: "Preencha todos os campos." });

    // 2️⃣ Verifica formato de e-mail
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "E-mail inválido." });

    // 3️⃣ Força mínima da senha
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        message:
          "A senha deve ter pelo menos 8 caracteres, incluindo letras e números.",
      });
    }
    // 4️⃣ E-mail já cadastrado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "E-mail já cadastrado." });

    // 5️⃣ Validação externa do e-mail
    const emailValido = await validarEmail(email);
    if (!emailValido)
      return res.status(400).json({
        message:
          "E-mail inexistente ou não confiável. Verifique e tente novamente.",
      });

    // 🔹 Criptografa e salva
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "user" },
      select: { id: true, name: true, email: true, role: true },
    });

    const family = await prisma.family.create({
      data: {
        name: `${user.name.split(" ")[0]} Family`,
        ownerId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

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
      message: "Usuário e família criados com sucesso.",
      user,
      family,
    });
  } catch (error) {
    console.error("❌ Erro ao registrar usuário:", error);
    res.status(500).json({
      message: "Erro ao criar usuário e família.",
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
