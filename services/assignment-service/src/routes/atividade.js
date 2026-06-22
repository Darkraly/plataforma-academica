const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize, requirePermission } = require('../middlewares/authMiddleware');
const controller = require('../controllers/atividadeController');

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, requirePermission('CRIAR_ATIVIDADE'),
  [
    body('turma_id').isInt().withMessage('ID da turma é obrigatório'),
    body('titulo').trim().notEmpty().withMessage('Título é obrigatório'),
    body('prazo').isDate().withMessage('Prazo deve ser uma data válida (YYYY-MM-DD)'),
  ],
  validate, controller.create
);
router.put('/:id', authenticate, requirePermission('EDITAR_ATIVIDADE'),
  [
    body('titulo').optional().trim().notEmpty().withMessage('Título não pode ser vazio'),
    body('prazo').optional().isDate().withMessage('Prazo inválido'),
  ],
  validate, controller.update
);
router.delete('/:id', authenticate, requirePermission('DELETAR_ATIVIDADE'), controller.remove);

module.exports = router;
