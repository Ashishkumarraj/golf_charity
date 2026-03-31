'use client';
import Link from 'next/link';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';
import styles from './home.module.css';

const features = [
  { icon: '⛳', title: 'Track Your Scores', desc: 'Record up to 5 golf scores per month. Your average becomes your unique draw entry number.' },
  { icon: '🎰', title: 'Monthly Prize Draw', desc: 'Every month, 5 winning numbers are drawn. Match 3, 4, or all 5 to win your tier prize.' },
  { icon: '❤️', title: 'Support a Charity', desc: 'Choose from 10+ golf charities. A minimum 10% of all subscription revenue goes directly to your chosen charity.' },
  { icon: '🏆', title: 'Win Real Prizes', desc: 'We verify every winner and process payouts securely. Jackpots roll over if no winner is found.' },
];

const howItWorks = [
  { step: '01', title: 'Sign Up & Subscribe', desc: 'Create your account and choose a monthly or yearly subscription plan. Secure payments via Stripe.' },
  { step: '02', title: 'Record Golf Scores', desc: 'Log up to 5 golf scores (1–45 pts). Your average score rounds to your personal draw entry number for the month.' },
  { step: '03', title: 'Pick Your Charity', desc: 'Choose from 10+ verified golf charities. 10% of your subscription goes directly to your chosen charity every month.' },
  { step: '04', title: 'Enter the Draw', desc: 'At month end, 5 winning numbers are drawn. Match 3 = Tier 1, 4 = Tier 2, all 5 = Jackpot!' },
];

const charities = [
  { name: "The R&A Foundation", emoji: '⛳', raised: '₹4,250' },
  { name: "First Tee", emoji: '🌿', raised: '₹3,100' },
  { name: "PGA REACH", emoji: '🏆', raised: '₹5,600' },
  { name: "Golf 4 Cancer", emoji: '💛', raised: '₹3,800' },
  { name: "Golf Foundation", emoji: '🏌️', raised: '₹2,800' },
  { name: "GreenLight Golf", emoji: '💚', raised: '₹1,950' },
];

const plans = [
  {
    name: 'Monthly',
    price: '₹2999',
    period: '/month',
    features: ['Monthly draw entry', '5 score slots', '10% to charity', 'Cancel anytime'],
  },
  {
    name: 'Yearly',
    price: '₹29999',
    period: '/year',
    popular: true,
    saves: 'Save ₹5989',
    features: ['12 draw entries', '5 score slots', '25% to charity', 'Jackpot rollover bonus'],
  },
];

