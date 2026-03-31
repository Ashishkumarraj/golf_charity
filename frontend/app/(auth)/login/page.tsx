'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth';
import styles from '../auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => { setEmail('user@golfcharity.com'); setPassword('User@123456'); };
  const fillAdmin = () => { setEmail('admin@golfcharity.com'); setPassword('Admin@123456'); };

  return (
    <div className={styles.authPage}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.authCard}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span>⛳</span>
          <span>Golf<span className={styles.accent}>Charity</span></span>
        </Link>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18 }} />Signing in...</>
            ) : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className={styles.demoSection}>
          <div className={styles.demoLabel}>Quick test login:</div>
          <div className={styles.demoBtns}>
            <button className="btn btn-ghost btn-sm" onClick={fillDemo} type="button">
              👤 User Login
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fillAdmin} type="button">
              👑 Admin Login
            </button>
          </div>
        </div>

        <div className={styles.switchLink}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-lime font-semibold">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}
