const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Professor = sequelize.define('Professor', {
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
  siape: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'Este SIAPE já está cadastrado' },
    validate: {
      notEmpty: { msg: 'SIAPE não pode ser vazio' },
    },
  },
  departamento: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Departamento não pode ser vazio' },
    },
  },
}, {
  tableName: 'professores',
  timestamps: true,
  underscored: true,
});

// Relacionamentos
User.hasOne(Professor, { foreignKey: 'usuario_id', as: 'professor' });
Professor.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = Professor;
