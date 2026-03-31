'use client';
import { useEffect, useState } from 'react';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  total_contributed: number;
  is_active: boolean;
}

export default function CharityPage() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(user?.charity_id || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiRequest<{ charities: Charity[] }>('/charities')
      .then(d => setCharities(d.charities || []))
      .catch(() => setError('Failed to load partners'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.charity_id) setSelected(user.charity_id);
  }, [user?.charity_id]);

  const handleSave = async () => {
    if (!selected) { setError('Please select an organization'); return; }
    setSaving(true);
    setError('');
    try {
      await apiRequest('/users/me/charity', {
        method: 'PUT',
        body: JSON.stringify({ charity_id: selected }),
      });
      setSuccess('Partner charity updated! Your subscription contribution will now be routed here.');
      await refreshUser();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error syncing preference');
    } finally {
      setSaving(false);
    }
  };

  const currentCharity = charities.find(c => c.id === user?.charity_id);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p>Loading charities...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>❤️</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Partner Charity</h1>
        </div>
        <p className="page-subtitle">
          Choose the organization that receives 10% of your monthly subscription contribution.
        </p>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✅ {success}</div>}

      {/* Active Selection Detail */}
      {currentCharity && (
        <div className="card animate-fadeInUp" style={{ marginBottom: '40px', borderLeft: '4px solid var(--lime)', padding: '32px' }}>
          <div className={styles.currentHeader} style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
            <div className={styles.charityLogo} style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>{currentCharity.logo_url}</div>
            <div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SELECTED PARTNER</div>
              <h2 style={{ color: 'var(--white)', fontSize: '1.75rem', marginTop: '4px' }}>{currentCharity.name}</h2>
              <p style={{ marginTop: '8px', fontSize: '0.9375rem', color: 'var(--gray-300)' }}>{currentCharity.description}</p>
            </div>
          </div>
          <div className={styles.currentStats} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className={styles.currentStat} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lime)' }}>
                ₹{currentCharity.total_contributed.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginTop: '4px' }}>Lifetime Community Contribution</div>
            </div>
            <div className={styles.currentStat} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>10%</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginTop: '4px' }}>Allocated From Your Subscription</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Selection */}
      <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Select Organization</h2>
      <div className={styles.charityGrid}>
        {charities.map(charity => (
          <div
            key={charity.id}
            className={`${styles.charityCard} ${selected === charity.id ? styles.selectedCard : ''} animate-fadeInUp`}
            onClick={() => setSelected(charity.id)}
            style={{ padding: '24px', borderRadius: '20px', transition: 'all 0.3s ease' }}
          >
            <div className={styles.cardCheck} style={{ position: 'absolute', right: '16px', top: '16px', fontSize: '1.2rem', color: selected === charity.id ? 'var(--lime)' : 'rgba(255,255,255,0.1)' }}>
              {selected === charity.id ? '●' : '○'}
            </div>
            <div className={styles.charityEmoji} style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{charity.logo_url}</div>
            <h4 className={styles.charityName} style={{ marginBottom: '8px' }}>{charity.name}</h4>
            <p className={styles.charityDesc} style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', minHeight: '3.6rem' }}>{charity.description}</p>
            <div className={styles.charityStats} style={{ marginTop: '16px' }}>
              <span className="badge badge-gray" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                ₹{charity.total_contributed.toLocaleString()} Contribution Impact
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.saveRow} style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--white)' }}>Update your preference?</p>
          <p className="text-muted text-sm">Your next contribution will be routed to your new selection.</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving || selected === user?.charity_id}
          style={{ padding: '16px 32px' }}
        >
          {saving ? 'UPDATING...' : 'CONFIRM CHOICE ❤️'}
        </button>
      </div>
    </div>
  );
}
