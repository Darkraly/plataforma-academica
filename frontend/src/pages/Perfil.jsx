import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { 
  User, Phone, MapPin, Mail, Save, Edit2, X, 
  CreditCard, Calendar, Activity, Globe, Heart, FileText, Users 
} from 'lucide-react';
import './Perfil.css';

const Perfil = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    telefone: '',
    endereco: '',
    email_pessoal: '',
    cpf: '',
    rg: '',
    sexo: '',
    estado_civil: '',
    data_nascimento: '',
    tipo_sanguineo: '',
    naturalidade: '',
    nacionalidade: '',
    aluno_dados: {
      nome_pai: '',
      nome_mae: '',
      contato_responsaveis: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        telefone: user.telefone || '',
        endereco: user.endereco || '',
        email_pessoal: user.email_pessoal || '',
        cpf: user.cpf || '',
        rg: user.rg || '',
        sexo: user.sexo || '',
        estado_civil: user.estado_civil || '',
        data_nascimento: user.data_nascimento || '',
        tipo_sanguineo: user.tipo_sanguineo || '',
        naturalidade: user.naturalidade || '',
        nacionalidade: user.nacionalidade || '',
        aluno_dados: {
          nome_pai: user.aluno?.nome_pai || '',
          nome_mae: user.aluno?.nome_mae || '',
          contato_responsaveis: user.aluno?.contato_responsaveis || ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('aluno_')) {
      const field = name.replace('aluno_', '');
      setFormData(prev => ({
        ...prev,
        aluno_dados: {
          ...prev.aluno_dados,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      telefone: user.telefone || '',
      endereco: user.endereco || '',
      email_pessoal: user.email_pessoal || '',
      cpf: user.cpf || '',
      rg: user.rg || '',
      sexo: user.sexo || '',
      estado_civil: user.estado_civil || '',
      data_nascimento: user.data_nascimento || '',
      tipo_sanguineo: user.tipo_sanguineo || '',
      naturalidade: user.naturalidade || '',
      nacionalidade: user.nacionalidade || '',
      aluno_dados: {
        nome_pai: user.aluno?.nome_pai || '',
        nome_mae: user.aluno?.nome_mae || '',
        contato_responsaveis: user.aluno?.contato_responsaveis || ''
      }
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authService.updateProfile(formData);
      if (response.success) {
        setUser(response.data);
        setSuccess(true);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Carregando...</div>;

  return (
    <div className="perfil-container fade-in">
      <div className="perfil-header">
        <div className="perfil-header-content">
          <div className="perfil-avatar">
            <User size={48} color="white" />
          </div>
          <div>
            <h1 className="perfil-name">{user.nome}</h1>
            <p className="perfil-role">{user.tipo.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="perfil-content">
        <div className="perfil-card glass-panel">
          <div className="perfil-card-header">
            <h2>Dados Pessoais</h2>
            {!isEditing ? (
              <button 
                className="btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} /> Editar
              </button>
            ) : (
              <button 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} /> Cancelar
              </button>
            )}
          </div>

          {error && <div className="alert-error mb-4">{error}</div>}
          {success && <div className="alert-success mb-4">Perfil atualizado com sucesso!</div>}

          <form onSubmit={handleSubmit} className="perfil-form">
            <div className="form-grid">
              
              {/* Nome */}
              <div className="form-group full-width">
                <label>Nome Completo <span className="text-red-500">*</span></label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" value={user.nome} disabled className="input-disabled" title="Nome não pode ser alterado por aqui" />
                </div>
              </div>

              {/* Email Institucional */}
              <div className="form-group">
                <label>Email Institucional</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="text" value={user.email} disabled className="input-disabled" title="Email institucional não pode ser alterado" />
                </div>
              </div>

              {/* Email Pessoal */}
              <div className="form-group">
                <label>Email Pessoal <span className="text-red-500">*</span></label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    name="email_pessoal"
                    value={formData.email_pessoal} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required={isEditing}
                    placeholder="Seu email pessoal"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* CPF */}
              <div className="form-group">
                <label>CPF <span className="text-red-500">*</span></label>
                <div className="input-with-icon">
                  <CreditCard size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="cpf"
                    value={formData.cpf} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required={isEditing}
                    placeholder="000.000.000-00"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* RG */}
              <div className="form-group">
                <label>RG</label>
                <div className="input-with-icon">
                  <FileText size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="rg"
                    value={formData.rg} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="00.000.000-0"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Data Nascimento */}
              <div className="form-group">
                <label>Data de Nascimento</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input 
                    type="date" 
                    name="data_nascimento"
                    value={formData.data_nascimento} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Sexo */}
              <div className="form-group">
                <label>Sexo</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <select 
                    name="sexo"
                    value={formData.sexo} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'input-disabled form-select' : 'form-select'}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              {/* Estado Civil */}
              <div className="form-group">
                <label>Estado Civil</label>
                <div className="input-with-icon">
                  <Heart size={18} className="input-icon" />
                  <select 
                    name="estado_civil"
                    value={formData.estado_civil} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'input-disabled form-select' : 'form-select'}
                  >
                    <option value="">Selecione</option>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              {/* Tipo Sanguíneo */}
              <div className="form-group">
                <label>Tipo Sanguíneo</label>
                <div className="input-with-icon">
                  <Activity size={18} className="input-icon" />
                  <select 
                    name="tipo_sanguineo"
                    value={formData.tipo_sanguineo} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'input-disabled form-select' : 'form-select'}
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Naturalidade */}
              <div className="form-group">
                <label>Naturalidade</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="naturalidade"
                    value={formData.naturalidade} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Cidade - UF"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Nacionalidade */}
              <div className="form-group">
                <label>Nacionalidade</label>
                <div className="input-with-icon">
                  <Globe size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="nacionalidade"
                    value={formData.nacionalidade} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Brasileiro"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="form-group">
                <label>Telefone / Celular</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    name="telefone"
                    value={formData.telefone} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(00) 00000-0000"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="form-group full-width">
                <label>Endereço Completo</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="endereco"
                    value={formData.endereco} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Rua, Número, Bairro, Cidade, Estado"
                    className={!isEditing ? 'input-disabled' : ''}
                  />
                </div>
              </div>

              {/* Campos de Aluno */}
              {user.tipo === 'aluno' && (
                <>
                  <div className="form-group full-width">
                    <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      Dados de Responsáveis
                    </h3>
                  </div>

                  <div className="form-group">
                    <label>Nome da Mãe</label>
                    <div className="input-with-icon">
                      <Users size={18} className="input-icon" />
                      <input 
                        type="text" 
                        name="aluno_nome_mae"
                        value={formData.aluno_dados.nome_mae} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'input-disabled' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nome do Pai</label>
                    <div className="input-with-icon">
                      <Users size={18} className="input-icon" />
                      <input 
                        type="text" 
                        name="aluno_nome_pai"
                        value={formData.aluno_dados.nome_pai} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'input-disabled' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Contatos de Emergência / Responsáveis</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input 
                        type="text" 
                        name="aluno_contato_responsaveis"
                        value={formData.aluno_dados.contato_responsaveis} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Telefones dos pais ou responsáveis"
                        className={!isEditing ? 'input-disabled' : ''}
                      />
                    </div>
                  </div>
                </>
              )}

            </div>

            {isEditing && (
              <div className="perfil-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={18} /> 
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
