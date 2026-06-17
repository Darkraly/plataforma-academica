const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const controller = require('../controllers/entregaController');

router.post('/', authenticate,
  [
    body('atividade_id').isInt().withMessage('ID da atividade é obrigatório'),
    body('aluno_id').isInt().withMessage('ID do aluno é obrigatório'),
  ],
  validate, controller.submit
);
router.get('/aluno/:alunoId', authenticate, controller.getByAluno);
router.get('/atividade/:atividadeId', authenticate, controller.getByAtividade);
router.put('/:id/nota', authenticate,
  [ body('nota').isFloat({ min: 0, max: 10 }).withMessage('Nota deve ser entre 0 e 10') ],
  validate, controller.grade
);

module.exports = router;
