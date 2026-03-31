'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface GolfScore {
  id: string;
  score: number;
  date_played: string;
}

interface Draw {
  id: string;
  month: number;
  year: number;
  status: string;
  prize_pool: number;
  winning_numbers?: number[];
  jackpot_amount: number;
}

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];

export default function DashboardPage() {
  const { user, subscription, isSubscribed } = useAuth();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [winnings, setWinnings] = useState<{ total: number; count: number }>({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresData, drawData, winningsData] = await Promise.allSettled([
          apiRequest<{ scores: GolfScore[] }>('/users/me/scores'),
          apiRequest<{ draw: Draw }>('/draws/current'),
          apiRequest<{ winners: Array<{ prize_amount: number }> }>('/users/me/winnings'),
        ]);

        if (scoresData.status === 'fulfilled') setScores(scoresData.value.scores || []);
        if (drawData.status === 'fulfilled') setCurrentDraw(drawData.value.draw || null);
        if (winningsData.status === 'fulfilled') {
          const wins = winningsData.value.winners || [];
          setWinnings({
            total: wins.reduce((s, w) => s + (w.prize_amount || 0), 0),
            count: wins.length,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgScore = scores.length
    ? Math.round(scores.reduce((s, g) => s + g.score, 0) / scores.length)
    : 0;

  const nextDrawDate = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = end.getTime() - now.getTime();
    const days = Math.min(Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))), 31);
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header Area */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="page-subtitle">
            {isSubscribed
              ? `You are an active member. The next draw happens in ${nextDrawDate()}.`
              : "You haven't joined a plan yet. Subscribe to enter the monthly prize draw!"}
          </p>
        </div>
        {!isSubscribed && (
          <Link href="/subscription" className="btn btn-gold btn-lg">
            ⚡ Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Overview Metrics */}
      <div className={styles.statsGrid}>
        <div className="stat-card animate-fadeInUp delay-1">
          <div className="stat-icon">⛳</div>
          <div className="stat-value">{scores.length}/5</div>
          <div className="stat-label">Golf Scores</div>
          {scores.length > 0 && (
            <div className="stat-change">Current Avg: {avgScore} pts</div>
          )}
        </div>

        <div className="stat-card animate-fadeInUp delay-2">
          <div className="stat-icon">🎰</div>
          <div className="stat-value">
            {currentDraw ? `₹${(currentDraw.prize_pool || 0).toLocaleString('en-IN')}` : '—'}
          </div>
          <div className="stat-label">Current Prize Pool</div>
          {currentDraw && (
            <div className="stat-change">Next Draw: {nextDrawDate()}</div>
          )}
        </div>

        <div className="stat-card animate-fadeInUp delay-3">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">₹{winnings.total.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Winnings</div>
          <div className="stat-change">{winnings.count} Prize{winnings.count !== 1 ? 's' : ''} Won</div>
        </div>

        <div className="stat-card animate-fadeInUp delay-4">
          <div className="stat-icon">💳</div>
          <div className="stat-value">
            {subscription ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}` : 'Free Tier'}
          </div>
          <div className="stat-label">Membership Plan</div>
          {subscription && (
            <div className={`stat-change`} style={{ color: subscription.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>
              {subscription.status === 'active' ? '✅ Active Member' : '❌ Access Paused'}
            </div>
          )}
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Golf Performance Section */}
        <div className="card animate-fadeInUp delay-2">
          <div className={styles.cardHeader}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⛳</span> My Performance History
            </h3>
            <Link href="/scores" className="btn btn-sm btn-secondary">Analyze All →</Link>
          </div>

          {scores.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <p>No performance data recorded yet.</p>
              <Link href="/scores" className="btn btn-primary" style={{ marginTop: '24px' }}>
                Record Initial Score
              </Link>
            </div>
          ) : (
            <div className={styles.scoresList}>
              {scores.map((s, i) => (
                <div key={s.id} className={styles.scoreItem}>
                  <div className={styles.scoreRank}>#{i + 1}</div>
                  <div>
                    <div className={styles.scoreValue}>{s.score} pts</div>
                    <div className={styles.scoreDate}>
                      {new Date(s.date_played).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreBarFill}
                      style={{ width: `${(s.score / 45) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.scoreAvg} style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                Average Entry Number: <strong className="text-lime">{avgScore}</strong>
                <span className="text-muted text-sm" style={{ marginLeft: 12 }}>
                  (This is your primary draw number)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Draw Insights */}
        <div className={styles.rightColumn}>
          <div className="card animate-fadeInUp delay-3">
            <div className={styles.cardHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎰</span> Active Draw Insight
              </h3>
              <Link href="/draws" className="btn btn-sm btn-secondary">Explore History →</Link>
            </div>

            {currentDraw ? (
              <div className={styles.drawInfo}>
                <div className={styles.drawMonth}>
                  {MONTHS[(currentDraw.month || 1) - 1]} {currentDraw.year} Period
                </div>
                <div className={styles.drawStatus}>
                  <span className={`badge ${currentDraw.status === 'completed' ? 'badge-lime' : currentDraw.status === 'running' ? 'badge-gold' : 'badge-gray'}`}>
                    {currentDraw.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.prizeDisplay}>
                  <div className={styles.prizeAmount}>
                    ₹{(currentDraw.jackpot_amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className={styles.prizeLabel}>TARGET JACKPOT</div>
                </div>

                {currentDraw.winning_numbers && currentDraw.winning_numbers.length > 0 && (
                  <div className={styles.winNums} style={{ marginTop: '24px' }}>
                    <div className={styles.winNumsLabel} style={{ marginBottom: '12px' }}>Official Winning Combination</div>
                    <div className={styles.numbersRow}>
                      {currentDraw.winning_numbers.map((n, i) => (
                        <span key={i} className={styles.ball}>{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!isSubscribed && (
                  <div className="alert alert-warning" style={{ marginTop: '24px' }}>
                    ⚠️ Subscribe now to participate in this draw.
                  </div>
                )}
                {isSubscribed && scores.length === 0 && (
                  <div className="alert alert-info" style={{ marginTop: '24px' }}>
                    💡 Tip: Record golf scores to establish your entry number!
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎯</div>
                <p>No active draw found for this period.</p>
              </div>
            )}
          </div>

          {/* Navigation Shortcuts */}
          <div className="card animate-fadeInUp delay-4" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>⚡ Navigation Shortcuts</h3>
            <div className={styles.quickLinks}>
              <Link href="/scores" className={styles.quickLink}>
                <span>⛳</span>
                <span>My Scores</span>
              </Link>
              <Link href="/charity" className={styles.quickLink}>
                <span>❤️</span>
                <span>Partner Charity</span>
              </Link>
              <Link href="/winnings" className={styles.quickLink}>
                <span>🏆</span>
                <span>Winnings Audit</span>
              </Link>
              <Link href="/subscription" className={styles.quickLink}>
                <span>💳</span>
                <span>Plan Management</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
