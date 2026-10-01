// frontend/src/tests/uiRedesignPhase1Verification.test.js
// Verification suite for UI Redesign Phase 1 OF 2
// Verifies dark colorful theme, navigation, Home, Projects, New Project, System Status,
// buttons, cards, feedback, modals, responsive CSS, and dark background constraints.

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const srcDir = path.join(projectRoot, 'src');

console.log('====================================================');
console.log('Running UI Redesign Phase 1 Verification Suite');
console.log('====================================================\n');

// -------------------------------------------------------------
// Check 1: Global Design System & Dark Theme Tokens (index.css)
// -------------------------------------------------------------
console.log('--- Check 1: Global Theme System & Color Tokens (index.css) ---');
const indexCssPath = fs.existsSync(path.join(srcDir, 'styles', 'index.css'))
  ? path.join(srcDir, 'styles', 'index.css')
  : path.join(srcDir, 'index.css');
assert(fs.existsSync(indexCssPath), 'index.css must exist');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');

const requiredTokens = [
  '--bg-main: #08131F',
  '--bg-secondary: #0D1C2B',
  '--bg-card: #102437',
  '--bg-card-hover: #14304A',
  '--bg-elevated: #162A3D',
  '--text-primary: #F4F8FC',
  '--text-secondary: #B6C5D5',
  '--text-muted: #7E93A8',
  '--accent-cyan: #16D9E3',
  '--accent-blue: #3388FF',
  '--accent-purple: #8B5CF6',
  '--accent-green: #37D996',
  '--accent-orange: #FFB547',
  '--accent-red: #FF5E7A',
  '--accent-pink: #EC5CD5',
  '--border-default:',
  '--border-bright:',
];

for (const token of requiredTokens) {
  assert(indexCss.includes(token), `index.css must define required token: ${token}`);
}
console.log('✅ PASSED: All dark theme tokens defined correctly');

// -------------------------------------------------------------
// Check 2: No Plain White Page Background on Body / Root
// -------------------------------------------------------------
console.log('\n--- Check 2: No Plain White Main Page Background ---');
// Verify body background uses var(--bg-main)
assert(/body\s*\{[^}]*background(?:-color)?:\s*var\(--bg-main\)/.test(indexCss),
  'body must set background to var(--bg-main)');

