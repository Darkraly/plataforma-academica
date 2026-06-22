const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome não pode ser vazio' },
      len: { args: [2, 255], msg: 'Nome deve ter entre 2 e 255 caracteres' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Este email já está cadastrado' },
    validate: {
      isEmail: { msg: 'Email inválido' },
      notEmpty: { msg: 'Email não pode ser vazio' },
    },
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Senha não pode ser vazia' },
      len: { args: [6, 255], msg: 'Senha deve ter no mínimo 6 caracteres' },
    },
  },
  tipo: {
    type: DataTypes.ENUM('aluno', 'professor', 'admin'),
    allowNull: false,
    defaultValue: 'aluno',
    validate: {
      isIn: {
        args: [['aluno', 'professor', 'admin']],
        msg: 'Tipo deve ser: aluno, professor ou admin',
      },
    },
  },
  permissoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email_pessoal: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Email pessoal inválido' },
    },
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: { msg: 'Este CPF já está cadastrado' },
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  sexo: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  estado_civil: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  tipo_sanguineo: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  naturalidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  nacionalidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

module.exports = User;
