'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface Analytics {
  activeUsers: number;
  activeSubs: number;
  totalRevenue: number;
  totalCharityContributions: number;
  totalWinnersPaid: number;
  completedDraws: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ analytics: Analytics }>('/admin/analytics')
      .then(d => setAnalytics(d.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading overview...</p>
      </div>
    );
  }

  const stats = [
    { icon: '👥', label: 'Active Users', value: analytics?.activeUsers || 0, color: 'var(--lime)' },
    { icon: '💳', label: 'Active Subscriptions', value: analytics?.activeSubs || 0, color: 'var(--gold)' },
    { icon: '💰', label: 'Monthly Revenue', value: `₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'var(--success)' },
    { icon: '❤️', label: 'Charity Contributions', value: `₹${(analytics?.totalCharityContributions || 0).toLocaleString('en-IN')}`, color: 'var(--danger)' },
    { icon: '🏆', label: 'Prizes Paid', value: `₹${(analytics?.totalWinnersPaid || 0).toLocaleString('en-IN')}`, color: 'var(--gold)' },
    { icon: '🎰', label: 'Completed Draws', value: analytics?.completedDraws || 0, color: 'var(--info)' },
  ];

  const quickActions = [
    { href: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'Manage all platform members and subscriptions' },
    { href: '/admin/draws', icon: '🎰', title: 'Manage Draws', desc: 'Schedule, run and publish monthly draws' },
    { href: '/admin/charities', icon: '❤️', title: 'Manage Charities', desc: 'Add or edit partner charity organizations' },
    { href: '/admin/analytics', icon: '📈', title: 'Analytics', desc: 'Platform growth and financial performance' },
  ];

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>👑</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
        </div>
        <p className="page-subtitle">
          Welcome back, {user?.name}. Here is an overview of the platform performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={`stat-card animate-fadeInUp delay-${(i % 5) + 1}`} style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="divider" style={{ margin: '40px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className={styles.lowerSection}>
        {/* Quick Actions */}
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Quick Actions
          </h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <Link key={action.href} href={action.href} className={`${styles.actionCard} animate-fadeInUp delay-${i + 1}`}>
                <div className={styles.actionIcon}>{action.icon}</div>
                <div>
                  <div className={styles.actionTitle}>{action.title}</div>
                  <div className={styles.actionDesc}>{action.desc}</div>
                </div>
                <div className={styles.actionArrow}>→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card animate-fadeInUp" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span> Financial Allocation
          </h3>
          <div className={styles.revenueGrid}>
            <div className={styles.revBar}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={styles.revLabel}>Total Revenue</span>
                <span className={styles.revVal}>₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.revBarBg}>
                <div className={styles.revBarFill} style={{ width: '100%', background: 'var(--grad-lime)' }} />
              </div>
            </div>

            <div className={styles.revBar}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={styles.revLabel}>Charity (10%)</span>
                <span className={styles.revVal} style={{ color: 'var(--success)' }}>₹{(analytics?.totalCharityContributions || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.revBarBg}>
                <div
                  className={styles.revBarFill}
                  style={{
                    width: analytics?.totalRevenue ? `${((analytics.totalCharityContributions / analytics.totalRevenue) * 100)}%` : '0%',
                    background: 'var(--success)',
                  }}
                />
              </div>
            </div>

            <div className={styles.revBar}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={styles.revLabel}>Prizes Paid</span>
                <span className={styles.revVal} style={{ color: 'var(--gold)' }}>₹{(analytics?.totalWinnersPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.revBarBg}>
                <div
                  className={styles.revBarFill}
                  style={{
                    width: analytics?.totalRevenue ? `${((analytics.totalWinnersPaid / analytics.totalRevenue) * 100)}%` : '0%',
                    background: 'var(--grad-gold)',
                  }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
            💰 Revenue is automatically split: 10% to Charity, ~70% to Prize Pool, and 20% Platform Operation.
          </div>
        </div>
      </div>
    </div>
  );
}
