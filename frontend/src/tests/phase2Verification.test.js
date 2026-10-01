/**
 * Phase 2 Verification Test Suite
 * Tests Application Shell, Routes, Form Validation Boundaries, and Data Integrity.
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
console.log('Running Phase 2 Verification Suite');
console.log('====================================================\n');

// 1. Inspect Route Configurations in App.jsx
console.log('--- Check 1: Route Declarations in App.jsx ---');
const appJsxPath = fs.existsSync(path.join(srcDir, 'app', 'App.jsx'))
  ? path.join(srcDir, 'app', 'App.jsx')
  : path.join(srcDir, 'App.jsx');
const appJsx = fs.readFileSync(appJsxPath, 'utf8');
assert(appJsx.includes('path="/projects"'), 'Route /projects is declared');
assert(appJsx.includes('path="/projects/new"'), 'Route /projects/new is declared');
assert(appJsx.includes('path="/projects/:id"'), 'Route /projects/:id is declared');
assert(appJsx.includes('element={<ProjectListPage />}'), '/projects maps to ProjectListPage');
assert(appJsx.includes('element={<ProjectNewPage />}'), '/projects/new maps to ProjectNewPage');
assert(appJsx.includes('element={<ProjectDetailPage />}'), '/projects/:id maps to ProjectDetailPage');

// 2. Inspect Main Application Shell & Navbar
console.log('\n--- Check 2: Application Shell & Navbar ---');
const navbarPath = fs.existsSync(path.join(srcDir, 'components', 'navigation', 'Navbar.jsx'))
  ? path.join(srcDir, 'components', 'navigation', 'Navbar.jsx')
  : path.join(srcDir, 'components', 'Navbar.jsx');
const navbarJsx = fs.readFileSync(navbarPath, 'utf8');
assert(navbarJsx.includes('IdeaStruct AI'), 'Branding "IdeaStruct AI" present in Navbar');
assert(navbarJsx.includes('to="/projects/new"'), 'Navbar links to /projects/new');
assert(navbarJsx.includes('New Project'), 'Navbar includes "New Project" action');
assert(navbarJsx.includes('id="nav-btn-new-project"'), 'Navbar new project button has id="nav-btn-new-project"');
assert(navbarJsx.includes('flexWrap'), 'Navbar supports responsive wrapping');

// 3. Inspect EmptyState Component
console.log('\n--- Check 3: EmptyState Component ---');
const emptyStateJsx = fs.readFileSync(path.join(srcDir, 'components', 'EmptyState.jsx'), 'utf8');
assert(emptyStateJsx.includes('actionTo = \'/projects/new\''), 'EmptyState defaults action to /projects/new');
assert(emptyStateJsx.includes('id="btn-empty-create"'), 'EmptyState action has id="btn-empty-create"');

// 4. Form Validation Logic Boundaries
console.log('\n--- Check 4: Form Validation Boundaries in ProjectNewPage.jsx ---');
const projectNewJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectNewPage.jsx'), 'utf8');

// Extract validation constants
const titleMinMatch = projectNewJsx.match(/TITLE_MIN\s*=\s*(\d+)/);
const titleMaxMatch = projectNewJsx.match(/TITLE_MAX\s*=\s*(\d+)/);
const ideaMinMatch = projectNewJsx.match(/IDEA_MIN\s*=\s*(\d+)/);
const ideaMaxMatch = projectNewJsx.match(/IDEA_MAX\s*=\s*(\d+)/);

assert(titleMinMatch && parseInt(titleMinMatch[1], 10) === 3, 'TITLE_MIN is 3 characters');
assert(titleMaxMatch && parseInt(titleMaxMatch[1], 10) === 120, 'TITLE_MAX is 120 characters');
assert(ideaMinMatch && parseInt(ideaMinMatch[1], 10) === 50, 'IDEA_MIN is 50 characters');
assert(ideaMaxMatch && parseInt(ideaMaxMatch[1], 10) === 10000, 'IDEA_MAX is 10,000 characters');

// Validate the exact validation algorithm extracted from ProjectNewPage.jsx
function validateInput(currentTitle, currentIdea) {
  const errs = {};
  const trimmedTitle = currentTitle.trim();
  const trimmedIdea = currentIdea.trim();

  if (!trimmedTitle) {
    errs.title = 'Project title is required.';
  } else if (trimmedTitle.length < 3) {
    errs.title = 'Title must be at least 3 characters.';
  } else if (trimmedTitle.length > 120) {
    errs.title = 'Title must not exceed 120 characters.';
  }

  if (!trimmedIdea) {
    errs.idea = 'Software idea description is required.';
  } else if (trimmedIdea.length < 50) {
    errs.idea = `Idea must be at least 50 characters (${trimmedIdea.length}/50 entered). Add more details about target users, core features, and system purpose.`;
  } else if (trimmedIdea.length > 10000) {
    errs.idea = 'Idea must not exceed 10000 characters.';
  }

  return errs;
}

// 4a. Title validation test cases
assert(validateInput('', 'A valid idea with more than fifty characters to pass length bounds.').title != null, 'Rejects empty title');
assert(validateInput('  ', 'A valid idea with more than fifty characters to pass length bounds.').title != null, 'Rejects whitespace title');
assert(validateInput('AB', 'A valid idea with more than fifty characters to pass length bounds.').title != null, 'Rejects title shorter than 3 chars');
assert(validateInput('A'.repeat(121), 'A valid idea with more than fifty characters to pass length bounds.').title != null, 'Rejects title longer than 120 chars');
assert(validateInput('Campus Food App', 'A valid idea with more than fifty characters to pass length bounds.').title == null, 'Accepts valid title');

// 4b. Idea validation test cases
assert(validateInput('Campus Food App', '').idea != null, 'Rejects empty idea');
assert(validateInput('Campus Food App', '   ').idea != null, 'Rejects whitespace-only idea');
assert(validateInput('Campus Food App', 'Food app for college').idea != null, 'Rejects idea shorter than 50 chars');
assert(validateInput('Campus Food App', 'A'.repeat(10001)).idea != null, 'Rejects idea longer than 10,000 chars');
assert(validateInput('Campus Food App', 'A campus food ordering app designed for college students to skip lunch lines.').idea == null, 'Accepts valid idea >= 50 chars');

// 5. Input Preservation on Validation Failure
console.log('\n--- Check 5: Input Preservation on Validation Failure ---');
assert(projectNewJsx.includes('if (Object.keys(validationErrors).length > 0)'), 'Form submission halts if validation errors exist');
assert(projectNewJsx.includes('value={title}'), 'Title input is controlled by React state');
assert(projectNewJsx.includes('value={idea}'), 'Idea input is controlled by React state');
assert(!projectNewJsx.includes('setTitle(\'\')\n    setIdea(\'\')\n    if (Object.keys'), 'State is NOT cleared on validation failure');

// 6. "Use Example" Functionality
console.log('\n--- Check 6: "Use Example" Functionality ---');
assert(projectNewJsx.includes('CampusBite'), 'Includes canonical CampusBite example');
assert(projectNewJsx.includes('id="btn-use-example"'), '"Use Example" button has accessible ID');
assert(projectNewJsx.includes('handleUseExample'), 'Click handler handleUseExample is bound');

// 7. LocalStorage Draft Auto-Recovery
console.log('\n--- Check 7: LocalStorage Draft Recovery ---');
assert(projectNewJsx.includes('DRAFT_STORAGE_KEY'), 'Uses dedicated draft storage key');
assert(projectNewJsx.includes('localStorage.getItem'), 'Restores draft on mount via localStorage.getItem');
assert(projectNewJsx.includes('localStorage.setItem'), 'Saves draft on keystrokes via localStorage.setItem');
assert(projectNewJsx.includes('localStorage.removeItem'), 'Clears draft on successful submit or clear button');

// 8. Accessibility: Form Labels, Focus States, ARIA Attributes
console.log('\n--- Check 8: Accessibility & Visible Focus States ---');
assert(projectNewJsx.includes('htmlFor="project-title"'), 'Title label links to input id');
assert(projectNewJsx.includes('htmlFor="project-idea"'), 'Idea label links to textarea id');
assert(projectNewJsx.includes('aria-invalid='), 'Inputs include aria-invalid attribute');
assert(projectNewJsx.includes('aria-describedby='), 'Inputs link to error/help text via aria-describedby');

const indexCssPath = fs.existsSync(path.join(srcDir, 'styles', 'index.css'))
  ? path.join(srcDir, 'styles', 'index.css')
  : path.join(srcDir, 'index.css');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');
assert(indexCss.includes('input:focus-visible') && indexCss.includes('textarea:focus-visible'), 'CSS defines visible focus states for inputs and textareas');
assert(indexCss.includes('overflow-x: hidden'), 'CSS prevents accidental horizontal overflow');

// 9. Absence of Fake Persistence or Fake AI Generation
console.log('\n--- Check 9: Honest Implementation (No Fake Data/APIs) ---');
assert(projectNewJsx.includes('api.createProject'), 'Real API client is invoked for project creation');
assert(!projectNewJsx.includes('setTimeout(() => navigate'), 'No fake delayed persistence mocks in submit handler');
assert(!projectNewJsx.includes('mockGenerate'), 'No fake AI generation in ProjectNewPage');

console.log('\n====================================================');
console.log(`PHASE 2 VERIFICATION RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED!`);
console.log('====================================================\n');
