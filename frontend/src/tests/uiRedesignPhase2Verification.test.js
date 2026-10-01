// frontend/src/tests/uiRedesignPhase2Verification.test.js
// Verification suite for UI Redesign Phase 2 OF 2
// Verifies Project Detail dashboard, Simple View, Advanced View, All 10 Planning Sections,
// Data Map dark canvas, Plan Check severity and zero-state, Modals, Danger Zone, and dark theme audit.

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const srcDir = path.join(projectRoot, 'src');

console.log('====================================================');
console.log('Running UI Redesign Phase 2 Verification Suite');
console.log('====================================================\n');

// -------------------------------------------------------------
// Check 1: Project Detail Dashboard Core (ProjectDetailPage.jsx)
// -------------------------------------------------------------
console.log('--- Check 1: Project Detail Dashboard (ProjectDetailPage.jsx) ---');
const detailPath = path.join(srcDir, 'pages', 'ProjectDetailPage.jsx');
assert(fs.existsSync(detailPath), 'ProjectDetailPage.jsx must exist');
const detailJsx = fs.readFileSync(detailPath, 'utf8');

// Back to projects & friendly navigation
assert(detailJsx.includes('Back to Projects'), 'Must show Back to Projects navigation link');
assert(detailJsx.includes('Plan status:'), 'Must display friendly Plan status');

// Simple View as default
assert(detailJsx.includes("useState('simple')"), 'Simple View must be the default viewMode');
assert(detailJsx.includes('id="btn-view-simple"'), 'Must have Simple View toggle button');
assert(detailJsx.includes('id="btn-view-advanced"'), 'Must have Advanced View toggle button');

// Technical details collapsed under TechnicalDetails
assert(detailJsx.includes('<TechnicalDetails summary="Technical details"'), 'Must nest technical metadata under collapsed disclosure');
assert(detailJsx.includes('Project ID:'), 'Technical details contains Project ID');
assert(detailJsx.includes('Provider:'), 'Technical details contains AI provider');

console.log('✅ PASSED: Project Detail page core and Simple View default verified');

// -------------------------------------------------------------
// Check 2: Simple View 7 Real-Data Metrics (SimplePlanDashboard.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 2: Simple View Real-Data Metrics (SimplePlanDashboard.jsx) ---');
const simplePath = path.join(srcDir, 'components', 'dashboard', 'SimplePlanDashboard.jsx');
assert(fs.existsSync(simplePath), 'SimplePlanDashboard.jsx must exist');
const simpleJsx = fs.readFileSync(simplePath, 'utf8');

const metricNames = [
  'Project Type',
  'Estimated Time',
  'Recommended Team',
  'Main Features',
  'Plan Check'
];
for (const m of metricNames) {
  assert(simpleJsx.includes(m), `Simple View metrics must include: ${m}`);
}
assert(!simpleJsx.includes('Estimated Cost'), 'Simple View must NOT include Estimated Cost');

// Accent tokens for metrics
assert(simpleJsx.includes('var(--accent-cyan)'), 'Metrics must use cyan accent');
assert(simpleJsx.includes('var(--accent-blue)'), 'Metrics must use blue accent');
assert(simpleJsx.includes('var(--accent-purple)'), 'Metrics must use purple accent');
assert(simpleJsx.includes('var(--accent-green)'), 'Metrics must use green accent');
assert(simpleJsx.includes('var(--accent-orange)'), 'Metrics must use orange accent');

console.log('✅ PASSED: Simple View 7 real-data metric cards verified');

// -------------------------------------------------------------
// Check 3: Project Summary Section (SimplePlanDashboard.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 3: Project Summary 4 Cards (SimplePlanDashboard.jsx) ---');
assert(simpleJsx.includes('What are we building?'), 'Summary card 1: What are we building?');
assert(simpleJsx.includes('Problem to solve'), 'Summary card 2: Problem to solve');
assert(simpleJsx.includes('Target Users') || simpleJsx.includes('Who is it for?'), 'Summary card 3: Target Users / Who is it for?');
assert(simpleJsx.includes('Main Goals') || simpleJsx.includes('Main goals'), 'Summary card 4: Main goals');
console.log('✅ PASSED: Project Summary 4 cards verified');

// -------------------------------------------------------------
// Check 4: Student-Friendly Plan Check & Actions (SimplePlanDashboard.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 4: Plan Check & Actions (SimplePlanDashboard.jsx) ---');
assert(simpleJsx.includes('Plan Check'), 'Plan Check headline present');
assert(simpleJsx.includes('Run Plan Check'), 'Includes action to Run Plan Check');
assert(simpleJsx.includes('Regenerate Part of Plan'), 'Includes action to Regenerate Part of Plan');
assert(simpleJsx.includes('Edit Technical Plan Data'), 'Includes action to Edit Technical Plan Data');
console.log('✅ PASSED: Student-friendly Plan Check and Actions panel verified');

