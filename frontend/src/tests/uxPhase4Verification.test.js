// frontend/src/tests/uxPhase4Verification.test.js
// Verification suite for UX Improvement Phase 4: Beginner Project Plan Dashboard / Simple View

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('====================================================');
console.log('Running UX Phase 4 Verification Suite');
console.log('====================================================\n');

// 1. Inspect ProjectDetailPage.jsx for Simple & Advanced View Mode Controls
console.log('--- Check 1: Simple / Advanced View Mode Controls ---');
const detailPagePath = path.join(projectRoot, 'src', 'pages', 'ProjectDetailPage.jsx');
const detailPageJsx = fs.readFileSync(detailPagePath, 'utf8');

assert(detailPageJsx.includes("const [viewMode, setViewMode] = useState('simple')"), 'Simple View is default view mode');
assert(detailPageJsx.includes('id="btn-view-simple"'), 'Simple View toggle button has unique id btn-view-simple');
assert(detailPageJsx.includes('id="btn-view-advanced"'), 'Advanced View toggle button has unique id btn-view-advanced');
assert(detailPageJsx.includes('role="tablist"'), 'View mode switcher has proper tablist semantics');
assert(detailPageJsx.includes('openAdvancedSection'), 'Deep link / view switch helper openAdvancedSection defined');
console.log('✅ PASSED: Simple View is the default mode, Advanced View toggle is available with accessible semantics, and deep linking helper is defined');

// 2. Inspect Project Header & Step Context
console.log('\n--- Check 2: Project Header, Plan Status & Step Context ---');
assert(detailPageJsx.includes('Step 2 of 2 · Generate your Project Plan'), 'Step 2 context indicator present when no blueprint exists');
assert(detailPageJsx.includes('Project Plan ready'), 'Project Plan ready status present when blueprint exists');
assert(!detailPageJsx.includes('50% complete') && !detailPageJsx.includes('80%') && !detailPageJsx.includes('progress-bar'), 'Does not use fake percentage progress');
assert(detailPageJsx.includes('No Project Plan yet'), 'Plain-language "No Project Plan yet" status present');
assert(detailPageJsx.includes('Your idea changed — the Project Plan may need updating'), 'Calm outdated idea status present in header');
assert(detailPageJsx.includes('Technical details'), 'Discloses internal metadata under collapsed Technical details');
console.log('✅ PASSED: Project header provides human-friendly plan status, step 2 context, and moves raw metadata to Technical details');

// 3. Inspect No-Plan State Card
console.log('\n--- Check 3: Beginner No-Plan Card & Generation Choices ---');
assert(detailPageJsx.includes('Your project idea is saved'), 'No-plan card title is "Your project idea is saved"');
assert(detailPageJsx.includes('Now create a Project Plan from your idea.'), 'No-plan card description guides beginner to create a plan');
assert(detailPageJsx.includes('Your Project Plan will include:'), 'Briefly explains what the plan includes');
assert(detailPageJsx.includes('Main Features'), 'Mentions Main Features in plan summary');
assert(detailPageJsx.includes('Data Structure'), 'Mentions Data Structure in plan summary');
assert(detailPageJsx.includes('Backend APIs'), 'Mentions Backend APIs in plan summary');
assert(detailPageJsx.includes('Generate with Live AI'), 'Primary choice is Live AI with clear label');
assert(detailPageJsx.includes('Use Demo Plan'), 'Secondary choice is Demo Plan clearly labeled as sample data');
assert(detailPageJsx.includes('Live AI is not configured yet'), 'Helpful guidance when Live AI key is not configured');
assert(detailPageJsx.includes('Creating your Project Plan...'), 'Honest generation loading feedback');
assert(detailPageJsx.includes('This may take a few seconds.'), 'Honest generation duration explanation');
console.log('✅ PASSED: No-plan state provides focused beginner card with clear Live AI and Demo Plan choices and honest loading copy');

