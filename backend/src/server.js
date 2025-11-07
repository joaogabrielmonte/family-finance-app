import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finances.js';
import adminRoutes from './routes/admin.js'; // 👈 adicione isto
import 'dotenv/config';
import menuRoutes from './routes/menus.js';
import databaseRoutes from './routes/database.js';
import bankRoutes from './routes/bankRoutes.js';
import goalRoutes from './routes/goals.js';
import reportsRouter from "./routes/reports.js";
import Events from './routes/events.js';
import FamilyMembers from './routes/family.js';


const app = express();

app.use(cors());
app.use(express.json());

// Montando as rotas
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

// Teste básico pra ver se o servidor está rodando
app.get('/', (req, res) => {
  res.send('API Online 🚀');
});

app.listen(3333, '0.0.0.0', () => {
  console.log('Servidor rodando na porta 3333');
});
