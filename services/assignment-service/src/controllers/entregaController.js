const { Entrega, Atividade } = require('../models');
const logger = require('../config/logger');
const { authClient, getAuthHeaders } = require('../utils/apiClient');

const submit = async (req, res, next) => {
  try {
    const { atividade_id, aluno_id } = req.body;

    const atividade = await Atividade.findByPk(atividade_id);
    if (!atividade) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });

    // Verificar se o aluno existe no auth-service
    const response = await authClient.get(`/users/${aluno_id}`, { headers: getAuthHeaders(req) });
    if (response.data.data.tipo !== 'aluno') {
      return res.status(400).json({ success: false, message: 'Usuário informado não é um aluno' });
    }

    // Verificar se já entregou
    const existing = await Entrega.findOne({ where: { atividade_id, aluno_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Aluno já fez a entrega desta atividade' });

    const entrega = await Entrega.create({ atividade_id, aluno_id, data_entrega: new Date() });
    logger.info(`Entrega submetida: Aluno ${aluno_id}, Atividade ${atividade_id}`);
    res.status(201).json({ success: true, message: 'Entrega realizada com sucesso', data: entrega });
  } catch (error) { next(error); }
};

const getByAluno = async (req, res, next) => {
  try {
    const entregas = await Entrega.findAll({
      where: { aluno_id: req.params.alunoId },
      include: [{ model: Atividade, as: 'atividade' }],
    });
    res.status(200).json({ success: true, data: entregas });
  } catch (error) { next(error); }
};

const getByAtividade = async (req, res, next) => {
  try {
    const entregas = await Entrega.findAll({
      where: { atividade_id: req.params.atividadeId },
    });
    res.status(200).json({ success: true, data: entregas });
  } catch (error) { next(error); }
};

const grade = async (req, res, next) => {
  try {
    const entrega = await Entrega.findByPk(req.params.id);
    if (!entrega) return res.status(404).json({ success: false, message: 'Entrega não encontrada' });

    const { nota } = req.body;
    await entrega.update({ nota });
    logger.info(`Nota atribuída: Entrega ${entrega.id}, Nota: ${nota}`);
    res.status(200).json({ success: true, message: 'Nota atribuída com sucesso', data: entrega });
  } catch (error) { next(error); }
};

module.exports = { submit, getByAluno, getByAtividade, grade };
