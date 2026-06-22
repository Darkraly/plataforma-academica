const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Middleware de autenticação JWT
 * Verifica o token no header Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar e decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    );

    // Adicionar dados do usuário ao request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
      permissoes: decoded.permissoes || [],
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expirado');
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Token inválido');
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    next(error);
  }
};

/**
 * Middleware de autorização por tipo de usuário
 * @param {...string} tipos - Tipos de usuário permitidos
 */
const authorize = (...tipos) => {
  return (req, res, next) => {
    if (!req.user || !tipos.includes(req.user.tipo)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    next();
  };
};

/**
 * Middleware para checar permissão granular
 * @param {string} action - Ação requerida (ex: 'CRIAR_TURMA')
 */
const requirePermission = (action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }
    
    // Admin master tem acesso total, ou o usuário tem a permissão específica
    const hasPermission = req.user.tipo === 'admin' || req.user.permissoes.includes(action) || req.user.permissoes.includes('ADMIN_ALL');
    
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: `Permissão negada. Requer: ${action}` });
    }
    next();
  };
};

module.exports = { authenticate, authorize, requirePermission };
