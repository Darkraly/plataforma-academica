const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const controller = require('../controllers/matriculaController');

router.post('/',
  authenticate,
  [
    body('aluno_id').isInt().withMessage('ID do aluno é obrigatório'),
    body('turma_id').isInt().withMessage('ID da turma é obrigatório'),
  ],
  validate,
  controller.enroll
);

router.get('/aluno/:alunoId', authenticate, controller.getByAluno);
router.get('/turma/:turmaId', authenticate, controller.getByTurma);
router.patch('/:id/status',
  authenticate,
  [
    body('status').isIn(['ativa', 'trancada', 'concluida']).withMessage('Status inválido'),
  ],
  validate,
  controller.updateStatus
);

module.exports = router;
