// Setup global para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'auth_db_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
