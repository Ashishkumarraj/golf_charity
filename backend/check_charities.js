require('dotenv').config();
const db = require('./src/config/database');

async function checkCharities() {
  try {
    const charities = await db.getCharities(false);
    console.log('REAL Charities found:', JSON.stringify(charities, null, 2));
  } catch (err) {
    console.error('Error fetching charities:', err);
  }
}

checkCharities();
