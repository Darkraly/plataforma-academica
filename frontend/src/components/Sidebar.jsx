import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={toggleSidebar}>×</button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
            <span className="icon">🏠</span> Início
          </NavLink>
          <NavLink to="/buscar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="icon">🔍</span> Buscar
          </NavLink>

          {/* Admin Links */}
          {user.tipo === 'admin' && (
            <>
              <div className="nav-divider">Administração</div>
              <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">👥</span> Usuários & Permissões
              </NavLink>
              <NavLink to="/admin/estrutura" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">🏢</span> Estrutura
              </NavLink>
            </>
          )}

          {/* Professor Links */}
          {user.tipo === 'professor' && (
            <>
              <div className="nav-divider">Gestão</div>
              <NavLink to="/professor/turmas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">📚</span> Minhas Turmas
              </NavLink>
              <NavLink to="/professor/avaliacoes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">📝</span> Avaliações
              </NavLink>
            </>
          )}

          {/* Aluno Links */}
          {user.tipo === 'aluno' && (
            <>
              <div className="nav-divider">Acadêmico</div>
              <NavLink to="/aluno/matriculas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">🎓</span> Minhas Matrículas
              </NavLink>
              <NavLink to="/aluno/trabalhos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="icon">📤</span> Trabalhos
              </NavLink>
            </>
          )}

          <div className="nav-divider">Conta</div>
          <NavLink to="/perfil" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="icon">👤</span> Meus Dados
          </NavLink>
          <NavLink to="/configuracoes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="icon">⚙️</span> Configurações
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="icon">🚪</span> Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
