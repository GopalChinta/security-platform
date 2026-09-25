import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Target,
  ShieldAlert,
  Flame,
  CheckCircle,
  Activity,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getMetrics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: '200px', height: '24px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ width: '350px', height: '16px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
        </div>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <ShieldAlert size={40} style={{ color: '#f43f5e', margin: '0 auto 1rem' }} />
        <h3>Failed to load tenant dashboard metrics</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          An error occurred while communicating with the telemetry service.
        </p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, charts, recentActivity, tenant } = data;

  return (
    <div>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Security Operations Center</h1>
            <span className="badge badge-ACTIVE">LIVE MONITORING</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Tenant Environment: <strong style={{ color: '#2563eb' }}>{tenant.name}</strong> ({tenant.slug})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/campaigns" className="btn btn-secondary btn-sm">
            <Target size={15} />
            Manage Campaigns
          </Link>
          <Link to="/security-events" className="btn btn-primary btn-sm">
            <ShieldAlert size={15} />
            View Events
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        <StatCard
          label="Active Campaigns"
          value={metrics.activeCampaigns}
          subtext={`of ${metrics.totalCampaigns} total campaigns`}
          icon={<Target size={22} />}
          gradient="linear-gradient(90deg, #10b981, #06b6d4)"
          iconColor="#34d399"
          iconBg="rgba(16, 185, 129, 0.15)"
        />

        <StatCard
          label="Open Security Events"
          value={metrics.openSecurityEvents}
          subtext={`${metrics.criticalSecurityEvents} critical incident${metrics.criticalSecurityEvents === 1 ? '' : 's'}`}
          icon={<ShieldAlert size={22} />}
          gradient="linear-gradient(90deg, #f43f5e, #fb923c)"
          iconColor={metrics.criticalSecurityEvents > 0 ? '#f43f5e' : '#fb923c'}
          iconBg={metrics.criticalSecurityEvents > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 146, 60, 0.15)'}
        />

        <StatCard
          label="Resolved Events"
          value={metrics.resolvedSecurityEvents}
          subtext="Mitigated threats"
          icon={<CheckCircle size={22} />}
          gradient="linear-gradient(90deg, #38bdf8, #818cf8)"
          iconColor="#38bdf8"
          iconBg="rgba(56, 189, 248, 0.15)"
        />

        <StatCard
          label="Tenant Identities"
          value={metrics.totalUsers}
          subtext={`Assigned to ${tenant.name}`}
          icon={<Users size={22} />}
          gradient="linear-gradient(90deg, #8b5cf6, #ec4899)"
          iconColor="#a78bfa"
          iconBg="rgba(139, 92, 246, 0.15)"
        />
      </div>

      {/* Middle Layout: Posture & Campaign Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Campaign Posture Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} style={{ color: '#38bdf8' }} />
              <span>Campaign Distribution</span>
            </div>
            <Link to="/campaigns" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Active</span>
                  <span>{charts.campaignsByStatus.ACTIVE || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: '#10b981',
                      width: `${(charts.campaignsByStatus.ACTIVE / (metrics.totalCampaigns || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Draft</span>
                  <span>{charts.campaignsByStatus.DRAFT || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: '#94a3b8',
                      width: `${(charts.campaignsByStatus.DRAFT / (metrics.totalCampaigns || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Completed</span>
                  <span>{charts.campaignsByStatus.COMPLETED || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: '#38bdf8',
                      width: `${(charts.campaignsByStatus.COMPLETED / (metrics.totalCampaigns || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#fb7185', fontWeight: 600 }}>Cancelled</span>
                  <span>{charts.campaignsByStatus.CANCELLED || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: '#f43f5e',
                      width: `${(charts.campaignsByStatus.CANCELLED / (metrics.totalCampaigns || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Posture Summary Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Flame size={18} style={{ color: '#f43f5e' }} />
              <span>Incident Threat Posture</span>
            </div>
            <Link to="/security-events" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Inspect <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{charts.securityEventsSummary.critical}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                  Critical Threats
                </div>
              </div>
              <div style={{ background: 'rgba(251, 146, 60, 0.08)', border: '1px solid rgba(251, 146, 60, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c' }}>{charts.securityEventsSummary.high}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                  High Severity
                </div>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{charts.securityEventsSummary.open}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                  Total Open
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{charts.securityEventsSummary.resolved}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                  Total Resolved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tenant Audit Activity Stream */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} style={{ color: '#38bdf8' }} />
            <span>Recent Activity Audit Trail</span>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Link to="/audit-logs" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Full Audit Logs <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        <div className="table-container">
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No audit records recorded for this organization yet.
                  </td>
                </tr>
              ) : (
                recentActivity.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="badge badge-role-MANAGER" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.description}</td>
                    <td>
                      {log.user ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{log.user.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            {log.user.email}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System Event</span>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{log.ipAddress || '127.0.0.1'}</code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
