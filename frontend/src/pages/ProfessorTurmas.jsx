import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicService, authService } from '../services/api';
import { Users, BookOpen, Clock, Calendar, ChevronRight, X, Save } from 'lucide-react';

const ProfessorTurmas = () => {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [modalType, setModalType] = useState(null); // 'diario' or 'alunos'
  
  // Alunos e Diário state
  const [alunos, setAlunos] = useState([]);
  const [diario, setDiario] = useState({}); // { matricula_id: { nota_final, faltas } }
  const [modalLoading, setModalLoading] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const res = await academicService.getTurmasProfessor(user.id);
        setTurmas(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar turmas:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchTurmas();
    }
  }, [user]);

  const [allAlunos, setAllAlunos] = useState([]);
  const [newAlunoId, setNewAlunoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Busca lista de alunos ao abrir modal
  useEffect(() => {
    if (selectedTurma && modalType) {
      fetchAlunosDaTurma(selectedTurma.id);
      if (modalType === 'alunos') {
        fetchAllAlunosDisponiveis();
      }
    }
  }, [selectedTurma, modalType]);

  const fetchAllAlunosDisponiveis = async () => {
    try {
      const res = await authService.getAllUsers();
      const students = (res.data || []).filter(u => u.tipo === 'aluno');
      setAllAlunos(students);
    } catch (err) {
      console.error('Erro ao buscar todos os alunos', err);
    }
  };

  const fetchAlunosDaTurma = async (turmaId) => {
    setModalLoading(true);
    setFormMsg({ text: '', type: '' });
    try {
      // 1. Pega turma com matrículas
      const turmaRes = await academicService.getTurmaById(turmaId);
      const matriculas = turmaRes.data?.matriculas || [];
      
      if (matriculas.length === 0) {
        setAlunos([]);
        setDiario({});
        setModalLoading(false);
        return;
      }

      // 2. Extrai IDs dos alunos e busca no auth-service
      const alunoIds = matriculas.map(m => m.aluno_id);
      const usersRes = await authService.getUsersBatch(alunoIds);
      const usersData = usersRes.data || [];

      // 3. Mescla dados
      const alunosMapeados = matriculas.map(m => {
        const u = usersData.find(u => u.id === m.aluno_id) || {};
        return {
          matricula_id: m.id,
          aluno_id: m.aluno_id,
          nome: u.nome || 'Aluno Desconhecido',
          email: u.email || 'Sem email',
          nota_final: m.nota_final || '',
          faltas: m.faltas || 0,
          status: m.status
        };
      });

      // Ordenar por nome
      alunosMapeados.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(alunosMapeados);

      // Prepara estado inicial do diário
      if (modalType === 'diario') {
        const diarioInicial = {};
        alunosMapeados.forEach(a => {
          diarioInicial[a.matricula_id] = { nota_final: a.nota_final, faltas: a.faltas };
        });
        setDiario(diarioInicial);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setFormMsg({ text: 'Erro ao carregar lista de alunos.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDiarioChange = (matriculaId, field, value) => {
    setDiario(prev => ({
      ...prev,
      [matriculaId]: {
        ...prev[matriculaId],
        [field]: value
      }
    }));
  };

  const handleSalvarDiario = async () => {
    setSubmitting(true);
    setFormMsg({ text: 'Salvando diário...', type: 'info' });

    try {
      const diarioArray = Object.keys(diario).map(matId => ({
        matricula_id: parseInt(matId),
        nota_final: diario[matId].nota_final !== '' ? parseFloat(diario[matId].nota_final) : null,
        faltas: parseInt(diario[matId].faltas) || 0
      }));

      await academicService.updateDiario(selectedTurma.id, diarioArray);
      setFormMsg({ text: 'Diário atualizado com sucesso!', type: 'success' });
      setTimeout(() => setFormMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setFormMsg({ text: 'Erro ao salvar diário: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
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
      // Recarrega a lista de alunos
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

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando suas turmas...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Users size={32} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Minhas Turmas</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Bem-vindo, Professor {user.nome}. Aqui estão as turmas em que você está alocado atualmente.
      </p>

      {turmas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-color)' }}>Nenhuma turma encontrada</h3>
          <p style={{ color: 'var(--text-muted)' }}>Você não foi alocado em nenhuma turma ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {turmas.map(turma => (
            <div key={turma.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                  {turma.disciplina?.nome || 'Disciplina sem nome'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Calendar size={14} />
                  <span>Semestre: {turma.semestre}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <Clock size={14} />
                  <span>Horário: {turma.horario}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setSelectedTurma(turma); setModalType('diario'); }} className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Diário <ChevronRight size={16} />
                  </button>
                  <button onClick={() => { setSelectedTurma(turma); setModalType('alunos'); }} className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Alunos <Users size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Diário/Alunos */}
      {modalType && selectedTurma && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel modal-content" style={{ padding: '2rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>
                  {modalType === 'diario' ? 'Diário de Classe' : 'Lista de Alunos'}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {selectedTurma.disciplina?.nome} ({selectedTurma.semestre})
                </p>
              </div>
              <button onClick={() => { setModalType(null); setSelectedTurma(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
                <X size={24} />
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
                {alunos.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum aluno matriculado nesta turma.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ padding: '1rem' }}>Aluno</th>
                          <th style={{ padding: '1rem' }}>Email</th>
                          {modalType === 'diario' && (
                            <>
                              <th style={{ padding: '1rem', width: '120px' }}>Faltas</th>
                              <th style={{ padding: '1rem', width: '120px' }}>Nota Final</th>
                            </>
                          )}
                          {modalType === 'alunos' && (
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map(a => (
                          <tr key={a.matricula_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{a.nome}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{a.email}</td>
                            {modalType === 'diario' && (
                              <>
                                <td style={{ padding: '1rem' }}>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    value={diario[a.matricula_id]?.faltas ?? 0}
                                    onChange={(e) => handleDiarioChange(a.matricula_id, 'faltas', e.target.value)}
                                    className="form-input" 
                                    style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                  />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <input 
                                    type="number" 
                                    min="0" max="10" step="0.1"
                                    value={diario[a.matricula_id]?.nota_final ?? ''}
                                    onChange={(e) => handleDiarioChange(a.matricula_id, 'nota_final', e.target.value)}
                                    placeholder="--"
                                    className="form-input" 
                                    style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                  />
                                </td>
                              </>
                            )}
                            {modalType === 'alunos' && (
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleRemoveAluno(a.matricula_id)} 
                                  className="btn-icon" 
                                  style={{ color: 'var(--danger-color)' }} 
                                  title="Remover Aluno"
                                >
                                  <X size={18} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {modalType === 'alunos' && (
                  <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--input-bg)' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} /> Adicionar Aluno à Turma
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
                            .filter(a => !alunos.some(matriculado => matriculado.aluno_id === a.id))
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
                )}
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
              <button onClick={() => { setModalType(null); setSelectedTurma(null); setNewAlunoId(''); }} className="btn btn-secondary">Fechar</button>
              {modalType === 'diario' && alunos.length > 0 && (
                <button onClick={handleSalvarDiario} disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {submitting ? 'Salvando...' : 'Salvar Diário'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorTurmas;
