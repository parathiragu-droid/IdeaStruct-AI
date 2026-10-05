const https = require('https');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'https://ideastruct-api.onrender.com');
    const reqHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = https.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verifyRender() {
  console.log('--- Checking Render Public Backend ---');
  
  // 1. Health
  const health = await request('GET', '/api/health');
  console.log('1. Health check HTTP status:', health.status);
  console.log('   Health payload:', JSON.stringify(health.data));
  if (health.status !== 200) {
    console.error('FAIL: Health check did not return 200');
    process.exit(1);
  }

  // Poll for Render deployment if needed
  let deployed = false;
  for (let attempt = 1; attempt <= 20; attempt++) {
    console.log(`\nTesting Delete Safety Contract on Render (Attempt ${attempt}/20)...`);
    
    // Create temp project
    const createRes = await request('POST', '/api/projects', {
      title: 'Render Public Verify ' + Date.now(),
      domain: 'SOFTWARE',
      idea: 'Temporary verification project for Phase 20 delete safety check'
    });

    if (createRes.status !== 201) {
      console.log('   Create project status:', createRes.status, createRes.data);
      console.log('   Waiting 15s before next attempt...');
      await new Promise(r => setTimeout(r, 15000));
      continue;
    }

    const project = createRes.data;
    const projectId = project.id;
    const revision = project.revision || 1;
    console.log(`   Created project id=${projectId}, revision=${revision}`);

    // Missing revision -> expect 400
    const deleteNoRev = await request('DELETE', `/api/projects/${projectId}`);
    console.log(`   DELETE without revision header: HTTP ${deleteNoRev.status}`);

    if (deleteNoRev.status === 400) {
      console.log('   SUCCESS: Missing revision returned HTTP 400 on public Render!');
      
      // Stale revision -> expect 409
      const deleteStale = await request('DELETE', `/api/projects/${projectId}`, null, {
        'If-Match': '9999'
      });
      console.log(`   DELETE with stale revision (9999): HTTP ${deleteStale.status}`);

      // Valid revision -> expect 204
      const deleteValid = await request('DELETE', `/api/projects/${projectId}`, null, {
        'If-Match': String(revision)
      });
      console.log(`   DELETE with matching revision (${revision}): HTTP ${deleteValid.status}`);

      if (deleteStale.status === 409 && deleteValid.status === 204) {
        console.log('>>> RENDER BACKEND PUBLIC CONTRACT FULLY VERIFIED (400, 409, 204)!');
        deployed = true;
        break;
      }
    } else {
      console.log(`   Render is still deploying previous build (missing revision returned ${deleteNoRev.status}). Waiting 15s...`);
      // Clean up project if it deleted or still exists
      try {
        await request('DELETE', `/api/projects/${projectId}`, null, { 'X-Expected-Revision': String(revision) });
      } catch {}
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  if (!deployed) {
    console.error('Render deployment timed out or did not return expected status.');
    process.exit(1);
  }
}

verifyRender().catch(err => {
  console.error('Fatal error during Render verification:', err);
  process.exit(1);
});
