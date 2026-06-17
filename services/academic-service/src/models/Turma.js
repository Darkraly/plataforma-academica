const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Disciplina = require('./Disciplina');

const Turma = sequelize.define('Turma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Disciplina,
      key: 'id',
    },
  },
  professor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do professor no auth-service (referência lógica)',
  },
  semestre: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Semestre não pode ser vazio' },
    },
  },
  horario: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Horário não pode ser vazio' },
    },
  },
}, {
  tableName: 'turmas',
  timestamps: true,
  underscored: true,
});

// Relacionamentos
Disciplina.hasMany(Turma, { foreignKey: 'disciplina_id', as: 'turmas' });
Turma.belongsTo(Disciplina, { foreignKey: 'disciplina_id', as: 'disciplina' });

module.exports = Turma;
