import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('clinic_api_url') || 'http://localhost:5270/api');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApiUrlChange = (url: string) => {
    setApiUrl(url);
    localStorage.setItem('clinic_api_url', url);
  };

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password) {
      setError('Заполните логин и пароль');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login({ login: loginInput, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoLogin: string, role: UserRole) => {
    setLoginInput(demoLogin);
    setPassword('Password123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            marginBottom: '14px'
          }}>
            <Activity size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>Вход в систему</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
            Авторизуйтесь для доступа к клинике
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Логин</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Введите ваш логин"
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
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Вход...' : (
              <>
                <span>Войти</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
            Быстрый вход для тестирования:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleDemoFill('admin', UserRole.Admin)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoFill('doctor', UserRole.Doctor)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Doctor
            </button>
            <button
              onClick={() => handleDemoFill('patient', UserRole.Patient)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Patient
            </button>
            <button
              onClick={() => handleDemoFill('registrar', UserRole.Registrar)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Registrar
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            Зарегистрироваться
          </Link>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            {showSettings ? '▲ Скрыть адрес бэкенда' : '⚙️ Настройка адреса API бэкенда'}
          </button>
          {showSettings && (
            <div style={{ marginTop: '10px', textAlign: 'left' }} className="fade-in">
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>URL API Бэкенда:</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px', marginTop: '4px' }}
                value={apiUrl}
                onChange={(e) => handleApiUrlChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
