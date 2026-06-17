const { submit } = require('../../src/controllers/entregaController');
const { Entrega, Atividade } = require('../../src/models');
const { authClient } = require('../../src/utils/apiClient');

jest.mock('../../src/models');
jest.mock('../../src/utils/apiClient', () => ({
  authClient: { get: jest.fn() },
  getAuthHeaders: jest.fn(),
}));

describe('Entrega Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: { atividade_id: 1, aluno_id: 1 },
      headers: { authorization: 'Bearer token' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve submeter entrega com sucesso se o aluno for válido', async () => {
    Atividade.findByPk.mockResolvedValue({ id: 1 });
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'aluno' } } });
    Entrega.findOne.mockResolvedValue(null);
    Entrega.create.mockResolvedValue({ id: 1, ...mockReq.body });

    await submit(mockReq, mockRes, mockNext);

    expect(authClient.get).toHaveBeenCalledWith('/users/1', expect.any(Object));
    expect(Entrega.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar erro 400 se o usuário não for aluno', async () => {
    Atividade.findByPk.mockResolvedValue({ id: 1 });
    authClient.get.mockResolvedValue({ data: { data: { tipo: 'professor' } } });

    await submit(mockReq, mockRes, mockNext);

    expect(Entrega.create).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
