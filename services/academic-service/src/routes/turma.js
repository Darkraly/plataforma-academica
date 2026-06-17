const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const controller = require('../controllers/turmaController');

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);

router.post('/',
  authenticate,
  [
    body('disciplina_id').isInt().withMessage('ID da disciplina é obrigatório'),
    body('professor_id').isInt().withMessage('ID do professor é obrigatório'),
    body('semestre').trim().notEmpty().withMessage('Semestre é obrigatório'),
    body('horario').trim().notEmpty().withMessage('Horário é obrigatório'),
  ],
  validate,
  controller.create
);

router.put('/:id',
  authenticate,
  [
    body('disciplina_id').optional().isInt().withMessage('ID da disciplina inválido'),
    body('professor_id').optional().isInt().withMessage('ID do professor inválido'),
    body('semestre').optional().trim().notEmpty().withMessage('Semestre não pode ser vazio'),
    body('horario').optional().trim().notEmpty().withMessage('Horário não pode ser vazio'),
  ],
  validate,
  controller.update
);

router.delete('/:id', authenticate, controller.remove);

module.exports = router;
