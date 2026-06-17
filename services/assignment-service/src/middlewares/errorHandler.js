const logger = require('../config/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path });
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Erro de validação', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'Registro duplicado', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Erro interno do servidor' });
};

module.exports = { errorHandler };
