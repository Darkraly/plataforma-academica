const { Atividade } = require('../models');
const logger = require('../config/logger');

const getAll = async (req, res, next) => {
  try {
    const { turma_id } = req.query;
    const where = turma_id ? { turma_id } : {};
    const atividades = await Atividade.findAll({ where, order: [['prazo', 'ASC']] });
    res.status(200).json({ success: true, data: atividades });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const atividade = await Atividade.findByPk(req.params.id, { include: [{ association: 'entregas' }] });
    if (!atividade) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    res.status(200).json({ success: true, data: atividade });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { turma_id, titulo, descricao, prazo } = req.body;
    const atividade = await Atividade.create({ turma_id, titulo, descricao, prazo });
    logger.info(`Atividade criada: ${titulo} (Turma: ${turma_id})`);
    res.status(201).json({ success: true, message: 'Atividade criada com sucesso', data: atividade });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const atividade = await Atividade.findByPk(req.params.id);
    if (!atividade) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    const { titulo, descricao, prazo } = req.body;
    await atividade.update({ titulo, descricao, prazo });
    logger.info(`Atividade atualizada: ID ${atividade.id}`);
    res.status(200).json({ success: true, message: 'Atividade atualizada', data: atividade });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const atividade = await Atividade.findByPk(req.params.id);
    if (!atividade) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    await atividade.destroy();
    logger.info(`Atividade removida: ID ${atividade.id}`);
    res.status(200).json({ success: true, message: 'Atividade removida' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
