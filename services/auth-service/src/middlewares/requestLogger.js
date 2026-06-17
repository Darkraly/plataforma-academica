const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Middleware de logging de requisições HTTP
 * Adiciona correlation ID e loga request/response
 */
const requestLogger = (req, res, next) => {
  // Gerar ou propagar correlation ID
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);

  const start = Date.now();

  // Log da requisição
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Log da resposta (quando terminar)
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level](`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = { requestLogger };
