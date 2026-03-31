'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth';
import styles from '../auth.module.css';


export default function SignupPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.authCard}>
        <Link href="/" className={styles.logo}>
          <span>⛳</span>
          <span>Golf<span className={styles.accent}>Charity</span></span>
        </Link>

        <h1 className={styles.heading}>Join GolfCharity</h1>
        <p className={styles.subheading}>
          Start playing for prizes while supporting your favorite charity
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className={styles.passWrapper}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.terms}>
            <span>By signing up, you agree to our Terms of Service and Privacy Policy</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            id="signup-submit"
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18 }} />Creating account...</>
            ) : 'Create Account 🎉'}
          </button>
        </form>

        {/* Benefits */}
        <div className={styles.benefits}>
          {['Monthly prize draws', '10% goes to charity', 'Track your golf scores', 'Cancel anytime'].map((b, i) => (
            <div key={i} className={styles.benefit}>
              <span style={{ color: 'var(--lime)' }}>✓</span> {b}
            </div>
          ))}
        </div>

        <div className={styles.switchLink}>
          Already have an account?{' '}
          <Link href="/login" className="text-lime font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
