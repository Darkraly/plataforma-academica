const { Disciplina } = require('../models');
const logger = require('../config/logger');

const getAll = async (req, res, next) => {
  try {
    const disciplinas = await Disciplina.findAll({
      order: [['nome', 'ASC']],
    });
    res.status(200).json({ success: true, data: disciplinas });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const disciplina = await Disciplina.findByPk(req.params.id, {
      include: [{ association: 'turmas' }],
    });
    if (!disciplina) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada' });
    }
    res.status(200).json({ success: true, data: disciplina });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nome, codigo, carga_horaria } = req.body;
    const disciplina = await Disciplina.create({ nome, codigo, carga_horaria });
    logger.info(`Disciplina criada: ${codigo} - ${nome}`);
    res.status(201).json({ success: true, message: 'Disciplina criada com sucesso', data: disciplina });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const disciplina = await Disciplina.findByPk(req.params.id);
    if (!disciplina) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada' });
    }
    const { nome, codigo, carga_horaria } = req.body;
    await disciplina.update({ nome, codigo, carga_horaria });
    logger.info(`Disciplina atualizada: ${disciplina.codigo}`);
    res.status(200).json({ success: true, message: 'Disciplina atualizada com sucesso', data: disciplina });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const disciplina = await Disciplina.findByPk(req.params.id);
    if (!disciplina) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada' });
    }
    await disciplina.destroy();
    logger.info(`Disciplina removida: ${disciplina.codigo}`);
    res.status(200).json({ success: true, message: 'Disciplina removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