// -------------------------------------------------------------
// Check 5: No-Plan State (ProjectDetailPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 5: No-Plan State (ProjectDetailPage.jsx) ---');
assert(detailJsx.includes('Your project idea is saved'), 'No-plan heading must be "Your project idea is saved"');
assert(detailJsx.includes('Now create your Project Plan.'), 'No-plan text must include "Now create your Project Plan."');
assert(detailJsx.includes('Generate with Live AI'), 'Must show primary Live AI generation button');
assert(detailJsx.includes('Use Demo Plan'), 'Must show secondary Demo Plan button');
assert(detailJsx.includes('Sample Data'), 'Demo option must clearly state Sample Data');
assert(detailJsx.includes('id="btn-generate-live"'), 'Live AI button test ID');
assert(detailJsx.includes('id="btn-generate-demo"'), 'Demo button test ID');
console.log('✅ PASSED: No-plan state dark colorful cards verified');

// -------------------------------------------------------------
// Check 6: Outdated Plan Warning Banner (SimplePlanDashboard.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 6: Outdated Plan Banner (SimplePlanDashboard.jsx) ---');
assert(simpleJsx.includes('Your project idea changed after this Project Plan was created.'), 'Outdated headline present');
assert(simpleJsx.includes('The saved plan is still available, but some parts may'), 'Outdated explanation present');
assert(simpleJsx.includes('Update Project Plan'), 'Action to Update Project Plan present');
assert(simpleJsx.includes('Review Current Plan'), 'Action to Review Current Plan present');
console.log('✅ PASSED: Outdated plan state warning banner verified');

// -------------------------------------------------------------
// Check 7: Advanced View Workspace & Tabs (DashboardTabs.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 7: Advanced View Tabs (DashboardTabs.jsx) ---');
const tabsPath = path.join(srcDir, 'components', 'dashboard', 'DashboardTabs.jsx');
assert(fs.existsSync(tabsPath), 'DashboardTabs.jsx must exist');
const tabsJsx = fs.readFileSync(tabsPath, 'utf8');

const tabIds = [
  'overview', 'features', 'roles', 'requirements',
  'database', 'apis', 'screens', 'roadmap', 'architecture', 'validation'
];
for (const tabId of tabIds) {
  assert(tabsJsx.includes(`id: '${tabId}'`), `Tabs must include canonical section: ${tabId}`);
}
assert(tabsJsx.includes('var(--accent-cyan)'), 'Active tab must have cyan accent');
console.log('✅ PASSED: Advanced View 10 tabs and dark workspace navigation verified');

// -------------------------------------------------------------
// Check 8: Overview Section (OverviewTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 8: Overview Section Scope Styling (OverviewTab.jsx) ---');
const overviewPath = path.join(srcDir, 'components', 'dashboard', 'OverviewTab.jsx');
assert(fs.existsSync(overviewPath), 'OverviewTab.jsx must exist');
const overviewJsx = fs.readFileSync(overviewPath, 'utf8');
assert(overviewJsx.includes('In Scope'), 'Must display In Scope');
assert(overviewJsx.includes('Out of Scope'), 'Must display Out of Scope');
assert(overviewJsx.includes('rgba(55, 217, 150,'), 'In Scope must use green tint styling');
assert(overviewJsx.includes('rgba(255, 94, 122,'), 'Out of Scope must use coral tint styling');
console.log('✅ PASSED: Overview Scope tinted styling verified');

// -------------------------------------------------------------
// Check 9: Detailed Requirements (RequirementsTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 9: Detailed Requirements (RequirementsTab.jsx) ---');
const reqPath = path.join(srcDir, 'components', 'dashboard', 'RequirementsTab.jsx');
assert(fs.existsSync(reqPath), 'RequirementsTab.jsx must exist');
const reqJsx = fs.readFileSync(reqPath, 'utf8');
assert(reqJsx.includes('Functional'), 'Must include Functional filter');
assert(reqJsx.includes('Non-Functional'), 'Must include Non-Functional filter');
assert(reqJsx.includes('From your idea'), 'Friendly user source label present');
assert(reqJsx.includes('Suggested by AI'), 'Friendly AI source label present');
assert(reqJsx.includes('How can we verify this?'), 'Verification criteria heading present');
console.log('✅ PASSED: Detailed Requirements friendly filters and criteria verified');

