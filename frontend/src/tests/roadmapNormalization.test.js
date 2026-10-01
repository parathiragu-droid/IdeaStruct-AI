/**
 * Roadmap Normalization & Tab Robustness Test Suite
 *
 * Verifies that normalizeRoadmap and RoadmapTab safely handle all variations:
 * 1. Normal roadmap array
 * 2. Roadmap object with phases ({ phases: [...] })
 * 3. String task entries
 * 4. Structured task objects
 * 5. Missing optional fields (title, duration, tasks, completionCriteria, dependsOnPhaseIds)
 * 6. Empty roadmap ([] or {})
 * 7. Null or undefined roadmap
 * 8. Software roadmap
 * 9. Hardware roadmap
 * 10. Hybrid roadmap
 * 11. Legacy persisted roadmap shape (string completionCriteria from LIVE_AI)
 */

import assert from 'node:assert';
import { normalizeRoadmap, safeString, safeStringList, safeIdList } from '../utils/roadmapNormalizer.js';

console.log('--- Test 1: Normal Roadmap Array ---');
const normalArray = [
  {
    id: 'phase-1',
    title: 'Phase 1: Architecture',
    description: 'Initial setup',
    featureIds: ['feat-1'],
    tasks: ['Setup repository', 'Configure DB'],
    dependsOnPhaseIds: [],
    completionCriteria: ['Code compiles', 'DB connects']
  }
];
const res1 = normalizeRoadmap(normalArray);
assert.strictEqual(res1.length, 1);
assert.strictEqual(res1[0].id, 'phase-1');
assert.strictEqual(res1[0].title, 'Phase 1: Architecture');
assert.deepStrictEqual(res1[0].tasks, ['Setup repository', 'Configure DB']);
assert.deepStrictEqual(res1[0].completionCriteria, ['Code compiles', 'DB connects']);
console.log('✅ Passed Test 1');

console.log('--- Test 2: Roadmap Object with Phases ---');
const objPhases = {
  phases: [
    {
      phase: 'Phase 1: Prototyping',
      duration: '2 weeks',
      tasks: ['Wire sensors']
    }
  ]
};
const res2 = normalizeRoadmap(objPhases);
assert.strictEqual(res2.length, 1);
assert.strictEqual(res2[0].title, 'Phase 1: Prototyping');
assert.strictEqual(res2[0].duration, '2 weeks');
assert.deepStrictEqual(res2[0].tasks, ['Wire sensors']);
console.log('✅ Passed Test 2');

console.log('--- Test 3: String Task Entries ---');
const stringTasks = [
  {
    title: 'Phase 1',
    tasks: 'Step 1: Do this\nStep 2: Do that'
  }
];
const res3 = normalizeRoadmap(stringTasks);
assert.strictEqual(res3.length, 1);
assert.deepStrictEqual(res3[0].tasks, ['Step 1: Do this', 'Step 2: Do that']);
console.log('✅ Passed Test 3');

console.log('--- Test 4: Structured Task Objects ---');
const taskObjects = [
  {
    id: 'p-1',
    tasks: [
      { name: 'Implement Auth', status: 'TODO' },
      { title: 'Create DB Schema' },
      { description: 'Deploy to Cloud' }
    ]
  }
];
const res4 = normalizeRoadmap(taskObjects);
assert.strictEqual(res4.length, 1);
assert.deepStrictEqual(res4[0].tasks, ['Implement Auth', 'Create DB Schema', 'Deploy to Cloud']);
console.log('✅ Passed Test 4');

console.log('--- Test 5: Missing Optional Fields ---');
const partialPhase = [
  {
    // missing id, title, duration, tasks, completionCriteria
    someCustomKey: 'value'
  }
];
const res5 = normalizeRoadmap(partialPhase);
assert.strictEqual(res5.length, 1);
assert.strictEqual(res5[0].id, 'phase-1');
assert.strictEqual(res5[0].title, 'Phase 1');
assert.strictEqual(res5[0].description, '');
assert.strictEqual(res5[0].duration, null);
assert.deepStrictEqual(res5[0].tasks, []);
assert.deepStrictEqual(res5[0].completionCriteria, []);
assert.deepStrictEqual(res5[0].dependsOnPhaseIds, []);
console.log('✅ Passed Test 5');

console.log('--- Test 6: Empty Roadmap ([] or {}) ---');
assert.deepStrictEqual(normalizeRoadmap([]), []);
assert.deepStrictEqual(normalizeRoadmap({}), []);
console.log('✅ Passed Test 6');

