'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../lib/auth';
import styles from './page.module.css';

interface Analytics {
  activeUsers: number;
  activeSubs: number;
  totalRevenue: number;
  totalCharityContributions: number;
  totalWinnersPaid: number;
  completedDraws: number;
}

interface Draw {
  id: string;
  month: number;
  year: number;
  prize_pool: number;
  charity_contribution: number;
  status: string;
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiRequest<{ analytics: Analytics }>('/admin/analytics'),
      apiRequest<{ draws: Draw[] }>('/draws'),
    ]).then(([a, d]) => {
      if (a.status === 'fulfilled') setAnalytics(a.value.analytics);
      if (d.status === 'fulfilled') setDraws(d.value.draws || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Generating analytics report...</p>
      </div>
    );
  }

  const completedDraws = draws.filter(d => d.status === 'completed');
  const totalPrizePoolAllDraws = completedDraws.reduce((s, d) => s + (d.prize_pool || 0), 0);
  const avgPrizePoolValue = completedDraws.length ? totalPrizePoolAllDraws / completedDraws.length : 0;
  const charityImpactPct = analytics?.totalRevenue
    ? ((analytics.totalCharityContributions / analytics.totalRevenue) * 100).toFixed(1)
    : '10.0';

  const metrics = [
    { icon: '👥', label: 'Active Members', value: analytics?.activeUsers || 0, color: 'var(--lime)' },
    { icon: '💳', label: 'Active Subscriptions', value: analytics?.activeSubs || 0, color: 'var(--gold)' },
    { icon: '💰', label: 'Gross Revenue', value: `₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'var(--success)' },
    { icon: '❤️', label: 'Charity Impact', value: `₹${(analytics?.totalCharityContributions || 0).toLocaleString('en-IN')}`, color: 'var(--danger)' },
    { icon: '🏆', label: 'Prizes Paid', value: `₹${(analytics?.totalWinnersPaid || 0).toLocaleString('en-IN')}`, color: 'var(--gold)' },
    { icon: '🎰', label: 'Draws Completed', value: analytics?.completedDraws || 0, color: 'var(--info)' },
    { icon: '📈', label: 'Avg Prize Pool', value: `₹${avgPrizePoolValue.toLocaleString('en-IN')}`, color: 'var(--lime)' },
    { icon: '🌟', label: 'Impact Factor', value: `${charityImpactPct}%`, color: 'var(--success)' },
  ];

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>📈</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Platform Analytics</h1>
        </div>
        <p className="page-subtitle">Real-time performance metrics and financial distribution audit.</p>
      </div>

      {/* Metrics Performance Grid */}
      <div className={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <div key={i} className={`stat-card animate-fadeInUp delay-${(i % 5) + 1}`} style={{ borderBottom: `2px solid ${m.color}22` }}>
            <div className="stat-icon" style={{ fontSize: '1.25rem', opacity: 0.8 }}>{m.icon}</div>
            <div className="stat-value" style={{ color: m.color, fontSize: '1.5rem' }}>{m.value}</div>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '32px' }}>
        {/* Revenue Allocation Profile */}
        <div className="card animate-fadeInUp" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '32px', fontSize: '1.1rem', fontWeight: 700 }}>📊 Allocation Profile</h3>
          <div className={styles.allocationBars}>
            {[
              { label: 'Winner Payouts', amount: analytics?.totalWinnersPaid || 0, total: analytics?.totalRevenue || 1, color: 'var(--grad-gold)' },
              { label: 'Charity Contributions', amount: analytics?.totalCharityContributions || 0, total: analytics?.totalRevenue || 1, color: 'var(--success)' },
            ].map((item, i) => {
              const pct = ((item.amount / item.total) * 100).toFixed(1);
              return (
                <div key={i} className={styles.allocBar} style={{ marginBottom: '24px' }}>
                  <div className={styles.allocHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className={styles.allocLabel} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-400)' }}>{item.label}</span>
                    <span className={styles.allocVal} style={{ fontWeight: 700, color: 'var(--white)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className={styles.allocBarBg} style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      className={styles.allocBarFill}
                      style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '5px' }}
                    />
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'right' }}>
                     ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: '40px', fontSize: '0.8rem', color: 'var(--gray-500)', fontStyle: 'italic', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            🔔 This breakdown represents actual disbursements. Theoretical allocation is 10% Charity, 70% Prizes, 20% Operations.
          </p>
        </div>

        {/* Draw History Audit */}
        {completedDraws.length > 0 ? (
          <div className="card animate-fadeInUp delay-2" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📋 Historical Audit</h3>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <th style={{ padding: '16px 32px' }}>DRAW PERIOD</th>
                    <th>PRIZE POOL</th>
                    <th>CHARITY VALUE</th>
                    <th style={{ paddingRight: '32px' }}>AUDIT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDraws.map(d => (
                    <tr key={d.id}>
                      <td style={{ padding: '20px 32px', fontWeight: 600 }}>{MONTHS_SHORT[(d.month || 1) - 1]} {d.year}</td>
                      <td><strong style={{ color: 'var(--gold)' }}>₹{(d.prize_pool || 0).toLocaleString('en-IN')}</strong></td>
                      <td><strong style={{ color: 'var(--success)' }}>₹{(d.charity_contribution || 0).toLocaleString('en-IN')}</strong></td>
                      <td style={{ paddingRight: '32px' }}><span className="badge badge-lime">VERIFIED</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card animate-fadeInUp delay-2" style={{ textAlign: 'center', padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '16px' }}>📊</div>
            <p className="text-muted">No historical data available yet.<br/>Run your first draw to see audit records.</p>
          </div>
        )}
      </div>
    </div>
  );
}
