import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await authService.login(email, senha);
      // O backend retorna: { success: true, data: { token: '...', user: {...} } }
      const token = response.data.token;
      const user = response.data.user;
      login(user, token);
      navigate('/'); // Redireciona para o Dashboard
    } catch (err) {
      setErro('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Bem-vindo</h2>
        
        {erro && (
          <div style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Institucional</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                outline: 'none',
                transition: 'var(--transition)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                outline: 'none',
                transition: 'var(--transition)'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Acessando...' : 'Entrar na Plataforma'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Esqueci minha senha</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