console.log('--- Test 7: Null or Undefined Roadmap ---');
assert.deepStrictEqual(normalizeRoadmap(null), []);
assert.deepStrictEqual(normalizeRoadmap(undefined), []);
console.log('✅ Passed Test 7');

console.log('--- Test 8: Software Roadmap ---');
const swRoadmap = [
  {
    id: 'sw-phase-1',
    title: 'Phase 1: Backend & APIs',
    description: 'Build REST endpoints',
    tasks: ['Design OpenAPI spec', 'Implement controllers'],
    completionCriteria: ['All tests pass']
  }
];
const res8 = normalizeRoadmap(swRoadmap);
assert.strictEqual(res8.length, 1);
assert.strictEqual(res8[0].title, 'Phase 1: Backend & APIs');
console.log('✅ Passed Test 8');

console.log('--- Test 9: Hardware Roadmap ---');
const hwRoadmap = [
  {
    id: 'hw-phase-1',
    title: 'Phase 1: Circuit Prototyping',
    description: 'Breadboard setup',
    tasks: ['Order ESP32', 'Connect MQ2 gas sensor'],
    completionCriteria: ['Sensor readings on serial monitor']
  }
];
const res9 = normalizeRoadmap(hwRoadmap);
assert.strictEqual(res9.length, 1);
assert.strictEqual(res9[0].title, 'Phase 1: Circuit Prototyping');
console.log('✅ Passed Test 9');

console.log('--- Test 10: Hybrid Roadmap ---');
const hybridRoadmap = [
  {
    id: 'hyb-1',
    title: 'Phase 1: Telematics & Cloud Pipeline',
    tasks: ['Build device', 'Connect to MQTT'],
    completionCriteria: ['End to end data flow confirmed']
  }
];
const res10 = normalizeRoadmap(hybridRoadmap);
assert.strictEqual(res10.length, 1);
assert.strictEqual(res10[0].title, 'Phase 1: Telematics & Cloud Pipeline');
console.log('✅ Passed Test 10');

console.log('--- Test 11: Legacy Persisted Roadmap Shape (String completionCriteria from LIVE_AI) ---');
const liveAiShape = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundation & Authentication',
    description: 'Set up database schema',
    featureIds: ['feat-auth'],
    tasks: ['Initialize DB', 'Implement JWT auth'],
    dependsOnPhaseIds: [],
    // CRITICAL: completionCriteria is a STRING, NOT an array!
    completionCriteria: 'Users can successfully register and log in with role-based routing.'
  }
];
const res11 = normalizeRoadmap(liveAiShape);
assert.strictEqual(res11.length, 1);
// MUST normalize to an array so .map() in UI never throws!
assert(Array.isArray(res11[0].completionCriteria), 'completionCriteria must be an Array');
assert.strictEqual(res11[0].completionCriteria.length, 1);
assert.strictEqual(res11[0].completionCriteria[0], 'Users can successfully register and log in with role-based routing.');
console.log('✅ Passed Test 11');

console.log('--- Test 12: Plain Array of Strings (Format D) ---');
const formatD = ['Planning & Research', 'Prototyping & Assembly', 'Testing & Review'];
const res12 = normalizeRoadmap(formatD);
assert.strictEqual(res12.length, 3);
assert.strictEqual(res12[0].title, 'Planning & Research');
assert.strictEqual(res12[1].title, 'Prototyping & Assembly');
assert.strictEqual(res12[2].title, 'Testing & Review');
console.log('✅ Passed Test 12');

console.log('--- Test 13: Object with Milestones (Format C) ---');
const formatC = {
  milestones: [
    { title: 'Milestone 1: Proof of Concept', duration: '3 weeks' }
  ]
};
const res13 = normalizeRoadmap(formatC);
assert.strictEqual(res13.length, 1);
assert.strictEqual(res13[0].title, 'Milestone 1: Proof of Concept');
assert.strictEqual(res13[0].duration, '3 weeks');
console.log('✅ Passed Test 13');

console.log('--- Test 14: Safe String & Raw Object Protection ---');
assert.strictEqual(safeString({ name: 'Special Item' }), 'Special Item');
assert.strictEqual(safeString({ title: 'Task Title' }), 'Task Title');
assert.strictEqual(safeString(123), '123');
assert.strictEqual(safeString(null), '');
assert.strictEqual(safeString(undefined), '');
assert.strictEqual(safeString({}), ''); // Never returns '[object Object]'
console.log('✅ Passed Test 14');

console.log('\n========================================');
console.log('✅ ALL 14 ROADMAP NORMALIZATION TESTS PASSED!');
console.log('========================================');
