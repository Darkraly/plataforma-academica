import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, academicService, assignmentService } from '../services/api';
import { BookOpen, CheckSquare, Users, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AlunoDashboard = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [discRes, atvRes] = await Promise.all([
          academicService.getDisciplinas(),
          assignmentService.getAtividades()
        ]);
        setDisciplinas(discRes.data || []);
        setAtividades(atvRes.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Carregando dados...</p>;

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Meu Painel de Aluno</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Card Disciplinas */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BookOpen color="var(--primary-color)" />
            <h2>Minhas Disciplinas</h2>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {disciplinas.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma disciplina matriculada.</p>
            ) : (
              disciplinas.map(d => (
                <li key={d.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '500' }}>{d.codigo}</span>
                  <span>{d.nome}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Card Atividades */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckSquare color="var(--primary-color)" />
            <h2>Atividades Pendentes</h2>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {atividades.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Você está em dia com as atividades!</p>
            ) : (
              atividades.map(a => (
                <li key={a.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontWeight: '500' }}>{a.titulo}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prazo: {new Date(a.prazo).toLocaleDateString('pt-BR')}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando plataforma...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Se for admin, mostra um resumo admin
  if (user.tipo === 'admin') {
    return (
      <div className="animate-fade-in">
        <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Painel Administrativo</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }} onClick={() => navigate('/admin/usuarios')}>
            <Users size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h3>Gerenciar Usuários</h3>
            <p style={{ color: 'var(--text-muted)' }}>Controle de contas e permissões</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }} onClick={() => navigate('/admin/estrutura')}>
            <Settings size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h3>Estrutura Acadêmica</h3>
            <p style={{ color: 'var(--text-muted)' }}>Cursos, Disciplinas e Turmas</p>
          </div>
        </div>
      </div>
    );
  }

  // Se for professor, mostra um resumo do professor
  if (user.tipo === 'professor') {
    return (
      <div className="animate-fade-in">
        <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Painel do Professor</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }} onClick={() => navigate('/professor/turmas')}>
            <BookOpen size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h3>Minhas Turmas</h3>
            <p style={{ color: 'var(--text-muted)' }}>Gerencie suas turmas e alunos</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }} onClick={() => navigate('/professor/avaliacoes')}>
            <CheckSquare size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h3>Avaliações</h3>
            <p style={{ color: 'var(--text-muted)' }}>Crie atividades e lance notas</p>
          </div>
        </div>
      </div>
    );
  }

  // Default: Aluno
  return <AlunoDashboard />;
};

export default Dashboard;
