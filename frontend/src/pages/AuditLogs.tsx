import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/auditLogs';
import { AuditLog } from '../types';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ScrollText,
  Search,
  Calendar,
  AlertCircle,
  FileJson,
  Shield,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  // Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Metadata inspection modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', { page, search, action: actionFilter, entityType: entityTypeFilter, sortBy, sortOrder }],
    queryFn: () =>
      auditLogsApi.getLogs({
        page,
        limit: 15,
        search,
        action: actionFilter,
        entityType: entityTypeFilter,
        sortBy,
        sortOrder,
      }),
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Immutable Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Cryptographically timestamped record of all authentication, campaign changes, and administrative actions.
          </p>
        </div>

        <div className="badge badge-ACTIVE" style={{ padding: '0.4rem 0.8rem' }}>
          <Shield size={13} />
          Tamper-Evident Logs
        </div>
      </div>

      {/* Filter Toolbar - Unified Single Row */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audit descriptions, actions, or IP addresses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="toolbar-filters-group">
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="CAMPAIGN_CREATED">CAMPAIGN_CREATED</option>
            <option value="CAMPAIGN_UPDATED">CAMPAIGN_UPDATED</option>
            <option value="CAMPAIGN_DELETED">CAMPAIGN_DELETED</option>
            <option value="CAMPAIGN_USER_ASSIGNED">CAMPAIGN_USER_ASSIGNED</option>
            <option value="CAMPAIGN_USER_REMOVED">CAMPAIGN_USER_REMOVED</option>
            <option value="SECURITY_EVENT_CREATED">SECURITY_EVENT_CREATED</option>
            <option value="SECURITY_EVENT_UPDATED">SECURITY_EVENT_UPDATED</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="USER_DELETED">USER_DELETED</option>
          </select>

          <select
            className="form-select"
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Entities</option>
            <option value="AUTH">AUTH</option>
            <option value="CAMPAIGN">CAMPAIGN</option>
            <option value="CAMPAIGN_USER">CAMPAIGN_USER</option>
            <option value="SECURITY_EVENT">SECURITY_EVENT</option>
            <option value="USER">USER</option>
          </select>

          <select
            className="form-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setSortOrder(o as any);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="action-asc">Action (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : isError || !data ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: '#f43f5e', margin: '0 auto 1rem' }} />
          <h3>Failed to load audit logs</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Unable to query organization audit records.</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <ScrollText size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Audit Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto' }}>
            {search || actionFilter || entityTypeFilter
              ? 'No audit entries match your specified filter parameters.'
              : 'Audit events will be logged here as administrative actions occur.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>Initiator</th>
                  <th>Client IP</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => {
                  const isFail = log.action === 'LOGIN_FAILED';
                  return (
                    <tr key={log.id}>
                      <td>
                        <span
                          className={`badge ${isFail ? 'badge-CANCELLED' : 'badge-role-MANAGER'}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{log.entityType}</code>
                      </td>
                      <td>
                        <div style={{ maxWidth: '350px', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {log.description}
                        </div>
                      </td>
                      <td>
                        {log.user ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 600 }}>{log.user.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>
                              {log.user.email}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            System/Unauth
                          </span>
                        )}
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem', color: '#93c5fd' }}>{log.ipAddress || '127.0.0.1'}</code>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {log.metadata ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="btn btn-secondary btn-sm"
                            title="Inspect JSON Metadata"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          >
                            <FileJson size={14} />
                            JSON
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Metadata JSON Inspection Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Telemetry: ${selectedLog?.action}`}
        maxWidth="600px"
      >
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Log Entry ID:</span>
                <code style={{ display: 'block', color: '#38bdf8' }}>{selectedLog.id}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tenant ID:</span>
                <code style={{ display: 'block', color: '#38bdf8' }}>{selectedLog.tenantId}</code>
              </div>
            </div>

            <div className="terminal-box">
              <div className="terminal-header">
                <div className="terminal-dot dot-red" />
                <div className="terminal-dot dot-yellow" />
                <div className="terminal-dot dot-green" />
                <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#64748b' }}>structured_metadata.json</span>
              </div>
              <pre style={{ margin: 0, overflowX: 'auto' }}>
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
