const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Atividade = require('./Atividade');

const Entrega = sequelize.define('Entrega', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  atividade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Atividade, key: 'id' },
  },
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do aluno no auth-service (referência lógica)',
  },
  data_entrega: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nota: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Nota não pode ser menor que 0' },
      max: { args: [10], msg: 'Nota não pode ser maior que 10' },
    },
  },
}, {
  tableName: 'entregas',
  timestamps: true,
  underscored: true,
});

Atividade.hasMany(Entrega, { foreignKey: 'atividade_id', as: 'entregas' });
Entrega.belongsTo(Atividade, { foreignKey: 'atividade_id', as: 'atividade' });

module.exports = Entrega;
