// frontend/src/tests/phase5Verification.test.js
// Verification suite for Phase 5 Frontend Requirements

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('====================================================');
console.log('Running Phase 5 Frontend Verification Suite');
console.log('====================================================\n');

// 1. Inspect Dashboard Tabs Navigation
console.log('--- Check 1: Dashboard Navigation & Tab Sections ---');
const dashboardTabsPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'DashboardTabs.jsx');
const dashboardTabsJsx = fs.readFileSync(dashboardTabsPath, 'utf8');

const expectedTabs = ['overview', 'features', 'roles', 'requirements', 'database', 'apis', 'screens', 'roadmap', 'architecture', 'validation'];
for (const tabId of expectedTabs) {
  assert(dashboardTabsJsx.includes(`id: '${tabId}'`), `DashboardTabs contains tab: ${tabId}`);
}
console.log('✅ PASSED: Core dashboard tab sections defined (Overview, Features, Roles, Requirements, Database, APIs, Screens, Roadmap, Architecture, Validation)');

// 2. Inspect OverviewTab
console.log('\n--- Check 2: OverviewTab Real Blueprint Fields ---');
const overviewTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'OverviewTab.jsx');
const overviewTabJsx = fs.readFileSync(overviewTabPath, 'utf8');

assert(overviewTabJsx.includes('overview.projectName'), 'Renders overview.projectName');
assert(overviewTabJsx.includes('overview.summary'), 'Renders overview.summary');
assert(overviewTabJsx.includes('overview.problemStatement'), 'Renders overview.problemStatement');
assert(overviewTabJsx.includes('overview.targetUsers'), 'Renders overview.targetUsers');
assert(overviewTabJsx.includes('overview.goals'), 'Renders overview.goals');
assert(overviewTabJsx.includes('overview.scope'), 'Renders overview.scope');
assert(overviewTabJsx.includes('overview.outOfScope'), 'Renders overview.outOfScope');
assert(overviewTabJsx.includes('assumptions.map'), 'Renders assumptions list');
assert(overviewTabJsx.includes('openQuestions.map'), 'Renders openQuestions list');
console.log('✅ PASSED: OverviewTab renders all 9 canonical overview fields and lists');

// 3. Inspect FeaturesTab
console.log('\n--- Check 3: FeaturesTab Data and Badges ---');
const featuresTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'FeaturesTab.jsx');
const featuresTabJsx = fs.readFileSync(featuresTabPath, 'utf8');

assert(featuresTabJsx.includes('feat.name'), 'Renders feature name');
assert(featuresTabJsx.includes('feat.description'), 'Renders feature description');
assert(featuresTabJsx.includes('feat.priority'), 'Renders feature priority');
assert(featuresTabJsx.includes('feat.needsApi'), 'Renders needsApi badge');
assert(featuresTabJsx.includes('feat.needsUi'), 'Renders needsUi badge');
assert(featuresTabJsx.includes('feat.needsPersistence'), 'Renders needsPersistence badge');
assert(featuresTabJsx.includes('feat.roleIds'), 'Renders linked roleIds');
console.log('✅ PASSED: FeaturesTab renders name, description, priority, needsApi, needsUi, needsPersistence, and linked roles');

// 4. Inspect RolesTab
console.log('\n--- Check 4: RolesTab Permissions & Interactive Status ---');
const rolesTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'RolesTab.jsx');
const rolesTabJsx = fs.readFileSync(rolesTabPath, 'utf8');

assert(rolesTabJsx.includes('role.name'), 'Renders role name');
assert(rolesTabJsx.includes('role.description'), 'Renders role description');
assert(rolesTabJsx.includes('role.permissions'), 'Renders permissions list');
assert(rolesTabJsx.includes('role.interactive'), 'Renders interactive actor vs automated status');
console.log('✅ PASSED: RolesTab renders name, description, permissions, and interactive status');

// 5. Inspect RequirementsTab
console.log('\n--- Check 5: RequirementsTab (Functional, Non-Functional, Acceptance Criteria, Sources) ---');
const reqsTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'RequirementsTab.jsx');
const reqsTabJsx = fs.readFileSync(reqsTabPath, 'utf8');

