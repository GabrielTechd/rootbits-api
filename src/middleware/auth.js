const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não informado' });
    }
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ erro: 'Usuário não encontrado' });
    if (!user.ativo) return res.status(401).json({ erro: 'Usuário inativo' });
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError') return res.status(401).json({ erro: 'Token inválido' });
    if (e.name === 'TokenExpiredError') return res.status(401).json({ erro: 'Token expirado' });
    res.status(500).json({ erro: 'Erro ao validar autenticação' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ erro: 'Não autenticado' });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ erro: 'Sem permissão para esta ação' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.ativo) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = { auth, requireRole, optionalAuth };
