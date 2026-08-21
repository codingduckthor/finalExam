import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password || !fullName || !birthDate) {
      setError('Заполните логин и пароль');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await register({
        login: loginInput,
        password,
        role: UserRole.Patient,
        fullName,
        birthDate: new Date(birthDate).toISOString(),
      });
      setSuccess('Пользователь зарегистрирован! Перенаправление...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
            marginBottom: '14px'
          }}>
            <Activity size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>Регистрация</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
            Создайте новую учетную запись в ClinicOS
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#34d399',
            fontSize: '0.85rem'
          }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date of birth</label>
            <input
              type="date"
              className="form-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Логин</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Придумайте логин"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Создание...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
          Уже зарегистрированы?{' '}
          <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
