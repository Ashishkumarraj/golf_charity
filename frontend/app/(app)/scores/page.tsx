'use client';
import { useEffect, useState } from 'react';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface GolfScore {
  id: string;
  score: number;
  date_played: string;
  created_at: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form input state
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchScores = async () => {
    try {
      const data = await apiRequest<{ scores: GolfScore[] }>('/users/me/scores');
      setScores(data.scores || []);
    } catch {
      setError('Connection loss: Failed to retrieve history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const scoreNum = parseInt(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Validation failed: Score must be between 1 and 45 points');
      return;
    }
    setAdding(true);
    try {
      await apiRequest('/users/me/scores', {
        method: 'POST',
        body: JSON.stringify({ score: scoreNum, date_played: newDate }),
      });
      setSuccess('Performance record updated successfully!');
      setNewScore('');
      setNewDate(new Date().toISOString().split('T')[0]);
      await fetchScores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed: Technical error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent action: Remove this performance record from history?')) return;
    try {
      await apiRequest(`/users/me/scores/${id}`, { method: 'DELETE' });
      setScores(scores.filter(s => s.id !== id));
      setSuccess('Record purged from audit history');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Operation failed: System error');
    }
  };

  const avgScore = scores.length
    ? (scores.reduce((s, g) => s + g.score, 0) / scores.length).toFixed(1)
    : '—';

  const maxScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
  const minScore = scores.length ? Math.min(...scores.map(s => s.score)) : 0;

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading performance ledger...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⛳</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Golf Performance Ledger</h1>
        </div>
        <p className="page-subtitle">
          Track up to 5 verified scores. Your performance average determines your monthly draw entry number.
        </p>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✅ {success}</div>}

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          {/* Record Entry */}
          <div className="card animate-fadeInUp" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.15rem' }}>🎯 Submit New Record</h3>
            <form onSubmit={handleAdd} className={styles.form}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Stroke Performance (1–45 pts)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 24"
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  min={1}
                  max={45}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Performance Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={adding}
                style={{ padding: '16px' }}
              >
                {adding ? 'PROCESSING...' : 'UPLOAD PERFORMANCE RECORD'}
              </button>
            </form>

            {scores.length >= 5 && (
              <div className="alert alert-warning" style={{ marginTop: '24px', background: 'rgba(255,160,0,0.05)', borderColor: 'rgba(255,160,0,0.2)' }}>
                ⚠️ Maximum threshold reached (5/5). New entries will rotate out the oldest record.
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="card animate-fadeInUp delay-2" style={{ marginTop: '32px', padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.15rem' }}>📊 Analytical Overview</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statVal} style={{ fontSize: '1.75rem' }}>{scores.length}/5</div>
                <div className={styles.statLbl}>Slots Filled</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statVal} style={{ color: 'var(--lime)', fontSize: '1.75rem' }}>{avgScore}</div>
                <div className={styles.statLbl}>Calculated Avg</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statVal} style={{ color: 'var(--gold)', fontSize: '1.75rem' }}>{maxScore || '—'}</div>
                <div className={styles.statLbl}>Best Record</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statVal} style={{ color: 'var(--info)', fontSize: '1.75rem' }}>{minScore || '—'}</div>
                <div className={styles.statLbl}>Min Record</div>
              </div>
            </div>

            <div className={styles.drawInfo} style={{ marginTop: '32px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className={styles.drawInfoIcon} style={{ fontSize: '2rem' }}>🎯</span>
              <div>
                <div className={styles.drawInfoTitle} style={{ fontWeight: 700, color: 'var(--white)' }}>Current Entry Number</div>
                <div className={styles.drawInfoVal} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lime)', marginTop: '4px' }}>
                  {scores.length > 0 ? Math.round(parseFloat(avgScore)) : '—'}
                </div>
                <div className={styles.drawInfoSub} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  This verified number is submitted to the monthly draw.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className="card animate-fadeInUp delay-1" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.15rem' }}>📋 Performance Log</h3>

            {scores.length === 0 ? (
              <div className={styles.empty} style={{ padding: '80px 40px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.1 }}>⛳</div>
                <h4 style={{ marginBottom: '12px', color: 'var(--white)' }}>Ledger is Empty</h4>
                <p style={{ color: 'var(--gray-400)' }}>Record your first performance to gain draw eligibility.</p>
              </div>
            ) : (
              <div className={styles.scoreCards}>
                {scores.map((s, i) => (
                  <div key={s.id} className={styles.scoreCard} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease', marginBottom: '16px' }}>
                    <div className={styles.scoreNum} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <div className={styles.scoreRank} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)' }}>ENTRY #{i + 1}</div>
                      <div className={styles.scoreVal} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>{s.score}</div>
                      <div className={styles.scorePts} style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>PTS</div>
                    </div>
                    <div className={styles.scoreDetails} style={{ marginTop: '12px' }}>
                      <div className={styles.scoreDate} style={{ fontSize: '0.85rem', color: 'var(--gray-300)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📅 {new Date(s.date_played).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                      <div className={styles.scoreBar} style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          className={styles.scoreBarFill}
                          style={{ width: `${(s.score / 45) * 100}%`, height: '100%', background: 'var(--grad-lime)' }}
                        />
                      </div>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(s.id)}
                      title="Purge record"
                      style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'color 0.2s', fontSize: '1rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Logic box */}
          <div className="card animate-fadeInUp delay-3" style={{ background: 'rgba(170,255,0,0.03)', borderColor: 'rgba(170,255,0,0.15)', padding: '32px' }}>
            <h4 style={{ color: 'var(--lime)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span> Draw Verification Protocol
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)', lineHeight: '1.6' }}>• Maintain up to <strong>5 verified scores</strong> in your active ledger.</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)', lineHeight: '1.6' }}>• The <strong>rounded average</strong> across all active entries serves as your monthly draw number.</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)', lineHeight: '1.6' }}>• Payouts are computed based on matching your number against the <strong>5 monthly drawn balls</strong> (1–45).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
