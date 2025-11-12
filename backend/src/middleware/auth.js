import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, 'SECRET_KEY', (err, user) => { // ⚡ usar mesma chave do login
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user; // id e role
    next();
  });
};

// Middleware para verificar se é admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Acesso negado: Admin apenas' });
  next();
};
