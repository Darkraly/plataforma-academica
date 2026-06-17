const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Aluno, Professor } = require('../models');
const logger = require('../config/logger');

/**
 * @desc    Registrar novo usuário
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { nome, email, senha, tipo, matricula, curso, siape, departamento } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado',
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha: hashedPassword,
      tipo: tipo || 'aluno',
    });

    // Criar perfil específico baseado no tipo
    if (tipo === 'aluno') {
      await Aluno.create({
        usuario_id: user.id,
        matricula: matricula || `ALU${Date.now()}`,
        curso: curso || 'Não informado',
      });
    } else if (tipo === 'professor') {
      await Professor.create({
        usuario_id: user.id,
        siape: siape || `SIA${Date.now()}`,
        departamento: departamento || 'Não informado',
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Novo usuário registrado: ${email} (${tipo})`);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login do usuário
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Login realizado: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter perfil do usuário logado
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['senha'] },
      include: [
        { model: Aluno, as: 'aluno' },
        { model: Professor, as: 'professor' },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Buscar usuário por ID
 * @route   GET /api/auth/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
      include: [
        { model: Aluno, as: 'aluno' },
        { model: Professor, as: 'professor' },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserById,
};
