require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexão com o banco de dados estabelecida com sucesso');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Modelos sincronizados com o banco de dados');

    app.listen(PORT, () => {
      logger.info(`🚀 Academic Service rodando na porta ${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
