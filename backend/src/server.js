import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finances.js';
import adminRoutes from './routes/admin.js';
import menuRoutes from './routes/menus.js';
import databaseRoutes from './routes/database.js';
import bankRoutes from './routes/bankRoutes.js';
import goalRoutes from './routes/goals.js';
import reportsRouter from "./routes/reports.js";
import Events from './routes/events.js';
import FamilyMembers from './routes/family.js';
import 'dotenv/config';
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(cors({
  origin: [
    "https://family-finance-lyart.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/finances', financeRoutes);
app.use('/admin', adminRoutes);
app.use('/menus', menuRoutes);
app.use('/database', databaseRoutes);
app.use('/banks', bankRoutes);
app.use('/goals', goalRoutes);
app.use('/reports', reportsRouter);
app.use('/events', Events);
app.use('/family', FamilyMembers);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('API Online 🚀');
});

// 🔹 Exportar para Vercel
export default app;
