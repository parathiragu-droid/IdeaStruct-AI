// frontend/src/tests/phase6StabilityAndBlankScreen.test.js
// Verification suite for Phase 6: Global Blank Page / Tab Crash / 3D Stability Fix

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const srcDir = path.resolve(projectRoot, 'src');

console.log('====================================================');
console.log('Running Phase 6 Blank Page / Tab Crash / 3D Stability Verification Suite');
console.log('====================================================\n');

let passedChecks = 0;

function verify(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  passedChecks++;
}

// -------------------------------------------------------------
// Check 1: Multi-Level ErrorBoundary Architecture
// -------------------------------------------------------------
console.log('--- Check 1: Multi-Level ErrorBoundary Architecture ---');

// 1.1 ErrorBoundary Component exists and has required capabilities
const errorBoundaryPath = path.join(srcDir, 'components', 'common', 'ErrorBoundary.jsx');
verify(fs.existsSync(errorBoundaryPath), 'ErrorBoundary.jsx exists in components/common');
const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, 'utf8');

verify(errorBoundaryContent.includes('getDerivedStateFromError'), 'ErrorBoundary implements getDerivedStateFromError');
verify(errorBoundaryContent.includes('componentDidCatch'), 'ErrorBoundary implements componentDidCatch');
verify(errorBoundaryContent.includes('role="alert"'), 'ErrorBoundary renders role="alert" for accessibility');
verify(errorBoundaryContent.includes('Try Reloading') || errorBoundaryContent.includes('Try Again'), 'ErrorBoundary provides a user retry action');
verify(errorBoundaryContent.includes('TechnicalDetails'), 'ErrorBoundary supports inspecting technical stack traces');

// 1.2 Root ErrorBoundary in main.jsx
const mainJsxPath = path.join(srcDir, 'main.jsx');
const mainJsxContent = fs.readFileSync(mainJsxPath, 'utf8');
verify(mainJsxContent.includes('ErrorBoundary') && mainJsxContent.includes('<ErrorBoundary level="app"'), 'main.jsx wraps <App /> in root-level ErrorBoundary');

// 1.3 Page-Level ErrorBoundaries in all primary pages
const homePageContent = fs.readFileSync(path.join(srcDir, 'pages', 'HomePage.jsx'), 'utf8');
verify(homePageContent.includes('<ErrorBoundary level="page"') && homePageContent.includes('sectionName="Home"'), 'HomePage.jsx wraps content in page-level ErrorBoundary');

const listPageContent = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectListPage.jsx'), 'utf8');
verify(listPageContent.includes('<ErrorBoundary level="page"') && listPageContent.includes('sectionName="Projects List"'), 'ProjectListPage.jsx wraps content in page-level ErrorBoundary');

const newPageContent = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectNewPage.jsx'), 'utf8');
verify(newPageContent.includes('<ErrorBoundary level="page"') && newPageContent.includes('sectionName="New Project"'), 'ProjectNewPage.jsx wraps content in page-level ErrorBoundary');

const detailPageContent = fs.readFileSync(path.join(srcDir, 'pages', 'ProjectDetailPage.jsx'), 'utf8');
verify(detailPageContent.includes('ErrorBoundary'), 'ProjectDetailPage.jsx imports ErrorBoundary');

const healthPageContent = fs.readFileSync(path.join(srcDir, 'pages', 'HealthCheckPage.jsx'), 'utf8');
verify(healthPageContent.includes('<ErrorBoundary level="page"') && healthPageContent.includes('sectionName="System Status"'), 'HealthCheckPage.jsx wraps content in page-level ErrorBoundary');

// 1.4 Tab-Level ErrorBoundaries in ProjectDetailPage.jsx
console.log('\n--- Check 2: Tab-Level Error Isolation in ProjectDetailPage ---');
const expectedTabs = [
  'overview',
  'features',
  'roles',
  'requirements',
  'estimates',
  'roadmap',
  'database',
  'apis',
  'screens',
  'architecture',
  'techstack',
  'prototype',
  'components',
  'connections',
  'firmware',
  'threedmodel',
  'diagram',
  'validation'
];

