import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { Shield, Plus, Edit, Trash2, Settings } from 'lucide-react';

const PERMISSION_OPTIONS = [
  { id: 'CRIAR_TURMA', label: 'Criar Turma' },
  { id: 'EDITAR_TURMA', label: 'Editar Turma' },
  { id: 'DELETAR_TURMA', label: 'Deletar Turma' },
  { id: 'CRIAR_DISCIPLINA', label: 'Criar Disciplina' },
  { id: 'EDITAR_DISCIPLINA', label: 'Editar Disciplina' },
  { id: 'DELETAR_DISCIPLINA', label: 'Deletar Disciplina' },
  { id: 'CRIAR_ATIVIDADE', label: 'Criar Atividade' },
  { id: 'EDITAR_ATIVIDADE', label: 'Editar Atividade' },
  { id: 'DELETAR_ATIVIDADE', label: 'Deletar Atividade' },
  { id: 'AVALIAR_ENTREGA', label: 'Avaliar Entrega' },
  { id: 'VER_DIARIO_CLASSE', label: 'Ver Diário de Classe' },
  { id: 'ALTERAR_STATUS_MATRICULA', label: 'Alterar Status de Matrícula' },
  { id: 'ADICIONAR_ALUNO_TURMA', label: 'Adicionar Aluno à Turma' },
  { id: 'REMOVER_ALUNO_TURMA', label: 'Remover Aluno da Turma' },
];

const AdminUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('professor');
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ nome: '', email: '', tipo: '' });

  const fetchUsers = async () => {
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg({ text: 'Criando...', type: 'info' });
    try {
      await authService.register({ nome, email, senha, tipo });
      setFormMsg({ text: 'Usuário criado com sucesso!', type: 'success' });
      setNome(''); setEmail(''); setSenha('');
      fetchUsers();
    } catch (err) {
      setFormMsg({ text: 'Erro ao criar usuário', type: 'error' });
    }
  };

  const openPermissionModal = (user) => {
    setSelectedUser(user);
    setUserPermissions(user.permissoes || []);
    setIsModalOpen(true);
  };

  const togglePermission = (permId) => {
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter(p => p !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await authService.updatePermissions(selectedUser.id, userPermissions);
      setIsModalOpen(false);
      fetchUsers(); // refresh list
    } catch (err) {
      alert('Erro ao atualizar permissões');
    }
  };

  const handleDeleteUser = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
      try {
        await authService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('Erro ao deletar usuário: ' + err.message);
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({ nome: user.nome, email: user.email, tipo: user.tipo });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.adminUpdateUser(selectedUser.id, editFormData);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Erro ao editar usuário: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Carregando usuários...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Shield size={32} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Gestão de Usuários</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Formulário de Criação */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Criar Conta
          </h2>
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
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome Completo</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Senha Temporária</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Conta</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}>
                <option value="professor">Professor</option>
                <option value="aluno">Aluno</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Registrar</button>
          </form>
        </div>

        {/* Lista de Usuários */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Contas Registradas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Nome</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Tipo</th>
                <th style={{ padding: '1rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{u.nome}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      backgroundColor: u.tipo === 'admin' ? 'rgba(255, 77, 79, 0.2)' : u.tipo === 'professor' ? 'rgba(74, 175, 80, 0.2)' : 'rgba(24, 144, 255, 0.2)',
                      color: u.tipo === 'admin' ? '#ff4d4f' : u.tipo === 'professor' ? 'var(--primary-color)' : '#1890ff'
                    }}>
                      {u.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {u.tipo !== 'admin' && (
                      <button onClick={() => openPermissionModal(u)} className="btn-icon" style={{ color: 'var(--text-color)' }} title="Editar Permissões">
                        <Settings size={18} />
                      </button>
                    )}
                    <button onClick={() => openEditModal(u)} className="btn-icon" style={{ color: 'var(--primary-color)' }} title="Editar Usuário">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteUser(u.id, u.nome)} className="btn-icon" style={{ color: 'var(--danger-color)' }} title="Excluir Usuário">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Permissões */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel modal-content" style={{ padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Permissões: {selectedUser.nome}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Configure o acesso granular para este usuário.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {PERMISSION_OPTIONS.map(perm => (
                <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={userPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    style={{ transform: 'scale(1.2)', accentColor: 'var(--primary-color)' }}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>Cancelar</button>
              <button onClick={handleSavePermissions} className="btn btn-primary">Salvar Permissões</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Usuário */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel modal-content" style={{ padding: '2rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Editar Usuário</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={editFormData.nome} 
                  onChange={e => setEditFormData({...editFormData, nome: e.target.value})} 
                  required 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                  required 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Conta</label>
                <select 
                  value={editFormData.tipo} 
                  onChange={e => setEditFormData({...editFormData, tipo: e.target.value})} 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                >
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
