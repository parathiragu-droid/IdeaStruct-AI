// scripts/verification/verify_phase7_validation.js
// Verification of Phase 7: Deterministic Requirement Validation and Traceability

const http = require('http');
const { generateMermaidErDiagram } = require('../../frontend/src/utils/mermaidTransformer.js');

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
  console.log('PHASE 7: DETERMINISTIC VALIDATION & TRACEABILITY VERIFICATION');
  console.log('================================================================\n');

  let disposableId = null;

  try {
    // 1. CREATE DISPOSABLE PROJECT
    console.log('Step 1: Creating disposable test project...');
    const createRes = await request('/projects', {
      method: 'POST',
      body: {
        title: 'Phase 7 Validation Verification Project',
        idea: 'An intelligent automated supply chain and parcel locker dispatching platform designed to rigorously test deterministic validation, missing reference detection, and concurrency protection.'
      }
    });

    if (createRes.status !== 201 || !createRes.data?.id) {
      throw new Error(`Failed to create project: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }
    disposableId = createRes.data.id;
    let currentRevision = createRes.data.revision;
    console.log(`✅ Project created: ID=${disposableId}, Revision=${currentRevision}`);

    // 2. GENERATE INITIAL BLUEPRINT (DEMO MODE)
    console.log('\nStep 2: Generating initial DEMO blueprint...');
    const genRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: currentRevision,
        mode: 'DEMO'
      }
    });

    if (genRes.status !== 200 || !genRes.data?.blueprint) {
      throw new Error(`Failed to generate initial blueprint: ${genRes.status} ${JSON.stringify(genRes.data)}`);
    }
    currentRevision = genRes.data.revision;
    console.log(`✅ Initial blueprint generated: Revision=${currentRevision}`);
    console.log(`   Initial automatic validationIssues count: ${genRes.data.validationIssues?.length}`);
    console.log(`   Initial validationCheckedAt: ${genRes.data.validationCheckedAt}`);

    // 3. EXPLICIT VALIDATION ENDPOINT
    console.log('\nStep 3: Triggering explicit POST /api/projects/{id}/validate...');
    const validateRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: {
        expectedRevision: currentRevision
      }
    });

    if (validateRes.status !== 200) {
      throw new Error(`Validate endpoint failed: ${validateRes.status} ${JSON.stringify(validateRes.data)}`);
    }
    if (!validateRes.data.validationCheckedAt) {
      throw new Error('validationCheckedAt was not set on validated project');
    }
    if (!Array.isArray(validateRes.data.validationIssues)) {
      throw new Error('validationIssues is not an array');
    }
    console.log(`✅ POST /validate succeeded. Validated issues count: ${validateRes.data.validationIssues.length}`);

    // 4. READ BACK TO VERIFY MONGODB PERSISTENCE
    console.log('\nStep 4: Reading back project to verify persistence in MongoDB...');
    const readRes = await request(`/projects/${disposableId}`);
    if (readRes.status !== 200) {
      throw new Error(`Failed to read project: ${readRes.status}`);
    }
    const savedProject = readRes.data;
    if (!savedProject.validationCheckedAt) {
      throw new Error('Persisted project is missing validationCheckedAt');
    }
    if (!Array.isArray(savedProject.validationIssues)) {
      throw new Error('Persisted project is missing validationIssues');
    }
    console.log(`✅ MongoDB persistence verified: validationCheckedAt=${savedProject.validationCheckedAt}, issuesCount=${savedProject.validationIssues.length}`);

    // 5. INTRODUCE VALIDATION GAP (FEATURE NEEDS API BUT NO API MAPPING)
    console.log('\nStep 5: Introducing validation gap: Feature marked needsApi:true without API mapping...');
    const modifiedBlueprint = JSON.parse(JSON.stringify(savedProject.blueprint));
    const gapFeatureId = 'feature-unmapped-api-gap';
    modifiedBlueprint.features.push({
      id: gapFeatureId,
      name: 'Automated Locker Temperature Telemetry',
      description: 'IoT sensor reporting temperature logs for refrigerated locker compartments.',
      priority: 'HIGH',
      roleIds: ['role-student'],
      needsApi: true,
      needsUi: true,
      needsPersistence: true
    });

    const saveGapRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: {
        'If-Match': String(currentRevision)
      },
      body: {
        blueprint: modifiedBlueprint,
        expectedRevision: currentRevision
      }
    });

    if (saveGapRes.status !== 200) {
      throw new Error(`Failed to save gap blueprint: ${saveGapRes.status} ${JSON.stringify(saveGapRes.data)}`);
    }
    currentRevision = saveGapRes.data.revision;
    console.log(`✅ Saved blueprint with gap. New Revision=${currentRevision}`);

    // Validate and assert finding appeared
    const valGapRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: { expectedRevision: currentRevision }
    });

    const gapIssues = valGapRes.data.validationIssues;
    const missingApiFinding = gapIssues.find(i => i.ruleCode === 'RULE_FEATURE_NO_API' && i.affectedEntityIds.includes(gapFeatureId));
    if (!missingApiFinding) {
      throw new Error(`Expected RULE_FEATURE_NO_API for ${gapFeatureId}, but none found in issues: ${JSON.stringify(gapIssues)}`);
    }
    console.log(`✅ Validation gap detected successfully:`);
    console.log(`   Rule: ${missingApiFinding.ruleCode}`);
    console.log(`   Severity: ${missingApiFinding.severity}`);
    console.log(`   Message: ${missingApiFinding.message}`);
    console.log(`   Suggested Action: ${missingApiFinding.suggestedAction}`);
    console.log(`   Source: ${missingApiFinding.source}, Status: ${missingApiFinding.status}`);

    // 6. REPAIR BLUEPRINT (ADD MATCHING API MAPPING)
    console.log('\nStep 6: Repairing blueprint by adding API endpoint for feature...');
    modifiedBlueprint.apis.push({
      id: 'api-locker-temperature',
      method: 'POST',
      path: '/lockers/{lockerId}/temperature',
      summary: 'Report compartment temperature readings',
      featureIds: [gapFeatureId],
      roleIds: ['role-student'],
      requestBodySchema: { type: 'object' },
      responses: [{ statusCode: 200, description: 'Readings accepted' }]
    });

    const saveRepairRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: {
        'If-Match': String(currentRevision)
      },
      body: {
        blueprint: modifiedBlueprint,
        expectedRevision: currentRevision
      }
    });

    if (saveRepairRes.status !== 200) {
      throw new Error(`Failed to save repaired blueprint: ${saveRepairRes.status}`);
    }
    currentRevision = saveRepairRes.data.revision;

    const valRepairRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: { expectedRevision: currentRevision }
    });

    const repairedIssues = valRepairRes.data.validationIssues;
    const stillPresent = repairedIssues.find(i => i.ruleCode === 'RULE_FEATURE_NO_API' && i.affectedEntityIds.includes(gapFeatureId));
    if (stillPresent) {
      throw new Error(`Repaired finding still present: ${JSON.stringify(stillPresent)}`);
    }
    console.log(`✅ Validation finding successfully resolved and cleared after repair!`);

    // 7. DIAGRAM VS VALIDATION CONSISTENCY ON BROKEN DATABASE RELATIONSHIP
    console.log('\nStep 7: Testing Diagram & Validation consistency on broken DB relationship...');
    const brokenDbBlueprint = JSON.parse(JSON.stringify(valRepairRes.data.blueprint));
    brokenDbBlueprint.database.relationships.push({
      id: 'rel-broken-target',
      sourceCollectionId: 'collection-orders',
      targetCollectionId: 'collection-nonexistent-xyz',
      sourceField: 'vendorId',
      targetField: '_id',
      cardinality: 'ONE_TO_MANY'
    });
    brokenDbBlueprint.database.relationships.push({
      id: 'rel-broken-cardinality',
      sourceCollectionId: 'collection-orders',
      targetCollectionId: 'collection-vendors',
      sourceField: 'vendorId',
      targetField: '_id',
      cardinality: 'INVALID_REL_TYPE'
    });

    const saveBrokenDbRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': String(currentRevision) },
      body: {
        blueprint: brokenDbBlueprint,
        expectedRevision: currentRevision
      }
    });
    currentRevision = saveBrokenDbRes.data.revision;

    // Phase 7 Validation
    const valDbRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: { expectedRevision: currentRevision }
    });
    const dbIssues = valDbRes.data.validationIssues;

    const hasTargetIssue = dbIssues.some(i => i.ruleCode === 'RULE_RELATIONSHIP_MISSING_TARGET' && i.affectedEntityIds.includes('rel-broken-target'));
    const hasCardIssue = dbIssues.some(i => i.ruleCode === 'RULE_RELATIONSHIP_UNSUPPORTED_CARDINALITY' && i.affectedEntityIds.includes('rel-broken-cardinality'));

    if (!hasTargetIssue) {
      throw new Error('Phase 7 Validation failed to flag missing target collection on broken relationship');
    }
    if (!hasCardIssue) {
      throw new Error('Phase 7 Validation failed to flag unsupported cardinality on broken relationship');
    }

    // Phase 6 Diagram
    const diagramOutput = generateMermaidErDiagram(brokenDbBlueprint.database);
    const diagramHasTargetBroken = diagramOutput.unresolvedLinks.some(u => u.reason.includes('Broken collection reference') || u.target === 'collection-nonexistent-xyz');
    const diagramHasCardBroken = diagramOutput.unresolvedLinks.some(u => u.reason.includes('Unsupported cardinality'));

    if (!diagramHasTargetBroken) {
      throw new Error('Phase 6 Diagram failed to flag broken collection reference in unresolvedLinks');
    }
    if (!diagramHasCardBroken) {
      throw new Error('Phase 6 Diagram failed to flag unsupported cardinality in unresolvedLinks');
    }

    console.log(`✅ Consistency Verified:`);
    console.log(`   Validation flagged: RULE_RELATIONSHIP_MISSING_TARGET & RULE_RELATIONSHIP_UNSUPPORTED_CARDINALITY`);
    console.log(`   Diagram flagged: ${diagramOutput.unresolvedLinks.length} unresolved links safely omitted from ER diagram syntax`);

    // 8. STALE VALIDATION & REVISION CONCURRENCY PROTECTION
    console.log('\nStep 8: Testing stale revision rejection during validation...');
    const staleRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: {
        expectedRevision: currentRevision - 1 // stale revision!
      }
    });

    if (staleRes.status !== 409) {
      throw new Error(`Expected 409 Conflict on stale revision, got: ${staleRes.status}`);
    }
    console.log(`✅ Stale revision correctly rejected with 409 Conflict: ${staleRes.data.message || JSON.stringify(staleRes.data)}`);

    // 9. CLIENT TRUST BOUNDARIES (SERVER MUST NOT TRUST FORGED CLIENT ISSUES)
    console.log('\nStep 9: Testing client trust boundaries (spoofed client issues)...');
    const spoofRes = await request(`/projects/${disposableId}/validate`, {
      method: 'POST',
      body: {
        expectedRevision: currentRevision,
        validationIssues: [
          {
            id: 'val-forged-client-issue',
            ruleCode: 'RULE_FORGED_HACK',
            severity: 'INFO',
            message: 'Client-injected unauthorized issue'
          }
        ]
      }
    });

    const issuesAfterSpoof = spoofRes.data.validationIssues;
    const hasForged = issuesAfterSpoof.some(i => i.id === 'val-forged-client-issue' || i.ruleCode === 'RULE_FORGED_HACK');
    if (hasForged) {
      throw new Error('CRITICAL SECURITY VIOLATION: Server trusted client-provided validationIssues!');
    }
    console.log('✅ Client trust boundary verified: Server discarded spoofed client issues and deterministically recomputed all findings');

    // 10. DETERMINISM & REPRODUCIBILITY TEST
    console.log('\nStep 10: Testing finding IDs and reproducibility across multiple runs...');
    const run1 = (await request(`/projects/${disposableId}/validate`, { method: 'POST', body: { expectedRevision: currentRevision } })).data.validationIssues;
    const run2 = (await request(`/projects/${disposableId}/validate`, { method: 'POST', body: { expectedRevision: currentRevision } })).data.validationIssues;
    const run3 = (await request(`/projects/${disposableId}/validate`, { method: 'POST', body: { expectedRevision: currentRevision } })).data.validationIssues;

    if (run1.length !== run2.length || run2.length !== run3.length) {
      throw new Error(`Inconsistent issue count across runs: run1=${run1.length}, run2=${run2.length}, run3=${run3.length}`);
    }

    for (let i = 0; i < run1.length; i++) {
      if (run1[i].id !== run2[i].id || run2[i].id !== run3[i].id) {
        throw new Error(`Inconsistent issue ID at index ${i}: ${run1[i].id} vs ${run2[i].id}`);
      }
      if (run1[i].ruleCode !== run2[i].ruleCode || run2[i].ruleCode !== run3[i].ruleCode) {
        throw new Error(`Inconsistent ruleCode at index ${i}: ${run1[i].ruleCode} vs ${run2[i].ruleCode}`);
      }
      if (run1[i].severity !== run2[i].severity) {
        throw new Error(`Inconsistent severity at index ${i}: ${run1[i].severity} vs ${run2[i].severity}`);
      }
    }
    console.log(`✅ Reproducibility verified: 3 consecutive runs yielded identical finding IDs, ruleCodes, and severities`);

    console.log('\n================================================================');
    console.log('🎉 ALL PHASE 7 INTEGRATION TESTS PASSED!');
    console.log('================================================================');

  } finally {
    // CLEAN UP DISPOSABLE PROJECT
    if (disposableId) {
      console.log(`\nCleanup: Deleting disposable project ${disposableId}...`);
      const delRes = await request(`/projects/${disposableId}`, { method: 'DELETE' });
      console.log(`Cleanup complete: status ${delRes.status}`);
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ Phase 7 Verification Failed:', err);
  process.exit(1);
});
