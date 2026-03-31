'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface Winner {
  id: string;
  draw_id: string;
  tier: string;
  numbers_matched: number;
  prize_amount: number;
  payout_status: string;
  created_at: string;
  proof_url?: string;
}

interface Draw {
  id: string;
  month: number;
  year: number;
  winning_numbers?: number[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TIER_INFO: Record<string, { label: string; color: string; icon: string }> = {
  '3-match': { label: 'Bronze Tier (3 Matched)', color: 'var(--info)', icon: '🥉' },
  '4-match': { label: 'Silver Tier (4 Matched)', color: 'var(--lime)', icon: '🥈' },
  jackpot: { label: 'GRAND JACKPOT!', color: 'var(--gold)', icon: '🏆' },
};

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiRequest<{ winners: Winner[] }>('/users/me/winnings'),
      apiRequest<{ draws: Draw[] }>('/draws'),
    ]).then(([w, d]) => {
      if (w.status === 'fulfilled') setWinnings(w.value.winners || []);
      if (d.status === 'fulfilled') setDraws(d.value.draws || []);
    }).finally(() => setLoading(false));
  }, []);

  const total = winnings.reduce((s, w) => s + (w.prize_amount || 0), 0);
  const paid = winnings.filter(w => w.payout_status === 'paid').reduce((s, w) => s + w.prize_amount, 0);
  const pending = winnings.filter(w => w.payout_status === 'pending' || w.payout_status === 'verified').reduce((s, w) => s + w.prize_amount, 0);

  const getDraw = (drawId: string) => draws.find(d => d.id === drawId);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Generating winnings audit...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Payout History</h1>
        </div>
        <p className="page-subtitle">Track and audit all prizes awarded to your membership account.</p>
      </div>

      {/* Metrics Performance Grid */}
      <div className={styles.statsGrid}>
        <div className="stat-card animate-fadeInUp delay-1">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">₹{total.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Cumulative Gain</div>
        </div>
        <div className="stat-card animate-fadeInUp delay-2">
          <div className="stat-icon" style={{ color: 'var(--lime)' }}>✅</div>
          <div className="stat-value">₹{paid.toLocaleString('en-IN')}</div>
          <div className="stat-label">Verified Payouts</div>
          <div className="stat-change" style={{ color: 'var(--success)' }}>Disbursed to Bank</div>
        </div>
        <div className="stat-card animate-fadeInUp delay-3">
          <div className="stat-icon" style={{ color: 'var(--gold)' }}>⏳</div>
          <div className="stat-value">₹{pending.toLocaleString('en-IN')}</div>
          <div className="stat-label">Pending Verification</div>
          <div className="stat-change" style={{ color: 'var(--warning)' }}>Awaiting Approval</div>
        </div>
        <div className="stat-card animate-fadeInUp delay-4">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{winnings.length}</div>
          <div className="stat-label">Total Wins Audited</div>
        </div>
      </div>

      {/* Winnings Ledger */}
      <div className="card animate-fadeInUp delay-2" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🔍 Historical Prize Ledger</h3>
          <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{winnings.length} ENTRIES</span>
        </div>

        {winnings.length === 0 ? (
          <div className={styles.empty} style={{ textAlign: 'center', padding: '80px', opacity: 0.8 }}>
            <div style={{ fontSize: '5rem', opacity: 0.1, marginBottom: '24px' }}>🎰</div>
            <h3 style={{ color: 'var(--white)', fontSize: '1.25rem' }}>No Prize History</h3>
            <p style={{ marginTop: '12px', color: 'var(--gray-400)' }}>Participate in monthly draws to start building your ledger history.</p>
          </div>
        ) : (
          <div className={styles.winList} style={{ border: 'none' }}>
            {winnings.map(w => {
              const tier = TIER_INFO[w.tier] || TIER_INFO['3-match'];
              const draw = getDraw(w.draw_id);
              return (
                <div key={w.id} className={styles.winCard} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.3s ease' }}>
                  <div className={styles.winIcon} style={{ fontSize: '2rem' }}>{tier.icon}</div>
                  <div className={styles.winInfo} style={{ flex: 1 }}>
                    <div className={styles.winTier} style={{ color: tier.color, fontWeight: 700, fontSize: '1rem' }}>{tier.label.toUpperCase()}</div>
                    {draw && (
                      <div className={styles.winDate} style={{ fontSize: '0.8125rem', color: 'var(--gray-300)', marginTop: '4px' }}>
                        {MONTHS[(draw.month || 1) - 1]} {draw.year} Prize Period
                      </div>
                    )}
                    <div className={styles.winDate} style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '2px', textTransform: 'uppercase' }}>
                      Audit Log: {new Date(w.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    {draw?.winning_numbers && (
                      <div className={styles.winNumbers} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        {draw.winning_numbers.map((n, i) => (
                          <span key={i} className={styles.winBall} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)' }}>{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.winRight} style={{ textAlign: 'right' }}>
                    <div className={styles.winAmount} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>
                      ₹{w.prize_amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span className={`badge ${w.payout_status === 'paid' ? 'badge-lime' : w.payout_status === 'verified' ? 'badge-info' : 'badge-gold'}`} style={{ fontSize: '0.6rem', padding: '4px 10px' }}>
                        {w.payout_status === 'paid' ? 'DISBURSED' : w.payout_status === 'verified' ? '🔍 VERIFIED' : '⏳ PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
