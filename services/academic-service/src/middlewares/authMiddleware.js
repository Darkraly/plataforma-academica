const jwt = require('jsonwebtoken');

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
      permissoes: decoded.permissoes || [],
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

const requirePermission = (actionOrActions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }
    
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions];
    const userPerms = req.user.permissoes || [];
    
    const hasPermission = req.user.tipo === 'admin' || 
                          userPerms.includes('ADMIN_ALL') || 
                          actions.some(a => userPerms.includes(a));
    
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: `Permissão negada. Requer uma das seguintes: ${actions.join(', ')}` });
    }
    next();
  };
};

module.exports = { authenticate, authorize, requirePermission };
