import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { StatCard } from '../components/StatCard';
import { CampaignDistribution } from '../components/CampaignDistribution';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Target,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Shield,
  Cpu,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getMetrics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: '220px', height: '28px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ width: '380px', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
        </div>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <ShieldAlert size={48} style={{ color: '#e11d48', margin: '0 auto 1.25rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Failed to load SOC telemetry</h3>
        <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          An error occurred while communicating with the telemetry cluster.
        </p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry Telemetry Sync
        </button>
      </div>
    );
  }

  const { metrics, charts, recentActivity, tenant } = data;

  const activeCount = charts.campaignsByStatus.ACTIVE || 0;
  const draftCount = charts.campaignsByStatus.DRAFT || 0;
  const completedCount = charts.campaignsByStatus.COMPLETED || 0;
  const cancelledCount = charts.campaignsByStatus.CANCELLED || 0;
  const totalCampaigns = metrics.totalCampaigns || 0;

  return (
    <div className="dashboard-wrapper">
      {/* Ambient Floating Cyber Symbols */}
      <div className="dashboard-ambient-symbol dashboard-symbol-1">
        <Shield size={38} />
      </div>
      <div className="dashboard-ambient-symbol dashboard-symbol-2">
        <Cpu size={42} />
      </div>
      <div className="dashboard-ambient-symbol dashboard-symbol-3">
        <Sparkles size={34} />
      </div>

      {/* Dashboard Top Header */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-title-wrap">
            <h1 className="dashboard-title">Security Operations Center</h1>
            {/* Live Radar Pulse Indicator */}
            <div className="live-radar-badge">
              <div className="radar-ping-container">
                <div className="radar-wave" />
                <div className="radar-dot" />
              </div>
              <span>Live Monitoring</span>
            </div>
          </div>
          <div className="tenant-env-pill">
            <Building2 size={15} color="#2563eb" />
            <span>Tenant Context:</span>
            <span className="tenant-name-highlight">{tenant.name}</span>
            <span className="tenant-slug-badge">{tenant.slug}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/campaigns" className="btn btn-secondary btn-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Target size={15} color="#2563eb" />
            <span>Manage Campaigns</span>
          </Link>
          <Link to="/security-events" className="btn btn-primary btn-sm">
            <ShieldAlert size={15} />
            <span>View Events</span>
          </Link>
        </div>
      </header>

      {/* Metric Cards Grid - Compact & Full Border Colored */}
      <div className="stat-grid" style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
        <StatCard
          label="Active Campaigns"
          value={metrics.activeCampaigns}
          subtext={`of ${metrics.totalCampaigns} total campaigns`}
          icon={<Target size={19} />}
          cardBorder="#a7f3d0"
          hoverBorder="#10b981"
          glow="rgba(16, 185, 129, 0.2)"
          iconColor="#059669"
          iconBg="#ecfdf5"
          smartBadge={{ text: 'Live', bg: '#dcfce7', color: '#15803d' }}
        />

        <StatCard
          label="Open Security Events"
          value={metrics.openSecurityEvents}
          subtext={
            metrics.criticalSecurityEvents > 0
              ? `${metrics.criticalSecurityEvents} critical incident${metrics.criticalSecurityEvents === 1 ? '' : 's'}`
              : 'All systems secured'
          }
          icon={<ShieldAlert size={19} />}
          cardBorder={metrics.criticalSecurityEvents > 0 ? '#fecdd3' : '#fed7aa'}
          hoverBorder={metrics.criticalSecurityEvents > 0 ? '#f43f5e' : '#ea580c'}
          glow={metrics.criticalSecurityEvents > 0 ? 'rgba(244, 63, 94, 0.22)' : 'rgba(234, 88, 12, 0.18)'}
          iconColor={metrics.criticalSecurityEvents > 0 ? '#e11d48' : '#ea580c'}
          iconBg={metrics.criticalSecurityEvents > 0 ? '#fff1f2' : '#fff7ed'}
          smartBadge={
            metrics.criticalSecurityEvents > 0
              ? { text: 'Critical', bg: '#ffe4e6', color: '#be123c' }
              : { text: 'Monitoring', bg: '#fff7ed', color: '#c2410c' }
          }
        />

        <StatCard
          label="Resolved Events"
          value={metrics.resolvedSecurityEvents}
          subtext="Mitigated threats"
          icon={<CheckCircle2 size={19} />}
          cardBorder="#bfdbfe"
          hoverBorder="#2563eb"
          glow="rgba(37, 99, 235, 0.2)"
          iconColor="#2563eb"
          iconBg="#eff6ff"
          smartBadge={{ text: 'Secured', bg: '#dbeafe', color: '#1e40af' }}
        />

        <StatCard
          label="Tenant Identities"
          value={metrics.totalUsers}
          subtext={`Assigned to ${tenant.name}`}
          icon={<Users size={19} />}
          cardBorder="#e9d5ff"
          hoverBorder="#7c3aed"
          glow="rgba(124, 58, 237, 0.2)"
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
          smartBadge={{ text: 'RBAC Active', bg: '#f3e8ff', color: '#6b21a8' }}
        />
      </div>

      {/* Campaign Distribution Showcase Card (Matches Reference Image) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <CampaignDistribution
          activeCount={activeCount}
          draftCount={draftCount}
          completedCount={completedCount}
          cancelledCount={cancelledCount}
          totalCampaigns={totalCampaigns}
        />
      </div>

      {/* Incident Threat Posture Card & Summary */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Flame size={18} style={{ color: '#e11d48' }} />
              <span>Incident Threat Posture</span>
            </div>
            <Link
              to="/security-events"
              style={{
                fontSize: '0.8rem',
                color: '#2563eb',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
              }}
            >
              <span>Inspect Security Events</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div className="threat-posture-grid">
              {/* Critical Threats Mini Card */}
              <div className="threat-mini-card threat-card-critical">
                <div className="threat-value-num" style={{ color: '#e11d48' }}>
                  {charts.securityEventsSummary.critical}
                </div>
                <div className="threat-label-text" style={{ color: '#be123c' }}>
                  {charts.securityEventsSummary.critical > 0 && <span className="threat-pulse-dot" />}
                  <span>Critical Threats</span>
                </div>
              </div>

              {/* High Severity Mini Card */}
              <div className="threat-mini-card threat-card-high">
                <div className="threat-value-num" style={{ color: '#ea580c' }}>
                  {charts.securityEventsSummary.high}
                </div>
                <div className="threat-label-text" style={{ color: '#c2410c' }}>
                  <span>High Severity</span>
                </div>
              </div>

              {/* Total Open Mini Card */}
              <div className="threat-mini-card threat-card-open">
                <div className="threat-value-num" style={{ color: '#2563eb' }}>
                  {charts.securityEventsSummary.open}
                </div>
                <div className="threat-label-text" style={{ color: '#1d4ed8' }}>
                  <span>Total Open</span>
                </div>
              </div>

              {/* Total Resolved Mini Card */}
              <div className="threat-mini-card threat-card-resolved">
                <div className="threat-value-num" style={{ color: '#059669' }}>
                  {charts.securityEventsSummary.resolved}
                </div>
                <div className="threat-label-text" style={{ color: '#047857' }}>
                  <span>Total Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tenant Audit Activity Stream */}
      <div className="card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} style={{ color: '#2563eb' }} />
            <span>Recent Activity Audit Trail</span>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Link
              to="/audit-logs"
              style={{
                fontSize: '0.8rem',
                color: '#2563eb',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
              }}
            >
              <span>Full Audit Logs</span>
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Description</th>
                <th>Initiated By</th>
                <th>Client IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No audit records recorded for this organization yet.
                  </td>
                </tr>
              ) : (
                recentActivity.map((log) => {
                  const initial = log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S';
                  return (
                    <tr key={log.id} className="audit-row-animated">
                      <td>
                        <span
                          className="badge badge-role-MANAGER"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.description}</td>
                      <td>
                        {log.user ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="audit-user-avatar">{initial}</div>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>
                                {log.user.name}
                              </span>
                              <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                                {log.user.email}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="audit-user-avatar" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}>
                              S
                            </div>
                            <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.82rem' }}>
                              System Event
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="audit-ip-chip">{log.ipAddress || '127.0.0.1'}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
