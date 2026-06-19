const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const disciplinaRoutes = require('./routes/disciplina');
const turmaRoutes = require('./routes/turma');
const matriculaRoutes = require('./routes/matricula');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Prometheus Metrics
const promBundle = require('express-prom-bundle');
const promClient = require('prom-client');
promClient.collectDefaultMetrics();
const metricsMiddleware = promBundle({includeMethod: true, includePath: true, includeStatusCode: true});
app.use(metricsMiddleware);

// Rotas
app.use('/', healthRoutes);
app.use('/api/academic/disciplinas', disciplinaRoutes);
app.use('/api/academic/turmas', turmaRoutes);
app.use('/api/academic/matriculas', matriculaRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
