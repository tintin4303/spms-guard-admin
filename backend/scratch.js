const http = require('http');

async function test() {
  // Login as ops@spms.com
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ops@spms.com', password: '1234' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // Fetch guards
  const guardsRes = await fetch('http://localhost:3001/api/guards', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const guards = await guardsRes.json();
  console.log('Guards:', JSON.stringify(guards, null, 2));
}

test();
