const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  register,
  login,
  getProfile,
  getUserById,
  getAllUsers,
  updatePermissions,
  updateProfile,
  deleteUser,
  adminUpdateUser,
  getUsersBatch,
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Private (Admin)
 */
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  [
    body('nome')
      .trim()
      .notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória')
      .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('tipo')
      .optional()
      .isIn(['aluno', 'professor', 'admin']).withMessage('Tipo deve ser: aluno, professor ou admin'),
  ],
  validate,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória'),
  ],
  validate,
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Buscar usuário por ID
 * @access  Private
 */
router.get('/users/:id', authenticate, getUserById);

/**
 * @route   POST /api/auth/users/batch
 * @desc    Buscar múltiplos usuários por ID
 * @access  Private
 */
router.post('/users/batch', authenticate, getUsersBatch);

/**
 * @route   GET /api/auth/users
 * @desc    Listar todos os usuários (admin, alunos e professores)
 * @access  Private (Admin)
 */
router.get('/users', authenticate, authorize('admin', 'professor'), getAllUsers);
/**
 * @route   PATCH /api/auth/users/:id/permissions
 * @desc    Atualizar permissões de um usuário
 * @access  Private (Admin)
 */
router.patch('/users/:id/permissions', authenticate, authorize('admin'), updatePermissions);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Editar usuário
 * @access  Private (Admin)
 */
router.put('/users/:id', authenticate, authorize('admin'), adminUpdateUser);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Deletar usuário
 * @access  Private (Admin)
 */
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