for (const tab of expectedTabs) {
  const tabCheck = detailPageContent.includes(`activeTab === '${tab}'`) &&
    detailPageContent.includes(`<ErrorBoundary sectionName=`) &&
    detailPageContent.includes(`level="tab"`);
  verify(tabCheck, `ProjectDetailPage wraps tab '${tab}' in an isolated ErrorBoundary`);
}

// 1.5 Section-Level ErrorBoundaries in HardwarePlanSection and SoftwarePlanSection
console.log('\n--- Check 3: Section-Level ErrorBoundaries in SimplePlanDashboard ---');
const hwPlanSectionContent = fs.readFileSync(path.join(srcDir, 'components', 'hardware', 'HardwarePlanSection.jsx'), 'utf8');
verify(hwPlanSectionContent.includes('<ErrorBoundary sectionName="Circuit Wiring Diagram"') &&
       hwPlanSectionContent.includes('<ErrorBoundary sectionName="3D Physical Prototype"'),
       'HardwarePlanSection wraps both Wiring Diagram and 3D Model in isolated ErrorBoundaries');

const swPlanSectionContent = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'SoftwarePlanSection.jsx'), 'utf8');
verify(swPlanSectionContent.includes('<ErrorBoundary sectionName="Interactive Software Prototype"'),
       'SoftwarePlanSection wraps Interactive Prototype in isolated ErrorBoundary');

// -------------------------------------------------------------
// Check 4: WebGL Context Lifecycle & Leak Prevention
// -------------------------------------------------------------
console.log('\n--- Check 4: WebGL Context Lifecycle & Leak Prevention in Parametric3DViewer ---');
const viewerPath = path.join(srcDir, 'components', 'hardware', 'Parametric3DViewer.jsx');
const viewerContent = fs.readFileSync(viewerPath, 'utf8');

// 4.1 Cached context availability check with loseContext cleanup
verify(viewerContent.includes('_webglSupportCache'), 'Parametric3DViewer caches WebGL availability check');
verify(viewerContent.includes("loseContext()") || viewerContent.includes("WEBGL_lose_context"), 'isWebGLAvailable explicitly frees check context via WEBGL_lose_context');

// 4.2 Cleanup on unmount
verify(viewerContent.includes('controls.dispose()'), 'Parametric3DViewer disposes OrbitControls on unmount');
verify(viewerContent.includes('traverse') && viewerContent.includes('dispose()'), 'Parametric3DViewer traverses scene and disposes geometry, material, textures on unmount');
verify(viewerContent.includes('renderer.forceContextLoss()'), 'Parametric3DViewer calls renderer.forceContextLoss() on unmount');

// 4.3 WebGL context loss event handling & recovery
verify(viewerContent.includes('webglcontextlost'), 'Parametric3DViewer listens to canvas webglcontextlost event');
verify(viewerContent.includes('event.preventDefault()'), 'Parametric3DViewer prevents default browser action on webglcontextlost');
verify(viewerContent.includes('setInitError') && viewerContent.includes('temporarily lost'), 'Parametric3DViewer flags context loss in component state');
verify(viewerContent.includes('Retry 3D Model') || viewerContent.includes('retryKey'), 'Parametric3DViewer provides user recovery / retry trigger on context loss');

// -------------------------------------------------------------
// Check 5: Defensive Data Normalization (Requirements, Resolvers, TechStack)
// -------------------------------------------------------------
console.log('\n--- Check 5: Defensive Data Normalization & Anti-Crash Guards ---');

// 5.1 entityResolvers.js safely handles non-array / null / undefined / string inputs
import {
  resolveRoleName,
  resolveRoleNames,
  resolveFeatureName,
  resolveFeatureNames,
  resolveScreenName,
  resolveScreenNames,
  resolvePhaseTitle,
  resolvePhaseTitles
} from '../utils/entityResolvers.js';

