const { enroll } = require('../../src/controllers/matriculaController');
const { Matricula, Turma } = require('../../src/models');
const { authClient } = require('../../src/utils/apiClient');

jest.mock('../../src/models');
jest.mock('../../src/utils/apiClient', () => ({
  authClient: { get: jest.fn() },
  getAuthHeaders: jest.fn(),
}));

describe('Matricula Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: { aluno_id: 1, turma_id: 1 },
      headers: { authorization: 'Bearer token' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve realizar matrícula com sucesso se aluno for válido', async () => {
    Turma.findByPk.mockResolvedValue({ id: 1 });
    Matricula.findOne.mockResolvedValue(null);
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'aluno' } } });
    Matricula.create.mockResolvedValue({ id: 1, ...mockReq.body });

    await enroll(mockReq, mockRes, mockNext);

    expect(authClient.get).toHaveBeenCalledWith('/users/1', expect.any(Object));
    expect(Matricula.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar erro 400 se o usuário não for aluno', async () => {
    Turma.findByPk.mockResolvedValue({ id: 1 });
    Matricula.findOne.mockResolvedValue(null);
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'professor' } } });

    await enroll(mockReq, mockRes, mockNext);

    expect(Matricula.create).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
