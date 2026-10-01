const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function verifyAllFourModes() {
  console.log('====================================================');
  console.log('VERIFYING PROJECT TYPE OVERRIDE MODES END-TO-END');
  console.log('Modes: AUTO, SOFTWARE, HARDWARE, HYBRID');
  console.log('====================================================\n');

  const modes = [
    {
      override: 'AUTO',
      title: 'Auto Test Project',
      idea: 'An autonomous hazardous gas and smoke detector using an ESP32 and MQ-135 sensor with OLED display.',
      expectedType: 'HARDWARE' // Classified as HARDWARE from idea
    },
    {
      override: 'SOFTWARE',
      title: 'Forced Software Project',
      idea: 'An autonomous hazardous gas and smoke detector using an ESP32 and MQ-135 sensor with OLED display.',
      expectedType: 'SOFTWARE' // Forced SOFTWARE despite hardware keywords
    },
    {
      override: 'HARDWARE',
      title: 'Forced Hardware Project',
      idea: 'A modern web dashboard for tracking student restaurant pre-orders and payment transactions.',
      expectedType: 'HARDWARE' // Forced HARDWARE despite software keywords
    },
    {
      override: 'HYBRID',
      title: 'Forced Hybrid Project',
      idea: 'A simple mobile note taking app for writing grocery lists on an iPhone.',
      expectedType: 'HYBRID' // Forced HYBRID despite simple mobile idea
    }
  ];

  for (const m of modes) {
    console.log(`▶ Testing mode: "${m.override}"...`);
    // 1. Create project with typeOverride
    const createRes = await request('/projects', {
      method: 'POST',
      body: {
        title: m.title,
        idea: m.idea,
        typeOverride: m.override
      }
    });
    if (createRes.status !== 201) throw new Error(`Creation failed for mode ${m.override}: ${createRes.status}`);
    const projectId = createRes.data.id;
    if (m.override === 'AUTO') {
      if (createRes.data.typeOverride !== null && createRes.data.typeOverride !== 'AUTO') {
        throw new Error(`Expected typeOverride to be null or AUTO for AUTO mode, got ${createRes.data.typeOverride}`);
      }
    } else {
      if (createRes.data.typeOverride !== m.override) {
        throw new Error(`Expected typeOverride=${m.override}, got ${createRes.data.typeOverride}`);
      }
    }

    // 2. Generate blueprint
    const genRes = await request(`/projects/${projectId}/generate`, {
      method: 'POST',
      body: { expectedRevision: 1, mode: 'DEMO' }
    });
    if (genRes.status !== 200) throw new Error(`Generation failed for mode ${m.override}: ${genRes.status}`);

    const bp = genRes.data.blueprint;
    if (bp.projectType !== m.expectedType) {
      throw new Error(`Mode ${m.override} generated projectType=${bp.projectType}, expected ${m.expectedType}`);
    }

    // 3. Reopen project and verify persistence
    const reopenRes = await request(`/projects/${projectId}`);
    if (reopenRes.status !== 200) throw new Error(`Reopen failed for mode ${m.override}: ${reopenRes.status}`);
    if (m.override !== 'AUTO' && reopenRes.data.typeOverride !== m.override) {
      throw new Error(`Persisted typeOverride mismatch: expected ${m.override}, got ${reopenRes.data.typeOverride}`);
    }
    if (reopenRes.data.blueprint.projectType !== m.expectedType) {
      throw new Error(`Persisted blueprint projectType mismatch: expected ${m.expectedType}, got ${reopenRes.data.blueprint.projectType}`);
    }

    // 4. Test Regeneration preserves typeOverride
    const regenRes = await request(`/projects/${projectId}/regenerate`, {
      method: 'POST',
      body: { section: 'all', expectedRevision: 2, mode: 'DEMO' }
    });
    if (regenRes.status !== 200) throw new Error(`Regen failed for mode ${m.override}: ${regenRes.status}`);
    if (regenRes.data.candidate.projectType !== m.expectedType) {
      throw new Error(`Regenerated candidate projectType mismatch: expected ${m.expectedType}, got ${regenRes.data.candidate.projectType}`);
    }

    // 5. Cleanup
    await request(`/projects/${projectId}?revision=2`, { method: 'DELETE' });
    console.log(`  ✅ Mode "${m.override}" verified end-to-end: Generated ${m.expectedType}, persisted, regenerated, and cleaned up.`);
  }

  console.log('\n====================================================');
  console.log('✅ ALL 4 PROJECT TYPE OVERRIDE MODES VERIFIED END-TO-END!');
  console.log('====================================================');
}

verifyAllFourModes().catch(e => {
  console.error('❌ Overrides verification failed:', e.message);
  process.exit(1);
});
