import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, CreateUserPayload, UpdateUserPayload } from '../api/users';
import { User, Role } from '../types';
import { RoleBadge } from '../components/RoleBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const Users: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });

  const [updateForm, setUpdateForm] = useState<UpdateUserPayload>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', { page, search, role: roleFilter, sortBy, sortOrder }],
    queryFn: () =>
      usersApi.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
      }),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('User Created', 'New identity added to organization.');
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'USER' });
    },
    onError: (err: any) => {
      error('Creation Failed', err.response?.data?.error?.message || 'Unable to create user.');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('User Updated', 'Identity details updated successfully.');
      setEditingUser(null);
    },
    onError: (err: any) => {
      error('Update Failed', err.response?.data?.error?.message || 'Unable to update user.');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('User Deleted', 'Identity removed from organization.');
      setDeletingUser(null);
    },
    onError: (err: any) => {
      error('Deletion Failed', err.response?.data?.error?.message || 'Unable to delete user.');
    },
  });

  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setUpdateForm({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      password: '',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password?.trim()) {
      error('Validation Error', 'All fields are required for new user creation.');
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload: UpdateUserPayload = {
      name: updateForm.name,
      email: updateForm.email,
      role: updateForm.role,
      ...(updateForm.password?.trim() ? { password: updateForm.password.trim() } : {}),
    };

    updateMutation.mutate({ id: editingUser.id, payload });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Identities & Access Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage organization members, security roles, and campaign assignment privileges.
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <UserPlus size={16} />
            Create User Identity
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
            placeholder="Search by name or email address..."
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
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setPage(1);
              }}
              style={{ minWidth: '130px' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
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
            style={{ minWidth: '150px' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="role-asc">Role</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : isError || !data ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: '#f43f5e', margin: '0 auto 1rem' }} />
          <h3>Failed to load organization users</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Error communicating with IAM service.</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <UsersIcon size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Identities Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            {search || roleFilter
              ? 'No users match your filter criteria.'
              : 'Add identities to participate in security campaigns.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identity Name</th>
                  <th>Corporate Email</th>
                  <th>RBAC Role</th>
                  <th>Assigned Campaigns</th>
                  <th>Creation Date</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              color: '#38bdf8',
                            }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  fontSize: '0.65rem',
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  background: 'rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                  fontWeight: 700,
                                }}
                              >
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.82rem', color: '#93c5fd' }}>{u.email}</code>
                      </td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{u.assignedCampaignsCount || 0} enrolled</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="btn btn-secondary btn-sm"
                              title="Edit User"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#f43f5e' }}
                              disabled={isCurrent}
                              title={isCurrent ? 'Cannot delete yourself' : 'Delete User'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Identity"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. john@acme.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Requirements: Minimum 8 characters, at least 1 uppercase, 1 lowercase, and 1 number.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Role Authorization</label>
            <select
              className="form-select"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
            >
              <option value="USER">USER (Standard simulation target)</option>
              <option value="MANAGER">MANAGER (Campaign operator & triage)</option>
              <option value="ADMIN">ADMIN (Full organization administrator)</option>
            </select>
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
              {createMutation.isPending ? 'Provisioning...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit Identity: ${editingUser?.name}`}
      >
        <form onSubmit={handleUpdateSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={updateForm.name}
              onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              className="form-input"
              value={updateForm.email}
              onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={updateForm.role}
              onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value as any })}
            >
              <option value="USER">USER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reset Password (Optional)</label>
            <input
              type="password"
              className="form-input"
              placeholder="Leave blank to keep existing password"
              value={updateForm.password || ''}
              onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="btn btn-secondary"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Save Identity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="Delete User Identity"
        message={`Are you sure you want to delete user ${deletingUser?.name} (${deletingUser?.email})? They will lose all access immediately.`}
        confirmLabel="Delete User"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
