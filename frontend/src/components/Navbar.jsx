import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, showMenuButton }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ 
      margin: '1rem', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      {showMenuButton && (
        <button onClick={toggleSidebar} className="btn-icon" aria-label="Abrir Menu" style={{ marginRight: '1rem' }}>
          <Menu size={24} color="var(--primary-color)" />
        </button>
      )}
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
        Plataforma Acadêmica
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={toggleTheme} className="btn-icon" aria-label="Alternar Tema">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user ? (
          <button onClick={handleLogout} className="btn btn-icon" style={{ color: 'var(--danger-color)' }} aria-label="Sair">
            <LogOut size={20} />
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary">Entrar</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
