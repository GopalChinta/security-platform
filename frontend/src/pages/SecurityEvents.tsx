import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityEventsApi, CreateSecurityEventPayload } from '../api/securityEvents';
import { Severity, EventStatus } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const SecurityEvents: React.FC = () => {
  const { isAdmin, isManager } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const canManage = isAdmin || isManager;

  // Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSecurityEventPayload>({
    eventType: '',
    severity: 'MEDIUM',
    status: 'OPEN',
    description: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['security-events', { page, search, severity: severityFilter, status: statusFilter, sortBy, sortOrder }],
    queryFn: () =>
      securityEventsApi.getEvents({
        page,
        limit: 10,
        search,
        severity: severityFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateSecurityEventPayload) => securityEventsApi.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Incident Created', 'Security event recorded into tenant SOC telemetry.');
      setIsCreateOpen(false);
      setFormData({ eventType: '', severity: 'MEDIUM', status: 'OPEN', description: '' });
    },
    onError: (err: any) => {
      error('Incident Creation Failed', err.response?.data?.error?.message || 'Failed to record event.');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: EventStatus }) =>
      securityEventsApi.updateEvent(id, { status: newStatus }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Status Updated', `Event marked as ${vars.newStatus}.`);
    },
    onError: (err: any) => {
      error('Update Failed', err.response?.data?.error?.message || 'Failed to update event status.');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventType.trim() || !formData.description.trim()) {
      error('Validation Error', 'Event type and description are required.');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Security Incident Events</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time threat detections, heuristic alerts, and posture telemetry.
          </p>
        </div>

        {canManage && (
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            Log Security Event
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search events by type or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as any);
                setPage(1);
              }}
              style={{ minWidth: '130px' }}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            style={{ minWidth: '130px' }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            className="form-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setSortOrder(o as any);
            }}
            style={{ minWidth: '150px' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="severity-desc">Severity</option>
          </select>
        </div>
      </div>

      {/* Security Events Table */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError || !data ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: '#f43f5e', margin: '0 auto 1rem' }} />
          <h3>Failed to load security events</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Error communicating with telemetry endpoint.</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <ShieldAlert size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Security Events</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            {search || severityFilter || statusFilter
              ? 'No events match your current filter settings.'
              : 'No security incidents have been logged for this organization.'}
          </p>
          {canManage && !search && !severityFilter && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              Record First Event
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                  {canManage && <th style={{ textAlign: 'right' }}>Resolution Action</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem' }}>
                        {event.eventType}
                      </span>
                    </td>
                    <td>
                      <SeverityBadge severity={event.severity} />
                    </td>
                    <td>
                      <StatusBadge status={event.status} />
                    </td>
                    <td>
                      <div style={{ maxWidth: '400px', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {event.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                    </td>
                    {canManage && (
                      <td style={{ textAlign: 'right' }}>
                        {event.status === 'OPEN' ? (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ id: event.id, newStatus: 'RESOLVED' })}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                            disabled={toggleStatusMutation.isPending}
                          >
                            <CheckCircle2 size={14} />
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ id: event.id, newStatus: 'OPEN' })}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#fb923c' }}
                            disabled={toggleStatusMutation.isPending}
                          >
                            <RotateCcw size={14} />
                            Reopen
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Log Security Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Security Incident Event"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Event Type / Classification *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. UNAUTHORIZED_SSH_ATTEMPT or RANSOMWARE_TRIGGER"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                className="form-select"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="OPEN">OPEN</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Incident Telemetry & Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe detected telemetry, target host, source IP addresses, and mitigation steps..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn btn-secondary"
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Logging...' : 'Log Security Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
