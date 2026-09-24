import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { usersApi } from '../api/users';
import { StatusBadge } from '../components/StatusBadge';
import { RoleBadge } from '../components/RoleBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Users,
  Calendar,
  UserPlus,
  Trash2,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isManager } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const canManageAssignments = isAdmin || isManager;

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // Fetch campaign details
  const {
    data: campaign,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getCampaignById(id!),
    enabled: !!id,
  });

  // Fetch organization users for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users-available-for-assignment'],
    queryFn: () => usersApi.getUsers({ limit: 100 }),
    enabled: isAssignModalOpen && canManageAssignments,
  });

  // Assign user mutation
  const assignMutation = useMutation({
    mutationFn: (userId: string) => campaignsApi.assignUser(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      success('User Assigned', 'User has been assigned to this security campaign.');
      setIsAssignModalOpen(false);
      setSelectedUserId('');
    },
    onError: (err: any) => {
      error('Assignment Failed', err.response?.data?.error?.message || 'Unable to assign user.');
    },
  });

  // Remove user assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: (userId: string) => campaignsApi.removeUser(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      success('Assignment Removed', 'User assignment was removed successfully.');
      setRemovingUserId(null);
    },
    onError: (err: any) => {
      error('Removal Failed', err.response?.data?.error?.message || 'Unable to remove assignment.');
    },
  });

  if (isLoading) {
    return (
      <div>
        <div style={{ width: '150px', height: '24px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '1.5rem' }} />
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !campaign) {
    const is404 = (fetchError as any)?.response?.status === 404;
    return (
      <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={44} style={{ color: '#f43f5e', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          {is404 ? 'Campaign Not Found' : 'Failed to Load Campaign'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
          {is404
            ? 'The requested campaign either does not exist or belongs to another organization. Strict tenant isolation ensures zero cross-tenant access.'
            : 'An unexpected error occurred while fetching campaign data.'}
        </p>
        <Link to="/campaigns" className="btn btn-primary">
          <ArrowLeft size={16} />
          Return to Campaigns
        </Link>
      </div>
    );
  }

  // Filter out already assigned users from candidate list
  const assignedIds = new Set(campaign.assignedUsers?.map((u) => u.id) || []);
  const availableUsers = usersData?.items?.filter((u) => !assignedIds.has(u.id)) || [];

  return (
    <div>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/campaigns"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          Back to Campaigns
        </Link>
      </div>

      {/* Main Campaign Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Campaign ID: {campaign.id} • Organization: {campaign.tenantId}
            </div>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Description */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Description & Objectives
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {campaign.description || 'No detailed scope description provided.'}
              </p>
            </div>

            {/* Campaign Meta Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Calendar size={16} style={{ color: '#38bdf8' }} />
                <span>
                  <strong>Timeline:</strong>{' '}
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Unscheduled'}
                  {campaign.endDate ? ` to ${new Date(campaign.endDate).toLocaleDateString()}` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Clock size={16} style={{ color: '#a78bfa' }} />
                <span>
                  <strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Shield size={16} style={{ color: '#34d399' }} />
                <span>
                  <strong>Created By:</strong> {campaign.createdBy?.name || 'System Admin'} ({campaign.createdBy?.email})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Users Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title">
            <Users size={18} style={{ color: '#38bdf8' }} />
            <span>Assigned Target Identities ({campaign.assignedUsers?.length || 0})</span>
          </div>

          {canManageAssignments && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={15} />
              Assign User
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity Name</th>
                <th>Corporate Email</th>
                <th>Role</th>
                <th>Assigned Timestamp</th>
                {canManageAssignments && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {!campaign.assignedUsers || campaign.assignedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No users currently assigned to this security campaign.
                  </td>
                </tr>
              ) : (
                campaign.assignedUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(u.assignedAt).toLocaleString()}
                    </td>
                    {canManageAssignments && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setRemovingUserId(u.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#f43f5e' }}
                          title="Remove assignment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign User Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign User to Campaign"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select an active identity from your organization (<strong>{campaign.tenantId}</strong>) to enroll into
            this campaign.
          </p>

          <div className="form-group">
            <label className="form-label">Select Organization User</label>
            <select
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose User --</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(false)}
            className="btn btn-secondary"
            disabled={assignMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedUserId && assignMutation.mutate(selectedUserId)}
            className="btn btn-primary"
            disabled={!selectedUserId || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </Modal>

      {/* Remove User Confirmation */}
      <ConfirmDialog
        isOpen={!!removingUserId}
        onClose={() => setRemovingUserId(null)}
        onConfirm={() => removingUserId && removeAssignmentMutation.mutate(removingUserId)}
        title="Remove User Assignment"
        message="Are you sure you want to remove this user from the campaign? They will no longer participate in simulations."
        confirmLabel="Remove User"
        isDangerous={true}
        isLoading={removeAssignmentMutation.isPending}
      />
    </div>
  );
};
