require('dotenv').config();
const db = require('./src/config/database');

async function setupCharity() {
  try {
    const charityData = {
      name: 'The R&A Foundation',
      description: 'Supporting golf development worldwide',
      logo_url: '⛳'
    };
    const charity = await db.addCharity(charityData);
    console.log('Created charity:', JSON.stringify(charity, null, 2));
  } catch (err) {
    console.error('Error creating charity:', err);
  }
}

setupCharity();
