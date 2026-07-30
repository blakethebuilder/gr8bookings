// Ponytail: patch collection rules on running instance via superuser API
// Run with: curl -s -X POST <pb>/api/collections/_superusers/auth-with-password ...
const https = require('https');

async function main() {
  const PB = 'gr8bookings.smartintegrate.co.za';
  
  // Auth
  const token = await auth(PB, 'grandmaster@gr8escape.co.za', 'gr8@2026!');
  
  // Rules to enforce: { name: { listRule, viewRule, createRule, updateRule, deleteRule } }
  const rules = {
    bookings: {
      listRule: '@request.auth.id != ""',
      viewRule: '',
      createRule: '',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    },
    time_slots: {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '',
      deleteRule: '@request.auth.id != ""',
    },
    rooms: {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    },
    staff: {
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    },
    waivers: {
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    },
  };
  
  for (const [name, r] of Object.entries(rules)) {
    const existing = await api(PB, 'GET', `/api/collections/${name}`, null, token);
    const payload = {
      listRule: r.listRule,
      viewRule: r.viewRule,
      createRule: r.createRule,
      updateRule: r.updateRule,
      deleteRule: r.deleteRule,
    };
    const res = await api(PB, 'PATCH', `/api/collections/${existing.id}`, payload, token);
    console.log(`${name}: rules patched ✓`);
  }
}

function auth(host, email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ identity: email, password });
    const opts = {
      hostname: host, path: '/api/collections/_superusers/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    };
    const req = https.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(JSON.parse(body).token));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function api(host, method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: host, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

main().then(() => console.log('Done')).catch(e => console.error(e));
