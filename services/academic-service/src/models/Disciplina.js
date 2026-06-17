const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disciplina = sequelize.define('Disciplina', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome da disciplina não pode ser vazio' },
    },
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: { msg: 'Este código de disciplina já existe' },
    validate: {
      notEmpty: { msg: 'Código não pode ser vazio' },
    },
  },
  carga_horaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Carga horária deve ser um número inteiro' },
      min: { args: [1], msg: 'Carga horária deve ser maior que 0' },
    },
  },
}, {
  tableName: 'disciplinas',
  timestamps: true,
  underscored: true,
});

module.exports = Disciplina;
