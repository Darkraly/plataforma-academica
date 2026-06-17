const sequelize = require('../config/database');
const User = require('./User');
const Aluno = require('./Aluno');
const Professor = require('./Professor');

module.exports = {
  sequelize,
  User,
  Aluno,
  Professor,
};
