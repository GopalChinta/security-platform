import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { Shield, LogOut, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title">Deep Trace Cybernetics</span>
          </div>
        </Link>
        <span className="brand-badge">Multi-Tenant SOC</span>
      </div>

      <div className="navbar-right">
        {/* Live Cross-Tenant Security Demo Lab button */}
        <Link
          to="/cross-tenant-demo"
          className="btn btn-secondary btn-sm"
          style={{
            borderColor: '#bfdbfe',
            color: '#2563eb',
            background: '#eff6ff',
          }}
        >
          <Terminal size={14} />
          Security Isolation Lab
        </Link>

        {/* Current User Info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RoleBadge role={user.role} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          title="Sign Out"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
