const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Atividade = sequelize.define('Atividade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID da turma no academic-service (referência lógica)',
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: { msg: 'Título não pode ser vazio' } },
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prazo: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: { isDate: { msg: 'Prazo deve ser uma data válida' } },
  },
}, {
  tableName: 'atividades',
  timestamps: true,
  underscored: true,
});

module.exports = Atividade;
