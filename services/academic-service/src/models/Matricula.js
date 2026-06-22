const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Turma = require('./Turma');

const Matricula = sequelize.define('Matricula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do aluno no auth-service (referência lógica)',
  },
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Turma,
      key: 'id',
    },
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('ativa', 'trancada', 'concluida'),
    allowNull: false,
    defaultValue: 'ativa',
  },
  nota_final: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  faltas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'matriculas',
  timestamps: true,
  underscored: true,
});

// Relacionamentos
Turma.hasMany(Matricula, { foreignKey: 'turma_id', as: 'matriculas' });
Matricula.belongsTo(Turma, { foreignKey: 'turma_id', as: 'turma' });

module.exports = Matricula;
