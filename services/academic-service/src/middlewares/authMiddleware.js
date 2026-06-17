const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Middleware de autenticação JWT para o academic-service
 * Valida o token JWT usando a mesma JWT_SECRET compartilhada
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    next(error);
  }
};

const authorize = (...tipos) => {
  return (req, res, next) => {
    if (!req.user || !tipos.includes(req.user.tipo)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
