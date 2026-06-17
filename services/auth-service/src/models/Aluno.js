const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Aluno = sequelize.define('Aluno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  matricula: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'Esta matrícula já está cadastrada' },
    validate: {
      notEmpty: { msg: 'Matrícula não pode ser vazia' },
    },
  },
  curso: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Curso não pode ser vazio' },
    },
  },
}, {
  tableName: 'alunos',
  timestamps: true,
  underscored: true,
});

// Relacionamentos
User.hasOne(Aluno, { foreignKey: 'usuario_id', as: 'aluno' });
Aluno.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = Aluno;
