const { create } = require('../../src/controllers/atividadeController');
const { Atividade } = require('../../src/models');
const { academicClient } = require('../../src/utils/apiClient');

jest.mock('../../src/models');
jest.mock('../../src/utils/apiClient', () => ({
  academicClient: { get: jest.fn() },
  getAuthHeaders: jest.fn(),
}));

describe('Atividade Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: { turma_id: 1, titulo: 'Prova', descricao: 'x', prazo: '2026-10-10' },
      headers: { authorization: 'Bearer token' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve criar uma atividade com sucesso se turma for válida', async () => {
    academicClient.get.mockResolvedValue({ data: { success: true } });
    Atividade.create.mockResolvedValue({ id: 1, ...mockReq.body });

    await create(mockReq, mockRes, mockNext);

    expect(academicClient.get).toHaveBeenCalledWith('/turmas/1', expect.any(Object));
    expect(Atividade.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('deve retornar erro 404 se a turma não existir', async () => {
    const err = new Error('Not found');
    err.response = { status: 404 };
    academicClient.get.mockRejectedValue(err);

    await create(mockReq, mockRes, mockNext);

    expect(Atividade.create).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});
