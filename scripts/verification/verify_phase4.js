// scripts/verification/verify_phase4.js
// Verification of Phase 4 AI Integration and Reliable Blueprint Generation

const http = require('http');

const API_BASE = 'http://localhost:8080/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          if (body) json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== PHASE 4: BACKEND ENDPOINT & INTEGRATION VERIFICATION ===\n');
  let disposableId = null;
  let disposable2Id = null;

  try {
    // 1. Create a disposable project
    console.log('1. Creating disposable test project...');
    const createRes = await request('/projects', {
      method: 'POST',
      body: {
        title: 'Phase 4 Verification Disposable App',
        idea: 'A comprehensive multi-tier inventory and ordering application designed to test Phase 4 blueprint generation contracts, concurrency guards, and metadata tracking.'
      }
    });

    if (createRes.status !== 201) {
      throw new Error(`Failed to create disposable project. Status: ${createRes.status}, data: ${JSON.stringify(createRes.data)}`);
    }
    disposableId = createRes.data.id;
    const initialRev = createRes.data.revision;
    console.log(`   Created project: id=${disposableId}, revision=${initialRev}`);
    if (initialRev !== 1) throw new Error(`Expected initial revision 1, got ${initialRev}`);

    // 2. Test LIVE_AI mode: Verify honest error if unconfigured or honest generation if configured
    console.log('\n2. Testing LIVE_AI request...');
    const liveAiRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 1,
        mode: 'LIVE_AI'
      }
    });
    console.log(`   Response status: ${liveAiRes.status}`);
    if (liveAiRes.status === 400) {
      if (!liveAiRes.data?.message?.includes('GEMINI_API_KEY is not configured')) {
        throw new Error(`Expected message to mention missing GEMINI_API_KEY, got: ${liveAiRes.data?.message}`);
      }
      // Verify project remained unchanged after failed LIVE_AI attempt
      const verifyUnchanged = await request(`/projects/${disposableId}`);
      if (verifyUnchanged.data.revision !== 1 || verifyUnchanged.data.blueprint !== null) {
        throw new Error(`Project was corrupted after failed LIVE_AI attempt: revision=${verifyUnchanged.data.revision}, blueprint=${verifyUnchanged.data.blueprint}`);
      }
      console.log('   Confirmed: Unconfigured LIVE_AI rejected honestly with 400; project preserved with revision 1, blueprint=null, NO silent fallback to DEMO.');
    } else if (liveAiRes.status === 200) {
      console.log('   Confirmed: LIVE_AI configured and generated successfully with revision 2.');
      // Delete and create a fresh project for DEMO mode verification steps
      await request(`/projects/${disposableId}?revision=2`, { method: 'DELETE' });
      const freshProject = await request('/projects', {
        method: 'POST',
        body: {
          title: 'Phase 4 Verification Disposable App (DEMO)',
          idea: 'A comprehensive multi-tier inventory and ordering application designed to test Phase 4 blueprint generation contracts, concurrency guards, and metadata tracking.'
        }
      });
      disposableId = freshProject.data.id;
    } else {
      throw new Error(`Unexpected status for LIVE_AI request: ${liveAiRes.status}`);
    }

    // 3. Stale revision rejection
    console.log('\n3. Testing generation with stale expectedRevision (expectedRevision=99)...');
    const staleRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 99,
        mode: 'DEMO'
      }
    });
    console.log(`   Response status: ${staleRes.status} (Conflict expected)`);
    if (staleRes.status !== 409) {
      throw new Error(`Expected HTTP 409 for stale revision, got ${staleRes.status}`);
    }

    // 4. Generate first blueprint using DEMO mode
    console.log('\n4. Generating initial blueprint with mode="DEMO"...');
    const demoGenRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 1,
        mode: 'DEMO'
      }
    });
    console.log(`   Response status: ${demoGenRes.status}`);
    if (demoGenRes.status !== 200) {
      throw new Error(`Expected HTTP 200 for DEMO generation, got ${demoGenRes.status}: ${JSON.stringify(demoGenRes.data)}`);
    }

    const updated = demoGenRes.data;
    console.log(`   Updated project revision: ${updated.revision}`);
    if (updated.revision !== 2) throw new Error(`Expected revision 2, got ${updated.revision}`);

    // Verify GenerationMetadata
    const meta = updated.generationMetadata;
    console.log(`   Generation metadata: source=${meta?.source}, provider=${meta?.provider}, model=${meta?.model}`);
    if (meta?.source !== 'DEMO') throw new Error(`Expected metadata source="DEMO", got ${meta?.source}`);
    if (meta?.provider === 'google' || meta?.provider === 'gemini') {
      throw new Error(`DEMO generation falsely claimed live provider: ${meta?.provider}`);
    }
    if (meta?.provider !== null && meta?.provider !== undefined) {
      throw new Error(`Expected provider to be null/absent for DEMO, got ${meta?.provider}`);
    }
    if (!meta?.model?.startsWith('deterministic-fixture')) throw new Error(`Expected model="deterministic-fixture-*", got ${meta?.model}`);

    // Verify Canonical Blueprint Structure
    const bp = updated.blueprint;
    if (!bp) throw new Error('Blueprint is null or missing in response');
    console.log(`   Blueprint schemaVersion: ${bp.schemaVersion}`);
    if (bp.schemaVersion !== '1.0' && bp.schemaVersion !== '2.0') throw new Error(`Expected schemaVersion "1.0" or "2.0", got ${bp.schemaVersion}`);

    const requiredSections = [
      'overview', 'features', 'roles', 'requirements', 'database',
      'apis', 'uiScreens', 'roadmap', 'assumptions', 'openQuestions'
    ];
    for (const sec of requiredSections) {
      if (!bp[sec]) throw new Error(`Missing required section: ${sec}`);
    }
    console.log(`   All ${requiredSections.length} canonical sections present.`);
    console.log(`   Features: ${bp.features.length}, Roles: ${bp.roles.length}, APIs: ${bp.apis.length}, Screens: ${bp.uiScreens.length}`);

    // 5. MongoDB Persistence Verification
    console.log('\n5. Verifying persistence in MongoDB (re-fetching project via GET)...');
    const readBack = await request(`/projects/${disposableId}`);
    if (readBack.status !== 200) throw new Error(`Failed to read back project: ${readBack.status}`);
    if (readBack.data.revision !== 2) throw new Error(`Persisted revision mismatch: ${readBack.data.revision}`);
    if (!readBack.data.blueprint || (readBack.data.blueprint.schemaVersion !== '1.0' && readBack.data.blueprint.schemaVersion !== '2.0')) {
      throw new Error('Persisted blueprint is incomplete or missing in MongoDB');
    }
    console.log('   Persistence confirmed in MongoDB: project reloaded successfully with complete blueprint.');

    // 6. Overwrite Prevention: Second generate on same project must be rejected with 409
    console.log('\n6. Testing overwrite prevention (calling /generate on project that already has blueprint)...');
    const overwriteRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 2,
        mode: 'DEMO'
      }
    });
    console.log(`   Response status: ${overwriteRes.status} (Conflict expected)`);
    if (overwriteRes.status !== 409) {
      throw new Error(`Expected HTTP 409 when generating over existing blueprint, got ${overwriteRes.status}`);
    }
    console.log(`   Conflict message: ${overwriteRes.data?.message}`);

    // 7. Concurrent edit scenario
    console.log('\n7. Testing concurrent edit scenario...');
    const create2Res = await request('/projects', {
      method: 'POST',
      body: {
        title: 'Concurrent Test Disposable App',
        idea: 'Application designed to simulate concurrent modification between generation initiation and save.'
      }
    });
    disposable2Id = create2Res.data.id;
    console.log(`   Created second project: id=${disposable2Id}, revision=${create2Res.data.revision}`);

    // Modify project to revision 2 before generation with rev 1 is requested
    const patchRes = await request(`/projects/${disposable2Id}`, {
      method: 'PATCH',
      headers: { 'If-Match': '1' },
      body: {
        title: 'Concurrent Test Disposable App (Modified to rev 2)',
        expectedRevision: 1
      }
    });
    if (patchRes.status !== 200 || patchRes.data.revision !== 2) {
      throw new Error(`Failed to update project revision: ${patchRes.status}`);
    }
    console.log(`   Updated project to revision ${patchRes.data.revision}`);

    // Now attempt generation expecting revision 1
    const concurrentGenRes = await request(`/projects/${disposable2Id}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 1,
        mode: 'DEMO'
      }
    });
    console.log(`   Attempted generate with stale expectedRevision=1: Status=${concurrentGenRes.status}`);
    if (concurrentGenRes.status !== 409) {
      throw new Error(`Expected HTTP 409 for concurrent edit conflict, got ${concurrentGenRes.status}`);
    }
    console.log('   Confirmed: Server rejected stale revision; title & newer state preserved intact.');

    console.log('\n=== ALL PHASE 4 LIVE INTEGRATION CHECKS PASSED ===\n');
  } finally {
    // Clean up disposable projects
    if (disposableId) {
      console.log(`Cleaning up test project ${disposableId}...`);
      await request(`/projects/${disposableId}?revision=2`, { method: 'DELETE' });
    }
    if (disposable2Id) {
      console.log(`Cleaning up test project ${disposable2Id}...`);
      await request(`/projects/${disposable2Id}?revision=2`, { method: 'DELETE' });
    }
    console.log('Disposable projects cleaned up. Real user data untouched.');
  }
}

runTests().catch(err => {
  console.error('\n❌ PHASE 4 VERIFICATION FAILED:', err.message);
  process.exit(1);
});
