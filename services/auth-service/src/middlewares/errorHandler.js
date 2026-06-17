const logger = require('../config/logger');

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Erros do Sequelize - Validação
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors,
    });
  }

  // Erros do Sequelize - Unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(409).json({
      success: false,
      message: 'Registro duplicado',
      errors,
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Erro interno do servidor' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
