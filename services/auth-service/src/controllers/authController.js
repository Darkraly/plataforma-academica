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

    let defaultPermissions = [];
    if (tipo === 'admin') defaultPermissions = ['ADMIN_ALL'];
    if (tipo === 'professor') defaultPermissions = ['CRIAR_TURMA', 'CRIAR_ATIVIDADE', 'CRIAR_DISCIPLINA', 'EDITAR_TURMA', 'EDITAR_DISCIPLINA', 'EDITAR_ATIVIDADE', 'DELETAR_TURMA', 'DELETAR_DISCIPLINA', 'DELETAR_ATIVIDADE', 'VER_DIARIO_CLASSE', 'ALTERAR_STATUS_MATRICULA', 'AVALIAR_ENTREGA', 'ADICIONAR_ALUNO_TURMA', 'REMOVER_ALUNO_TURMA'];
    if (tipo === 'aluno') defaultPermissions = ['SUBMETER_ENTREGA', 'REALIZAR_MATRICULA'];

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha: hashedPassword,
      tipo: tipo || 'aluno',
      permissoes: defaultPermissions,
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
      { id: user.id, email: user.email, tipo: user.tipo, permissoes: user.permissoes },
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
      { id: user.id, email: user.email, tipo: user.tipo, permissoes: user.permissoes },
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



/**
 * @desc    Listar todos os usuários da plataforma
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['senha'] },
      include: [
        { model: Aluno, as: 'aluno' },
        { model: Professor, as: 'professor' }
      ]
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) { next(error); }
};

/**
 * @desc    Atualizar permissões de um usuário
 * @route   PATCH /api/auth/users/:id/permissions
 * @access  Private (Admin)
 */
const updatePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    user.permissoes = permissoes;
    await user.save();

    res.status(200).json({ success: true, message: 'Permissões atualizadas com sucesso', data: user });
  } catch (error) {
    logger.error(`Erro ao atualizar permissões do usuário ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar permissões do usuário', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { 
      telefone, endereco, email_pessoal, 
      cpf, rg, sexo, estado_civil, 
      data_nascimento, tipo_sanguineo, naturalidade, nacionalidade,
      aluno_dados // nested object for aluno specific fields
    } = req.body;
    
    // Validar campos obrigatórios
    if (cpf !== undefined && !cpf) {
      return res.status(400).json({ success: false, message: 'O CPF é obrigatório.' });
    }
    if (email_pessoal !== undefined && !email_pessoal) {
      return res.status(400).json({ success: false, message: 'O Email pessoal é obrigatório.' });
    }

    if (telefone !== undefined) user.telefone = telefone;
    if (endereco !== undefined) user.endereco = endereco;
    if (email_pessoal !== undefined) user.email_pessoal = email_pessoal;
    if (cpf !== undefined) user.cpf = cpf;
    if (rg !== undefined) user.rg = rg;
    if (sexo !== undefined) user.sexo = sexo;
    if (estado_civil !== undefined) user.estado_civil = estado_civil;
    if (data_nascimento !== undefined) user.data_nascimento = data_nascimento;
    if (tipo_sanguineo !== undefined) user.tipo_sanguineo = tipo_sanguineo;
    if (naturalidade !== undefined) user.naturalidade = naturalidade;
    if (nacionalidade !== undefined) user.nacionalidade = nacionalidade;

    await user.save();

    // Se for aluno, atualiza os dados do aluno
    if (user.tipo === 'aluno' && aluno_dados) {
      const aluno = await Aluno.findOne({ where: { usuario_id: user.id } });
      if (aluno) {
        if (aluno_dados.nome_pai !== undefined) aluno.nome_pai = aluno_dados.nome_pai;
        if (aluno_dados.nome_mae !== undefined) aluno.nome_mae = aluno_dados.nome_mae;
        if (aluno_dados.contato_responsaveis !== undefined) aluno.contato_responsaveis = aluno_dados.contato_responsaveis;
        await aluno.save();
      }
    }

    // Recarregar usuário com as relações para retornar dados atualizados
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['senha'] },
      include: [
        { model: Aluno, as: 'aluno' },
        { model: Professor, as: 'professor' },
      ],
    });

    res.status(200).json({ success: true, message: 'Perfil atualizado com sucesso', data: updatedUser });
  } catch (error) {
    logger.error(`Erro ao atualizar perfil do usuário ${req.user.id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar perfil', error: error.message });
  }
};

/**
 * @desc    Deletar usuário (Admin)
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    // Also delete associated Aluno or Professor if necessary
    if (user.tipo === 'aluno') {
      await Aluno.destroy({ where: { usuario_id: user.id } });
    } else if (user.tipo === 'professor') {
      await Professor.destroy({ where: { usuario_id: user.id } });
    }
    
    await user.destroy();
    
    res.status(200).json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Editar dados do usuário (Admin)
 * @route   PUT /api/auth/users/:id
 * @access  Private (Admin)
 */
const adminUpdateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { nome, email, tipo } = req.body;
    await user.update({ nome, email, tipo });

    res.status(200).json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

const getUsersBatch = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Formato inválido, esperado array de ids' });
    }

    const users = await User.findAll({
      where: { id: ids },
      attributes: ['id', 'nome', 'email', 'tipo'],
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