export default function LandingPage() {
  return (
    <AuthProvider>
      <div className={styles.page}>
        <Navbar />

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroBadge}>
              <span>⛳ UK&apos;s #1 Golf Charity Platform</span>
            </div>
            <h1 className={styles.heroTitle}>
              Play Golf.{' '}
              <span className={styles.heroAccent}>Win Prizes.</span>
              <br />
              Change Lives.
            </h1>
            <p className={styles.heroSubtitle}>
              Subscribe monthly, log your golf scores, enter the monthly prize draw,
              and ensure 10% of every pound goes to a golf charity you believe in.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Playing — ₹2999/mo →
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary btn-lg">
                How It Works
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>₹17,900</span>
                <span className={styles.heroStatLbl}>Donated to Charities</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>₹9,200+</span>
                <span className={styles.heroStatLbl}>In Prizes Awarded</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>10+</span>
                <span className={styles.heroStatLbl}>Partner Charities</span>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className={styles.heroCards}>
            <div className={styles.floatCard}>
              <div className={styles.floatCardIcon}>🎰</div>
              <div>
                <div className={styles.floatCardTitle}>Current Jackpot</div>
                <div className={styles.floatCardVal}>₹1,619.46</div>
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.floatCard2}`}>
              <div className={styles.floatCardIcon}>❤️</div>
              <div>
                <div className={styles.floatCardTitle}>This Month&apos;s Charity</div>
                <div className={styles.floatCardVal}>PGA REACH</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section} id="how-it-works">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTag}>Simple Process</div>
              <h2>How GolfCharity Works</h2>
              <p>Four easy steps to start winning prizes and supporting golf charities.</p>
            </div>

            <div className={styles.stepsGrid}>
              {howItWorks.map((step, i) => (
                <div key={i} className={`${styles.stepCard} animate-fadeInUp delay-${i + 1}`}>
                  <div className={styles.stepNum}>{step.step}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className={styles.featuresSection}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTag}>Platform Features</div>
              <h2>Everything You Need</h2>
              <p>A complete golf charity subscription platform built for golfers.</p>
            </div>

            <div className={styles.featuresGrid}>
              {features.map((f, i) => (
                <div key={i} className={`${styles.featureCard} animate-fadeInUp delay-${i + 1}`}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRIZE TIERS */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTag}>Prize Structure</div>
              <h2>Three Ways to Win</h2>
              <p>Match your score number to the monthly draw for your chance to win.</p>
            </div>

            <div className={styles.tiersGrid}>
              <div className={styles.tierCard}>
                <div className={styles.tierIcon}>🥉</div>
                <div className={styles.tierName}>Tier 1</div>
                <div className={styles.tierMatch}>3 Numbers Matched</div>
                <div className={styles.tierPrize}>15% of Pool</div>
                <p className={styles.tierDesc}>Shared among all 3-match winners this month</p>
              </div>
              <div className={`${styles.tierCard} ${styles.tierFeatured}`}>
                <div className={styles.tierIcon}>🥈</div>
                <div className={styles.tierName}>Tier 2</div>
                <div className={styles.tierMatch}>4 Numbers Matched</div>
                <div className={styles.tierPrize}>25% of Pool</div>
                <p className={styles.tierDesc}>Shared among all 4-match winners this month</p>
              </div>
              <div className={`${styles.tierCard} ${styles.tierJackpot}`}>
                <div className={styles.tierIcon}>🏆</div>
                <div className={styles.tierName}>JACKPOT</div>
                <div className={styles.tierMatch}>5 Numbers Matched</div>
                <div className={styles.tierPrize}>60% of Pool</div>
                <p className={styles.tierDesc}>Full jackpot! Rolls over to next month if no winner.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CHARITIES */}
        <section className={styles.featuresSection} id="charities">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTag}>Giving Back</div>
              <h2>Our Partner Charities</h2>
              <p>Choose from 10+ verified golf charities. Your 10% goes directly to them.</p>
            </div>

            <div className={styles.charitiesGrid}>
              {charities.map((c, i) => (
                <div key={i} className={`${styles.charityCard} animate-fadeInUp delay-${(i % 3) + 1}`}>
                  <div className={styles.charityEmoji}>{c.emoji}</div>
                  <div className={styles.charityName}>{c.name}</div>
                  <div className={styles.charityRaised}>{c.raised} raised</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className={styles.section} id="pricing">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTag}>Simple Pricing</div>
              <h2>Choose Your Plan</h2>
              <p>No hidden fees. Cancel anytime. 10% always goes to your chosen charity.</p>
            </div>

            <div className={styles.pricingGrid}>
              {plans.map((plan, i) => (
                <div key={i} className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ''}`}>
                  {plan.popular && <div className={styles.popularBadge}>⭐ Best Value</div>}
                  {plan.saves && <div className={styles.savesBadge}>{plan.saves}</div>}
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{plan.price}</span>
                    <span className={styles.planPeriod}>{plan.period}</span>
                  </div>
                  <ul className={styles.planFeatures}>
                    {plan.features.map((f, j) => (
                      <li key={j}>
                        <span style={{ color: 'var(--lime)' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'center' }}>
                    Get Started →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <div className={styles.ctaDecor}>⛳</div>
              <h2 className={styles.ctaTitle}>Ready to Play for a Cause?</h2>
              <p className={styles.ctaDesc}>
                Join hundreds of golfers who are winning prizes and making a real difference every month.
              </p>
              <div className={styles.ctaBtns}>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Join GolfCharity Today →
                </Link>
                <Link href="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerTop}>
              <div className={styles.footerBrand}>
                <div className={styles.footerLogo}>⛳ Golf<span style={{ color: 'var(--lime)' }}>Charity</span></div>
                <p className={styles.footerTagline}>Play golf. Win prizes. Change lives.</p>
              </div>
              <div className={styles.footerLinks}>
                <div className={styles.footerCol}>
                  <div className={styles.footerColTitle}>Platform</div>
                  <Link href="/login" className={styles.footerLink}>Login</Link>
                  <Link href="/signup" className={styles.footerLink}>Sign Up</Link>
                  <Link href="#pricing" className={styles.footerLink}>Pricing</Link>
                </div>
                <div className={styles.footerCol}>
                  <div className={styles.footerColTitle}>Info</div>
                  <Link href="#how-it-works" className={styles.footerLink}>How It Works</Link>
                  <Link href="#charities" className={styles.footerLink}>Charities</Link>
                </div>
              </div>
            </div>
            <div className={styles.footerBottom}>
              <p>© 2024 GolfCharity. All rights reserved. Official Charity Partner Platform.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
