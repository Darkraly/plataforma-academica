const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('x-correlation-id', req.correlationId);

  const start = Date.now();
  logger.info(`→ ${req.method} ${req.originalUrl}`, { correlationId: req.correlationId });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, { correlationId: req.correlationId });
  });

  next();
};

module.exports = { requestLogger };
