const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  try {
    console.log(`Testing Registration for ${email}...`);
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw regData;
    console.log('Registration Success:', regData.message);

    console.log('Testing Login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw loginData;
    console.log('Login Success:', loginData.message);
    console.log('Token Received:', !!loginData.accessToken);

    console.log('Testing /me (Protected Route)...');
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.accessToken}` }
    });
    const meData = await meRes.json();
    if (!meRes.ok) throw meData;
    console.log('/me Success - Retrieved User:', meData.user.name);

    console.log('Auth System Verification: PASSED ✅');

  } catch (err) {
    console.error('Auth System Verification: FAILED ❌');
    console.error('Error Details:', err);
  }
}

testAuth();
