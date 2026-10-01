/**
 * UX Phase 2 Verification Test Suite
 * Tests Beginner Landing Page, Navigation, Terminology, Boundaries, and Accessibility.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  passedChecks++;
}

console.log('====================================================');
console.log('Running UX Phase 2 Landing Page Verification Suite');
console.log('====================================================\n');

// 1. Inspect Route Declarations in App.jsx
console.log('--- Check 1: Route Declarations in App.jsx ---');
const appJsxPath = fs.existsSync(path.join(srcDir, 'app', 'App.jsx'))
  ? path.join(srcDir, 'app', 'App.jsx')
  : path.join(srcDir, 'App.jsx');
const appJsx = fs.readFileSync(appJsxPath, 'utf8');
assert(appJsx.includes('path="/" element={<HomePage />}'), 'Route / maps to HomePage');
assert(appJsx.includes('path="/projects" element={<ProjectListPage />}'), 'Route /projects maps to ProjectListPage');
assert(appJsx.includes('path="/projects/new" element={<ProjectNewPage />}'), 'Route /projects/new maps to ProjectNewPage');
assert(appJsx.includes('path="/projects/:id" element={<ProjectDetailPage />}'), 'Route /projects/:id maps to ProjectDetailPage');
assert(appJsx.includes('path="/health" element={<HealthCheckPage />}'), 'Route /health maps to HealthCheckPage');

// 2. Inspect Navigation Bar in Navbar.jsx
console.log('\n--- Check 2: Navigation Bar in Navbar.jsx ---');
const navbarPath = fs.existsSync(path.join(srcDir, 'components', 'navigation', 'Navbar.jsx'))
  ? path.join(srcDir, 'components', 'navigation', 'Navbar.jsx')
  : path.join(srcDir, 'components', 'Navbar.jsx');
const navbarJsx = fs.readFileSync(navbarPath, 'utf8');
assert(navbarJsx.includes('<Link to="/"'), 'Logo / home link points to /');
assert(navbarJsx.includes('to="/"') && navbarJsx.includes('Home'), 'Home link is present');
assert(navbarJsx.includes('to="/projects"') && navbarJsx.includes('Projects'), 'Projects link is present');
assert(navbarJsx.includes('to="/health"') && navbarJsx.includes('System Status'), 'System Status link is displayed instead of raw Health');
assert(navbarJsx.includes('id="nav-btn-new-project"'), 'New Project action button has accessible id="nav-btn-new-project"');
assert(navbarJsx.includes('+ New Project') || navbarJsx.includes('New Project'), 'New Project CTA text present');

// 3. Inspect Landing Page Structure & Content in HomePage.jsx
console.log('\n--- Check 3: Landing Page Structure & Content in HomePage.jsx ---');
const homePageJsx = fs.readFileSync(path.join(srcDir, 'pages', 'HomePage.jsx'), 'utf8');

// 3a. Hero Section (Phase 3 simplified copy)
assert(homePageJsx.includes('Turn your idea into a') || homePageJsx.includes('Turn your software or hardware') || homePageJsx.includes('Turn your software idea into a'), 'Hero headline is beginner-friendly');
assert(homePageJsx.includes('to="/projects/new"'), 'Primary CTA links to /projects/new');
assert(homePageJsx.includes('to="/projects"'), 'Secondary CTA links to /projects');
assert(homePageJsx.includes('hero-btn-new-project') || homePageJsx.includes('hero-btn-create'), 'Primary hero CTA has accessible id');
assert(homePageJsx.includes('hero-btn-my-projects') || homePageJsx.includes('hero-btn-projects'), 'Secondary hero CTA has accessible id');

// 3b. Phase 3: Domain Type Cards (replaces old verbose sections)
assert(homePageJsx.includes('SOFTWARE'), 'Domain card: SOFTWARE present');
assert(homePageJsx.includes('HARDWARE'), 'Domain card: HARDWARE present');
assert(homePageJsx.includes('HYBRID'), 'Domain card: HYBRID present');
assert(homePageJsx.includes('card-btn-software') || homePageJsx.includes('Start Software Project'), 'Software card action present');
assert(homePageJsx.includes('card-btn-hardware') || homePageJsx.includes('Start Hardware Project'), 'Hardware card action present');
assert(homePageJsx.includes('card-btn-hybrid') || homePageJsx.includes('Start Hybrid Project'), 'Hybrid card action present');

// 3c. Final CTA
assert(homePageJsx.includes('Create New Project') || homePageJsx.includes('cta-btn-create'), 'Final CTA present');

// Note: Phase 3 intentionally removed verbose sections (3-step flow, prepared outputs,
// product boundary, example plan, getting started guide) to reduce information overload.

// 4. Accessibility: Heading Hierarchy & Non-Jargon
console.log('\n--- Check 4: Accessibility & Plain Language ---');
const h1Count = (homePageJsx.match(/<h1[\s>]/g) || []).length;
assert(h1Count === 1, `Exactly one semantic <h1> element present on page (found ${h1Count})`);

// Jargon check in HomePage
const forbiddenJargon = [
  'canonical blueprint',
  'schema contract',
  'optimistic concurrency',
  'revision-controlled project aggregate',
  'roleIds',
  'featureIds',
  'needsApi',
  'needsUi',
  'needsPersistence'
];
for (const jargon of forbiddenJargon) {
  assert(!homePageJsx.includes(jargon), `Jargon term "${jargon}" is not exposed on HomePage`);
}

// 5. Example pre-fill integration in ProjectNewPage
console.log('\n--- Check 5: Example Integration in ProjectNewPage.jsx ---');
const projectNewJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectNewPage.jsx'), 'utf8');
assert(projectNewJsx.includes('isExampleRequested'), 'ProjectNewPage detects ?example=true query param to pre-fill example');

console.log('\n====================================================');
console.log(`UX PHASE 2 VERIFICATION RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED!`);
console.log('====================================================\n');
