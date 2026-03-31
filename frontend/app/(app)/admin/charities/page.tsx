'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../lib/auth';
import styles from './page.module.css';

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  is_active: boolean;
  total_contributed: number;
}

const EMOJI_OPTIONS = ['⛳','🌿','🌍','💚','🏆','🕊️','💛','🦅','👩','⭐','❤️','🎯','🌐','🤝','🌱'];

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logo, setLogo] = useState('⛳');

  const fetchCharities = async () => {
    try {
      const data = await apiRequest<{ charities: Charity[] }>('/charities?all=true');
      setCharities(data.charities || []);
    } catch {
      setError('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharities(); }, []);

  const resetForm = () => {
    setName(''); setDesc(''); setLogo('⛳'); setEditId(null);
  };

  const handleEdit = (c: Charity) => {
    setEditId(c.id);
    setName(c.name);
    setDesc(c.description);
    setLogo(c.logo_url);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !desc.trim()) { setError('Name and description are required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await apiRequest(`/charities/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim(), description: desc.trim(), logo_url: logo }),
        });
        setSuccess('Charity updated successfully!');
      } else {
        await apiRequest('/charities', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: desc.trim(), logo_url: logo }),
        });
        setSuccess('New charity organization added!');
      }
      resetForm();
      setShowForm(false);
      await fetchCharities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await apiRequest(`/charities/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !currentActive }),
      });
      setCharities(charities.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
      setSuccess(`Charity status updated`);
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to update status');
    }
  };

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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">❤️ Charity Management</h1>
          <p className="page-subtitle">Manage partner charity organizations and donation metrics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ marginBottom: '8px' }}>
          {showForm && !editId ? '✕ Cancel' : '➕ Add Charity'}
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ margin: '24px 0' }}>⚠️  {error}</div>}
      {success && <div className="alert alert-success" style={{ margin: '24px 0' }}>✅ {success}</div>}

      {/* Stats Cluster */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{charities.length}</span>
          <span className={styles.statLbl}>Total Partners</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--lime)' }}>{charities.filter(c => c.is_active).length}</span>
          <span className={styles.statLbl}>Currently Active</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--gold)' }}>
            ₹{charities.reduce((s, c) => s + c.total_contributed, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className={styles.statLbl}>Total Contributed</span>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="card animate-scaleIn" style={{ marginBottom: '32px', borderLeft: '4px solid var(--lime)' }}>
          <h3 style={{ marginBottom: '24px' }}>{editId ? '📝 Edit Organization' : '➕ Register New Charity'}</h3>
          <div className={styles.form}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
               <div className="form-group">
                <label className="form-label">Charity Name</label>
                <input type="text" className="form-input" placeholder="e.g. Hope for Children" value={name} onChange={e => setName(e.target.value)} />
               </div>
               <div className="form-group">
                <label className="form-label">Slogan / Short Description</label>
                <input type="text" className="form-input" placeholder="Providing education to all..." value={desc} onChange={e => setDesc(e.target.value)} />
               </div>
            </div>
           
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Select Brand Icon</label>
              <div className={styles.emojiGrid}>
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    type="button"
                    className={`${styles.emojiBtn} ${logo === e ? styles.selectedEmoji : ''}`}
                    onClick={() => setLogo(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel Action</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} />Processing...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charity Organizations Grid */}
      <div className={styles.charityGrid}>
        {charities.map(c => (
          <div key={c.id} className={`${styles.charityCard} ${!c.is_active ? styles.inactive : ''} animate-fadeInUp`}>
            <div className={styles.charityHeader}>
              <div className={styles.charityLogo}>{c.logo_url}</div>
              <div className={styles.charityBadge}>
                <span className={`badge ${c.is_active ? 'badge-lime' : 'badge-gray'}`}>
                  {c.is_active ? '✅ Active' : '⚪ Paused'}
                </span>
              </div>
            </div>
            <h4 className={styles.charityName}>{c.name}</h4>
            <p className={styles.charityDesc}>{c.description}</p>
            <div className={styles.charityContrib}>
              <span className="text-lime font-bold">₹{c.total_contributed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="text-muted text-sm"> total contributed</span>
            </div>
            <div className={styles.charityActions}>
              <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(c)}>📝 Edit Content</button>
              <button
                className={`btn btn-sm ${c.is_active ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => handleToggle(c.id, c.is_active)}
              >
                {c.is_active ? '🔒 Deactivate' : '🔓 Activate'}
              </button>
            </div>
          </div>
        ))}
        {charities.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px' }}>
            <p className="text-muted">No charity organizations registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
