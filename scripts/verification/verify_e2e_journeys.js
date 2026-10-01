/**
 * Comprehensive End-to-End User Journey Verification Script
 * Validates Journeys A through G against live Spring Boot (localhost:8080) and MongoDB.
 */

const BASE_URL = 'http://localhost:8080/api';

async function runJourneys() {
  console.log('====================================================');
  console.log('Starting IdeaStruct AI End-to-End Journey Verification');
  console.log('====================================================\n');

  let passedSteps = 0;
  let totalSteps = 0;

  function assert(condition, message) {
    totalSteps++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(message);
    }
    console.log(`✅ PASSED: ${message}`);
    passedSteps++;
  }

  // --- JOURNEY A: Create Idea -> Generate Blueprint -> Inspect Tabs ---
  console.log('\n--- JOURNEY A: Full Project Lifecycle ---');
  const createRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'E2E Journey Campus Delivery',
      idea: 'An intelligent on-demand campus delivery service providing automated lockers and food truck integration for university students.'
    })
  });
  assert(createRes.status === 201, 'Project created with HTTP 201');
  let project = await createRes.json();
  const projectId = project.id;
  assert(project.revision === 1, 'Initial project revision is 1');
  assert(project.blueprint == null, 'Initial blueprint is null');

  const genRes = await fetch(`${BASE_URL}/projects/${projectId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedRevision: 1, mode: 'DEMO' })
  });
  assert(genRes.status === 200, 'Blueprint generated with HTTP 200');
  project = await genRes.json();
  assert(project.revision === 2, 'Revision incremented to 2 after generation');
  assert(project.generationMetadata?.source === 'DEMO', 'Metadata source is DEMO');
  assert(project.blueprint?.overview != null, 'Overview section present');
  assert(project.blueprint?.features?.length > 0, 'Features section populated');
  assert(project.blueprint?.database?.collections?.length > 0, 'Database collections populated');
  assert(project.blueprint?.apis?.length > 0, 'APIs populated');
  assert(project.blueprint?.uiScreens?.length > 0, 'UI screens populated');
  assert(project.blueprint?.roadmap?.length > 0, 'Roadmap populated');
  assert(project.validationIssues != null, 'Validation issues generated automatically');

  // --- JOURNEY B: Metadata Drift & Outdated Indicator ---
  console.log('\n--- JOURNEY B: Metadata Drift & Outdated Status ---');
  const updateRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'If-Match': '2' },
    body: JSON.stringify({
      title: 'E2E Journey Campus Delivery (Updated Scope)',
      idea: 'An intelligent on-demand campus delivery service with drone delivery and locker pickup across campuses.'
    })
  });
  assert(updateRes.status === 200, 'Project metadata updated with HTTP 200');
  project = await updateRes.json();
  assert(project.revision === 3, 'Revision incremented to 3');
  assert(project.blueprintOutdated === true, 'blueprintOutdated flag automatically set to TRUE on idea drift');

  // --- JOURNEY C: Section Regeneration Review Flow ---
  console.log('\n--- JOURNEY C: Regeneration Review Workflow ---');
  const regenRes = await fetch(`${BASE_URL}/projects/${projectId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'If-Match': '3' },
    body: JSON.stringify({
      section: 'overview',
      instructions: 'Include drone delivery in scope and goals',
      expectedRevision: 3
    })
  });
  assert(regenRes.status === 200, 'Regeneration proposal generated with HTTP 200');
  const proposal = await regenRes.json();
  assert(proposal.baseRevision === 3, 'Proposal baseRevision matches project revision 3');
  assert(proposal.candidate != null, 'Candidate blueprint returned for review');
  assert(proposal.diffSummary != null, 'Diff summary provided for user review');

  // Verify database is NOT mutated by proposal
  const checkRes = await fetch(`${BASE_URL}/projects/${projectId}`);
  const unmutated = await checkRes.json();
  assert(unmutated.revision === 3, 'Saved project revision remains strictly 3 (database unmutated)');

  // Apply proposal
  const applyRes = await fetch(`${BASE_URL}/projects/${projectId}/blueprint`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': '3' },
    body: JSON.stringify({
      expectedRevision: 3,
      blueprint: proposal.candidate
    })
  });
  assert(applyRes.status === 200, 'Proposal applied via blueprint update with HTTP 200');
  project = await applyRes.json();
  assert(project.revision === 4, 'Revision incremented to 4 after applying proposal');
  assert(project.generationMetadata?.source === 'USER_EDITED', 'Metadata source marked USER_EDITED');

  // --- JOURNEY D: Error Injection & Deterministic Validation Traceability ---
  console.log('\n--- JOURNEY D: Validation Traceability & Fix Cycle ---');
  const brokenBlueprint = JSON.parse(JSON.stringify(project.blueprint));
  // Inject: non-existent navigation target screen
  brokenBlueprint.uiScreens[0].actions.push({
    id: 'act-broken-nav-journey',
    label: 'Ghost Screen Nav',
    kind: 'NAVIGATION',
    targetScreenId: 'screen-nonexistent'
  });
  // Inject: duplicate API route
  brokenBlueprint.apis.push({
    id: 'api-dup-journey',
    method: 'GET',
    path: '/orders/{id}',
    featureIds: ['feature-browse-vendors']
  });

  const saveBrokenRes = await fetch(`${BASE_URL}/projects/${projectId}/blueprint`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': '4' },
    body: JSON.stringify({ expectedRevision: 4, blueprint: brokenBlueprint })
  });
  assert(saveBrokenRes.status === 200, 'Broken blueprint saved with revision increment');
  project = await saveBrokenRes.json();
  assert(project.revision === 5, 'Revision incremented to 5');
  const errors = project.validationIssues.filter(i => i.severity === 'ERROR');
  assert(errors.length >= 2, 'Validation engine automatically flagged injected errors');
  assert(errors.some(e => e.ruleCode === 'RULE_SCREEN_BROKEN_NAVIGATION'), 'Flagged RULE_SCREEN_BROKEN_NAVIGATION');
  assert(errors.some(e => e.ruleCode === 'RULE_DUPLICATE_API_ROUTE'), 'Flagged RULE_DUPLICATE_API_ROUTE');

  // Fix errors and revalidate
  brokenBlueprint.uiScreens[0].actions = brokenBlueprint.uiScreens[0].actions.filter(a => a.id !== 'act-broken-nav-journey');
  brokenBlueprint.apis = brokenBlueprint.apis.filter(a => a.id !== 'api-dup-journey');

  const saveCleanRes = await fetch(`${BASE_URL}/projects/${projectId}/blueprint`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': '5' },
    body: JSON.stringify({ expectedRevision: 5, blueprint: brokenBlueprint })
  });
  assert(saveCleanRes.status === 200, 'Cleaned blueprint saved');
  project = await saveCleanRes.json();
  assert(project.revision === 6, 'Revision incremented to 6');
  const cleanErrors = project.validationIssues.filter(i => i.severity === 'ERROR');
  assert(cleanErrors.length === 0, 'Zero errors after fix applied');

  // --- JOURNEY E: Concurrency & Revision Conflict Protection ---
  console.log('\n--- JOURNEY E: Optimistic Concurrency Guard (HTTP 409) ---');
  const stalePatchRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'If-Match': '2' }, // project is at rev 6
    body: JSON.stringify({ title: 'Stale update attempt' })
  });
  assert(stalePatchRes.status === 409, 'Stale PATCH rejected with HTTP 409 Conflict');

  const stalePutRes = await fetch(`${BASE_URL}/projects/${projectId}/blueprint`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': '2' },
    body: JSON.stringify({ expectedRevision: 2, blueprint: project.blueprint })
  });
  assert(stalePutRes.status === 409, 'Stale PUT blueprint rejected with HTTP 409 Conflict');

  const staleDeleteRes = await fetch(`${BASE_URL}/projects/${projectId}?revision=2`, {
    method: 'DELETE',
    headers: { 'If-Match': '2' }
  });
  assert(staleDeleteRes.status === 409, 'Stale DELETE rejected with HTTP 409 Conflict');

  // --- JOURNEY F: Clean Project Deletion ---
  console.log('\n--- JOURNEY F: Project Deletion ---');
  const deleteRes = await fetch(`${BASE_URL}/projects/${projectId}?revision=6`, {
    method: 'DELETE',
    headers: { 'If-Match': '6' }
  });
  assert(deleteRes.status === 204, 'Project deleted with HTTP 204 No Content');

  const getDeletedRes = await fetch(`${BASE_URL}/projects/${projectId}`);
  assert(getDeletedRes.status === 404, 'Deleted project returns HTTP 404 Not Found');

  // --- JOURNEY G: Resilience & Boundary Testing ---
  console.log('\n--- JOURNEY G: Resilience & Honest Error Boundaries ---');
  const invalidCreateRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'A', idea: 'Too short' })
  });
  assert(invalidCreateRes.status === 400, 'Invalid title/idea length rejected with HTTP 400');

  const notFoundRes = await fetch(`${BASE_URL}/projects/000000000000000000000000`);
  assert(notFoundRes.status === 404, 'Non-existent project returns HTTP 404');

  const healthRes = await fetch(`${BASE_URL}/health`);
  assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
  const healthData = await healthRes.json();
  assert(healthData.status === 'UP', 'Health status is UP');
  assert(healthData.database?.status === 'UP', 'MongoDB status is UP');

  console.log('\n====================================================');
  console.log(`ALL JOURNEYS PASSED: ${passedSteps}/${totalSteps} assertion checks succeeded!`);
  console.log('====================================================\n');
}

runJourneys().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
