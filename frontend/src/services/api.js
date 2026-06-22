// Serviço central de comunicação com o Backend (Gateway)
const API_URL = '/api'; // O Nginx (Gateway) ou o proxy do Vite vão rotear isso

// Função auxiliar para fazer fetch com JWT injetado
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Se o token expirou ou é inválido, podemos deslogar o usuário
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Força o login
  }

  return response;
}

export const authService = {
  login: async (email, senha) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    if (!res.ok) throw new Error('Falha no login');
    return res.json();
  },
  
  register: async (dados) => {
    const res = await fetchWithAuth(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error('Falha ao registrar');
    return res.json();
  },

  getProfile: async () => {
    const res = await fetchWithAuth('/auth/profile');
    if (!res.ok) throw new Error('Falha ao carregar perfil');
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetchWithAuth('/auth/users');
    if (!res.ok) throw new Error('Falha ao buscar usuários');
    return res.json();
  },

  updatePermissions: async (id, permissoes) => {
    const res = await fetchWithAuth(`/auth/users/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissoes })
    });
    if (!res.ok) throw new Error('Falha ao atualizar permissões');
    return res.json();
  },

  updateProfile: async (dados) => {
    const res = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao atualizar perfil');
    }
    return res.json();
  },

  adminUpdateUser: async (id, dados) => {
    const res = await fetchWithAuth(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao editar usuário');
    }
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetchWithAuth(`/auth/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao deletar usuário');
    }
    return res.json();
  },
  getUsersBatch: async (ids) => {
    const res = await fetchWithAuth('/auth/users/batch', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Erro ao buscar usuários em lote');
    return res.json();
  }
};

export const academicService = {
  getDisciplinas: async () => {
    const res = await fetchWithAuth('/academic/disciplinas');
    if (!res.ok) throw new Error('Erro ao buscar disciplinas');
    return res.json();
  },
  createDisciplina: async (dados) => {
    const res = await fetchWithAuth('/academic/disciplinas', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error('Erro ao criar disciplina');
    return res.json();
  },
  deleteDisciplina: async (id) => {
    const res = await fetchWithAuth(`/academic/disciplinas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar disciplina');
    return res.json();
  },
  getTurmas: async () => {
    const res = await fetchWithAuth('/academic/turmas');
    if (!res.ok) throw new Error('Erro ao buscar turmas');
    return res.json();
  },
  getTurmasProfessor: async (professorId) => {
    const res = await fetchWithAuth(`/academic/turmas/professor/${professorId}`);
    if (!res.ok) throw new Error('Erro ao buscar turmas do professor');
    return res.json();
  },
  getTurmaById: async (id) => {
    const res = await fetchWithAuth(`/academic/turmas/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar turma');
    return res.json();
  },
  createTurma: async (dados) => {
    const res = await fetchWithAuth('/academic/turmas', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error('Erro ao criar turma');
    return res.json();
  },
  deleteTurma: async (id) => {
    const res = await fetchWithAuth(`/academic/turmas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar turma');
    return res.json();
  },
  updateDiario: async (turmaId, diario) => {
    const res = await fetchWithAuth(`/academic/turmas/${turmaId}/diario`, {
      method: 'PUT',
      body: JSON.stringify({ diario }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar diário');
    return res.json();
  },
  enrollAluno: async (alunoId, turmaId) => {
    const res = await fetchWithAuth('/academic/matriculas', {
      method: 'POST',
      body: JSON.stringify({ aluno_id: alunoId, turma_id: turmaId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erro ao matricular aluno');
    }
    return res.json();
  },
  unenrollAluno: async (matriculaId) => {
    const res = await fetchWithAuth(`/academic/matriculas/${matriculaId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erro ao remover aluno da turma');
    }
    return res.json();
  }
};

export const assignmentService = {
  getAtividades: async () => {
    const res = await fetchWithAuth('/assignments/atividades');
    if (!res.ok) throw new Error('Erro ao buscar atividades');
    return res.json();
  },
  getAtividadesByTurma: async (turmaId) => {
    const res = await fetchWithAuth(`/assignments/atividades?turma_id=${turmaId}`);
    if (!res.ok) throw new Error('Erro ao buscar atividades da turma');
    return res.json();
  },
  createAtividade: async (dados) => {
    const res = await fetchWithAuth('/assignments/atividades', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error('Erro ao criar atividade');
    return res.json();
  }
};
