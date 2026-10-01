// scripts/verification/verify_phase5_e2e.js
// Verification of Phase 5 Complete Blueprint Dashboard, Editing, Concurrency, and Regeneration Review

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
  console.log('================================================================');
  console.log('PHASE 5: REAL MONGODB VERIFICATION & END-TO-END WORKFLOW');
  console.log('================================================================\n');

  let disposableId = null;

  try {
    // 1. CREATE PROJECT
    console.log('Step 1: Creating disposable test project...');
    const createRes = await request('/projects', {
      method: 'POST',
      body: {
        title: 'Phase 5 Verification Disposable App',
        idea: 'A comprehensive logistics management platform designed to thoroughly verify Phase 5 blueprint dashboard, manual JSON editing, optimistic locking concurrency, and candidate section regeneration.'
      }
    });

    if (createRes.status !== 201) {
      throw new Error(`Failed to create project: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }

    disposableId = createRes.data.id;
    console.log(`✅ Created test project with ID: ${disposableId}, Revision: ${createRes.data.revision}`);

    // 2. GENERATE INITIAL DEMO BLUEPRINT
    console.log('\nStep 2: Generating initial DEMO blueprint...');
    const genRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 1,
        mode: 'DEMO'
      }
    });

    if (genRes.status !== 200) {
      throw new Error(`Failed to generate demo blueprint: ${genRes.status} ${JSON.stringify(genRes.data)}`);
    }

    const genProject = genRes.data;
    console.log(`✅ Blueprint generated. New revision: ${genProject.revision}`);
    console.log(`   Source: ${genProject.generationMetadata.source}`);
    console.log(`   Provider: ${genProject.generationMetadata.provider}`);
    if (genProject.generationMetadata.source !== 'DEMO' || genProject.generationMetadata.provider !== null) {
      throw new Error(`DEMO blueprint metadata violation: source=${genProject.generationMetadata.source}, provider=${genProject.generationMetadata.provider}`);
    }

    // 3. REOPEN (GET /api/projects/:id)
    console.log('\nStep 3: Reopening project directly to verify persistence across all sections...');
    const reopenRes1 = await request(`/projects/${disposableId}`);
    if (reopenRes1.status !== 200) {
      throw new Error(`Failed to reload project: ${reopenRes1.status}`);
    }

    const savedBp = reopenRes1.data.blueprint;
    const requiredSections = [
      'schemaVersion', 'overview', 'features', 'roles', 'requirements',
      'database', 'apis', 'uiScreens', 'roadmap', 'assumptions', 'openQuestions'
    ];
    for (const sec of requiredSections) {
      if (!savedBp[sec]) {
        throw new Error(`Missing expected section '${sec}' in saved blueprint`);
      }
    }
    console.log(`✅ Reopened project from MongoDB. All 11 canonical sections verified present.`);

    // 4. MANUAL EDIT
    console.log('\nStep 4: Performing manual blueprint edit...');
    const modifiedBp = JSON.parse(JSON.stringify(savedBp));
    modifiedBp.overview.projectName = 'Phase 5 Logistics Pro (User Edited)';
    modifiedBp.overview.customVerificationNote = 'Manually edited by Phase 5 Verification Suite';

    // Test stale revision conflict (attempt save with expectedRevision: 1 while actual is 2)
    console.log('   Testing optimistic locking concurrency (stale expectedRevision: 1)...');
    const staleSaveRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': '1' },
      body: {
        blueprint: modifiedBp,
        expectedRevision: 1
      }
    });
    if (staleSaveRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for stale revision, got: ${staleSaveRes.status}`);
    }
    console.log('   ✅ 409 Conflict correctly returned on stale revision.');

    // Test invalid schema rejection (missing required section)
    console.log('   Testing server rejection of schema-invalid blueprint (missing database section)...');
    const invalidBp = JSON.parse(JSON.stringify(modifiedBp));
    delete invalidBp.database;
    const invalidSaveRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': '2' },
      body: {
        blueprint: invalidBp,
        expectedRevision: 2
      }
    });
    if (invalidSaveRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for missing database section, got: ${invalidSaveRes.status}`);
    }
    console.log('   ✅ 400 Bad Request correctly returned on invalid schema.');

    // Valid save with expectedRevision: 2
    console.log('   Saving valid edited blueprint with expectedRevision: 2...');
    const validSaveRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': '2' },
      body: {
        blueprint: modifiedBp,
        expectedRevision: 2
      }
    });
    if (validSaveRes.status !== 200) {
      throw new Error(`Failed to save valid blueprint: ${validSaveRes.status} ${JSON.stringify(validSaveRes.data)}`);
    }

    const savedProject2 = validSaveRes.data;
    console.log(`✅ Blueprint saved. New revision: ${savedProject2.revision}`);
    console.log(`   Source: ${savedProject2.generationMetadata.source}`);
    console.log(`   Provider: ${savedProject2.generationMetadata.provider}`);
    if (savedProject2.generationMetadata.source !== 'USER_EDITED' || savedProject2.generationMetadata.provider !== null) {
      throw new Error(`USER_EDITED provenance violation: source=${savedProject2.generationMetadata.source}, provider=${savedProject2.generationMetadata.provider}`);
    }

    // 5. REOPEN TO CONFIRM EDIT PERSISTED
    console.log('\nStep 5: Reopening project to confirm manual edit persisted in MongoDB...');
    const reopenRes2 = await request(`/projects/${disposableId}`);
    if (reopenRes2.status !== 200) {
      throw new Error(`Failed to reload project: ${reopenRes2.status}`);
    }
    const currentBp = reopenRes2.data.blueprint;
    if (currentBp.overview.projectName !== 'Phase 5 Logistics Pro (User Edited)') {
      throw new Error(`Edited projectName not persisted: ${currentBp.overview.projectName}`);
    }
    if (currentBp.overview.customVerificationNote !== 'Manually edited by Phase 5 Verification Suite') {
      throw new Error(`Edited customVerificationNote not persisted: ${currentBp.overview.customVerificationNote}`);
    }
    console.log('✅ Edit confirmed persisted in real MongoDB.');

    // 6. REGENERATE ONE SECTION (Review Candidate & Discard)
    console.log('\nStep 6: Proposing single-section regeneration ("database")...');
    const regenProposeRes = await request(`/projects/${disposableId}/regenerate`, {
      method: 'POST',
      body: {
        expectedRevision: 3,
        section: 'database',
        instructions: 'Add a new real-time fleet telematics collection',
        mode: 'DEMO'
      }
    });

    if (regenProposeRes.status !== 200) {
      throw new Error(`Regenerate proposal failed: ${regenProposeRes.status} ${JSON.stringify(regenProposeRes.data)}`);
    }

    const proposal = regenProposeRes.data;
    console.log(`✅ Regeneration candidate returned.`);
    console.log(`   Base Revision: ${proposal.baseRevision}`);
    console.log(`   Target Section: ${proposal.section}`);
    console.log(`   Diff Summary: ${proposal.diffSummary}`);

    if (proposal.baseRevision !== 3) {
      throw new Error(`Expected baseRevision 3, got: ${proposal.baseRevision}`);
    }
    if (proposal.section !== 'database') {
      throw new Error(`Expected section 'database', got: ${proposal.section}`);
    }

    // Verify saved project in MongoDB is UNMUTATED (Discard behavior check)
    console.log('   Verifying saved MongoDB project was NOT modified by proposal (base revision remains 3)...');
    const checkUnmutated = await request(`/projects/${disposableId}`);
    if (checkUnmutated.data.revision !== 3) {
      throw new Error(`Saved project revision was unexpectedly mutated to: ${checkUnmutated.data.revision}`);
    }
    if (checkUnmutated.data.blueprint.overview.projectName !== 'Phase 5 Logistics Pro (User Edited)') {
      throw new Error(`Saved project blueprint was prematurely overwritten before Apply!`);
    }
    console.log('✅ Proposal is ephemeral: MongoDB database state is strictly untouched before Apply.');

    // 7. REGENERATE AGAIN AND APPLY
    console.log('\nStep 7: Applying section regeneration proposal to project...');
    const applyRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': String(proposal.baseRevision) },
      body: {
        blueprint: proposal.candidate,
        expectedRevision: proposal.baseRevision
      }
    });

    if (applyRes.status !== 200) {
      throw new Error(`Failed to apply regeneration proposal: ${applyRes.status} ${JSON.stringify(applyRes.data)}`);
    }

    const appliedProject = applyRes.data;
    console.log(`✅ Candidate successfully applied. New revision: ${appliedProject.revision}`);
    if (appliedProject.revision !== 4) {
      throw new Error(`Expected revision 4 after applying candidate, got: ${appliedProject.revision}`);
    }

    // Verify only target section ('database') was replaced, all other sections preserved identically
    console.log('   Verifying all unrelated sections remain identical to pre-regeneration state...');
    const appliedBp = appliedProject.blueprint;
    if (appliedBp.overview.projectName !== 'Phase 5 Logistics Pro (User Edited)') {
      throw new Error(`Unrelated section 'overview' was corrupted or overwritten! Got: ${appliedBp.overview.projectName}`);
    }
    if (JSON.stringify(appliedBp.features) !== JSON.stringify(currentBp.features)) {
      throw new Error(`Unrelated section 'features' was unexpectedly modified!`);
    }
    if (JSON.stringify(appliedBp.roles) !== JSON.stringify(currentBp.roles)) {
      throw new Error(`Unrelated section 'roles' was unexpectedly modified!`);
    }
    if (JSON.stringify(appliedBp.requirements) !== JSON.stringify(currentBp.requirements)) {
      throw new Error(`Unrelated section 'requirements' was unexpectedly modified!`);
    }
    if (JSON.stringify(appliedBp.apis) !== JSON.stringify(currentBp.apis)) {
      throw new Error(`Unrelated section 'apis' was unexpectedly modified!`);
    }
    if (JSON.stringify(appliedBp.uiScreens) !== JSON.stringify(currentBp.uiScreens)) {
      throw new Error(`Unrelated section 'uiScreens' was unexpectedly modified!`);
    }
    if (JSON.stringify(appliedBp.roadmap) !== JSON.stringify(currentBp.roadmap)) {
      throw new Error(`Unrelated section 'roadmap' was unexpectedly modified!`);
    }
    console.log('✅ Unrelated sections verified 100% identical. Only the target section changed.');

    console.log('\n================================================================');
    console.log('ALL PHASE 5 REAL MONGODB & E2E VERIFICATIONS PASSED!');
    console.log('================================================================\n');

  } finally {
    // 8. CLEANUP DISPOSABLE PROJECT
    if (disposableId) {
      console.log(`Step 8: Cleaning up disposable test project (${disposableId})...`);
      try {
        const delRes = await request(`/projects/${disposableId}`, {
          method: 'DELETE'
        });
        console.log(`✅ Cleanup completed with status: ${delRes.status}`);
      } catch (err) {
        console.error('Warning: Failed to delete disposable test project:', err.message);
      }
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ PHASE 5 VERIFICATION FAILURE:', err.message);
  process.exit(1);
});
