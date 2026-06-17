const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  register,
  login,
  getProfile,
  getUserById,
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post(
  '/register',
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

/**
 * @route   GET /api/auth/users/:id
 * @desc    Buscar usuário por ID
 * @access  Private
 */
router.get('/users/:id', authenticate, getUserById);

module.exports = router;