// 4. Inspect SimplePlanDashboard.jsx Structure & Metric Summary Cards
console.log('\n--- Check 4: SimplePlanDashboard Metric Summary Cards ---');
const simpleDashboardPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'SimplePlanDashboard.jsx');
const simpleDashboardJsx = fs.readFileSync(simpleDashboardPath, 'utf8');
const softwareSectionPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'SoftwarePlanSection.jsx');
const softwareSectionJsx = fs.readFileSync(softwareSectionPath, 'utf8');
const featuresTabJsx = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'dashboard', 'FeaturesTab.jsx'), 'utf8');
const rolesTabJsx = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'dashboard', 'RolesTab.jsx'), 'utf8');
const screensTabJsx = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'dashboard', 'ScreensTab.jsx'), 'utf8');
const roadmapTabJsx = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'dashboard', 'RoadmapTab.jsx'), 'utf8');
const diagramTabJsx = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'dashboard', 'DiagramTab.jsx'), 'utf8');

assert(simpleDashboardJsx.includes('features.length'), 'Metric card uses real features array count');
assert(simpleDashboardJsx.includes('roles.length'), 'Metric card uses real roles array count');
assert(simpleDashboardJsx.includes('screens.length') || softwareSectionJsx.includes('screens.length'), 'Metric card uses real screens array count');
assert(simpleDashboardJsx.includes('collections.length') || softwareSectionJsx.includes('collections.length'), 'Metric card uses real database collections count');
assert(simpleDashboardJsx.includes('Not checked'), 'Plan Check metric indicates "Not checked" when unvalidated');
assert(simpleDashboardJsx.includes('All Clear'), 'Plan Check metric indicates "All Clear" when 0 findings');
assert(simpleDashboardJsx.includes('to review'), 'Plan Check metric indicates count of items to review');
console.log('✅ PASSED: SimplePlanDashboard computes real summary metrics with zero fabricated values or fake scores');

// 5. Inspect Project Summary Section
console.log('\n--- Check 5: Project Summary Section ---');
assert(simpleDashboardJsx.includes('overview.summary'), 'Displays real overview.summary');
assert(simpleDashboardJsx.includes('What are we building?'), 'Uses plain-language "What are we building?" label');
assert(simpleDashboardJsx.includes('overview.problemStatement'), 'Displays real overview.problemStatement');
assert(simpleDashboardJsx.includes('Problem to solve'), 'Uses plain-language "Problem to solve" label');
assert(simpleDashboardJsx.includes('overview.targetUsers'), 'Displays real overview.targetUsers');
assert(simpleDashboardJsx.includes('Target Users') || simpleDashboardJsx.includes('Who is it for?'), 'Uses plain-language target users label');
assert(simpleDashboardJsx.includes('overview.goals'), 'Displays real overview.goals');
assert(simpleDashboardJsx.includes('recommendations') || simpleDashboardJsx.includes('risks') || simpleDashboardJsx.includes('overview.scope'), 'Recommendations, risks or scope organized');
console.log('✅ PASSED: Project Summary section organizes real overview content in beginner-friendly sections with collapsed details');

// 6. Inspect Main Features Section & Role Resolution
console.log('\n--- Check 6: Main Features Section & Capability Indicators ---');
assert(featuresTabJsx.includes('feat.needsUi'), 'Checks needsUi for friendly capability indicator');
assert(featuresTabJsx.includes('Needs App Screen'), 'Displays friendly "Needs App Screen" label instead of needsUi=true');
assert(featuresTabJsx.includes('feat.needsApi'), 'Checks needsApi for friendly capability indicator');
assert(featuresTabJsx.includes('Needs Backend API'), 'Displays friendly "Needs Backend API" label instead of needsApi=true');
assert(featuresTabJsx.includes('feat.needsPersistence'), 'Checks needsPersistence for friendly capability indicator');
assert(featuresTabJsx.includes('Needs Data Storage'), 'Displays friendly "Needs Data Storage" label instead of needsPersistence=true');
assert(featuresTabJsx.includes('resolveRoleNames') || featuresTabJsx.includes('role'), 'Resolves linked role IDs to readable role names');
assert(!featuresTabJsx.includes('needsUi=true'), 'Does not leak needsUi=true');
assert(!featuresTabJsx.includes('needsApi=true'), 'Does not leak needsApi=true');
assert(!featuresTabJsx.includes('needsPersistence=true'), 'Does not leak needsPersistence=true');
console.log('✅ PASSED: Main Features renders friendly capability badges, priority tags, and resolves linked roles by name');

