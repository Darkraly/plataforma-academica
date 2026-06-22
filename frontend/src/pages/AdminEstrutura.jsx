import React, { useState, useEffect } from 'react';
import { academicService, authService } from '../services/api';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminEstrutura = () => {
  const { user } = useAuth();
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  
  // Forms
  const [nomeDisciplina, setNomeDisciplina] = useState('');
  const [codigoDisciplina, setCodigoDisciplina] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  
  const [disciplinaId, setDisciplinaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [semestre, setSemestre] = useState('');
  const [horario, setHorario] = useState('');

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [discRes, turmRes, usersRes] = await Promise.all([
        academicService.getDisciplinas(),
        academicService.getTurmas(),
        authService.getAllUsers()
      ]);
      setDisciplinas(discRes.data || []);
      setTurmas(turmRes.data || []);
      const users = usersRes.data || [];
      setProfessores(users.filter(u => u.tipo === 'professor'));
      setAllAlunos(users.filter(u => u.tipo === 'aluno'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Alunos Modal State
  const [allAlunos, setAllAlunos] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [turmaAlunos, setTurmaAlunos] = useState([]);
  const [newAlunoId, setNewAlunoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTurma) {
      fetchAlunosDaTurma(selectedTurma.id);
    }
  }, [selectedTurma]);

  const fetchAlunosDaTurma = async (turmaId) => {
    setModalLoading(true);
    setFormMsg({ text: '', type: '' });
    try {
      const turmaRes = await academicService.getTurmaById(turmaId);
      const matriculas = turmaRes.data?.matriculas || [];
      
      if (matriculas.length === 0) {
        setTurmaAlunos([]);
        setModalLoading(false);
        return;
      }

      const alunoIds = matriculas.map(m => m.aluno_id);
      const usersRes = await authService.getUsersBatch(alunoIds);
      const usersData = usersRes.data || [];

      const alunosMapeados = matriculas.map(m => {
        const u = usersData.find(u => u.id === m.aluno_id) || {};
        return {
          matricula_id: m.id,
          aluno_id: m.aluno_id,
          nome: u.nome || 'Aluno Desconhecido',
          email: u.email || 'Sem email',
        };
      });

      alunosMapeados.sort((a, b) => a.nome.localeCompare(b.nome));
      setTurmaAlunos(alunosMapeados);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setFormMsg({ text: 'Erro ao carregar lista de alunos.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddAluno = async () => {
    if (!newAlunoId || !selectedTurma) return;
    setSubmitting(true);
    setFormMsg({ text: 'Adicionando aluno...', type: 'info' });
    try {
      await academicService.enrollAluno(parseInt(newAlunoId), selectedTurma.id);
      setFormMsg({ text: 'Aluno adicionado com sucesso!', type: 'success' });
      setNewAlunoId('');
      fetchAlunosDaTurma(selectedTurma.id);
      setTimeout(() => setFormMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setFormMsg({ text: 'Erro ao adicionar aluno: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAluno = async (matriculaId) => {
    setFormMsg({ text: 'Removendo...', type: 'info' });
    try {
      await academicService.unenrollAluno(matriculaId);
      setFormMsg({ text: 'Aluno removido com sucesso!', type: 'success' });
      fetchAlunosDaTurma(selectedTurma.id);
      setTimeout(() => setFormMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setFormMsg({ text: 'Erro ao remover aluno: ' + err.message, type: 'error' });
    }
  };

  const handleCreateDisciplina = async (e) => {
    e.preventDefault();
    try {
      await academicService.createDisciplina({ 
        nome: nomeDisciplina, 
        codigo: codigoDisciplina, 
        carga_horaria: parseInt(cargaHoraria) 
      });
      setNomeDisciplina(''); setCodigoDisciplina(''); setCargaHoraria('');
      loadData();
    } catch (err) {
      alert('Erro ao criar disciplina. Verifique se você tem permissão.');
    }
  };

  const handleCreateTurma = async (e) => {
    e.preventDefault();
    try {
      await academicService.createTurma({
        disciplina_id: parseInt(disciplinaId),
        professor_id: parseInt(professorId),
        semestre,
        horario
      });
      setDisciplinaId(''); setProfessorId(''); setSemestre(''); setHorario('');
      loadData();
    } catch (err) {
      alert('Erro ao criar turma. Verifique se você tem permissão.');
    }
  };

  const handleDeleteDisciplina = async (id) => {
    if (!window.confirm('Tem certeza? Isso pode afetar turmas existentes.')) return;
    try {
      await academicService.deleteDisciplina(id);
      loadData();
    } catch (err) {
      alert('Erro ao deletar disciplina');
    }
  };

  const handleDeleteTurma = async (id) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      await academicService.deleteTurma(id);
      loadData();
    } catch (err) {
      alert('Erro ao deletar turma');
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Carregando dados...</div>;

  const canCreateDisciplina = user.tipo === 'admin' || user.permissoes?.includes('CRIAR_DISCIPLINA');
  const canDeleteDisciplina = user.tipo === 'admin' || user.permissoes?.includes('DELETAR_DISCIPLINA');
  const canCreateTurma = user.tipo === 'admin' || user.permissoes?.includes('CRIAR_TURMA');
  const canDeleteTurma = user.tipo === 'admin' || user.permissoes?.includes('DELETAR_TURMA');

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={32} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Estrutura Acadêmica</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Disciplinas */}
        <div>
          {canCreateDisciplina && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} /> Nova Disciplina
              </h2>
              <form onSubmit={handleCreateDisciplina} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nome da Disciplina" value={nomeDisciplina} onChange={e => setNomeDisciplina(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                <input type="text" placeholder="Código (Ex: MAT101)" value={codigoDisciplina} onChange={e => setCodigoDisciplina(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                <input type="number" placeholder="Carga Horária" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)} required min="1" className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                <button type="submit" className="btn btn-primary">Adicionar Disciplina</button>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Disciplinas Cadastradas</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {disciplinas.length === 0 ? <p>Nenhuma disciplina.</p> : disciplinas.map(d => (
                <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{d.codigo} - {d.nome}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.carga_horaria}h</span>
                  </div>
                  {canDeleteDisciplina && (
                    <button onClick={() => handleDeleteDisciplina(d.id)} className="btn-icon" style={{ color: 'var(--danger-color)' }} title="Deletar">
                      <Trash2 size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Turmas */}
        <div>
          {canCreateTurma && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} /> Nova Turma
              </h2>
              <form onSubmit={handleCreateTurma} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={disciplinaId} onChange={e => setDisciplinaId(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}>
                  <option value="">Selecione a Disciplina...</option>
                  {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
                <select value={professorId} onChange={e => setProfessorId(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}>
                  <option value="">Selecione o Professor...</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input type="text" placeholder="Semestre (Ex: 2026.1)" value={semestre} onChange={e => setSemestre(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                <input type="text" placeholder="Horário (Ex: Seg/Qua 10h)" value={horario} onChange={e => setHorario(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                <button type="submit" className="btn btn-primary">Adicionar Turma</button>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Turmas Ativas</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {turmas.length === 0 ? <p>Nenhuma turma.</p> : turmas.map(t => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>Turma {t.id} - {t.disciplina_id} (Semestre: {t.semestre})</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Horário: {t.horario}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => setSelectedTurma(t)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Alunos
                    </button>
                    {canDeleteTurma && (
                      <button onClick={() => handleDeleteTurma(t.id)} className="btn-icon" style={{ color: 'var(--danger-color)' }} title="Deletar">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Modal Alunos */}
      {selectedTurma && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel modal-content" style={{ padding: '2rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>
                  Lista de Alunos
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Turma {selectedTurma.id} ({selectedTurma.semestre})
                </p>
              </div>
              <button onClick={() => { setSelectedTurma(null); setNewAlunoId(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
                X
              </button>
            </div>
            
            {formMsg.text && (
              <div style={{ 
                padding: '0.8rem', 
                marginBottom: '1rem', 
                borderRadius: '8px', 
                backgroundColor: formMsg.type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)',
                color: 'white',
                textAlign: 'center'
              }}>
                {formMsg.text}
              </div>
            )}

            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando lista de alunos...</div>
            ) : (
              <>
                {turmaAlunos.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum aluno matriculado nesta turma.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ padding: '1rem' }}>Aluno</th>
                          <th style={{ padding: '1rem' }}>Email</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turmaAlunos.map(a => (
                          <tr key={a.matricula_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{a.nome}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{a.email}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button 
                                onClick={() => handleRemoveAluno(a.matricula_id)} 
                                className="btn-icon" 
                                style={{ color: 'var(--danger-color)' }} 
                                title="Remover Aluno"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--input-bg)' }}>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Adicionar Aluno à Turma
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                      type="text"
                      placeholder="Pesquisar por nome ou ID (Matrícula)..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <select 
                        value={newAlunoId} 
                        onChange={e => setNewAlunoId(e.target.value)} 
                        className="form-input" 
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                      >
                        <option value="" style={{ color: 'black' }}>Selecione um aluno da lista filtrada...</option>
                        {allAlunos
                          .filter(a => !turmaAlunos.some(matriculado => matriculado.aluno_id === a.id))
                          .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toString().includes(searchTerm))
                          .map(a => (
                          <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.nome} (ID: {a.id} - {a.email})</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleAddAluno} 
                        disabled={!newAlunoId || submitting}
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 1.5rem' }}
                      >
                        {submitting ? 'Adicionando...' : 'Adicionar'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={() => { setSelectedTurma(null); setNewAlunoId(''); }} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEstrutura;