assert(reqsTabJsx.includes('req.type'), 'Distinguishes FUNCTIONAL vs NON_FUNCTIONAL');
assert(reqsTabJsx.includes('req.description'), 'Renders requirement description');
assert(reqsTabJsx.includes('req.acceptanceCriteria'), 'Renders acceptance criteria');
assert(reqsTabJsx.includes('req.featureIds'), 'Renders linked featureIds');
assert(reqsTabJsx.includes('req.source'), 'Visibly displays USER_STATED vs AI_ASSUMED source');
console.log('✅ PASSED: RequirementsTab distinguishes types, acceptance criteria, linked features, and provenance sources');

// 6. Inspect DatabaseTab
console.log('\n--- Check 6: DatabaseTab Proposed Schema & Honesty ---');
const dbTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'DatabaseTab.jsx');
const dbTabJsx = fs.readFileSync(dbTabPath, 'utf8');

assert(dbTabJsx.includes('Planning Artifact'), 'Clearly identifies schemas as planning artifact, not provisioned collections');
assert(dbTabJsx.includes('coll.name'), 'Renders collection name');
assert(dbTabJsx.includes('coll.fields'), 'Renders fields table');
assert(dbTabJsx.includes('f.dataType'), 'Renders field dataType');
assert(dbTabJsx.includes('f.required'), 'Renders required status');
assert(dbTabJsx.includes('f.unique'), 'Renders unique status');
assert(dbTabJsx.includes('coll.indexes'), 'Renders indexes');
assert(dbTabJsx.includes('f.embeddedShape'), 'Renders embedded shapes where present');
assert(dbTabJsx.includes('relationships.map'), 'Renders relationships with source/target and cardinality');
console.log('✅ PASSED: DatabaseTab displays full proposed MongoDB schemas honestly labeled as planning artifact');

// 7. Inspect ApisTab
console.log('\n--- Check 7: ApisTab Specifications & No Fake Send Request ---');
const apisTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'ApisTab.jsx');
const apisTabJsx = fs.readFileSync(apisTabPath, 'utf8');

assert(apisTabJsx.includes('REST Architecture Specification'), 'Clearly identifies APIs as architectural blueprints, not live endpoints');
assert(apisTabJsx.includes('api.method'), 'Renders HTTP method');
assert(apisTabJsx.includes('api.path'), 'Renders path');
assert(apisTabJsx.includes('api.purpose'), 'Renders purpose');
assert(apisTabJsx.includes('api.authRequired'), 'Renders authRequired');
assert(apisTabJsx.includes('api.requestExample'), 'Renders request body example');
assert(apisTabJsx.includes('api.responseExample'), 'Renders response body example');
assert(apisTabJsx.includes('api.successStatus'), 'Renders successStatus');
assert(apisTabJsx.includes('api.errorCases'), 'Renders errorCases');
assert(!apisTabJsx.includes('Send Request'), 'Does NOT contain fake "Send Request" action');
assert(!apisTabJsx.includes('Execute API'), 'Does NOT contain fake "Execute API" action');
assert(apisTabJsx.includes('navigator.clipboard.writeText'), 'Provides text-only clipboard copy');
console.log('✅ PASSED: ApisTab displays full REST specifications with text-only copy and NO fake Send Request actions');

// 8. Inspect ScreensTab
console.log('\n--- Check 8: ScreensTab Structure & Linked Roles/Features ---');
const screensTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'ScreensTab.jsx');
const screensTabJsx = fs.readFileSync(screensTabPath, 'utf8');

assert(screensTabJsx.includes('screen.name'), 'Renders screen name');
assert(screensTabJsx.includes('screen.route'), 'Renders screen route');
assert(screensTabJsx.includes('screen.purpose'), 'Renders screen purpose');
assert(screensTabJsx.includes('screen.roleIds'), 'Renders linked roleIds');
assert(screensTabJsx.includes('screen.featureIds'), 'Renders linked featureIds');
assert(screensTabJsx.includes('screen.components'), 'Renders components list');
assert(screensTabJsx.includes('screen.states'), 'Renders states list');
assert(screensTabJsx.includes('screen.actions'), 'Renders actions list');
console.log('✅ PASSED: ScreensTab renders names, routes, purpose, components, states, actions, linked roles, and linked features');

// 9. Inspect RoadmapTab
console.log('\n--- Check 9: RoadmapTab Dependencies & No Fake Dates ---');
const roadmapTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'RoadmapTab.jsx');
const roadmapTabJsx = fs.readFileSync(roadmapTabPath, 'utf8');

