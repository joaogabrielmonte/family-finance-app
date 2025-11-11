// api/server.js
import express from "express";
import cors from "cors";
import 'dotenv/config';

import authRoutes from "../src/routes/auth.js";
import financeRoutes from "../src/routes/finances.js";
import adminRoutes from "../src/routes/admin.js";
import menuRoutes from "../src/routes/menus.js";
import databaseRoutes from "../src/routes/database.js";
import bankRoutes from "../src/routes/bankRoutes.js";
import goalRoutes from "../src/routes/goals.js";
import reportsRouter from "../src/routes/reports.js";
import Events from "../src/routes/events.js";
import FamilyMembers from "../src/routes/family.js";

const app = express();

app.use(cors({
  origin: [
    "https://family-finance-lyart.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/finances", financeRoutes);
app.use("/admin", adminRoutes);
app.use("/menus", menuRoutes);
app.use("/database", databaseRoutes);
app.use("/banks", bankRoutes);
app.use("/goals", goalRoutes);
app.use("/reports", reportsRouter);
app.use("/events", Events);
app.use("/family", FamilyMembers);

// Rota base
app.get("/", (req, res) => {
  res.send("API Online 🚀 (rodando na Vercel)");
});

// Apenas exporta
export default app;
