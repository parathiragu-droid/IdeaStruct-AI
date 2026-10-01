/**
 * Phase 3 Real CRUD & Contract Verification Script
 * Tests live API routes, optimistic locking (409), input validation (400),
 * 404 handling, blueprint outdated flag computation, and real MongoDB persistence.
 */

const BASE_URL = 'http://localhost:8080/api';

async function verifyPhase3() {
  console.log('====================================================');
  console.log('Phase 3 Real Persistence & CRUD Verification');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(message);
    }
    console.log(`✅ PASSED: ${message}`);
    passed++;
  }

  // 1. Health check
  console.log('--- Step 1: Health Check (GET /api/health) ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert(healthRes.status === 200, 'Health check returns HTTP 200');
  const healthData = await healthRes.json();
  assert(healthData.status === 'UP', 'Health overall status is UP');
  assert(healthData.database?.status === 'UP', 'MongoDB ping status is UP');
  assert(healthData.database?.databaseName === 'ideastruct_ai', 'Database name is ideastruct_ai');

  // 2. CREATE disposable project
  console.log('\n--- Step 2: CREATE Project (POST /api/projects) ---');
  const title = 'Phase 3 Verification Disposable Project';
  const idea = 'This is a dedicated disposable project created solely to verify Phase 3 CRUD operations, optimistic concurrency, and MongoDB persistence lifecycle.';
  const createRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, idea })
  });
  assert(createRes.status === 201, 'POST /api/projects returns HTTP 201 Created');
  const createdProject = await createRes.json();
  const projectId = createdProject.id;
  assert(projectId != null && projectId.length > 0, `Project ID generated: ${projectId}`);
  assert(createdProject.title === title, 'Title persisted correctly');
  assert(createdProject.idea === idea, 'Idea persisted correctly');
  assert(createdProject.revision === 1, 'Initial revision is 1');
  assert(createdProject.blueprint === null, 'Initial blueprint is null');
  assert(createdProject.blueprintOutdated === false, 'blueprintOutdated starts false');
  assert(createdProject.createdAt != null, 'createdAt timestamp present');
  assert(createdProject.updatedAt != null, 'updatedAt timestamp present');

  // 3. READ (GET /api/projects/{id})
  console.log('\n--- Step 3: READ Project by ID (GET /api/projects/{id}) ---');
  const readRes = await fetch(`${BASE_URL}/projects/${projectId}`);
  assert(readRes.status === 200, 'GET /api/projects/{id} returns HTTP 200');
  const readProject = await readRes.json();
  assert(readProject.id === projectId, 'Read project ID matches created ID');
  assert(readProject.revision === 1, 'Read revision is 1');

  // 4. LIST (GET /api/projects) with pagination and stable ordering
  console.log('\n--- Step 4: LIST Projects (GET /api/projects) ---');
  const listRes = await fetch(`${BASE_URL}/projects?page=0&size=10`);
  assert(listRes.status === 200, 'GET /api/projects returns HTTP 200');
  const listData = await listRes.json();
  assert(Array.isArray(listData.content), 'List data returns content array');
  assert(listData.content.some(p => p.id === projectId), 'Disposable project present in paginated list');
  assert(listData.page != null, 'Page metadata present');
  assert(listData.page.size === 10, 'Page size matches request');

  // 5. UPDATE (PATCH /api/projects/{id}) with correct revision
  console.log('\n--- Step 5: UPDATE Project (PATCH /api/projects/{id}) ---');
  const updatedTitle = 'Phase 3 Verification Disposable Project (Updated Title)';
  const updatedIdea = 'Updated idea description with more than fifty characters to verify modification and revision increment in MongoDB.';
  const updateRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'If-Match': '1' },
    body: JSON.stringify({
      title: updatedTitle,
      idea: updatedIdea,
      expectedRevision: 1
    })
  });
  assert(updateRes.status === 200, 'PATCH returns HTTP 200');
  const updatedProject = await updateRes.json();
  assert(updatedProject.revision === 2, 'Revision incremented from 1 to 2');
  assert(updatedProject.title === updatedTitle, 'Updated title persisted');
  assert(updatedProject.idea === updatedIdea, 'Updated idea persisted');

  // 6. READ again after update
  console.log('\n--- Step 6: READ Again to Verify Persistence ---');
  const readAgainRes = await fetch(`${BASE_URL}/projects/${projectId}`);
  assert(readAgainRes.status === 200, 'GET returns HTTP 200');
  const readAgain = await readAgainRes.json();
  assert(readAgain.revision === 2, 'Persisted revision is 2');
  assert(readAgain.title === updatedTitle, 'Persisted title reflects update');

  // 7. Stale UPDATE conflict (Optimistic locking 409)
  console.log('\n--- Step 7: Stale UPDATE Conflict (HTTP 409) ---');
  const staleRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'If-Match': '1' }, // current is 2
    body: JSON.stringify({
      title: 'Stale attempt that must fail',
      expectedRevision: 1
    })
  });
  assert(staleRes.status === 409, 'Stale PATCH returns HTTP 409 Conflict');
  const conflictData = await staleRes.json();
  assert(conflictData.code === 'CONFLICT', 'Error code is CONFLICT');
  assert(conflictData.fieldErrors?.currentRevision === '2', 'Error details reports currentRevision: 2');
  assert(conflictData.fieldErrors?.expectedRevision === '1', 'Error details reports expectedRevision: 1');

  // 8. Blueprint Outdated Flag Behavior (Requirement 6)
  console.log('\n--- Step 8: Blueprint Outdated Behavior ---');
  // First, generate a demo blueprint for this project
  const genRes = await fetch(`${BASE_URL}/projects/${projectId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedRevision: 2, mode: 'DEMO' })
  });
  assert(genRes.status === 200, 'Generated blueprint on disposable project (HTTP 200)');
  const projectWithBp = await genRes.json();
  assert(projectWithBp.revision === 3, 'Revision incremented to 3');
  assert(projectWithBp.blueprint != null, 'Blueprint populated');
  assert(projectWithBp.blueprintOutdated === false, 'blueprintOutdated starts false');
  assert(projectWithBp.blueprintBasedOnIdeaHash != null, 'Idea hash stored');

  // Now change the idea
  const driftIdea = 'Completely different idea description with more than fifty characters to intentionally induce idea hash drift.';
  const driftRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'If-Match': '3' },
    body: JSON.stringify({ idea: driftIdea, expectedRevision: 3 })
  });
  assert(driftRes.status === 200, 'Patched idea on project with blueprint (HTTP 200)');
  const driftedProject = await driftRes.json();
  assert(driftedProject.revision === 4, 'Revision incremented to 4');
  assert(driftedProject.blueprint != null, 'Existing blueprint was NOT deleted');
  assert(driftedProject.blueprintOutdated === true, 'blueprintOutdated correctly indicates drift (true)');

  // 9. Input & Error Handling (Requirement 8)
  console.log('\n--- Step 9: Input & Error Handling (400, 404, 409) ---');
  // 9a. 400 Bad Request on short title
  const badTitleRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'AB', idea: 'A valid idea description with more than fifty characters for testing.' })
  });
  assert(badTitleRes.status === 400, 'Title < 3 chars rejected with HTTP 400');
  const badTitleData = await badTitleRes.json();
  assert(badTitleData.code === 'VALIDATION_ERROR' || badTitleData.code === 'BAD_REQUEST', 'Error response code is VALIDATION_ERROR or BAD_REQUEST');

  // 9b. 400 Bad Request on short idea
  const badIdeaRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Valid Title', idea: 'Too short' })
  });
  assert(badIdeaRes.status === 400, 'Idea < 50 chars rejected with HTTP 400');

  // 9c. 404 Not Found on unknown ID
  const notFoundRes = await fetch(`${BASE_URL}/projects/000000000000000000000000`);
  assert(notFoundRes.status === 404, 'Unknown ID returns HTTP 404 Not Found');
  const notFoundData = await notFoundRes.json();
  assert(notFoundData.code === 'RESOURCE_NOT_FOUND', 'Error response code is RESOURCE_NOT_FOUND');

  // 10. DELETE project with stale revision check
  console.log('\n--- Step 10: DELETE with Stale Revision (HTTP 409) ---');
  const staleDeleteRes = await fetch(`${BASE_URL}/projects/${projectId}?revision=1`, {
    method: 'DELETE',
    headers: { 'If-Match': '1' }
  });
  assert(staleDeleteRes.status === 409, 'Stale DELETE returns HTTP 409 Conflict');

  // 11. DELETE project with correct revision
  console.log('\n--- Step 11: DELETE with Correct Revision (HTTP 204) ---');
  const deleteRes = await fetch(`${BASE_URL}/projects/${projectId}?revision=4`, {
    method: 'DELETE',
    headers: { 'If-Match': '4' }
  });
  assert(deleteRes.status === 204, 'DELETE /api/projects/{id} returns HTTP 204 No Content');

  // 12. Confirm deleted project returns 404
  console.log('\n--- Step 12: Confirm Deleted Project Returns 404 ---');
  const confirmDeletedRes = await fetch(`${BASE_URL}/projects/${projectId}`);
  assert(confirmDeletedRes.status === 404, 'GET deleted project returns HTTP 404 Not Found');

  console.log('\n====================================================');
  console.log(`ALL PHASE 3 CHECKS PASSED: ${passed}/${total} assertions succeeded!`);
  console.log('====================================================\n');
}

verifyPhase3().catch((err) => {
  console.error('\n❌ Phase 3 Verification Failed:', err);
  process.exit(1);
});
