const { Turma, Disciplina, Matricula } = require('../models');
const logger = require('../config/logger');
const { authClient, getAuthHeaders } = require('../utils/apiClient');

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

const getByProfessor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turmas = await Turma.findAll({
      where: { professor_id: id },
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

    // Validar se professor_id existe e tem tipo 'professor'
    if (professor_id) {
      const response = await authClient.get(`/users/${professor_id}`, { headers: getAuthHeaders(req) });
      if (response.data.data.tipo !== 'professor') {
        return res.status(400).json({ success: false, message: 'Usuário informado não é um professor' });
      }
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

    // Validar se professor_id existe e tem tipo 'professor'
    if (professor_id) {
      const response = await authClient.get(`/users/${professor_id}`, { headers: getAuthHeaders(req) });
      if (response.data.data.tipo !== 'professor') {
        return res.status(400).json({ success: false, message: 'Usuário informado não é um professor' });
      }
    }

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

const updateDiario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diario } = req.body; // array of { matricula_id, nota_final, faltas }

    const turma = await Turma.findByPk(id);
    if (!turma) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }

    // Verifica permissão adicional (se o professor atual é o dono da turma)
    // assumindo que req.user já passou pelo middleware de autenticação
    if (req.user.tipo === 'professor' && turma.professor_id !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Você não é o professor desta turma' });
    }

    if (!Array.isArray(diario)) {
      return res.status(400).json({ success: false, message: 'Formato de diário inválido' });
    }

    for (const d of diario) {
      await Matricula.update(
        { nota_final: d.nota_final, faltas: d.faltas },
        { where: { id: d.matricula_id, turma_id: id } }
      );
    }

    logger.info(`Diário da turma ${id} atualizado.`);
    res.status(200).json({ success: true, message: 'Diário atualizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, getByProfessor, updateDiario };
