require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Testar conexão com o banco
    await sequelize.authenticate();
    logger.info('✅ Conexão com o banco de dados estabelecida com sucesso');

    // Sincronizar modelos (criar tabelas se não existirem)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Modelos sincronizados com o banco de dados');

    // Seed: Criar Admin Inicial se não existir
    const bcrypt = require('bcryptjs');
    const { User } = require('./models');
    const adminEmail = 'admin@plataforma.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        nome: 'Administrador Principal',
        email: adminEmail,
        senha: hashedPassword,
        tipo: 'admin'
      });
      logger.info('✅ Conta de Administrador inicial criada: ' + adminEmail);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Auth Service rodando na porta ${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
