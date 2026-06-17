const { Matricula, Turma, Disciplina } = require('../models');
const logger = require('../config/logger');

const enroll = async (req, res, next) => {
  try {
    const { aluno_id, turma_id } = req.body;

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }

    // Verificar se já está matriculado
    const existing = await Matricula.findOne({
      where: { aluno_id, turma_id, status: 'ativa' },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Aluno já está matriculado nesta turma' });
    }

    const matricula = await Matricula.create({
      aluno_id,
      turma_id,
      data: new Date(),
      status: 'ativa',
    });

    logger.info(`Matrícula criada: Aluno ${aluno_id} na Turma ${turma_id}`);
    res.status(201).json({ success: true, message: 'Matrícula realizada com sucesso', data: matricula });
  } catch (error) {
    next(error);
  }
};

const getByAluno = async (req, res, next) => {
  try {
    const matriculas = await Matricula.findAll({
      where: { aluno_id: req.params.alunoId },
      include: [{
        model: Turma,
        as: 'turma',
        include: [{ model: Disciplina, as: 'disciplina' }],
      }],
    });
    res.status(200).json({ success: true, data: matriculas });
  } catch (error) {
    next(error);
  }
};

const getByTurma = async (req, res, next) => {
  try {
    const matriculas = await Matricula.findAll({
      where: { turma_id: req.params.turmaId },
    });
    res.status(200).json({ success: true, data: matriculas });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const matricula = await Matricula.findByPk(req.params.id);
    if (!matricula) {
      return res.status(404).json({ success: false, message: 'Matrícula não encontrada' });
    }
    const { status } = req.body;
    await matricula.update({ status });
    logger.info(`Status da matrícula ${req.params.id} atualizado para: ${status}`);
    res.status(200).json({ success: true, message: 'Status atualizado com sucesso', data: matricula });
  } catch (error) {
    next(error);
  }
};

module.exports = { enroll, getByAluno, getByTurma, updateStatus };
