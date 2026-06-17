const sequelize = require('../config/database');
const Disciplina = require('./Disciplina');
const Turma = require('./Turma');
const Matricula = require('./Matricula');

module.exports = {
  sequelize,
  Disciplina,
  Turma,
  Matricula,
};
