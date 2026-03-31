'use client';
import { useEffect, useState } from 'react';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface Draw {
  id: string;
  month: number;
  year: number;
  status: string;
  prize_pool: number;
  charity_contribution: number;
  jackpot_amount: number;
  jackpot_rolled_over: boolean;
  winning_numbers?: number[];
  created_at: string;
  published_at?: string;
}

interface Winner {
  id: string;
  user_id: string;
  tier: string;
  numbers_matched: number;
  prize_amount: number;
  payout_status: string;
}

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TIER_INFO: Record<string, { icon: string; color: string; desc: string }> = {
  '3-match': { icon: '🥉', color: 'var(--info)', desc: 'Tier 1 — 3 Matched' },
  '4-match': { icon: '🥈', color: 'var(--lime)', desc: 'Tier 2 — 4 Matched' },
  jackpot: { icon: '🏆', color: 'var(--gold)', desc: 'GRAND JACKPOT — 5 Matched!' },
};

export default function DrawsPage() {
  const { user } = useAuth();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Record<string, Winner[]>>({});
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ draws: Draw[] }>('/draws')
      .then(async data => {
        const drawList = data.draws || [];
        setDraws(drawList);
        if (drawList.length > 0) {
          setSelectedDraw(drawList[0]);
          const winnerMap: Record<string, Winner[]> = {};
          await Promise.allSettled(
            drawList.filter(d => d.status === 'completed').map(async d => {
              const w = await apiRequest<{ winners: Winner[] }>(`/draws/${d.id}/winners`).catch(() => ({ winners: [] }));
              winnerMap[d.id] = w.winners || [];
            })
          );
          setWinners(winnerMap);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myWinInDraw = (drawId: string) => {
    return (winners[drawId] || []).find(w => w.user_id === user?.id);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading prize draws...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎰</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Monthly Prize Draws</h1>
        </div>
        <p className="page-subtitle">View current and historical draws. Results are published at the start of each month.</p>
      </div>

      {draws.length === 0 ? (
        <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '80px', opacity: 0.8 }}>
          <div style={{ fontSize: '5rem', opacity: 0.1, marginBottom: '24px' }}>🎰</div>
          <h3 style={{ color: 'var(--white)', fontSize: '1.5rem' }}>Prizes Loading...</h3>
          <p style={{ marginTop: '12px', color: 'var(--gray-400)' }}>The platform initial draw event will be announced soon.</p>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Timeline sidebar */}
          <div className={styles.drawList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {draws.map(draw => {
              const myWin = myWinInDraw(draw.id);
              const isActive = selectedDraw?.id === draw.id;
              return (
                <div
                  key={draw.id}
                  className={`${styles.drawListItem} ${isActive ? styles.activeItem : ''} animate-fadeInUp`}
                  onClick={() => setSelectedDraw(draw)}
                  style={{ padding: '16px 20px', borderRadius: '16px', background: isActive ? 'rgba(170,255,0,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(170,255,0,0.2)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s ease', cursor: 'pointer' }}
                >
                  <div className={styles.drawListMonth} style={{ color: 'var(--white)', fontWeight: 700 }}>
                    {MONTHS_SHORT[(draw.month || 1) - 1]} {draw.year}
                  </div>
                  <div className={styles.drawListRight} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                    <span className={`badge ${draw.status === 'completed' ? 'badge-lime' : draw.status === 'running' ? 'badge-gold' : 'badge-gray'}`} style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
                      {draw.status.toUpperCase()}
                    </span>
                    {myWin && <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '4px 8px' }}>🏆 WON</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Draw breakdown */}
          {selectedDraw && (
            <div className={styles.drawDetail}>
              <div className="card animate-fadeInUp" style={{ padding: '40px' }}>
                <div className={styles.detailHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', color: 'var(--white)' }}>{MONTHS[(selectedDraw.month || 1) - 1]} {selectedDraw.year} Prize Period</h2>
                    <span className={`badge ${selectedDraw.status === 'completed' ? 'badge-lime' : selectedDraw.status === 'running' ? 'badge-gold' : 'badge-gray'}`} style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                      STATUS: {selectedDraw.status.toUpperCase()}
                    </span>
                  </div>
                  {selectedDraw.jackpot_rolled_over && (
                    <div className="badge badge-gold" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>🔄 JACKPOT ROLLED OVER</div>
                  )}
                </div>

                <div className={styles.prizeGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <div className={styles.prizeItem} style={{ textAlignment: 'center', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
                    <div className={styles.prizeVal} style={{ color: 'var(--gold)', fontSize: '1.75rem', fontWeight: 700 }}>
                      ₹{(selectedDraw.jackpot_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.prizeLbl} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>GRAND JACKPOT</div>
                  </div>
                  <div className={styles.prizeItem} style={{ textAlignment: 'center', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
                    <div className={styles.prizeVal} style={{ color: 'var(--white)', fontSize: '1.75rem', fontWeight: 700 }}>
                      ₹{(selectedDraw.prize_pool || 0).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.prizeLbl} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>TOTAL PRIZE POOL</div>
                  </div>
                  <div className={styles.prizeItem} style={{ textAlignment: 'center', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
                    <div className={styles.prizeVal} style={{ color: 'var(--success)', fontSize: '1.75rem', fontWeight: 700 }}>
                      ₹{(selectedDraw.charity_contribution || 0).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.prizeLbl} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>CHARITY IMPACT</div>
                  </div>
                </div>

                {selectedDraw.winning_numbers && selectedDraw.winning_numbers.length > 0 && (
                  <div className={styles.winNumbers} style={{ marginTop: '48px', padding: '32px', background: 'rgba(170,255,0,0.04)', borderRadius: '20px', border: '1px solid rgba(170,255,0,0.1)' }}>
                    <h4 style={{ marginBottom: '24px', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎯</span> OFFICIAL WINNING COMBINATION
                    </h4>
                    <div className={styles.ballsRow} style={{ display: 'flex', gap: '16px' }}>
                      {selectedDraw.winning_numbers.map((n, i) => (
                        <div key={i} className={styles.ball} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--grad-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-900)', fontWeight: 700, fontSize: '1.25rem' }}>
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDraw.status === 'completed' && (
                <div className="card animate-fadeInUp delay-2" style={{ marginTop: '32px', padding: '40px' }}>
                  <h3 style={{ marginBottom: '32px', fontSize: '1.25rem' }}>🏆 Prize Disbursal Protocol</h3>
                  {(winners[selectedDraw.id] || []).length === 0 ? (
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>No prizes were awarded for this period.</p>
                  ) : (
                    <div className={styles.winnersList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(winners[selectedDraw.id] || []).map(w => {
                        const tier = TIER_INFO[w.tier] || TIER_INFO['3-match'];
                        const isMe = w.user_id === user?.id;
                        return (
                          <div key={w.id} className={`${styles.winnerItem} ${isMe ? styles.myWin : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', borderRadius: '16px', background: isMe ? 'rgba(170,255,0,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isMe ? 'rgba(170,255,0,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
                            <div className={styles.winnerIcon} style={{ fontSize: '1.5rem' }}>{tier.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div className={styles.winnerTier} style={{ color: tier.color, fontWeight: 700, fontSize: '0.9375rem' }}>
                                {tier.desc} {isMe && <span className="badge badge-lime" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>👈 YOU!</span>}
                              </div>
                              <div className={styles.winnerStatus} style={{ marginTop: '4px' }}>
                                <span className={`badge ${w.payout_status === 'paid' ? 'badge-lime' : 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>
                                  PAYOUT: {w.payout_status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className={styles.winnerAmount} style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--white)' }}>
                              ₹{w.prize_amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedDraw.status !== 'completed' && (
                <div className="card animate-fadeInUp delay-2" style={{ marginTop: '32px', padding: '40px', borderColor: 'rgba(170,255,0,0.15)', background: 'rgba(170,255,0,0.03)' }}>
                  <h3 style={{ color: 'var(--lime)', marginBottom: '20px', fontSize: '1.25rem' }}>⏳ DRAW COMMENCEMENT IN PROGRESS</h3>
                  <p style={{ color: 'var(--gray-300)', fontSize: '0.9375rem' }}>Performance metrics are being audited. Results for this period will be published upon draw finalization at the end of the month.</p>
                  <div style={{ marginTop: '24px', display: 'flex', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                    {Object.entries(TIER_INFO).map(([key, t]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                        <span style={{ color: t.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.desc.split('—')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
