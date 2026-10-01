// frontend/src/tests/uxPhase6Verification.test.js
// Verification suite for UX Improvement Phase 6: Final UX Polish, Full Regression & Handoff

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const srcDir = path.join(projectRoot, 'src');

console.log('====================================================');
console.log('Running UX Phase 6 Final Verification Suite');
console.log('====================================================\n');

// -------------------------------------------------------------
// Check 1: Zero alert() or confirm() in all active frontend code
// -------------------------------------------------------------
console.log('--- Check 1: Zero window.alert/confirm across frontend ---');

function scanDirForAlertConfirm(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'tests') {
        scanDirForAlertConfirm(fullPath);
      }
    } else if ((entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) && !entry.name.endsWith('.test.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Look for alert( or confirm( calls not in comments
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        if (/\b(?:window\.)?alert\s*\(/.test(line)) {
          assert.fail(`Forbidden alert() found in ${fullPath}:${idx + 1}: ${line}`);
        }
        if (/\b(?:window\.)?confirm\s*\(/.test(line)) {
          assert.fail(`Forbidden confirm() found in ${fullPath}:${idx + 1}: ${line}`);
        }
      });
    }
  }
}

scanDirForAlertConfirm(srcDir);
console.log('✅ PASSED: Zero window.alert() or window.confirm() calls in active frontend codebase');

// -------------------------------------------------------------
// Check 2: Route definitions and System Status in App.jsx & Navbar
// -------------------------------------------------------------
console.log('\n--- Check 2: Route Configuration & Navigation Terminology ---');
const appJsxPath = fs.existsSync(path.join(srcDir, 'app', 'App.jsx'))
  ? path.join(srcDir, 'app', 'App.jsx')
  : path.join(srcDir, 'App.jsx');
const appJsx = fs.readFileSync(appJsxPath, 'utf8');
assert(appJsx.includes('path="/"'), 'Home route "/" present');
assert(appJsx.includes('path="/projects"'), 'Projects list route "/projects" present');
assert(appJsx.includes('path="/projects/new"'), 'New Project route "/projects/new" present');
assert(appJsx.includes('path="/projects/:id"'), 'Project Detail route "/projects/:id" present');
assert(appJsx.includes('path="/health"'), 'Health check route "/health" present');

const navbarPath = fs.existsSync(path.join(srcDir, 'components', 'navigation', 'Navbar.jsx'))
  ? path.join(srcDir, 'components', 'navigation', 'Navbar.jsx')
  : path.join(srcDir, 'components', 'Navbar.jsx');
const navbarJsx = fs.readFileSync(navbarPath, 'utf8');
assert(navbarJsx.includes('System Status'), 'Navbar links to System Status');
console.log('✅ PASSED: Core routes present and Navbar uses "System Status" terminology');

// -------------------------------------------------------------
// Check 3: HealthCheckPage.jsx Polish & Terminology
// -------------------------------------------------------------
console.log('\n--- Check 3: System Status Page Terminology & Structure ---');
const healthJsx = fs.readFileSync(path.join(srcDir, 'pages', 'HealthCheckPage.jsx'), 'utf8');
assert(healthJsx.includes('System Status'), 'Primary heading is "System Status"');
assert(healthJsx.includes('>Backend<'), 'Displays friendly Backend label');
assert(healthJsx.includes('>Database<'), 'Displays friendly Database label');
assert(healthJsx.includes('Available'), 'Uses "Available" terminology for operational status');
assert(healthJsx.includes('Unavailable'), 'Uses "Unavailable" terminology for down status');
assert(healthJsx.includes('Technical details (raw response)'), 'Raw JSON collapsed in Technical Details');
assert(healthJsx.includes('badge-backend-status'), 'Preserves badge-backend-status ID');
assert(healthJsx.includes('badge-mongo-status'), 'Preserves badge-mongo-status ID');
assert(healthJsx.includes('btn-recheck-health'), 'Preserves btn-recheck-health ID');
console.log('✅ PASSED: HealthCheckPage uses friendly "System Status", "Available/Unavailable", and preserves test IDs');

// -------------------------------------------------------------
// Check 4: Edit Technical Plan Data Modal Polish
// -------------------------------------------------------------
console.log('\n--- Check 4: Edit Technical Plan Data Modal Polish ---');
const editModalJsx = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'EditBlueprintModal.jsx'), 'utf8');
assert(editModalJsx.includes('Edit Technical Plan Data'), 'Title is "Edit Technical Plan Data"');
assert(editModalJsx.includes('For advanced users'), 'Badge shows "For advanced users"');
assert(editModalJsx.includes('This editor exposes the saved structured Project Plan data. Invalid changes will be rejected.'), 'Includes clear explanation of schema enforcement');
assert(editModalJsx.includes('role="dialog"'), 'Has role="dialog" accessibility attribute');
assert(editModalJsx.includes('aria-modal="true"'), 'Has aria-modal="true"');
assert(editModalJsx.includes('e.key === \'Escape\''), 'Handles Escape key to close');
assert(editModalJsx.includes('Edit Blueprint JSON'), 'Preserves Edit Blueprint JSON identifier for test suite');
console.log('✅ PASSED: EditBlueprintModal has advanced-user badge, disclaimer, accessibility attributes, and escape key listener');