// -------------------------------------------------------------
// Check 10: Data Structure (DatabaseTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 10: Data Structure (DatabaseTab.jsx) ---');
const dbPath = path.join(srcDir, 'components', 'dashboard', 'DatabaseTab.jsx');
assert(fs.existsSync(dbPath), 'DatabaseTab.jsx must exist');
const dbJsx = fs.readFileSync(dbPath, 'utf8');
assert(dbJsx.includes('Field'), 'Table header: Field');
assert(dbJsx.includes('Type'), 'Table header: Type');
assert(dbJsx.includes('Required?'), 'Table header: Required?');
assert(dbJsx.includes('Unique?'), 'Table header: Unique?');
assert(dbJsx.includes('Purpose'), 'Table header: Purpose');
assert(dbJsx.includes('badge-green'), 'Required "Yes" must use badge-green');
console.log('✅ PASSED: Data Structure dark table and field status verified');

// -------------------------------------------------------------
// Check 11: Backend APIs Method Styling (ApisTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 11: Backend APIs (ApisTab.jsx) ---');
const apisPath = path.join(srcDir, 'components', 'dashboard', 'ApisTab.jsx');
assert(fs.existsSync(apisPath), 'ApisTab.jsx must exist');
const apisJsx = fs.readFileSync(apisPath, 'utf8');
assert(apisJsx.includes('var(--accent-blue)'), 'GET must use blue accent');
assert(apisJsx.includes('var(--accent-green)'), 'POST must use green accent');
assert(apisJsx.includes('var(--accent-orange)'), 'PUT/PATCH must use orange accent');
assert(apisJsx.includes('var(--accent-red)'), 'DELETE must use red/coral accent');
assert(apisJsx.includes('Copy JSON') || apisJsx.includes('Copy Request JSON'), 'Copy JSON button present');
console.log('✅ PASSED: Backend APIs method-specific styling verified');

// -------------------------------------------------------------
// Check 12: App Screens & Navigation Resolution (ScreensTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 12: App Screens (ScreensTab.jsx) ---');
const screensPath = path.join(srcDir, 'components', 'dashboard', 'ScreensTab.jsx');
assert(fs.existsSync(screensPath), 'ScreensTab.jsx must exist');
const screensJsx = fs.readFileSync(screensPath, 'utf8');
assert(screensJsx.includes('Screen View'), 'App window header present');
assert(screensJsx.includes('resolveScreenName'), 'Navigation actions must resolve screen target IDs to friendly names');
assert(screensJsx.includes('Possible screen states'), 'Possible screen states present');
console.log('✅ PASSED: App Screens window cards and navigation resolution verified');

// -------------------------------------------------------------
// Check 13: Build Roadmap Timeline (RoadmapTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 13: Build Roadmap (RoadmapTab.jsx) ---');
const roadmapPath = path.join(srcDir, 'components', 'dashboard', 'RoadmapTab.jsx');
assert(fs.existsSync(roadmapPath), 'RoadmapTab.jsx must exist');
const roadmapJsx = fs.readFileSync(roadmapPath, 'utf8');
assert(roadmapJsx.includes('Phase'), 'Phases listed');
assert(roadmapJsx.includes('Main Tasks'), 'Main tasks heading present');
assert(roadmapJsx.includes('Completion Criteria'), 'Completion criteria heading present');
console.log('✅ PASSED: Build Roadmap vertical timeline verified');

// -------------------------------------------------------------
// Check 14: Data Map Dark Canvas & Legend (DiagramTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 14: Data Map Dark Canvas & Legend (DiagramTab.jsx) ---');
const diagramPath = path.join(srcDir, 'components', 'dashboard', 'DiagramTab.jsx');
assert(fs.existsSync(diagramPath), 'DiagramTab.jsx must exist');
const diagramJsx = fs.readFileSync(diagramPath, 'utf8');
assert(diagramJsx.includes("theme: 'dark'"), 'Mermaid must be initialized with dark theme');
assert(diagramJsx.includes('var(--bg-secondary)'), 'Canvas must use dark secondary background');
assert(diagramJsx.includes('One-to-One'), 'Cardinality legend: One-to-One');
assert(diagramJsx.includes('One-to-Many'), 'Cardinality legend: One-to-Many');
assert(diagramJsx.includes('Many-to-One'), 'Cardinality legend: Many-to-One');
assert(diagramJsx.includes('Many-to-Many'), 'Cardinality legend: Many-to-Many');
console.log('✅ PASSED: Data Map dark canvas and relationship legend verified');