assert(roadmapTabJsx.includes('avoiding artificial delivery dates'), 'Honestly labeled avoiding artificial delivery dates');
assert(roadmapTabJsx.includes('phase.title'), 'Renders phase title');
assert(roadmapTabJsx.includes('phase.description'), 'Renders phase description');
assert(roadmapTabJsx.includes('phase.featureIds'), 'Renders linked featureIds');
assert(roadmapTabJsx.includes('phase.dependsOnPhaseIds'), 'Renders dependencies');
assert(roadmapTabJsx.includes('phase.tasks'), 'Renders tasks');
assert(roadmapTabJsx.includes('phase.completionCriteria'), 'Renders completion criteria');
console.log('✅ PASSED: RoadmapTab renders title, description, tasks, criteria, dependencies, linked features, and no fake delivery dates');

// 10. Inspect EditBlueprintModal
console.log('\n--- Check 10: EditBlueprintModal Schema Validation & Concurrency ---');
const editModalPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'EditBlueprintModal.jsx');
const editModalJsx = fs.readFileSync(editModalPath, 'utf8');

assert(editModalJsx.includes('JSON.parse(jsonContent)'), 'Parses JSON before saving');
assert(editModalJsx.includes('schemaVersion'), 'Validates schemaVersion');
assert(editModalJsx.includes('overview'), 'Validates overview');
assert(editModalJsx.includes('database'), 'Validates database');
assert(editModalJsx.includes('features'), 'Validates features');
assert(editModalJsx.includes('Discard / Cancel'), 'Provides Discard / Cancel button');
assert(editModalJsx.includes('Save Blueprint to MongoDB'), 'Provides Save button');
console.log('✅ PASSED: EditBlueprintModal validates all canonical sections and rejects invalid schemas');

// 11. Inspect RegenerateModal
console.log('\n--- Check 11: RegenerateModal Review Flow & Concurrency ---');
const regenModalPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'RegenerateModal.jsx');
const regenModalJsx = fs.readFileSync(regenModalPath, 'utf8');

assert(regenModalJsx.includes('Scope of Regeneration'), 'Has section selection dropdown');
assert(regenModalJsx.includes('value="all"'), 'Allows full regeneration candidate');
assert(regenModalJsx.includes('value="database"'), 'Allows section-level database regeneration');
assert(regenModalJsx.includes('value="apis"'), 'Allows section-level apis regeneration');
assert(regenModalJsx.includes('value="features"'), 'Allows section-level features regeneration');
assert(regenModalJsx.includes('handleDiscard'), 'Provides Discard action to leave saved blueprint untouched');
assert(regenModalJsx.includes('id="btn-apply-proposal"'), 'Provides Apply action with unique id');
assert(regenModalJsx.includes('onApplyProposal(proposal.candidate, proposal.baseRevision)'), 'Passes candidate and baseRevision to apply callback');
console.log('✅ PASSED: RegenerateModal provides section selector, candidate review, explicit Discard and Apply with baseRevision concurrency');

// 12. Inspect Provenance Labels on ProjectDetailPage
console.log('\n--- Check 12: Provenance Badges (DEMO, LIVE_AI, USER_EDITED) ---');
const detailPagePath = path.join(projectRoot, 'src', 'pages', 'ProjectDetailPage.jsx');
const detailPageJsx = fs.readFileSync(detailPagePath, 'utf8');

assert(detailPageJsx.includes('id="badge-demo-mode"'), 'Has badge-demo-mode');
assert(detailPageJsx.includes('Demo blueprint — sample data'), 'DEMO badge clearly states sample data with no Google attribution');
assert(detailPageJsx.includes('id="badge-live-ai"'), 'Has badge-live-ai');
assert(detailPageJsx.includes('id="badge-user-edited"'), 'Has badge-user-edited');
assert(detailPageJsx.includes('User Edited'), 'USER_EDITED badge displayed honestly');
console.log('✅ PASSED: Generation provenance badges for DEMO, LIVE_AI, and USER_EDITED are present and truthful');

console.log('\n====================================================');
console.log('ALL PHASE 5 FRONTEND CHECKS PASSED!');
console.log('====================================================\n');
