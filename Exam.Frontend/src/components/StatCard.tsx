import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#06b6d4',
}) => {
  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          padding: '14px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={26} color={color} />
      </div>
      <div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{title}</span>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', margin: '2px 0' }}>{value}</h3>
        {subtitle && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );
};
