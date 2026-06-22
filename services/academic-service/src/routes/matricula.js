const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize, requirePermission } = require('../middlewares/authMiddleware');
const controller = require('../controllers/matriculaController');

router.post('/',
  authenticate,
  requirePermission(['REALIZAR_MATRICULA', 'ADICIONAR_ALUNO_TURMA', 'EDITAR_TURMA']),
  [
    body('aluno_id').isInt().withMessage('ID do aluno é obrigatório'),
    body('turma_id').isInt().withMessage('ID da turma é obrigatório'),
  ],
  validate,
  controller.enroll
);

router.get('/aluno/:alunoId', authenticate, controller.getByAluno);
router.get('/turma/:turmaId', authenticate, requirePermission(['VER_DIARIO_CLASSE', 'ADICIONAR_ALUNO_TURMA', 'EDITAR_TURMA']), controller.getByTurma);
router.patch('/:id/status',
  authenticate,
  requirePermission('ALTERAR_STATUS_MATRICULA'),
  [
    body('status').isIn(['ativa', 'trancada', 'concluida']).withMessage('Status inválido'),
  ],
  validate,
  controller.updateStatus
);

router.delete('/:id',
  authenticate,
  requirePermission(['REMOVER_ALUNO_TURMA', 'EDITAR_TURMA']),
  controller.remove
);

module.exports = router;
