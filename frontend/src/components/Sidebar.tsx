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
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();

  const canAccessUsers = isAdmin || isManager;
  const canAccessAudit = isAdmin || isManager;

  return (
    <aside className="sidebar">
      {/* Tenant Indicator */}
      <div className="sidebar-header">
        <div className="tenant-selector-pill">
          <div className="tenant-avatar">
            <Building2 size={16} />
          </div>
          <div className="tenant-info">
            <div className="tenant-name">{user?.tenantName || 'Current Tenant'}</div>
            <div className="tenant-slug">{user?.tenantSlug ? `slug: ${user.tenantSlug}` : user?.tenantId}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations Center</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/campaigns"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Target size={18} />
          <span>Campaigns</span>
        </NavLink>

        <NavLink
          to="/security-events"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <ShieldAlert size={18} />
          <span>Security Events</span>
        </NavLink>

        <div className="nav-section-title">Administration</div>

        {canAccessUsers ? (
          <NavLink
            to="/users"
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
          Strict Isolation Active • TLS v1.3
        </div>
      </div>
    </aside>
  );
};
