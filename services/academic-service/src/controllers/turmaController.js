const { Turma, Disciplina } = require('../models');
const logger = require('../config/logger');

const getAll = async (req, res, next) => {
  try {
    const turmas = await Turma.findAll({
      include: [{ model: Disciplina, as: 'disciplina' }],
      order: [['semestre', 'DESC']],
    });
    res.status(200).json({ success: true, data: turmas });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const turma = await Turma.findByPk(req.params.id, {
      include: [
        { model: Disciplina, as: 'disciplina' },
        { association: 'matriculas' },
      ],
    });
    if (!turma) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }
    res.status(200).json({ success: true, data: turma });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { disciplina_id, professor_id, semestre, horario } = req.body;

    // Verificar se a disciplina existe
    const disciplina = await Disciplina.findByPk(disciplina_id);
    if (!disciplina) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada' });
    }

    const turma = await Turma.create({ disciplina_id, professor_id, semestre, horario });
    logger.info(`Turma criada: ${disciplina.nome} - ${semestre}`);
    res.status(201).json({ success: true, message: 'Turma criada com sucesso', data: turma });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const turma = await Turma.findByPk(req.params.id);
    if (!turma) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }
    const { disciplina_id, professor_id, semestre, horario } = req.body;
    await turma.update({ disciplina_id, professor_id, semestre, horario });
    logger.info(`Turma atualizada: ID ${turma.id}`);
    res.status(200).json({ success: true, message: 'Turma atualizada com sucesso', data: turma });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const turma = await Turma.findByPk(req.params.id);
    if (!turma) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }
    await turma.destroy();
    logger.info(`Turma removida: ID ${turma.id}`);
    res.status(200).json({ success: true, message: 'Turma removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
