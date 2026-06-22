import React, { useState } from 'react';
import { academicService, assignmentService } from '../services/api';
import { BookOpen, Plus, Clock } from 'lucide-react';

const ProfessorDashboard = ({ user }) => {
  const [formType, setFormType] = useState(null); // 'disciplina', 'turma', 'atividade'
  const [formData, setFormData] = useState({});

  if (user.status === 'pendente') {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Clock size={64} color="var(--primary-color)" style={{ margin: '0 auto 2rem' }} />
        <h1 style={{ color: 'var(--primary-color)' }}>Aprovação Pendente</h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Sua conta de professor foi registrada e está aguardando aprovação por um Administrador.
          Você terá acesso às funcionalidades assim que for aprovado.
        </p>
      </div>
    );
  }

  const handleCreateDisciplina = async (e) => {
    e.preventDefault();
    try {
      await academicService.createDisciplina(formData);
      alert('Disciplina criada com sucesso!');
      setFormType(null);
      setFormData({});
    } catch (err) {
      alert('Erro ao criar disciplina');
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Painel do Professor</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setFormType('disciplina')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Nova Disciplina
        </button>
        {/* Futuramente: botões para Nova Turma, Nova Atividade */}
      </div>

      {formType === 'disciplina' && (
        <form onSubmit={handleCreateDisciplina} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2>Criar Nova Disciplina</h2>
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Código da Disciplina</label>
            <input 
              type="text" 
              required 
              onChange={e => setFormData({...formData, codigo: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Nome da Disciplina</label>
            <input 
              type="text" 
              required 
              onChange={e => setFormData({...formData, nome: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Carga Horária (horas)</label>
            <input 
              type="number" 
              required 
              min="1"
              onChange={e => setFormData({...formData, carga_horaria: parseInt(e.target.value)})} 
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Salvar Disciplina</button>
          <button type="button" onClick={() => setFormType(null)} style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', marginLeft: '1rem' }}>
            Cancelar
          </button>
        </form>
      )}

      {/* Listagem de Turmas e Disciplinas viria aqui */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BookOpen color="var(--primary-color)" />
          <h2>Visão Geral</h2>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Utilize os botões acima para gerenciar o conteúdo acadêmico.</p>
      </div>

    </div>
  );
};

export default ProfessorDashboard;
