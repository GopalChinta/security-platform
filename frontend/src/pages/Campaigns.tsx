import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { campaignsApi, CreateCampaignPayload, UpdateCampaignPayload } from '../api/campaigns';
import { Campaign, CampaignStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Target,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const Campaigns: React.FC = () => {
  const { isAdmin, isManager } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const canCreateOrEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  // Filter & pagination state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateCampaignPayload>({
    name: '',
    description: '',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaigns', { page, search, status: statusFilter, sortBy, sortOrder }],
    queryFn: () =>
      campaignsApi.getCampaigns({
        page,
        limit: 10,
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateCampaignPayload) => campaignsApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Campaign Created', 'The campaign has been initialized successfully.');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      error('Creation Failed', err.response?.data?.error?.message || 'Unable to create campaign.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) =>
      campaignsApi.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Campaign Updated', 'Campaign details updated successfully.');
      setEditingCampaign(null);
    },
    onError: (err: any) => {
      error('Update Failed', err.response?.data?.error?.message || 'Unable to update campaign.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Campaign Deleted', 'Campaign removed permanently.');
      setDeletingCampaign(null);
    },
    onError: (err: any) => {
      error('Deletion Failed', err.response?.data?.error?.message || 'Unable to delete campaign.');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'DRAFT',
      startDate: '',
      endDate: '',
    });
  };

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : '',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Validation Error', 'Campaign name is required');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      status: formData.status,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    updateMutation.mutate({
      id: editingCampaign.id,
      payload: {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Security Campaigns</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Coordinate and execute phishing simulations, zero-trust audits, and compliance assessments.
          </p>
        </div>

        {canCreateOrEdit && (
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create Campaign
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
            placeholder="Search campaigns by name or description..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              style={{ minWidth: '140px' }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <select
            className="form-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setSortOrder(o as any);
            }}
            style={{ minWidth: '160px' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="status-asc">Status</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError || !data ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: '#f43f5e', margin: '0 auto 1rem' }} />
          <h3>Failed to load campaigns</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Unable to retrieve tenant campaign data.</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Target size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Campaigns Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            {search || statusFilter
              ? 'No campaigns match your selected search criteria. Try modifying your filters.'
              : 'Get started by creating your first security simulation or compliance campaign.'}
          </p>
          {canCreateOrEdit && !search && !statusFilter && (
            <button
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Create First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Timeline</th>
                  <th>Assigned Identities</th>
                  <th>Created By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((camp) => (
                  <tr key={camp.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link
                          to={`/campaigns/${camp.id}`}
                          style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {camp.name}
                        </Link>
                        {camp.description && (
                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              maxWidth: '320px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: '2px',
                            }}
                          >
                            {camp.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={camp.status} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        {camp.startDate ? (
                          <span>
                            {new Date(camp.startDate).toLocaleDateString()}
                            {camp.endDate ? ` → ${new Date(camp.endDate).toLocaleDateString()}` : ''}
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No timeline set</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Users size={14} style={{ color: '#38bdf8' }} />
                        <span>{camp.assignedUsersCount || 0} users</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 500 }}>{camp.createdBy?.name || 'System'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <Link
                          to={`/campaigns/${camp.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>

                        {canCreateOrEdit && (
                          <button
                            onClick={() => handleOpenEdit(camp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Campaign"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeletingCampaign(camp)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#f43f5e' }}
                            title="Delete Campaign (Admin Only)"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
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

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Security Campaign"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Campaign Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Q1 Phishing Resilience Assessment"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe campaign goals, target departments, and simulation procedures..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              {createMutation.isPending ? 'Creating...' : 'Initialize Campaign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        title={`Edit Campaign: ${editingCampaign?.name}`}
      >
        <form onSubmit={handleUpdateSubmit}>
          <div className="form-group">
            <label className="form-label">Campaign Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status Transition</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Valid transitions: DRAFT → ACTIVE/CANCELLED, ACTIVE → COMPLETED/CANCELLED.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setEditingCampaign(null)}
              className="btn btn-secondary"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onConfirm={() => deletingCampaign && deleteMutation.mutate(deletingCampaign.id)}
        title="Delete Security Campaign"
        message={`Are you sure you want to delete campaign "${deletingCampaign?.name}"? All associated user assignments and statistics will be permanently removed.`}
        confirmLabel="Delete Campaign"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
