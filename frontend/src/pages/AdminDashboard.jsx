import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { Users, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const res = await authService.getPendingProfessors();
      setProfessors(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar professores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await authService.updateProfessorStatus(id, status);
      fetchProfessors();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Painel Administrativo</h1>
      
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Users color="var(--primary-color)" />
          <h2>Aprovações Pendentes</h2>
        </div>
        
        {loading ? (
          <p>Carregando...</p>
        ) : professors.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum professor aguardando aprovação.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Nome</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {professors.map(prof => (
                  <tr key={prof.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{prof.usuario?.nome}</td>
                    <td style={{ padding: '1rem' }}>{prof.usuario?.email}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleStatus(prof.id, 'aprovado')}
                        style={{ background: 'var(--primary-color)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} /> Aprovar
                      </button>
                      <button 
                        onClick={() => handleStatus(prof.id, 'rejeitado')}
                        style={{ background: '#ef4444', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle size={18} /> Rejeitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
