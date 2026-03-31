'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import styles from './Sidebar.module.css';

const userLinks = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/scores', icon: '⛳', label: 'Golf Scores' },
  { href: '/draws', icon: '🎰', label: 'Monthly Draws' },
  { href: '/subscription', icon: '💳', label: 'Subscription' },
  { href: '/charity', icon: '❤️', label: 'My Charity' },
  { href: '/winnings', icon: '🏆', label: 'Winnings' },
];

const adminLinks = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/draws', icon: '🎰', label: 'Draws' },
  { href: '/admin/charities', icon: '❤️', label: 'Charities' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isSubscribed } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⛳</span>
          <span className={styles.logoText}>
            Golf<span className={styles.logoAccent}>Charity</span>
          </span>
        </Link>
      </div>

      {/* Role badge */}
      <div className={styles.roleBadge}>
        <span className={`badge ${isAdmin ? 'badge-gold' : isSubscribed ? 'badge-lime' : 'badge-gray'}`}>
          {isAdmin ? '👑 Admin' : isSubscribed ? '✅ Member' : '⚪ Free'}
        </span>
      </div>

      {/* Nav links */}
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${
              pathname === link.href || (link.href !== '/admin' && link.href !== '/dashboard' && pathname.startsWith(link.href))
                ? styles.active
                : ''
            }`}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span className={styles.label}>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom user */}
      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userText}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
