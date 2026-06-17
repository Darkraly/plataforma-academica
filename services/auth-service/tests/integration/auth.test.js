const request = require('supertest');
const app = require('../../src/app');

// Mock do Sequelize para não depender de banco de dados real nos testes
jest.mock('../../src/models', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };

  const mockAluno = {
    create: jest.fn(),
  };

  const mockProfessor = {
    create: jest.fn(),
  };

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync: jest.fn().mockResolvedValue(),
    },
    User: mockUser,
    Aluno: mockAluno,
    Professor: mockProfessor,
  };
});

// Mock do logger para não poluir output dos testes
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const { User, Aluno } = require('../../src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Service - Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // Health Check
  // ==========================================
  describe('GET /health', () => {
    it('deve retornar status UP', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('auth-service');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  // ==========================================
  // Register
  // ==========================================
  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockCreatedUser = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        tipo: 'aluno',
        senha: await bcrypt.hash('123456', 10),
      };

      User.findOne.mockResolvedValue(null); // email não existe
      User.create.mockResolvedValue(mockCreatedUser);
      Aluno.create.mockResolvedValue({ id: 1, usuario_id: 1, matricula: 'ALU001', curso: 'Engenharia' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '123456',
          tipo: 'aluno',
          matricula: 'ALU001',
          curso: 'Engenharia',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('joao@email.com');
    });

    it('deve retornar erro 409 se email já existe', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'joao@email.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '123456',
          tipo: 'aluno',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('deve retornar erro 400 se dados estão incompletos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'joao@email.com',
          // faltando nome e senha
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar erro 400 se email é inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          email: 'email-invalido',
          senha: '123456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar erro 400 se senha tem menos de 6 caracteres', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  // ==========================================
  // Login
  // ==========================================
  describe('POST /api/auth/login', () => {
    it('deve fazer login com sucesso', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const mockUser = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        tipo: 'aluno',
        senha: hashedPassword,
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@email.com',
          senha: '123456',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('joao@email.com');
    });

    it('deve retornar erro 401 se email não existe', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@email.com',
          senha: '123456',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('deve retornar erro 401 se senha está incorreta', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        email: 'joao@email.com',
        senha: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@email.com',
          senha: 'senha_errada',
        });

      expect(res.statusCode).toBe(401);
    });

    it('deve retornar erro 400 se email não é fornecido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ senha: '123456' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ==========================================
  // Profile (rota protegida)
  // ==========================================
  describe('GET /api/auth/profile', () => {
    it('deve retornar erro 401 sem token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
    });

    it('deve retornar erro 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.statusCode).toBe(401);
    });

    it('deve retornar perfil com token válido', async () => {
      const token = jwt.sign(
        { id: 1, email: 'joao@email.com', tipo: 'aluno' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      const mockUser = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        tipo: 'aluno',
        toJSON: () => ({ id: 1, nome: 'João Silva', email: 'joao@email.com', tipo: 'aluno' }),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
