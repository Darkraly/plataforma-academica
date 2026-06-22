import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicService, assignmentService } from '../services/api';
import { FileText, Plus, Calendar, BookOpen, Save, X, Edit, Trash2 } from 'lucide-react';

const ProfessorAvaliacoes = () => {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    turma_id: '',
    titulo: '',
    descricao: '',
    prazo: ''
  });
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      // 1. Fetch Turmas
      const resTurmas = await academicService.getTurmasProfessor(user.id);
      const turmasData = resTurmas.data || [];
      setTurmas(turmasData);

      // 2. Fetch Atividades para cada turma do professor
      const promessasAtividades = turmasData.map(t => assignmentService.getAtividadesByTurma(t.id));
      const resultadosAtividades = await Promise.all(promessasAtividades);
      
      // Combinar e mapear nome da turma/disciplina em cada atividade
      let todasAtividades = [];
      resultadosAtividades.forEach((res, index) => {
        if (res.data) {
          const atvsComTurma = res.data.map(atv => ({
            ...atv,
            nome_turma: `${turmasData[index].disciplina?.nome} (${turmasData[index].semestre})`
          }));
          todasAtividades = [...todasAtividades, ...atvsComTurma];
        }
      });

      // Ordenar por prazo decrescente
      todasAtividades.sort((a, b) => new Date(b.prazo) - new Date(a.prazo));
      setAtividades(todasAtividades);

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ text: 'Criando...', type: 'info' });

    try {
      await assignmentService.createAtividade({
        turma_id: parseInt(formData.turma_id),
        titulo: formData.titulo,
        descricao: formData.descricao,
        prazo: formData.prazo
      });
      
      setFormMsg({ text: 'Atividade criada com sucesso!', type: 'success' });
      setFormData({ turma_id: '', titulo: '', descricao: '', prazo: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormMsg({ text: '', type: '' });
        fetchData();
      }, 1500);
    } catch (err) {
      setFormMsg({ text: err.message || 'Erro ao criar atividade', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando avaliações...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileText size={32} color="var(--primary-color)" />
          <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Gestão de Avaliações</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Nova Atividade
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Atividades Recentes</h2>
        
        {atividades.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não criou nenhuma atividade para suas turmas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Título</th>
                <th style={{ padding: '1rem' }}>Turma / Disciplina</th>
                <th style={{ padding: '1rem' }}>Prazo de Entrega</th>
                <th style={{ padding: '1rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{a.titulo}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={16} /> {a.nome_turma}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: new Date(a.prazo) < new Date() ? 'var(--danger-color)' : 'var(--text-color)' }}>
                      <Calendar size={16} /> 
                      {new Date(a.prazo + 'T00:00:00').toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ver Entregas</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nova Atividade */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel modal-content" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Criar Nova Atividade</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Turma Destino <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <select 
                  name="turma_id"
                  value={formData.turma_id} 
                  onChange={handleInputChange}
                  required 
                  className="form-input form-select" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.disciplina?.nome} (Semestre: {t.semestre})</option>
                  ))}
                </select>
                {turmas.length === 0 && <small style={{ color: 'var(--danger-color)' }}>Você não possui turmas para criar atividades.</small>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Título da Avaliação <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <input 
                  type="text" 
                  name="titulo"
                  value={formData.titulo} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Ex: Prova A1, Trabalho Semestral..."
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prazo de Entrega <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <input 
                  type="date" 
                  name="prazo"
                  value={formData.prazo} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Instruções (Opcional)</label>
                <textarea 
                  name="descricao"
                  value={formData.descricao} 
                  onChange={handleInputChange} 
                  rows="4"
                  placeholder="Descreva o que os alunos precisam fazer..."
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || turmas.length === 0}>
                  <Save size={18} style={{ marginRight: '0.5rem' }}/> {submitting ? 'Salvando...' : 'Criar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorAvaliacoes;
