import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  ShieldAlert,
  Users,
  ScrollText,
  Terminal,
  FileCode,
  Building2,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager } = useAuth();

  const canAccessUsers = isAdmin || isManager;
  const canAccessAudit = isAdmin || isManager;

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Tenant Indicator & Mobile Close Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="tenant-selector-pill" style={{ flex: 1 }}>
            <div className="tenant-avatar">
              <Building2 size={16} />
            </div>
            <div className="tenant-info">
              <div className="tenant-name">{user?.tenantName || 'Current Tenant'}</div>
              <div className="tenant-slug">{user?.tenantSlug ? `slug: ${user.tenantSlug}` : user?.tenantId}</div>
            </div>
          </div>

          {/* Close button for mobile screen drawer */}
          <button
            type="button"
            className="sidebar-close-mobile-btn"
            onClick={onClose}
            aria-label="Close Sidebar Drawer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations Center</div>

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/campaigns"
          onClick={onClose}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Target size={18} />
          <span>Campaigns</span>
        </NavLink>

        <NavLink
          to="/security-events"
          onClick={onClose}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <ShieldAlert size={18} />
          <span>Security Events</span>
        </NavLink>

        <div className="nav-section-title">Administration</div>

        {canAccessUsers ? (
          <NavLink
            to="/users"
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Users & Access</span>
          </NavLink>
        ) : (
          <div
            className="nav-link"
            style={{ opacity: 0.35, cursor: 'not-allowed' }}
            title="Restricted: Requires ADMIN or MANAGER role"
          >
            <Users size={18} />
            <span>Users</span>
            <span className="nav-link-badge">Restricted</span>
          </div>
        )}

        {canAccessAudit ? (
          <NavLink
            to="/audit-logs"
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <ScrollText size={18} />
            <span>Audit Trail</span>
          </NavLink>
        ) : (
          <div
            className="nav-link"
            style={{ opacity: 0.35, cursor: 'not-allowed' }}
            title="Restricted: Requires ADMIN or MANAGER role"
          >
            <ScrollText size={18} />
            <span>Audit Trail</span>
            <span className="nav-link-badge">Restricted</span>
          </div>
        )}

        <div className="nav-section-title">Security Testing</div>

        <NavLink
          to="/cross-tenant-demo"
          onClick={onClose}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Terminal size={18} />
          <span>Isolation Lab</span>
        </NavLink>

        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
        >
          <FileCode size={18} />
          <span>OpenAPI Docs</span>
        </a>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Strict Isolation Active &bull; TLS v1.3
        </div>
      </div>
    </aside>
  );
};
