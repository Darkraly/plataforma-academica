const { create } = require('../../src/controllers/turmaController');
const { Turma, Disciplina } = require('../../src/models');
const { authClient } = require('../../src/utils/apiClient');

jest.mock('../../src/models');
jest.mock('../../src/utils/apiClient', () => ({
  authClient: { get: jest.fn() },
  getAuthHeaders: jest.fn(),
}));

describe('Turma Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: { disciplina_id: 1, professor_id: 1, semestre: '2026.1', horario: '08:00' },
      headers: { authorization: 'Bearer token' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve criar uma turma com sucesso se o professor for válido', async () => {
    Disciplina.findByPk.mockResolvedValue({ id: 1, nome: 'Math' });
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'professor' } } });
    Turma.create.mockResolvedValue({ id: 1, ...mockReq.body });

    await create(mockReq, mockRes, mockNext);

    expect(authClient.get).toHaveBeenCalledWith('/users/1', expect.any(Object));
    expect(Turma.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar erro 400 se o usuário não for professor', async () => {
    Disciplina.findByPk.mockResolvedValue({ id: 1, nome: 'Math' });
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'aluno' } } });

    await create(mockReq, mockRes, mockNext);

    expect(Turma.create).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
