import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { Shield, LogOut, Terminal, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          title={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">Deep Trace Cybernetics</span>
          </div>
        </Link>
        <span className="brand-badge hide-on-mobile">Multi-Tenant SOC</span>
      </div>

      <div className="navbar-right">
        {/* Live Cross-Tenant Security Demo Lab button */}
        <Link
          to="/cross-tenant-demo"
          className="btn btn-secondary btn-sm nav-lab-btn"
          style={{
            borderColor: '#bfdbfe',
            color: '#2563eb',
            background: '#eff6ff',
          }}
        >
          <Terminal size={14} />
          <span className="nav-lab-btn-text">Security Isolation Lab</span>
        </Link>

        {/* Current User Info */}
        {user && (
          <div className="nav-user-info">
            <RoleBadge role={user.role} />
            <div className="nav-user-details hide-on-mobile">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{user.email}</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm nav-logout-btn"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span className="hide-on-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};
