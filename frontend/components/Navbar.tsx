'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isSubscribed } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={`${styles.navInner} container`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⛳</span>
          <span className={styles.logoText}>
            Golf<span className={styles.logoAccent}>Charity</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className={styles.links}>
          {!isAuthenticated ? (
            <>
              <Link href="/#how-it-works" className={styles.link}>How It Works</Link>
              <Link href="/#charities" className={styles.link}>Charities</Link>
              <Link href="/#pricing" className={styles.link}>Pricing</Link>
              <Link href="/login" className={`btn btn-ghost ${styles.navBtn}`}>Login</Link>
              <Link href="/signup" className={`btn btn-primary ${styles.navBtn}`}>Join Now</Link>
            </>
          ) : isAdmin ? (
            <>
              <Link href="/admin" className={styles.link}>Dashboard</Link>
              <Link href="/admin/users" className={styles.link}>Users</Link>
              <Link href="/admin/draws" className={styles.link}>Draws</Link>
              <Link href="/admin/charities" className={styles.link}>Charities</Link>
              <button onClick={handleLogout} className={`btn btn-ghost ${styles.navBtn}`}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              <Link href="/scores" className={styles.link}>Scores</Link>
              <Link href="/draws" className={styles.link}>Draws</Link>
              {!isSubscribed && (
                <Link href="/subscription" className={`btn btn-gold ${styles.navBtn}`}>Subscribe</Link>
              )}
              <div className={styles.userMenu}>
                <button className={styles.avatar} onClick={() => setMenuOpen(!menuOpen)}>
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className={styles.dropdown} onClick={() => setMenuOpen(false)}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{user?.name}</div>
                      <div className={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/dashboard" className={styles.dropdownItem}>Dashboard</Link>
                    <Link href="/scores" className={styles.dropdownItem}>My Scores</Link>
                    <Link href="/subscription" className={styles.dropdownItem}>Subscription</Link>
                    <Link href="/charity" className={styles.dropdownItem}>My Charity</Link>
                    <Link href="/winnings" className={styles.dropdownItem}>Winnings</Link>
                    <div className={styles.dropdownDivider} />
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.barOpen : ''} />
          <span className={menuOpen ? styles.barOpen : ''} />
          <span className={menuOpen ? styles.barOpen : ''} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {!isAuthenticated ? (
            <>
              <Link href="/#how-it-works" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link href="/#charities" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Charities</Link>
              <Link href="/#pricing" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/signup" className={`btn btn-primary ${styles.mobileCta}`} onClick={() => setMenuOpen(false)}>Join Now</Link>
            </>
          ) : isAdmin ? (
            <>
              <Link href="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/admin/users" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Users</Link>
              <Link href="/admin/draws" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Draws</Link>
              <Link href="/admin/charities" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Charities</Link>
              <button onClick={handleLogout} className={`btn btn-ghost ${styles.mobileCta}`}>Logout</button>
            </>
          ) : (
            <>
              <div className={styles.mobileUser}>
                <div className={styles.avatar} style={{ marginRight: '12px' }}>{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F5F5F5' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8aaa8a' }}>{user?.email}</div>
                </div>
              </div>
              <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/scores" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Scores</Link>
              <Link href="/draws" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Draws</Link>
              <Link href="/subscription" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Subscription</Link>
              <Link href="/charity" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Charity</Link>
              <Link href="/winnings" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Winnings</Link>
              <button onClick={handleLogout} className={`btn btn-ghost ${styles.mobileCta}`}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
