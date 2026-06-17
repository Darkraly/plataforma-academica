const sequelize = require('../config/database');
const Atividade = require('./Atividade');
const Entrega = require('./Entrega');

module.exports = { sequelize, Atividade, Entrega };
