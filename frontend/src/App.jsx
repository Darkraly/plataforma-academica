import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminEstrutura from './pages/AdminEstrutura';
import ProfessorTurmas from './pages/ProfessorTurmas';
import ProfessorAvaliacoes from './pages/ProfessorAvaliacoes';
import Perfil from './pages/Perfil';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/estrutura" element={<AdminEstrutura />} />
              <Route path="/professor/turmas" element={<ProfessorTurmas />} />
              <Route path="/professor/avaliacoes" element={<ProfessorAvaliacoes />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