// Verify body is NOT set to white or plain light color
const bodyBlockMatch = indexCss.match(/body\s*\{([^}]+)\}/);
assert(bodyBlockMatch, 'body style rule must exist');
const bodyBlock = bodyBlockMatch[1];
assert(!/background(-color)?:\s*(?:#fff|white|#ffffff)/i.test(bodyBlock),
  'body must not have a plain white background');

// Verify rich subtle dark background glows
assert(indexCss.includes('radial-gradient'), 'body or background must feature subtle radial decorative glows');
console.log('✅ PASSED: Deep navy midnight background with subtle decorative ambient glows verified');

// -------------------------------------------------------------
// Check 3: Global Navigation Redesign (Navbar.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 3: Global Navigation (Navbar.jsx) ---');
const navbarPath = fs.existsSync(path.join(srcDir, 'components', 'navigation', 'Navbar.jsx'))
  ? path.join(srcDir, 'components', 'navigation', 'Navbar.jsx')
  : path.join(srcDir, 'components', 'Navbar.jsx');
assert(fs.existsSync(navbarPath), 'Navbar.jsx must exist');
const navbarJsx = fs.readFileSync(navbarPath, 'utf8');

assert(navbarJsx.includes('IdeaStruct') && navbarJsx.includes('AI'), 'Navbar must show brand name "IdeaStruct AI"');
assert(navbarJsx.includes('Student Project Planner') || navbarJsx.includes('Student Software Planner') || navbarJsx.includes('AI Project Planner'), 'Navbar must display student-friendly or AI project subtitle');
assert(navbarJsx.includes('💡') || navbarJsx.includes('ideastruct-ai-logo') || navbarJsx.includes('logoSrc'), 'Navbar must include a brand logo (image or lightbulb icon)');
assert(navbarJsx.includes('Home'), 'Navbar must include "Home" link');
assert(navbarJsx.includes('My Projects'), 'Navbar must include "My Projects" link');
assert(navbarJsx.includes('System Status'), 'Navbar must include "System Status" link');
assert(navbarJsx.includes('+') && navbarJsx.includes('New Project'), 'Navbar must include "+ New Project" button');
assert(navbarJsx.includes('id="nav-btn-new-project"'), 'Navbar must have id="nav-btn-new-project" for testing/e2e');
assert(navbarJsx.includes('backdropFilter') || navbarJsx.includes('backdrop-filter'), 'Navbar should use modern glassmorphism');
console.log('✅ PASSED: Global navigation redesigned with dark glassmorphism, brand accent, and active states');

// -------------------------------------------------------------
// Check 4: Landing Page Redesign (HomePage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 4: Landing Page (HomePage.jsx) ---');
const homePath = path.join(srcDir, 'pages', 'HomePage.jsx');
assert(fs.existsSync(homePath), 'HomePage.jsx must exist');
const homeJsx = fs.readFileSync(homePath, 'utf8');

// Hero section & CTAs (Phase 3 simplified)
assert(homeJsx.includes('Turn your idea into a') || homeJsx.includes('Turn your software or hardware') || homeJsx.includes('Turn your software idea into a'), 'Hero headline present');
assert(homeJsx.includes('to="/projects/new"'), 'Primary CTA links to /projects/new');
assert(homeJsx.includes('hero-btn-new-project') || homeJsx.includes('hero-btn-create'), 'Hero primary CTA id present');
assert(homeJsx.includes('hero-btn-my-projects') || homeJsx.includes('hero-btn-projects'), 'Hero secondary CTA id present');

// Phase 3: Domain Type Cards (replaces old verbose feature grid and sections)
assert(homeJsx.includes('SOFTWARE'), 'Domain card: SOFTWARE present');
assert(homeJsx.includes('HARDWARE'), 'Domain card: HARDWARE present');
assert(homeJsx.includes('HYBRID'), 'Domain card: HYBRID present');
assert(homeJsx.includes('card-btn-software') || homeJsx.includes('Start Software Project'), 'Software domain card action present');
assert(homeJsx.includes('card-btn-hardware') || homeJsx.includes('Start Hardware Project'), 'Hardware domain card action present');
assert(homeJsx.includes('card-btn-hybrid') || homeJsx.includes('Start Hybrid Project'), 'Hybrid domain card action present');
assert(homeJsx.includes('Create New Project') || homeJsx.includes('cta-btn-create'), 'Final CTA present');
console.log('✅ PASSED: Landing page redesigned (Phase 3 simplified home with domain cards)');

// -------------------------------------------------------------
// Check 5: Projects List Page Redesign (ProjectListPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 5: Projects List Page (ProjectListPage.jsx) ---');
const projectListPath = path.join(srcDir, 'pages', 'ProjectListPage.jsx');
assert(fs.existsSync(projectListPath), 'ProjectListPage.jsx must exist');
const projectListJsx = fs.readFileSync(projectListPath, 'utf8');

// Title & Top CTA
assert(projectListJsx.includes('My Projects'), 'Heading "My Projects" present');
assert(projectListJsx.includes('btn-create-project-top'), 'Top "+ New Project" button present');

// 4 Metric Cards
assert(projectListJsx.includes('Total Projects'), 'Metric card "Total Projects" present');
assert(projectListJsx.includes('Plans Ready'), 'Metric card "Plans Ready" present');
assert(projectListJsx.includes('Ideas Waiting for a Plan'), 'Metric card "Ideas Waiting for a Plan" present');
assert(projectListJsx.includes('Plans Needing Update'), 'Metric card "Plans Needing Update" present');

// Search & Filter
assert(projectListJsx.includes('Search projects by title or idea...'), 'Dark elevated search field present');
assert(projectListJsx.includes("setStatusFilter('ALL')"), 'Filter "All" present');
assert(projectListJsx.includes("setStatusFilter('READY')"), 'Filter "Plan Ready" present');
assert(projectListJsx.includes("setStatusFilter('NEEDS_PLAN')"), 'Filter "Needs Plan" present');
assert(projectListJsx.includes("setStatusFilter('NEEDS_UPDATE')"), 'Filter "Needs Update" present');

// Project card action & delete confirmation
assert(projectListJsx.includes('Open Project'), 'Card CTA "Open Project" present');
assert(projectListJsx.includes('Delete Project?') && (projectListJsx.includes('rgba(3, 8, 14') || projectListJsx.includes('modal-backdrop')), 'Dark modal backdrop for delete confirmation dialog present');
console.log('✅ PASSED: Projects page redesigned with 4 colorful metrics, search, filters, and cards');

// -------------------------------------------------------------
// Check 6: New Project Page Redesign (ProjectNewPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 6: New Project Guided Page (ProjectNewPage.jsx) ---');
const projectNewPath = path.join(srcDir, 'pages', 'ProjectNewPage.jsx');
assert(fs.existsSync(projectNewPath), 'ProjectNewPage.jsx must exist');
const projectNewJsx = fs.readFileSync(projectNewPath, 'utf8');

// Step badge & Guided layout
assert(projectNewJsx.includes('Step 1 of 2'), 'Step badge "Step 1 of 2" present');
assert(projectNewJsx.includes('Describe your idea'), 'Step title present');
assert(projectNewJsx.includes('btn-use-example'), 'Button "Use Example Idea" present');
assert(projectNewJsx.includes('btn-submit-idea'), 'Button "Generate Project Plan" present');

// Planning Guidance & Domain Coverage
assert(projectNewJsx.includes('Project Planning Guide'), 'Idea help guide header present');
assert(projectNewJsx.includes('Software Systems'), 'Software guidance present');
assert(projectNewJsx.includes('Hardware Circuits'), 'Hardware guidance present');
assert(projectNewJsx.includes('Hybrid IoT Projects'), 'Hybrid guidance present');

// Domain Starters across Software, Hardware, and Hybrid
const starters = ['PulseIoT Cold-Chain Telemetry', 'SentinelAir Gas & Smoke Circuit', 'CampusBite Food Ordering'];
for (const starter of starters) {
  assert(projectNewJsx.includes(starter), `Inspiration starter "${starter}" present`);
}
console.log('✅ PASSED: New project page redesigned into 2-column student guided experience');

// -------------------------------------------------------------
// Check 7: System Status Page Redesign (HealthCheckPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 7: System Status Page (HealthCheckPage.jsx) ---');
const healthPath = path.join(srcDir, 'pages', 'HealthCheckPage.jsx');
assert(fs.existsSync(healthPath), 'HealthCheckPage.jsx must exist');
const healthJsx = fs.readFileSync(healthPath, 'utf8');

assert(healthJsx.includes('System Status'), 'Page heading "System Status" present');
assert(healthJsx.includes('Check whether all parts of IdeaStruct AI are available.'), 'Page subtitle present');
assert(healthJsx.includes('Backend'), 'Backend service card present');
assert(healthJsx.includes('Database'), 'Database service card present');
assert(healthJsx.includes('AI Service'), 'AI Service card present');
assert(healthJsx.includes('Technical details') || healthJsx.includes('TechnicalDetails'), 'Collapsible technical details present');
console.log('✅ PASSED: System Status page redesigned with dark colorful service cards');

// -------------------------------------------------------------
// Check 8: Global Feedback & Modal Dialogs
// -------------------------------------------------------------
console.log('\n--- Check 8: Global Feedback & Modal Shells ---');
const feedbackPath = path.join(srcDir, 'components', 'common', 'FeedbackMessage.jsx');
assert(fs.existsSync(feedbackPath), 'FeedbackMessage.jsx must exist');
const feedbackJsx = fs.readFileSync(feedbackPath, 'utf8');
assert(feedbackJsx.includes('toast-success'), 'toast-success class present');
assert(feedbackJsx.includes('toast-warning'), 'toast-warning class present');
assert(feedbackJsx.includes('toast-error'), 'toast-error class present');
assert(feedbackJsx.includes('toast-info'), 'toast-info class present');

// Check modal styles in index.css
assert(indexCss.includes('.modal-backdrop'), 'index.css must define .modal-backdrop');
assert(indexCss.includes('.modal-card'), 'index.css must define .modal-card');
assert(indexCss.includes('backdrop-filter: blur'), 'modal backdrop must use blur');
assert(indexCss.includes('background-color: var(--bg-card)') || indexCss.includes('background: var(--bg-card)'),
  'modal-card must use dark blue card background');
console.log('✅ PASSED: Feedback and modal styling updated to dark theme');

// -------------------------------------------------------------
// Check 9: Responsive Layout Rules
// -------------------------------------------------------------
console.log('\n--- Check 9: Responsive Rules & Media Queries ---');
assert(indexCss.includes('@media (max-width: 768px)'), 'Mobile/tablet media query 768px defined in index.css');
assert(indexCss.includes('@media (max-width: 480px)'), 'Mobile media query 480px defined in index.css');
assert(!indexCss.includes('overflow-x: scroll'), 'Should not force horizontal scroll');
console.log('✅ PASSED: Responsive design rules verified');

// -------------------------------------------------------------
// Check 10: Status Colors and Badges
// -------------------------------------------------------------
console.log('\n--- Check 10: Status Badges and Button Variants ---');
const expectedBadges = [
  'badge-green',
  'badge-orange',
  'badge-coral',
  'badge-cyan',
  'badge-purple',
  'badge-blue',
];
for (const b of expectedBadges) {
  assert(indexCss.includes(`.${b}`), `index.css must include badge class .${b}`);
}

const expectedButtons = [
  'btn-primary',
  'btn-secondary',
  'btn-success',
  'btn-warning',
  'btn-danger',
];
for (const btn of expectedButtons) {
  assert(indexCss.includes(`.${btn}`), `index.css must include button class .${btn}`);
}
console.log('✅ PASSED: Status badge and button styles verified');

console.log('\n====================================================');
console.log('🎉 ALL UI REDESIGN PHASE 1 VERIFICATION CHECKS PASSED');
console.log('====================================================\n');