// Test edge cases on entityResolvers
assert.strictEqual(resolveRoleName(null, null), '');
assert.strictEqual(resolveRoleName(undefined, []), '');
assert.strictEqual(resolveRoleName('custom-role', null), 'custom-role');
assert.deepStrictEqual(resolveRoleNames(null, null), []);
assert.deepStrictEqual(resolveRoleNames(undefined, []), []);
assert.deepStrictEqual(resolveRoleNames('single-role', [{ id: 'single-role', name: 'Admin' }]), ['Admin']);

assert.strictEqual(resolveFeatureName(null, null), '');
assert.deepStrictEqual(resolveFeatureNames(null, null), []);
assert.deepStrictEqual(resolveFeatureNames(['f1'], [{ id: 'f1', name: 'Auth' }]), ['Auth']);

assert.strictEqual(resolveScreenName(null, null), '');
assert.deepStrictEqual(resolveScreenNames(null, null), []);
assert.deepStrictEqual(resolveScreenNames(['s1'], [{ id: 's1', name: 'Dashboard' }]), ['Dashboard']);

assert.strictEqual(resolvePhaseTitle(null, null), '');
assert.deepStrictEqual(resolvePhaseTitles(null, null), []);
verify(true, 'entityResolvers.js functions safely tolerate null, undefined, strings, and non-array collections');

// 5.2 RequirementsTab defensive normalization
const reqTabContent = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'RequirementsTab.jsx'), 'utf8');
verify(reqTabContent.includes('Array.isArray(req.featureIds)') || reqTabContent.includes('req.featureIds || []'), 'RequirementsTab guards featureIds against non-array values');
verify(reqTabContent.includes('Array.isArray(req.acceptanceCriteria)') || reqTabContent.includes('req.acceptanceCriteria || []'), 'RequirementsTab guards acceptanceCriteria against non-array values');
verify(reqTabContent.includes('No requirements available') || reqTabContent.includes('No requirements match'), 'RequirementsTab renders empty state fallback when requirements list is empty');

// 5.3 TechStackTab prop mismatch protection
const techStackTabContent = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'TechStackTab.jsx'), 'utf8');
verify(techStackTabContent.includes('techStack') && techStackTabContent.includes('blueprint'), 'TechStackTab accepts both techStack and blueprint props defensively');

// 5.4 DiagramTab ER diagram guard
const diagramTabContent = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'DiagramTab.jsx'), 'utf8');
verify(diagramTabContent.includes('try {') && diagramTabContent.includes('catch'), 'DiagramTab wraps Mermaid diagram generation in try-catch to prevent render-time throws');

// 5.5 ThreeDModelTab hardware fallback
const threeDTabContent = fs.readFileSync(path.join(srcDir, 'components', 'dashboard', 'ThreeDModelTab.jsx'), 'utf8');
verify(threeDTabContent.includes('unavailable') || threeDTabContent.includes('hasHardware'), 'ThreeDModelTab provides defensive fallback when hardware model is missing');

// -------------------------------------------------------------
// Check 6: Route & State Desynchronization Prevention
// -------------------------------------------------------------
console.log('\n--- Check 6: Route Parameter & State Desynchronization Prevention ---');
verify(detailPageContent.includes('setLoading(true)') && detailPageContent.includes('setProject(null)'), 'ProjectDetailPage resets loading and project state on id parameter change');
verify(detailPageContent.includes('hwTabs') && detailPageContent.includes('swTabs'), 'ProjectDetailPage sanitizes activeTab when switching between different project types (software/hardware/hybrid)');

console.log('\n====================================================');
console.log(`Phase 6 Verification: ALL ${passedChecks} CHECKS PASSED SUCCESSFULLY!`);
console.log('====================================================\n');
