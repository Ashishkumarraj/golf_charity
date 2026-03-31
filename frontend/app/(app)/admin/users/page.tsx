'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../lib/auth';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  charity_id?: string;
  subscription?: {
    id: string;
    user_id: string;
    plan: string;
    status: string;
    amount: number;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const uData = await apiRequest<{ users: User[] }>('/admin/users');
      setUsers(uData.users || []);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleActive = async (userId: string, currentState: boolean) => {
    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !currentState }),
      });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentState } : u));
      setSuccess(`User ${currentState ? 'deactivated' : 'activated'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update user');
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.subscription?.status === 'active') ||
      (filter === 'inactive' && (!u.subscription || u.subscription.status !== 'active')) ||
      (filter === 'admin' && u.role === 'admin');
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading member data...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">View, edit and manage all platform members and their subscriptions.</p>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✅ {success}</div>}

      {/* Overview Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{users.filter(u => u.role !== 'admin').length}</span>
          <span className={styles.statLbl}>Total Members</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--lime)' }}>
            {users.filter(u => u.subscription?.status === 'active').length}
          </span>
          <span className={styles.statLbl}>Active Subscriptions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--danger)' }}>
            {users.filter(u => !u.is_active).length}
          </span>
          <span className={styles.statLbl}>Suspended Users</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controls}>
        <div className="form-group" style={{ maxWidth: '380px', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search members by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ flex: 0 }}>
          {['all', 'active', 'inactive', 'admin'].map(f => (
            <button
              key={f}
              className={`tab-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'active' ? '✅ Active' : f === 'inactive' ? '❌ Inactive' : '👑 Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Members table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Subscription Status</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '64px', color: 'var(--gray-500)' }}>
                    No members matching your search.
                  </td>
                </tr>
              ) : filtered.map(u => {
                const sub = u.subscription;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </td>
                    <td>
                      {sub ? (
                        <div>
                          <span className={`badge ${sub.status === 'active' ? 'badge-lime' : 'badge-danger'}`}>
                            {sub.status}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
                            ₹{sub.amount.toLocaleString('en-IN')}/{sub.plan === 'monthly' ? 'mo' : 'yr'}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-gray">No Plan</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? '✅ Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={() => toggleActive(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
