import express from 'express';
import bankController from '../controllers/bankController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rotas do módulo de bancos
router.get('/user/:userId', authenticateToken, bankController.index);   // Listar bancos do usuário
router.post('/', authenticateToken, bankController.store);              // Criar novo banco
router.put('/:id', authenticateToken, bankController.update);          // Atualizar banco
router.delete('/:id', authenticateToken, bankController.destroy);      // Excluir banco

export default router;