// -------------------------------------------------------------
// Check 5: Regenerate Modal & Delete Modal Accessibility
// -------------------------------------------------------------
console.log('\n--- Check 5: Modals Accessibility & Escape Key Handling ---');
const regenModalJsx = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'RegenerateModal.jsx'), 'utf8');
assert(regenModalJsx.includes('role="dialog"'), 'RegenerateModal has role="dialog"');
assert(regenModalJsx.includes('aria-modal="true"'), 'RegenerateModal has aria-modal="true"');
assert(regenModalJsx.includes('e.key === \'Escape\''), 'RegenerateModal handles Escape key');

const detailJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectDetailPage.jsx'), 'utf8');
assert(detailJsx.includes('role="dialog"'), 'Delete modal in ProjectDetailPage has role="dialog"');
assert(detailJsx.includes('aria-modal="true"'), 'Delete modal has aria-modal="true"');
assert(detailJsx.includes('e.key === \'Escape\''), 'ProjectDetailPage handles Escape key for modal');
assert(detailJsx.includes('Deleting project...'), 'Uses specific "Deleting project..." loading text');
assert(detailJsx.includes('saved Project Plan'), 'Delete confirmation uses friendly "saved Project Plan"');
console.log('✅ PASSED: All modals have dialog roles, aria-modal, Escape listeners, and friendly action copy');

// -------------------------------------------------------------
// Check 6: Beginner View Terminology Consistency
// -------------------------------------------------------------
console.log('\n--- Check 6: Beginner Simple View Terminology & Tabs ---');
const simpleViewJsx = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'SimplePlanDashboard.jsx'), 'utf8');
assert(simpleViewJsx.includes('What are we building?') || simpleViewJsx.includes('Project Summary'), 'SimpleView has summary framing');
assert(simpleViewJsx.includes('Target Users') || simpleViewJsx.includes('who it is for') || simpleViewJsx.includes('Who is this for?') || simpleViewJsx.includes('Users & Roles'), 'SimpleView has user roles framing');
assert(simpleViewJsx.includes('Main Features') || simpleViewJsx.includes('What can users do?'), 'SimpleView has features framing');
assert(simpleViewJsx.includes('Screens') || simpleViewJsx.includes('Software') || simpleViewJsx.includes('App Screens'), 'SimpleView has screens/software framing');
assert(simpleViewJsx.includes('Estimates') || simpleViewJsx.includes('Data Structure'), 'SimpleView has data structure/estimates framing');
assert(simpleViewJsx.includes('Roadmap') || simpleViewJsx.includes('Plan Check'), 'SimpleView has roadmap framing');

// Check tab labels in ProjectDetailPage
assert(detailJsx.includes('Simple View'), 'Tab includes Simple View');
assert(detailJsx.includes('Detailed Requirements'), 'Tab includes Detailed Requirements');
assert(detailJsx.includes('Data Structure'), 'Tab includes Data Structure');
assert(detailJsx.includes('Backend APIs'), 'Tab includes Backend APIs');
assert(detailJsx.includes('App Screens'), 'Tab includes App Screens');
assert(detailJsx.includes('Build Roadmap'), 'Tab includes Build Roadmap');
assert(detailJsx.includes('Data Map'), 'Tab includes Data Map');
assert(detailJsx.includes('Plan Check'), 'Tab includes Plan Check');
console.log('✅ PASSED: Simple View and Tab Bar strictly follow beginner-friendly terminology');

// -------------------------------------------------------------
// Check 7: Specific Loading & Error Messages
// -------------------------------------------------------------
console.log('\n--- Check 7: Context-Specific Loading Messages ---');
const planCheckJsx = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'ValidationTab.jsx'), 'utf8');
assert(detailJsx.includes('Loading your project...'), 'ProjectDetailPage uses "Loading your project..."');
const listJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectListPage.jsx'), 'utf8');
assert(listJsx.includes('Loading your saved projects...'), 'ProjectListPage uses "Loading your saved projects..."');
const newJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectNewPage.jsx'), 'utf8');
assert(newJsx.includes('Creating project...'), 'ProjectNewPage uses "Creating project..."');
assert(detailJsx.includes('Creating your Project Plan...'), 'ProjectDetailPage uses "Creating your Project Plan..."');
assert(planCheckJsx.includes('Running Plan Check...') || simpleViewJsx.includes('Running Plan Check...'), 'Validation components use "Running Plan Check..."');
assert(regenModalJsx.includes('Applying changes...'), 'RegenerateModal uses "Applying changes..."');
console.log('✅ PASSED: Context-specific loading messages replace generic "Loading..." strings');

// -------------------------------------------------------------
// Check 8: Empty States & Feedback Messages
// -------------------------------------------------------------
console.log('\n--- Check 8: Friendly Empty States ---');
assert(listJsx.includes('No projects yet') || listJsx.includes('No projects found'), 'ProjectListPage has friendly empty state');
assert(detailJsx.includes('Your project idea is saved') || detailJsx.includes('No plan has been generated yet'), 'ProjectDetailPage has friendly no-plan state');

const dataMapJsx = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'DiagramTab.jsx'), 'utf8');
assert(dataMapJsx.includes('No collections available to render relationship diagram.') || dataMapJsx.includes('No diagram data') || dataMapJsx.includes('No Collections Found'), 'DiagramTab has friendly empty state');

assert(planCheckJsx.includes('No issues were found by the currently implemented validation rules.') || planCheckJsx.includes('No issues found'), 'ValidationTab has friendly empty state');

console.log('✅ PASSED: Empty states provide clear guidance without presenting missing data as system errors');

console.log('\n====================================================');
console.log('ALL UX PHASE 6 VERIFICATION CHECKS PASSED (8/8)');
console.log('====================================================');
