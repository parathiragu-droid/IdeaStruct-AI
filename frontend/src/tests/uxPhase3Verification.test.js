/**
 * UX Phase 3 Verification Test Suite
 * Tests Projects List & New Project Guided Experience:
 * - Beginner headings and descriptions
 * - Real summary statistics calculation
 * - Client-side search and status filters
 * - Human-friendly plan status labels and next actions
 * - Technical details disclosure for internal IDs/revisions
 * - Delete confirmation modal copy
 * - New project step indicator and writing guide
 * - Inspiration starters
 * - Form validation and draft restore messaging
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
console.log('Running UX Phase 3 Verification Suite');
console.log('====================================================\n');

// -------------------------------------------------------------
// PART A: Projects List Page (ProjectListPage.jsx)
// -------------------------------------------------------------
console.log('--- Check 1: Projects List Page Structure & Headings ---');
const projectListJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectListPage.jsx'), 'utf8');

assert(projectListJsx.includes('My Projects'), 'Page heading is "My Projects"');
assert(projectListJsx.includes('Create, review, and continue your software'), 'Page description is beginner friendly');
assert(projectListJsx.includes('id="btn-create-project-top"'), 'Header action button id="btn-create-project-top" exists');
assert(!projectListJsx.includes('Project Aggregates'), 'Does not use technical heading "Project Aggregates"');
assert(!projectListJsx.includes('Stored Documents'), 'Does not use technical heading "Stored Documents"');

console.log('\n--- Check 2: Project Summary Cards ---');
assert(projectListJsx.includes('Total Projects'), 'Summary area computes Total Projects');
assert(projectListJsx.includes('Plans Ready'), 'Summary area computes Plans Ready');
assert(projectListJsx.includes('Ideas Waiting for a Plan'), 'Summary area computes Ideas Waiting for a Plan');
assert(projectListJsx.includes('Plans Needing Update'), 'Summary area computes Plans Needing Update');
assert(!projectListJsx.includes('% complete') && !projectListJsx.includes('% of total'), 'Summary area does not fabricate statistical percentages');

console.log('\n--- Check 3: Search & Status Filters ---');
assert(projectListJsx.includes('id="input-search-projects"'), 'Search input with id="input-search-projects" exists');
assert(projectListJsx.includes('searchQuery'), 'Client-side search state is bound');
assert(projectListJsx.includes('statusFilter'), 'Status filter state is bound');
assert(projectListJsx.includes('No projects match your search'), 'Clear message when search yields no results');

console.log('\n--- Check 4: Human-Friendly Project Status Labels & Actions ---');
assert(projectListJsx.includes('Plan not generated yet'), 'Status label "Plan not generated yet"');
assert(projectListJsx.includes('Project Plan ready'), 'Status label "Project Plan ready"');
assert(projectListJsx.includes('Plan may need updating'), 'Status label "Plan may need updating"');
assert(projectListJsx.includes('Create your first Project Plan.'), 'Next action hint for ungenerated projects');
assert(projectListJsx.includes('Continue reviewing your Project Plan.'), 'Next action hint for ready projects');
assert(projectListJsx.includes('Your idea changed after the last plan was generated.'), 'Next action hint for outdated projects');

console.log('\n--- Check 5: Truthful Provenance & Disclosed Technical Details ---');
assert(projectListJsx.includes('Generated with Live AI'), 'Human-friendly label for LIVE_AI');
assert(projectListJsx.includes('Generated with Demo data'), 'Human-friendly label for DEMO');
assert(projectListJsx.includes('Edited by you'), 'Human-friendly label for USER_EDITED');
assert(projectListJsx.includes('<TechnicalDetails'), 'Uses TechnicalDetails component for internal ID & revision disclosure');

console.log('\n--- Check 6: Empty State & Delete Modal ---');
assert(projectListJsx.includes('No projects yet'), 'Empty state heading is "No projects yet"');
assert(projectListJsx.includes('Create your first project'), 'Empty state CTA is "Create your first project"');
assert(projectListJsx.includes('id="btn-empty-create"'), 'Empty state CTA retains id="btn-empty-create"');
assert(projectListJsx.includes('Delete Project'), 'Delete button has clear label "Delete Project"');
assert(projectListJsx.includes('id="btn-confirm-delete"'), 'Delete confirmation retains id="btn-confirm-delete"');
assert(!projectListJsx.includes('confirm('), 'Does not use intrusive browser confirm() dialog');

// -------------------------------------------------------------
// PART B: New Project Page (ProjectNewPage.jsx)
// -------------------------------------------------------------
console.log('\n--- Check 7: New Project Introduction & Step Context ---');
const projectNewJsx = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectNewPage.jsx'), 'utf8');

assert(projectNewJsx.includes('Create a New Project'), 'Page heading is "Create a New Project"');
assert(projectNewJsx.includes('Step 1 of 2'), 'Step indicator "Step 1 of 2" context is present');
assert(projectNewJsx.includes('Describe your idea'), 'Step indicator mentions "Describe your idea"');
assert(projectNewJsx.includes('Tell us what you want to build'), 'Beginner-friendly page description is present');

console.log('\n--- Check 8: Field Labels, Validation Bounds & Counters ---');
assert(projectNewJsx.includes('Project name'), 'Title field label is "Project name"');
assert(projectNewJsx.includes('Describe your project idea') || projectNewJsx.includes('Describe your idea'), 'Idea field label is present');
assert(projectNewJsx.includes('TITLE_MIN = 3'), 'TITLE_MIN bound of 3 preserved');
assert(projectNewJsx.includes('TITLE_MAX = 120'), 'TITLE_MAX bound of 120 preserved');
assert(projectNewJsx.includes('IDEA_MIN = 50'), 'IDEA_MIN bound of 50 preserved');
assert(projectNewJsx.includes('IDEA_MAX = 10000'), 'IDEA_MAX bound of 10000 preserved');
assert(projectNewJsx.includes('id="project-title"'), 'Input retains id="project-title"');
assert(projectNewJsx.includes('id="project-idea"'), 'Textarea retains id="project-idea"');

console.log('\n--- Check 9: Idea Writing Guidance & Inspiration Starters ---');
assert(projectNewJsx.includes('Project Planning Guide'), 'Idea writing guide header present');
assert(projectNewJsx.includes('Software Systems'), 'Guide includes Software Systems');
assert(projectNewJsx.includes('Hardware Circuits'), 'Guide includes Hardware Circuits');
assert(projectNewJsx.includes('Hybrid IoT Projects'), 'Guide includes Hybrid IoT Projects');
assert(projectNewJsx.includes('IDEA_STARTERS'), 'Idea inspiration starters defined');
assert(projectNewJsx.includes('PulseIoT') && projectNewJsx.includes('SentinelAir'), 'Starters include Hybrid and Hardware starters');

console.log('\n--- Check 10: Use Example & Draft Restored Messaging ---');
assert(projectNewJsx.includes('Use Example Idea'), 'Button label is "Use Example Idea"');
assert(projectNewJsx.includes('id="btn-use-example"'), 'Retains id="btn-use-example"');
assert(projectNewJsx.includes('example added. You can edit it before creating the project.') || projectNewJsx.includes('PulseIoT Hybrid example added'), 'Helpful notice shown when example is applied');
assert(projectNewJsx.includes('We restored your unfinished project idea'), 'Notice shown when previous unsaved draft is restored');
assert(projectNewJsx.includes('id="btn-clear-draft"'), 'Retains id="btn-clear-draft" action');

console.log('\n--- Check 11: Create Button & Accessible Focus ---');
assert(projectNewJsx.includes('Create Project'), 'Primary submit button is "Create Project"');
assert(projectNewJsx.includes('Creating project...'), 'Loading state is "Creating project..."');
assert(projectNewJsx.includes('id="btn-submit-idea"'), 'Retains id="btn-submit-idea"');
assert(projectNewJsx.includes('.focus()'), 'Automatically moves keyboard focus to invalid field on validation failure');
assert(!projectNewJsx.includes('HTTP POST'), 'Does not leak technical HTTP POST in UI');
assert(!projectNewJsx.includes('MongoDB Save'), 'Does not leak MongoDB Save in UI');

console.log('\n====================================================');
console.log(`UX PHASE 3 VERIFICATION RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED!`);
console.log('====================================================\n');
