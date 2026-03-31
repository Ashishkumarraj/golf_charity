/**
 * Draw Algorithm Service
 * 
 * Monthly Draw Logic:
 * 1. Collect all active subscribers with at least 1 golf score
 * 2. Generate 5 "winning numbers" (1-45) using a seeded random function
 * 3. For each user, use their golf scores as their "lucky numbers"
 * 4. Match: 3-match = Tier1 (15%), 4-match = Tier2 (25%), 5-match = Jackpot (60%)
 * 5. Minimum 10% of prize pool goes to charity before distribution
 * 6. Jackpot rolls over to next month if no winner
 */

const db = require('../config/database');

// Seeded random number generator (Mulberry32)
function seededRandom(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate N unique numbers in range [1, max] using seed
function generateWinningNumbers(seed, count = 5, max = 45) {
  const random = seededRandom(seed);
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Get user's "entry numbers" from their golf scores
function getUserEntryNumbers(userId) {
  const scores = db.getScoresByUserId(userId);
  if (!scores || scores.length === 0) return [];
  // Use the actual score values as their lottery numbers
  return scores.map(s => s.score);
}

// Count matches between user numbers and winning numbers
function countMatches(userNumbers, winningNumbers) {
  return userNumbers.filter(n => winningNumbers.includes(n)).length;
}

// Run the monthly draw
async function runDraw(drawId, options = {}) {
  const draw = db.getDrawById(drawId);
  if (!draw) throw new Error('Draw not found');
  if (draw.status === 'completed') throw new Error('Draw already completed');

  // Get all active subscribers
  const allSubs = db.subscriptions.filter(s => s.status === 'active');
  const eligibleUsers = [];

  for (const sub of allSubs) {
    const user = db.getUserById(sub.user_id);
    if (!user || !user.is_active) continue;
    const scores = db.getScoresByUserId(sub.user_id);
    if (scores.length === 0) continue;
    eligibleUsers.push({ user, subscription: sub, scores });
  }

  // Generate winning numbers using timestamp as seed
  const seed = options.seed || Date.now();
  const winningNumbers = generateWinningNumbers(seed);

  // Calculate prize pool (total active subscription amounts)
  const totalRevenue = allSubs.reduce((sum, s) => sum + s.amount, 0);
  const charityAmount = totalRevenue * 0.10;
  const prizePool = totalRevenue * 0.90;

  // Check for jackpot rollover
  const jackpotRollover = draw.jackpot_rollover || 0;
  const totalJackpot = (prizePool * 0.60) + jackpotRollover;

  // Find winners by tier
  const tier1Winners = []; // 3-match: 15%
  const tier2Winners = []; // 4-match: 25%
  const jackpotWinners = []; // 5-match: 60%

  for (const { user, scores } of eligibleUsers) {
    const userNumbers = scores.map(s => s.score);
    const matches = countMatches(userNumbers, winningNumbers);

    if (matches >= 5) jackpotWinners.push({ user, matches });
    else if (matches >= 4) tier2Winners.push({ user, matches });
    else if (matches >= 3) tier1Winners.push({ user, matches });
  }

  // Distribute prizes
  const winners = [];
  const tier1Pool = prizePool * 0.15;
  const tier2Pool = prizePool * 0.25;

  // Tier 1: 3-match
  if (tier1Winners.length > 0) {
    const prizePerWinner = tier1Pool / tier1Winners.length;
    for (const { user } of tier1Winners) {
      winners.push({
        user_id: user.id,
        draw_id: drawId,
        tier: '3-match',
        numbers_matched: 3,
        prize_amount: parseFloat(prizePerWinner.toFixed(2)),
        payout_status: 'pending'
      });
    }
  }

  // Tier 2: 4-match
  if (tier2Winners.length > 0) {
    const prizePerWinner = tier2Pool / tier2Winners.length;
    for (const { user } of tier2Winners) {
      winners.push({
        user_id: user.id,
        draw_id: drawId,
        tier: '4-match',
        numbers_matched: 4,
        prize_amount: parseFloat(prizePerWinner.toFixed(2)),
        payout_status: 'pending'
      });
    }
  }

  // Jackpot: 5-match
  let newJackpotRollover = 0;
  if (jackpotWinners.length > 0) {
    const prizePerWinner = totalJackpot / jackpotWinners.length;
    for (const { user } of jackpotWinners) {
      winners.push({
        user_id: user.id,
        draw_id: drawId,
        tier: 'jackpot',
        numbers_matched: 5,
        prize_amount: parseFloat(prizePerWinner.toFixed(2)),
        payout_status: 'pending'
      });
    }
  } else {
    // No jackpot winner - rollover!
    newJackpotRollover = totalJackpot;
  }

  // Save winners to DB
  for (const winner of winners) {
    db.addWinner(winner);
  }

  // Update charity contributions
  if (draw.charity_id_distribution) {
    // Distribute to user-selected charities
    const allUsers = db.users.filter(u => u.role === 'user' && u.charity_id);
    const charityMap = {};
    for (const u of allUsers) {
      charityMap[u.charity_id] = (charityMap[u.charity_id] || 0) + 1;
    }
    const totalUserCount = Object.values(charityMap).reduce((a, b) => a + b, 0);
    for (const [charityId, count] of Object.entries(charityMap)) {
      const share = charityAmount * (count / totalUserCount);
      const charity = db.getCharityById(charityId);
      if (charity) {
        db.updateCharity(charityId, { total_contributed: (charity.total_contributed || 0) + share });
      }
    }
  }

  // Update draw record
  const updatedDraw = db.updateDraw(drawId, {
    status: options.simulate ? 'simulated' : 'completed',
    winning_numbers: winningNumbers,
    prize_pool: parseFloat(prizePool.toFixed(2)),
    charity_contribution: parseFloat(charityAmount.toFixed(2)),
    jackpot_amount: parseFloat(totalJackpot.toFixed(2)),
    jackpot_rolled_over: jackpotWinners.length === 0,
    jackpot_rollover_amount: parseFloat(newJackpotRollover.toFixed(2)),
    eligible_entries: eligibleUsers.length,
    total_winners: winners.length,
    published_at: options.simulate ? null : new Date().toISOString(),
    seed_used: seed
  });

  return {
    draw: updatedDraw,
    winningNumbers,
    winners,
    stats: {
      eligibleEntries: eligibleUsers.length,
      tier1Winners: tier1Winners.length,
      tier2Winners: tier2Winners.length,
      jackpotWinners: jackpotWinners.length,
      prizePool: parseFloat(prizePool.toFixed(2)),
      charityAmount: parseFloat(charityAmount.toFixed(2)),
      jackpotRolledOver: jackpotWinners.length === 0,
      newJackpotAmount: parseFloat(newJackpotRollover.toFixed(2))
    }
  };
}

module.exports = { runDraw, generateWinningNumbers, countMatches, getUserEntryNumbers };

