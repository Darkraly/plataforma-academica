const { validationResult } = require('express-validator');

/**
 * Middleware que verifica os resultados do express-validator
 * Deve ser usado após as regras de validação nas rotas
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = { validate };
