const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const atividadeRoutes = require('./routes/atividade');
const entregaRoutes = require('./routes/entrega');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/', healthRoutes);
app.use('/api/assignments/atividades', atividadeRoutes);
app.use('/api/assignments/entregas', entregaRoutes);

app.use(errorHandler);

module.exports = app;
