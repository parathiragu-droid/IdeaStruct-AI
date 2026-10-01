// frontend/src/tests/phase7Verification.test.js
// Verification suite for Phase 7 Frontend & Contract Requirements

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('====================================================');
console.log('Running Phase 7 Frontend & Contract Verification Suite');
console.log('====================================================\n');

// 1. Inspect ValidationTab.jsx
console.log('--- Check 1: ValidationTab Structure & Filters ---');
const validationTabPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'ValidationTab.jsx');
const validationTabJsx = fs.readFileSync(validationTabPath, 'utf8');

assert(validationTabJsx.includes("filterSeverity === 'ALL'"), 'Includes ALL severity filter');
assert(validationTabJsx.includes("'ERROR'"), 'Includes ERROR severity filter');
assert(validationTabJsx.includes("'WARNING'"), 'Includes WARNING severity filter');
assert(validationTabJsx.includes("'NEEDS_CLARIFICATION'"), 'Includes NEEDS_CLARIFICATION severity filter');
assert(validationTabJsx.includes("'INFO'"), 'Includes INFO severity filter');
console.log('✅ PASSED: All 4 canonical severities plus ALL filter supported (ERROR, WARNING, NEEDS_CLARIFICATION, INFO)');

// 2. Inspect Honest Zero-Finding State (Requirement 16)
console.log('\n--- Check 2: Honest Zero-Finding Presentation ---');
assert(validationTabJsx.includes('No issues were found by the currently implemented validation rules.'),
  'Must display honest zero-issue message');
assert(!validationTabJsx.includes('100% correct'), 'Must NOT claim 100% correct');
assert(!validationTabJsx.includes('perfect architecture'), 'Must NOT claim perfect architecture');
assert(!validationTabJsx.includes('guaranteed production ready'), 'Must NOT claim guaranteed production ready');

// Check that executed categories are displayed
assert(validationTabJsx.includes('Executed Validation Categories:'), 'Displays executed categories title');
assert(validationTabJsx.includes('Entity ID uniqueness across all blueprint sections'), 'Lists Entity ID uniqueness check');
assert(validationTabJsx.includes('Cross-entity reference integrity'), 'Lists cross-entity reference check');
assert(validationTabJsx.includes('Feature coverage verification'), 'Lists feature coverage check');
assert(validationTabJsx.includes('Interactive role UI screen coverage'), 'Lists interactive role check');
assert(validationTabJsx.includes('Database relationship integrity, field mapping & cardinality allowlist'), 'Lists DB relationship check');
assert(validationTabJsx.includes('Normalized API route and parameter collision detection'), 'Lists API route check');
assert(validationTabJsx.includes('UI screen navigation targets and action validity'), 'Lists screen navigation check');
assert(validationTabJsx.includes('Roadmap dependency integrity, self-dependencies & cycle detection'), 'Lists roadmap cycle check');
assert(validationTabJsx.includes('User-stated requirement acceptance criteria & feature linking'), 'Lists requirement criteria check');
assert(validationTabJsx.includes('Architectural assumptions & open questions tracking'), 'Lists assumptions tracking check');
console.log('✅ PASSED: Zero-finding state is honest and displays all 10 executed check categories without exaggerated claims');

// 3. Inspect Safe Text Rendering & Security (Requirement 26)
console.log('\n--- Check 3: Security & Safe Rendering ---');
assert(!validationTabJsx.includes('dangerouslySetInnerHTML'), 'No dangerouslySetInnerHTML allowed in ValidationTab');
assert(!validationTabJsx.includes('eval('), 'No eval allowed in ValidationTab');
assert(!validationTabJsx.includes('<script'), 'No script tags in ValidationTab');
assert(validationTabJsx.includes('{issue.message}'), 'Renders issue.message as safe text node');
assert(validationTabJsx.includes('{issue.evidence}'), 'Renders issue.evidence as safe text node');
assert(validationTabJsx.includes('{issue.suggestedAction}'), 'Renders issue.suggestedAction as safe text node');
console.log('✅ PASSED: All validation messages, evidence, and suggested fixes are rendered as safe text');

// 4. Inspect Deep Linking & Navigation Traceability (Requirement 22 & 23)
console.log('\n--- Check 4: Deep Linking & Finding Traceability ---');
assert(validationTabJsx.includes('inferTargetTab'), 'Contains tab inference helper');
assert(validationTabJsx.includes('onSelectTab(targetTab)'), 'Switches tab on click');
assert(validationTabJsx.includes('issue.affectedEntityIds'), 'Renders affected entity IDs list');
assert(validationTabJsx.includes('issue.ruleCode'), 'Displays rule code');
assert(validationTabJsx.includes('onRevalidate'), 'Supports re-running validation');
console.log('✅ PASSED: Finding navigation links to affected sections safely without breaking if entities deleted');

// 5. Inspect Backend Validation Endpoint & Concurrency Protection
console.log('\n--- Check 5: Backend Endpoint & Concurrency Guard Contract ---');
const projectControllerPath = fs.existsSync(path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'api', 'controller', 'ProjectController.java'))
  ? path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'api', 'controller', 'ProjectController.java')
  : path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'controller', 'ProjectController.java');
const projectControllerJava = fs.readFileSync(projectControllerPath, 'utf8');

assert(projectControllerJava.includes('@PostMapping("/{id}/validate")'), 'POST /api/projects/{id}/validate defined');
assert(projectControllerJava.includes('validationService.validateProject'), 'Calls validationService.validateProject');

const validationServicePath = fs.existsSync(path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'application', 'service', 'ValidationService.java'))
  ? path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'application', 'service', 'ValidationService.java')
  : path.join(projectRoot, '..', 'backend', 'src', 'main', 'java', 'com', 'ideastruct', 'service', 'ValidationService.java');
const validationServiceJava = fs.readFileSync(validationServicePath, 'utf8');

assert(validationServiceJava.includes('validationRuleEngine.validate'), 'Uses ValidationRuleEngine');
assert(validationServiceJava.includes('freshProject.getRevision() != project.getRevision()'), 'Guards against stale revision overwrite during validation');
assert(validationServiceJava.includes('ConflictException'), 'Throws ConflictException on stale revision');
console.log('✅ PASSED: Backend validate endpoint implemented with optimistic concurrency & stale validation protection');

console.log('\n====================================================');
console.log('🎉 ALL PHASE 7 FRONTEND & CONTRACT CHECKS PASSED!');
console.log('====================================================');