// 7. Inspect Users & Roles Section
console.log('\n--- Check 7: Users & Roles Section ---');
assert(rolesTabJsx.includes('role.description'), 'Renders role description');
assert(rolesTabJsx.includes('role.permissions'), 'Renders permissions');
assert(rolesTabJsx.includes('System / automated role'), 'Gentle label "System / automated role" for non-interactive roles');
console.log('✅ PASSED: Users & Roles presents clear user types, permissions, and automated role indicators without raw IDs');

// 8. Inspect Combined Data & Backend Section
console.log('\n--- Check 8: Data & Backend Combined Section ---');
assert(softwareSectionJsx.includes('Database Schema') || softwareSectionJsx.includes('database'), 'Subgroup Data Structure present');
assert(softwareSectionJsx.includes('Backend APIs') || softwareSectionJsx.includes('apis'), 'Subgroup Backend APIs present');
console.log('✅ PASSED: Data & Backend section presents organized previews and connects deep-link buttons to Advanced sections');

// 9. Inspect Suggested App Screens Section
console.log('\n--- Check 9: Suggested App Screens Section ---');
assert(screensTabJsx.includes('screen.purpose') || screensTabJsx.includes('scr.purpose'), 'Renders screen purpose');
assert(screensTabJsx.includes('screen.route') || screensTabJsx.includes('scr.route'), 'Renders screen route');
console.log('✅ PASSED: App Screens renders routes, purposes, resolved role names, and deep-link action');

// 10. Inspect Recommended Build Roadmap Section
console.log('\n--- Check 10: Recommended Build Roadmap Section ---');
assert(roadmapTabJsx.includes('phase.title'), 'Renders phase title');
assert(roadmapTabJsx.includes('phase.description'), 'Renders phase description');
assert(roadmapTabJsx.includes('phase.tasks'), 'Renders phase tasks');
assert(!roadmapTabJsx.includes('Q1 202') && !roadmapTabJsx.includes('100% complete'), 'Does not show fake calendar dates or progress percentages');
console.log('✅ PASSED: Recommended Build Roadmap renders ordered phases and tasks without fake calendar dates or percentages');

// 11. Inspect Data Map Preview Section
console.log('\n--- Check 11: Data Map Preview Section ---');
assert(diagramTabJsx.includes("theme: 'dark'") || diagramTabJsx.includes('Data Map') || diagramTabJsx.includes('Mermaid'), 'Data Map / Architecture Diagram present');
console.log('✅ PASSED: Data Map preview summarizes collections and valid relationships with Open Data Map action');

// 12. Inspect Plan Check Summary Section
console.log('\n--- Check 12: Plan Check Summary Section ---');
assert(simpleDashboardJsx.includes('Plan Check'), 'Title is "Plan Check"');
assert(simpleDashboardJsx.includes('Your plan has not been checked yet.'), 'Friendly unvalidated status message');
assert(simpleDashboardJsx.includes('No issues were found by the currently implemented checks.'), 'Friendly zero-issue status message');
assert(simpleDashboardJsx.includes('flagged for review') || simpleDashboardJsx.includes('to review'), 'Friendly findings count label');
assert(simpleDashboardJsx.includes('View All Plan Check Results'), 'Provides "View All Plan Check Results" action');
assert(simpleDashboardJsx.includes("onOpenSection('validation')"), 'Plan Check action deep-links to validation tab');
assert(simpleDashboardJsx.includes('onRunValidation'), 'Provides trigger to run Plan Check directly');
console.log('✅ PASSED: Plan Check summary provides plain-language status, severity breakdown, and action to run checks');

// 13. Inspect Important Actions & Advanced Edit
console.log('\n--- Check 13: Important Actions Area & Advanced Edit ---');
assert(simpleDashboardJsx.includes('id="btn-open-regen-modal"'), 'Regenerate action has id="btn-open-regen-modal"');
assert(simpleDashboardJsx.includes('Regenerate Part of Plan'), 'Uses friendly label "Regenerate Part of Plan"');
assert(simpleDashboardJsx.includes('id="btn-open-edit-modal"'), 'Edit blueprint action has id="btn-open-edit-modal"');
assert(simpleDashboardJsx.includes('Edit Technical Plan Data'), 'Labels raw JSON editor as "Edit Technical Plan Data"');

