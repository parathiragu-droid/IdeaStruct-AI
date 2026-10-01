// frontend/src/tests/phase4Verification.test.js
// Verification suite for Phase 4 Frontend Requirements

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('====================================================');
console.log('Running Phase 4 Frontend Verification Suite');
console.log('====================================================\n');

// 1. Inspect api.js
console.log('--- Check 1: api.js Endpoint Contracts ---');
const apiJsPath = path.join(projectRoot, 'src', 'services', 'api.js');
const apiJs = fs.readFileSync(apiJsPath, 'utf8');

assert(apiJs.includes('generateBlueprint: (id, expectedRevision, mode) =>'), 'api.js generateBlueprint accepts id, expectedRevision, and mode');
assert(apiJs.includes('/projects/${id}/generate'), 'Calls POST /projects/${id}/generate endpoint');
assert(apiJs.includes('JSON.stringify({ expectedRevision, mode })'), 'Includes expectedRevision and mode in POST body');
console.log('✅ PASSED: api.generateBlueprint conforms to backend contract with mode and expectedRevision');

// 2. Inspect ProjectDetailPage.jsx for Generation Behavior
console.log('\n--- Check 2: ProjectDetailPage Generation Buttons & Modes ---');
const detailJsxPath = path.join(projectRoot, 'src', 'pages', 'ProjectDetailPage.jsx');
const detailJsx = fs.readFileSync(detailJsxPath, 'utf8');

assert(detailJsx.includes("handleGenerateBlueprint('DEMO')"), 'Demo generate button triggers DEMO mode');
assert(detailJsx.includes("handleGenerateBlueprint('LIVE_AI')"), 'Live AI generate button triggers LIVE_AI mode');
assert(detailJsx.includes('id="btn-generate-demo"'), 'Demo button has unique id btn-generate-demo');
assert(detailJsx.includes('id="btn-generate-live"'), 'Live AI button has unique id btn-generate-live');
console.log('✅ PASSED: Distinct buttons for DEMO and LIVE_AI exist with unique IDs');

// 3. Duplicate Submission & Loading Lockout
console.log('\n--- Check 3: Concurrency and Loading Lockout ---');
assert(detailJsx.includes('if (generating) return;'), 'handleGenerateBlueprint early returns if already generating');
assert(detailJsx.includes('disabled={generating}'), 'Buttons disabled while generating is true');
assert(detailJsx.includes('Generating Blueprint...'), 'Clear loading label displayed during generation');
console.log('✅ PASSED: Double-submit guard and honest loading state implemented');

// 4. Mode Badges & Visual Distinction
console.log('\n--- Check 4: Generation Source Badges ---');
assert(detailJsx.includes('id="badge-demo-mode"'), 'Demo mode badge element exists with id badge-demo-mode');
assert(detailJsx.includes('Demo blueprint — sample data'), 'Demo mode clearly labeled as sample data');
assert(detailJsx.includes('id="badge-live-ai"'), 'Live AI badge element exists with id badge-live-ai');
assert(detailJsx.includes('Live AI Generated (Gemini)'), 'Live AI mode clearly distinguished with Gemini label');
console.log('✅ PASSED: DEMO and LIVE_AI are visually distinguishable with explicit labels');

// 5. Error & Conflict Handling
console.log('\n--- Check 5: Error and Conflict Handling ---');
assert(detailJsx.includes('err.status === 409'), 'Handles HTTP 409 concurrency conflicts cleanly');
assert(detailJsx.includes('setGenError'), 'Sets genError on failure');
assert(detailJsx.includes('setConflictNotice'), 'Shows conflict notice on concurrent modification');
console.log('✅ PASSED: Error and conflict handling displays actionable feedback to user');

// 6. Security Check: No Gemini Keys in Frontend
console.log('\n--- Check 6: Secret Leak Prevention ---');
const srcDir = path.join(projectRoot, 'src');
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|json|css|html)$/.test(entry.name) && entry.name !== 'phase4Verification.test.js') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const keyPrefix = 'AI' + 'za';
      assert(!content.includes(keyPrefix), `Found potential API key in frontend file: ${fullPath}`);
      assert(!content.includes('VITE_GEMINI_API_KEY'), `Found VITE_GEMINI_API_KEY in frontend file: ${fullPath}`);
    }
  }
}
scanDir(srcDir);
console.log('✅ PASSED: Frontend source code is clean of all API keys and secrets');

console.log('\n====================================================');
console.log('ALL PHASE 4 FRONTEND CHECKS PASSED!');
console.log('====================================================\n');
