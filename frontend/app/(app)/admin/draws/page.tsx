'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../lib/auth';
import styles from './page.module.css';

interface Draw {
  id: string;
  month: number;
  year: number;
  status: string;
  prize_pool: number;
  charity_contribution: number;
  jackpot_amount: number;
  winning_numbers?: number[];
  created_at: string;
}

interface Winner {
  id: string;
  user_id: string;
  tier: string;
  prize_amount: number;
  payout_status: string;
}

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [drawWinners, setDrawWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrize, setNewPrize] = useState('');

  const fetchDraws = async () => {
    try {
      const data = await apiRequest<{ draws: Draw[] }>('/draws/admin/all');
      setDraws(data.draws || []);
      if (data.draws && data.draws.length > 0 && !selectedDraw) {
        setSelectedDraw(data.draws[0]);
      }
    } catch {
      setError('Failed to load draws');
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async (drawId: string) => {
    try {
      const data = await apiRequest<{ winners: Winner[] }>(`/draws/${drawId}/winners`);
      setDrawWinners(data.winners || []);
    } catch {
      setDrawWinners([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDraws(); }, []);

  useEffect(() => {
    if (selectedDraw) fetchWinners(selectedDraw.id);
  }, [selectedDraw]);

  const createDraw = async () => {
    const now = new Date();
    setRunning(true);
    setError('');
    try {
      await apiRequest('/draws/admin/create', {
        method: 'POST',
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          prize_pool: parseFloat(newPrize) || 2999.70,
        }),
      });
      setSuccess('Target monthly draw created successfully!');
      setShowCreateForm(false);
      setNewPrize('');
      await fetchDraws();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Database error');
    } finally {
      setRunning(false);
    }
  };

  const simulateDraw = async (drawId: string) => {
    setSimulating(true);
    setError('');
    try {
      const data = await apiRequest<{ draw: Draw; message: string }>(`/draws/admin/${drawId}/simulate`, { method: 'POST' });
      setSuccess(data.message || 'Simulation complete!');
      await fetchDraws();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const runDraw = async (drawId: string) => {
    if (!confirm('Proceed with running the official draw? This action is irreversible.')) return;
    setRunning(true);
    setError('');
    try {
      const data = await apiRequest<{ draw: Draw; message: string }>(`/draws/admin/${drawId}/run`, { method: 'POST' });
      setSuccess(data.message || 'Official Draw Complete!');
      await fetchDraws();
      await fetchWinners(drawId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const publishDraw = async (drawId: string) => {
    setPublishing(true);
    setError('');
    try {
      await apiRequest(`/draws/admin/${drawId}/publish`, { method: 'POST' });
      setSuccess('Results are now visible to all users!');
      await fetchDraws();
    } catch {
      setError('Communication error');
    } finally {
      setPublishing(false);
    }
  };

  const updatePayoutStatus = async (winnerId: string, status: string) => {
    try {
      await apiRequest(`/draws/admin/winners/${winnerId}/payout`, {
        method: 'PUT',
        body: JSON.stringify({ payout_status: status }),
      });
      setSuccess(`Payout status: ${status}`);
      if (selectedDraw) await fetchWinners(selectedDraw.id);
    } catch {
      setError('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Analyzing draws...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">🎰 Draw Management</h1>
          <p className="page-subtitle">Configure prize pools, simulate runs, and manage official monthly draws.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          ➕ New Draw Event
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✅ {success}</div>}

      {/* Creation UI */}
      {showCreateForm && (
        <div className="card animate-scaleIn" style={{ marginBottom: '32px', borderColor: 'rgba(170,255,0,0.2)' }}>
          <h3 style={{ marginBottom: '20px' }}>Schedule New Draw</h3>
          <div className={styles.createForm}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Starting Prize Pool (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5000.00"
                value={newPrize}
                onChange={e => setNewPrize(e.target.value)}
              />
            </div>
            <div className={styles.createActions}>
              <button className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>Cancel Action</button>
              <button className="btn btn-primary" onClick={createDraw} disabled={running}>
                {running ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Initialize Draw'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        {/* Navigation Panel */}
        <div className={styles.drawList}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '12px', paddingLeft: '8px' }}>HISTORY & QUEUE</h3>
          {draws.map(draw => (
            <div
              key={draw.id}
              className={`${styles.drawItem} ${selectedDraw?.id === draw.id ? styles.activeItem : ''} animate-fadeInUp`}
              onClick={() => setSelectedDraw(draw)}
            >
              <div className={styles.drawItemMonth}>
                {MONTHS_SHORT[(draw.month || 1) - 1]} {draw.year}
              </div>
              <span className={`badge ${
                draw.status === 'completed' ? 'badge-lime' :
                draw.status === 'running' ? 'badge-gold' :
                'badge-gray'
              }`}>
                {draw.status}
              </span>
            </div>
          ))}
          {draws.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>No events.</p>}
        </div>

        {/* Execution Workspace */}
        {selectedDraw ? (
          <div className={styles.detail}>
            <div className="card animate-fadeInUp" style={{ padding: '32px' }}>
              <div className={styles.detailHeader} style={{ marginBottom: '32px' }}>
                <div>
                   <span className="text-lime font-bold" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>DRAW PERIOD</span>
                   <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>{MONTHS[(selectedDraw.month || 1) - 1]} {selectedDraw.year}</h2>
                </div>
                <span className={`badge ${
                  selectedDraw.status === 'completed' ? 'badge-lime' :
                  selectedDraw.status === 'running' ? 'badge-gold' : 'badge-gray'
                }`} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                  {selectedDraw.status.toUpperCase()}
                </span>
              </div>

              {/* Performance Metrics */}
              <div className={styles.prizeRow}>
                <div className={styles.prizeItem}>
                  <div className={styles.prizeVal}>₹{(selectedDraw.prize_pool || 0).toLocaleString('en-IN')}</div>
                  <div className={styles.prizeLbl}>Total Pooled</div>
                </div>
                <div className={styles.prizeItem}>
                  <div className={styles.prizeVal} style={{ color: 'var(--gold)' }}>₹{(selectedDraw.jackpot_amount || 0).toLocaleString('en-IN')}</div>
                  <div className={styles.prizeLbl}>Jackpot (5 Matches)</div>
                </div>
                <div className={styles.prizeItem}>
                  <div className={styles.prizeVal} style={{ color: 'var(--success)' }}>₹{(selectedDraw.charity_contribution || 0).toLocaleString('en-IN')}</div>
                  <div className={styles.prizeLbl}>10% Charity Fund</div>
                </div>
              </div>

              {/* Result Visualization */}
              {selectedDraw.winning_numbers && selectedDraw.winning_numbers.length > 0 && (
                <div className={styles.numbers} style={{ marginTop: '40px', padding: '24px', background: 'rgba(170,255,0,0.05)', borderRadius: '16px', border: '1px solid rgba(170,255,0,0.1)' }}>
                  <div className={styles.numbersLabel} style={{ marginBottom: '16px', fontWeight: '700', fontSize: '1rem' }}>OFFICIAL WINNING COMBINATION</div>
                  <div className={styles.balls} style={{ gap: '16px' }}>
                    {selectedDraw.winning_numbers.map((n, i) => (
                      <div key={i} className={styles.ball} style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>{n}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Action Buttons */}
              <div className={styles.actions} style={{ marginTop: '40px', gap: '16px' }}>
                {selectedDraw.status === 'scheduled' && (
                  <>
                    <button className="btn btn-ghost" onClick={() => simulateDraw(selectedDraw.id)} disabled={simulating} style={{ flex: 1 }}>
                      {simulating ? '🎲 SIMULATING...' : '🎲 TEST SIMULATION'}
                    </button>
                    <button className="btn btn-primary" onClick={() => runDraw(selectedDraw.id)} disabled={running} style={{ flex: 1.5 }}>
                      {running ? '🚀 RUNNING OFFICIAL...' : '🚀 EXECUTE OFFICIAL DRAW'}
                    </button>
                  </>
                )}
                {selectedDraw.status === 'running' && (
                  <button className="btn btn-gold w-full" onClick={() => publishDraw(selectedDraw.id)} disabled={publishing} style={{ padding: '16px' }}>
                    {publishing ? '📢 PUBLISHING...' : '📢 PUBLISH RESULTS TO USERS'}
                  </button>
                )}
              </div>
            </div>

            {/* Winner Roster */}
            <div className="card animate-fadeInUp delay-2" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>🏆 Winner Roster</h3>
                <span className="badge badge-gray">{drawWinners.length} Winners</span>
              </div>
              {drawWinners.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>No records found for this period.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Winning Tier</th>
                        <th>Winner ID</th>
                        <th>Prize Amount</th>
                        <th>Fund Status</th>
                        <th>Grant Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawWinners.map(w => (
                        <tr key={w.id}>
                          <td>
                            <span className={`badge ${w.tier === 'jackpot' ? 'badge-gold' : w.tier === '4-match' ? 'badge-lime' : 'badge-info'}`}>
                              {w.tier === 'jackpot' ? '🏆 JACKPOT' : w.tier === '4-match' ? '🥈 4-MATCH' : '🥉 3-MATCH'}
                            </span>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>#{w.user_id.slice(-6)}</span></td>
                          <td><strong style={{ color: 'var(--gold)' }}>₹{w.prize_amount.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <span className={`badge ${w.payout_status === 'paid' ? 'badge-lime' : w.payout_status === 'verified' ? 'badge-info' : 'badge-gold'}`}>
                              {w.payout_status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-input"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', minWidth: '140px' }}
                              value={w.payout_status}
                              onChange={e => updatePayoutStatus(w.id, e.target.value)}
                            >
                              <option value="pending">⏳ Pending Review</option>
                              <option value="verified">🔍 Verified</option>
                              <option value="paid">✅ Payout Released</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '80px', flex: 1 }}>
            <div style={{ fontSize: '5rem', opacity: 0.1, marginBottom: '24px' }}>🎰</div>
            <p className="text-muted" style={{ fontSize: '1.25rem' }}>Select a draw event from the panel to manage details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
