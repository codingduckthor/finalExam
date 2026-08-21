import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRoleNames } from '../types';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel" style={{ height: '70px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #10b981)',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>ClinicOS</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Система управления клиникой</p>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <UserIcon size={18} color="#06b6d4" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.login}</span>
              <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 500 }}>
                {UserRoleNames[user.role] || 'Пользователь'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Выйти из системы"
          >
            <LogOut size={16} />
            <span>Выход</span>
          </button>
        </div>
      )}
    </header>
  );
};
