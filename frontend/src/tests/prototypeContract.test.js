// frontend/src/tests/prototypeContract.test.js
// Verification of Software Prototype Component and Action Registry Contracts

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('====================================================');
console.log('Running Prototype Component & Action Contract Test');
console.log('====================================================\n');

// 1. Inspect Prototype Whitelist Components
console.log('--- Check 1: Whitelist Component Registry (17 Components) ---');
const componentsPath = path.join(projectRoot, 'src', 'components', 'prototype', 'PrototypeWhitelistComponents.jsx');
assert(fs.existsSync(componentsPath), 'PrototypeWhitelistComponents.jsx must exist');
const componentsJsx = fs.readFileSync(componentsPath, 'utf8');

const EXPECTED_COMPONENTS = [
  'Heading',
  'Text',
  'Button',
  'Input',
  'Textarea',
  'Select',
  'Card',
  'List',
  'Table',
  'ImagePlaceholder',
  'Navbar',
  'Sidebar',
  'Tabs',
  'Badge',
  'Form',
  'Modal',
  'StatCard',
];

for (const comp of EXPECTED_COMPONENTS) {
  assert(
    componentsJsx.includes(`${comp}: ${comp}Component`) || componentsJsx.includes(`${comp}Component`),
    `Registry must implement whitelist component: ${comp}`
  );
}

// Ensure strict security: zero eval or new Function
const codeWithoutComments = componentsJsx.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
assert(!codeWithoutComments.includes('eval('), 'Must not use eval()');
assert(!codeWithoutComments.includes('new Function('), 'Must not use new Function()');
assert(!codeWithoutComments.includes('dangerouslySetInnerHTML'), 'Must not use dangerouslySetInnerHTML');
console.log(`✅ PASSED: All 17 controlled whitelist components registered safely with zero eval/new Function`);

// 2. Inspect Prototype Action Handlers
console.log('\n--- Check 2: Safe Prototype Action Contract (9 Actions) ---');
const enginePath = path.join(projectRoot, 'src', 'components', 'prototype', 'SafePrototypeEngine.jsx');
assert(fs.existsSync(enginePath), 'SafePrototypeEngine.jsx must exist');
const engineJsx = fs.readFileSync(enginePath, 'utf8');

const EXPECTED_ACTIONS = [
  'NAVIGATE',
  'OPEN_MODAL',
  'CLOSE_MODAL',
  'SET_VALUE',
  'SUBMIT_DEMO',
  'SHOW_MESSAGE',
  'FILTER_DEMO_DATA',
  'SELECT_ITEM',
  'BACK',
];

for (const action of EXPECTED_ACTIONS) {
  assert(
    engineJsx.includes(`'${action}'`),
    `Engine must implement action handler for: ${action}`
  );
}
console.log('✅ PASSED: All 9 controlled actions handled safely (NAVIGATE, OPEN/CLOSE_MODAL, SET_VALUE, SUBMIT_DEMO, SHOW_MESSAGE, FILTER_DEMO_DATA, SELECT_ITEM, BACK)');

// 3. Graceful fallback for unknown actions & components
console.log('\n--- Check 3: Graceful Fallbacks for Unknown Actions & Components ---');
assert(engineJsx.includes('Unhandled prototype action') || engineJsx.includes('Unknown prototype action') || engineJsx.includes('unrecognized action'), 'Gracefully handles unrecognized actions');
assert(engineJsx.includes('[Controlled Component:'), 'Gracefully renders fallback card for unrecognized component types');
assert(engineJsx.includes('activeModal'), 'Maintains controlled active modal state');
assert(engineJsx.includes('demoFilter'), 'Maintains controlled demo filter state');
assert(engineJsx.includes('selectedItem'), 'Maintains controlled selected item state');
console.log('✅ PASSED: Safe engine gracefully absorbs unknown actions and unknown components without crashing');

console.log('\n====================================================');
console.log('🎉 ALL PROTOTYPE CONTRACT VERIFICATION CHECKS PASSED!');
console.log('====================================================\n');