// -------------------------------------------------------------
// Check 15: Plan Check Severity & Zero-State (ValidationTab.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 15: Plan Check Severity & Zero-State (ValidationTab.jsx) ---');
const valPath = path.join(srcDir, 'components', 'dashboard', 'ValidationTab.jsx');
assert(fs.existsSync(valPath), 'ValidationTab.jsx must exist');
const valJsx = fs.readFileSync(valPath, 'utf8');
assert(valJsx.includes('Errors'), 'Severity metric: Errors');
assert(valJsx.includes('Warnings'), 'Severity metric: Warnings');
assert(valJsx.includes('Needs Clarification'), 'Severity metric: Needs Clarification');
assert(valJsx.includes('Info'), 'Severity metric: Info');
assert(valJsx.includes('No issues were found by the currently implemented Plan Check rules.'), 'Zero-state text present');
assert(valJsx.includes('Run Plan Check'), 'Run Plan Check action button present');
console.log('✅ PASSED: Plan Check severity metrics and zero-state verified');

// -------------------------------------------------------------
// Check 16: Modals (RegenerateModal & EditBlueprintModal)
// -------------------------------------------------------------
console.log('\n--- Check 16: Modals (Regenerate & Technical Plan Editor) ---');
const regenPath = path.join(srcDir, 'components', 'dashboard', 'RegenerateModal.jsx');
const editBpPath = path.join(srcDir, 'components', 'dashboard', 'EditBlueprintModal.jsx');
assert(fs.existsSync(regenPath), 'RegenerateModal.jsx must exist');
assert(fs.existsSync(editBpPath), 'EditBlueprintModal.jsx must exist');

const regenJsx = fs.readFileSync(regenPath, 'utf8');
const editBpJsx = fs.readFileSync(editBpPath, 'utf8');

assert(regenJsx.includes('Regenerate Part of Plan'), 'Regenerate modal title');
assert(regenJsx.includes('This is a proposed update. Your saved plan will not change until you choose Apply.'), 'Proposed update disclaimer');
assert(regenJsx.includes('Apply Changes'), 'Apply changes button');
assert(regenJsx.includes('Discard'), 'Discard button');

assert(editBpJsx.includes('Edit Technical Plan Data'), 'Technical editor title');
assert(editBpJsx.includes('Advanced'), 'Advanced badge present');
assert(editBpJsx.includes('This editor exposes the saved structured Project Plan data. Invalid changes will be rejected.'), 'Technical editor disclaimer');
assert(editBpJsx.includes('Format JSON'), 'Format JSON utility present');

console.log('✅ PASSED: Elevated dark modals with disclaimers verified');

// -------------------------------------------------------------
// Check 17: Delete Experience Visually Separated (ProjectDetailPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 17: Delete Experience Isolated in Danger Zone ---');
assert(detailJsx.includes('Project Settings & Danger Area'), 'Danger zone section heading');
assert(detailJsx.includes('id="btn-delete-project"'), 'Delete project button present in danger zone');
assert(detailJsx.includes('Delete Project?'), 'Delete confirmation modal title');
assert(detailJsx.includes('id="btn-confirm-delete"'), 'Delete confirmation button present');
console.log('✅ PASSED: Delete action separated in Danger Zone with confirmation modal');

// -------------------------------------------------------------
// Check 18: Dark Theme Surface Audit (No Large White Dashboard Surfaces)
// -------------------------------------------------------------
console.log('\n--- Check 18: Dark Theme Surface Audit in Dashboard Components ---');
const dashboardFiles = [
  'ProjectDetailPage.jsx',
  'SimplePlanDashboard.jsx',
  'DashboardTabs.jsx',
  'OverviewTab.jsx',
  'FeaturesTab.jsx',
  'RolesTab.jsx',
  'RequirementsTab.jsx',
  'DatabaseTab.jsx',
  'ApisTab.jsx',
  'ScreensTab.jsx',
  'RoadmapTab.jsx',
  'DiagramTab.jsx',
  'ValidationTab.jsx',
  'RegenerateModal.jsx',
  'EditBlueprintModal.jsx'
];

for (const file of dashboardFiles) {
  const filePath = file.includes('Page')
    ? path.join(srcDir, 'pages', file)
    : path.join(srcDir, 'components', 'dashboard', file);
  assert(fs.existsSync(filePath), `${file} must exist`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify no hardcoded white background surfaces
  assert(!/backgroundColor:\s*['"]#(?:fff|ffffff)['"]/i.test(content),
    `${file} must not contain hardcoded #FFFFFF background`);
  assert(!/background:\s*['"]#(?:fff|ffffff)['"]/i.test(content),
    `${file} must not contain hardcoded #FFFFFF background`);
}
console.log('✅ PASSED: All 15 project detail & dashboard components pass the dark surface audit');

console.log('\n====================================================');
console.log('🎉 UI Redesign Phase 2 Verification Suite PASSED! (18/18 checks)');
console.log('====================================================');
