const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const controller = require('../controllers/disciplinaController');

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);

router.post('/',
  authenticate,
  [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('codigo').trim().notEmpty().withMessage('Código é obrigatório'),
    body('carga_horaria').isInt({ min: 1 }).withMessage('Carga horária deve ser um número inteiro positivo'),
  ],
  validate,
  controller.create
);

router.put('/:id',
  authenticate,
  [
    body('nome').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
    body('codigo').optional().trim().notEmpty().withMessage('Código não pode ser vazio'),
    body('carga_horaria').optional().isInt({ min: 1 }).withMessage('Carga horária inválida'),
  ],
  validate,
  controller.update
);

router.delete('/:id', authenticate, controller.remove);

module.exports = router;
