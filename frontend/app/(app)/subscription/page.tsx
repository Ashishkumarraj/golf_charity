'use client';
import { useState } from 'react';
import { useAuth, apiRequest } from '../../../lib/auth';
import styles from './page.module.css';

const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Plus Membership',
    price: 2999,
    period: '/month',
    saves: null,
    features: [
      'Monthly prize draw entry',
      'Up to 5 golf score slots',
      '10% contribution to chosen charity',
      'Direct payout to verified bank',
      'Flexible monthly billing',
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Elite Annual',
    price: 29999,
    period: '/year',
    saves: 'Save ₹5,989 per year',
    features: [
      'All Plus Membership features',
      '12 guaranteed draw entries',
      'Priority charity organization access',
      'Exclusive jackpot rollover entry',
      'Expanded charity impact factor',
    ]
  }
};

export default function SubscriptionPage() {
  const { subscription, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const isActive = subscription?.status === 'active';
  const plan = PLANS[selectedPlan];

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      await apiRequest('/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan }),
      });
      setSuccess('🎉 Welcome to Premium! Your subscription is now active.');
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to pause your subscription? access continues until the end of this billing cycle.')) return;
    setCancelling(true);
    setError('');
    try {
      await apiRequest('/subscriptions/cancel', { method: 'POST' });
      setSuccess('Your subscription will be deactivated at the end of this cycle.');
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error processing request');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>💳</span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Membership Plan</h1>
        </div>
        <p className="page-subtitle">Choose a plan to join the monthly draws and support your favorite charities.</p>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✅ {success}</div>}

      {/* Subscription Audit */}
      {subscription && (
        <div className="card animate-fadeInUp" style={{ marginBottom: '40px', borderLeft: `4px solid ${isActive ? 'var(--lime)' : 'var(--danger)'}` }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.15rem' }}>📋 Subscription Details</h3>
          <div className={styles.currentSub}>
            <div className={styles.subInfoGrid}>
              <div className={styles.subInfoItem}>
                <div className={styles.subInfoLabel}>CURRENT PLAN</div>
                <div className={styles.subInfoValue}>
                  {subscription.plan === 'monthly' ? 'Plus Monthly' : 'Elite Yearly'}
                </div>
              </div>
              <div className={styles.subInfoItem}>
                <div className={styles.subInfoLabel}>BILLING RATE</div>
                <div className={styles.subInfoValue}>₹{subscription.amount.toLocaleString('en-IN')}/{subscription.plan === 'monthly' ? 'mo' : 'yr'}</div>
              </div>
              <div className={styles.subInfoItem}>
                <div className={styles.subInfoLabel}>STATUS</div>
                <div>
                  <span className={`badge ${isActive ? 'badge-lime' : 'badge-danger'}`} style={{ padding: '6px 12px' }}>
                    {isActive ? 'ACTIVE' : subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.subInfoItem}>
                <div className={styles.subInfoLabel}>RENEWAL DATE</div>
                <div className={styles.subInfoValue}>
                  {new Date(subscription.end_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {isActive && (
              <div className={styles.cancelSection}>
                <div>
                  <div className={styles.cancelTitle}>Manage Membership</div>
                  <div className={styles.cancelDesc}>Thinking of pausing? Your draw entries remain valid for the current cycle.</div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={handleCancel}
                  disabled={cancelling}
                  style={{ color: 'var(--danger)', borderColor: 'rgba(255,75,75,0.2)' }}
                >
                  {cancelling ? 'Processing...' : 'Deactivate Plan'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tier Selection */}
      {!isActive && (
        <div className={styles.subscriptionContainer}>
          <div className={styles.toggleContainer}>
            <span className={`${styles.toggleLabel} ${selectedPlan === 'monthly' ? styles.activeLabel : ''}`}>BILL MONTHLY</span>
            <div 
              className={styles.toggleTrack} 
              onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'yearly' : 'monthly')}
            >
              <div className={`${styles.toggleThumb} ${selectedPlan === 'yearly' ? styles.toggled : ''}`} />
            </div>
            <span className={`${styles.toggleLabel} ${selectedPlan === 'yearly' ? styles.activeLabel : ''}`}>
              BILL ANNUALLY <span className={styles.discountBadge}>SAVE 17%</span>
            </span>
          </div>

          <div className={`${styles.slidingPlanCard} animate-fadeInUp`} style={{ padding: '40px' }}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPriceWrapper}>
                <div className={`${styles.planPrice}`}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.amount}>{plan.price.toLocaleString('en-IN')}</span>
                  <span className={styles.period}>{plan.period}</span>
                </div>
                {plan.saves && <div className={styles.planSavings} style={{ color: 'var(--lime)' }}>{plan.saves}</div>}
              </div>
            </div>
            
            <div className={styles.featuresContainer} style={{ marginTop: '32px' }}>
              <p className={styles.featuresTitle} style={{ fontWeight: 700, marginBottom: '16px' }}>CORE BENEFITS:</p>
              <ul className={styles.planFeaturesList}>
                {plan.features.map((f, i) => (
                  <li key={i + selectedPlan} className={styles.featureItem} style={{ marginBottom: '12px' }}>
                    <div className={styles.checkCircle} style={{ background: 'var(--lime)', color: 'var(--green-900)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actionContainer} style={{ marginTop: '40px' }}>
              <p className={styles.demoNote} style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>🛡️ Secure payment processing and automatic charity payout system.</p>
              <button
                className={`btn btn-primary btn-lg ${styles.subscribeBtn}`}
                onClick={handleSubscribe}
                disabled={loading}
                style={{ width: '100%', padding: '18px' }}
              >
                {loading ? 'INITIALIZING...' : `⚡ ACTIVATE ${plan.name.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transparency / Impact Section */}
      <div className="card animate-fadeInUp" style={{ marginTop: '40px', background: 'rgba(170,255,0,0.03)', borderColor: 'rgba(170,255,0,0.1)' }}>
        <h3 style={{ color: 'var(--lime)', marginBottom: '24px', fontSize: '1.25rem' }}>📊 Fund Allocation Transparency</h3>
        <div className={styles.moneyGrid}>
          <div className={styles.moneyItem}>
            <div className={styles.moneyPercent} style={{ color: 'var(--lime)', fontSize: '2.5rem' }}>10%</div>
            <div className={styles.moneyLabel}>Direct Charity Donation</div>
          </div>
          <div className={styles.moneyItem}>
            <div className={styles.moneyPercent} style={{ color: 'var(--gold)', fontSize: '2.5rem' }}>60%</div>
            <div className={styles.moneyLabel}>Grand Jackpot Fund</div>
          </div>
          <div className={styles.moneyItem}>
            <div className={styles.moneyPercent} style={{ color: 'var(--info)', fontSize: '2.5rem' }}>25%</div>
            <div className={styles.moneyLabel}>Tier 2–3 Community Prizes</div>
          </div>
          <div className={styles.moneyItem}>
            <div className={styles.moneyPercent} style={{ color: 'var(--gray-500)', fontSize: '2.5rem' }}>5%</div>
            <div className={styles.moneyLabel}>Network Maintenance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