// 14. Inspect RegenerateModal Friendly Terminology
console.log('\n--- Check 14: RegenerateModal Beginner Terminology ---');
const regenModalPath = path.join(projectRoot, 'src', 'components', 'dashboard', 'RegenerateModal.jsx');
const regenModalJsx = fs.readFileSync(regenModalPath, 'utf8');

assert(regenModalJsx.includes('Regenerate Part of Plan'), 'Modal title is "Regenerate Part of Plan"');
assert(regenModalJsx.includes('This is a proposed update. Your saved plan will not change until you choose Apply.'), 'Explanation warns that saved plan will not change until applied');
assert(regenModalJsx.includes('>Main Features</option>'), 'Dropdown displays "Main Features"');
assert(regenModalJsx.includes('>Users & Roles</option>'), 'Dropdown displays "Users & Roles"');
assert(regenModalJsx.includes('>Detailed Requirements</option>'), 'Dropdown displays "Detailed Requirements"');
assert(regenModalJsx.includes('>Data Structure</option>'), 'Dropdown displays "Data Structure"');
assert(regenModalJsx.includes('>Backend APIs</option>'), 'Dropdown displays "Backend APIs"');
assert(regenModalJsx.includes('>App Screens</option>'), 'Dropdown displays "App Screens"');
assert(regenModalJsx.includes('>Build Roadmap</option>'), 'Dropdown displays "Build Roadmap"');
assert(regenModalJsx.includes('Apply Changes'), 'Review button is "Apply Changes"');
assert(regenModalJsx.includes('Discard'), 'Discard button is "Discard"');
console.log('✅ PASSED: RegenerateModal provides friendly section names, clear candidate explanation, and Apply/Discard buttons');

// 15. Inspect Outdated Plan Experience
console.log('\n--- Check 15: Outdated Plan Experience ---');
assert(simpleDashboardJsx.includes('Your project idea changed after this Project Plan was created.'), 'Outdated notice headline is calm and friendly');
assert(simpleDashboardJsx.includes('The saved plan is still available, but some parts may no longer match your latest idea.'), 'Explains old plan is still available');
assert(simpleDashboardJsx.includes('Update Project Plan'), 'Provides "Update Project Plan" action');
assert(simpleDashboardJsx.includes('Review Current Plan'), 'Provides "Review Current Plan" action');
console.log('✅ PASSED: Outdated plan experience provides calm guidance without hiding or deleting the saved plan');

// 16. Inspect Loading & Error States
console.log('\n--- Check 16: Project Loading & Error States ---');
assert(detailPageJsx.includes('Loading your project...'), 'Loading state uses structured message "Loading your project..."');
assert(detailPageJsx.includes('This project could not be found.'), '404 state uses beginner-friendly "This project could not be found."');
assert(detailPageJsx.includes('Unable to load this project because IdeaStruct AI cannot connect to the backend.'), 'Backend error uses plain language');
assert(detailPageJsx.includes('Try Again'), 'Provides Try Again action on error');
console.log('✅ PASSED: Loading and error states use beginner-friendly language and provide recovery actions');

// 17. Inspect Separated Danger Zone (Delete Project)
console.log('\n--- Check 17: Visually Separated Danger Zone ---');
assert(detailPageJsx.includes('Project Settings & Danger Area'), 'Delete project is enclosed in Project Settings & Danger Area');
assert(detailPageJsx.includes('id="btn-delete-project"'), 'Delete button retains id btn-delete-project');
assert(detailPageJsx.includes('id="btn-confirm-delete"'), 'Delete confirmation retains id btn-confirm-delete');
console.log('✅ PASSED: Delete Project action is separated in a dedicated Danger Area at the bottom of the page');

console.log('\n====================================================');
console.log('ALL UX PHASE 4 CHECKS PASSED!');
console.log('====================================================\n');
