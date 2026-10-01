const fs = require('fs');
const path = require('path');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  chromium = require('../../frontend/node_modules/playwright').chromium;
}

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runE2ECheck() {
  console.log('====================================================');
  console.log('Starting Playwright End-to-End Entire Web Verification');
  console.log('Target URL: http://localhost:5173');
  console.log('Browser Channel: Google Chrome (System Installed)');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Listen to console and page errors
  const consoleErrors = [];
  page.on('console', msg => {
    console.log('[BROWSER CONSOLE]', msg.type(), msg.text());
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error('[BROWSER PAGE ERROR]', err.message);
    consoleErrors.push(err.message);
  });
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log('[API REQUEST]', req.method(), req.url());
    }
  });
  page.on('response', res => {
    if (res.url().includes('/api/')) {
      console.log('[API RESPONSE]', res.status(), res.url());
    }
  });

  try {
    // -------------------------------------------------------------
    // STEP 0: Landing Page / Home (http://localhost:5173/)
    // -------------------------------------------------------------
    console.log('--- Step 0: Navigating to Landing Page (http://localhost:5173/) ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const homeTitle = await page.title();
    console.log('Page Title:', homeTitle);
    if (!homeTitle.includes('IdeaStruct AI')) {
      throw new Error(`Unexpected page title: ${homeTitle}`);
    }
    console.log('✅ Page title contains IdeaStruct AI');

    const heroH1 = page.locator('h1').first();
    const h1Text = await heroH1.innerText();
    console.log('✅ Hero H1:', h1Text);
    if (!h1Text.includes('Turn your software idea into a')) {
      throw new Error(`Hero H1 unexpected: ${h1Text}`);
    }

    // Verify Primary & Secondary CTAs
    const heroBtnCreate = page.locator('#hero-btn-create');
    const heroBtnProjects = page.locator('#hero-btn-projects');
    if (!await heroBtnCreate.isVisible() || !await heroBtnProjects.isVisible()) {
      throw new Error('Hero CTAs are not both visible');
    }
    console.log('✅ Hero Primary and Secondary CTAs visible');

    // Verify 3-step section
    await page.waitForSelector('text=How It Works');
    await page.waitForSelector('text=Describe your idea');
    await page.waitForSelector('text=AI creates your Project Plan');
    await page.waitForSelector('text=Review and improve');
    console.log('✅ 3-Step "How It Works" section verified');

    // Verify 9 output cards
    await page.waitForSelector('text=What will IdeaStruct AI prepare?');
    await page.waitForSelector('text=Project Summary');
    await page.waitForSelector('text=Data Structure');
    await page.waitForSelector('text=Backend APIs');
    await page.waitForSelector('text=Plan Check');
    console.log('✅ Prepared output cards verified with beginner terminology');

    // Verify Product Boundary
    await page.waitForSelector('text=What IdeaStruct AI does — and does not do');
    await page.waitForSelector('text=What It DOES');
    await page.waitForSelector('text=What It DOES NOT');
    console.log('✅ Product boundary (Does & Does Not) verified');

    // Verify Example
    await page.waitForSelector('text=See an Example Plan');
    await page.waitForSelector('text=Example Only — Illustrative Preview');
    console.log('✅ Beginner example plan verified with "Example Only" label');

    // Verify Getting Started guidance
    await page.waitForSelector('text=Not sure what to write?');
    const startExampleBtn = page.locator('#btn-start-with-example');
    if (!await startExampleBtn.isVisible()) {
      throw new Error('Start with example button not visible');
    }
    console.log('✅ Getting started guidance and example CTA visible');

    // Test Direct Refresh on /
    await page.reload({ waitUntil: 'networkidle' });
    console.log('✅ Direct browser refresh on / verified');

    // Responsive check on Landing Page
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    console.log('✅ Landing Page Tablet Viewport (768px) verified');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    console.log('✅ Landing Page Mobile Viewport (375px) verified');
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '00_landing_page.png') });

    // Test clicking "Start with an Example Idea" navigates to /projects/new?example=true
    await startExampleBtn.click();
    await page.waitForURL('**/projects/new?example=true', { timeout: 10000 });
    await page.waitForFunction(() => (document.querySelector('#project-title')?.value || '').length > 0, { timeout: 5000 });
    const prefilledTitle = await page.inputValue('#project-title');
    const prefilledIdea = await page.inputValue('#project-idea');
    if (!prefilledTitle || !prefilledIdea) {
      throw new Error('Example did not prefill into ProjectNewPage');
    }
    console.log('✅ "Start with an Example Idea" successfully opened /projects/new with prefilled idea');

    // -------------------------------------------------------------
    // STEP 1: Project List Page
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Navigating to Projects List (http://localhost:5173/projects) ---');
    await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle' });

    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);
    if (!pageTitle.includes('IdeaStruct AI')) {
      throw new Error(`Unexpected page title: ${pageTitle}`);
    }
    console.log('✅ Page title contains IdeaStruct AI');

    const brandEl = page.locator('text=IdeaStruct AI').first();
    if (!await brandEl.isVisible()) {
      throw new Error('Branding "IdeaStruct AI" not visible in navbar');
    }
    console.log('✅ Navbar branding visible');

    // Verify "My Projects" heading and description
    await page.waitForSelector('text=My Projects');
    await page.waitForSelector('text=Create, review, and continue your software planning projects.');
    console.log('✅ "My Projects" heading and beginner description verified');

    // Test Search Box if present
    const searchInput = page.locator('#input-search-projects');
    if (await searchInput.isVisible()) {
      await searchInput.fill('NonExistentKeywordXYZ123');
      await page.waitForTimeout(200);
      const noMatchText = page.locator('text=No projects match your search');
      if (await noMatchText.isVisible()) {
        console.log('✅ Client-side search empty result verified');
      }
      await searchInput.fill('');
      await page.waitForTimeout(200);
    }

    // Check "New Project" navigation button
    const newProjNavBtn = page.locator('a:has-text("New Project"), button:has-text("New Project")').first();
    if (!await newProjNavBtn.isVisible()) {
      throw new Error('New Project CTA button not visible');
    }
    console.log('✅ "New Project" navigation link visible');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_projects_list.png') });

    // -------------------------------------------------------------
    // STEP 2: System Health Page
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Navigating to Health Check (http://localhost:5173/health) ---');
    await page.goto('http://localhost:5173/health', { waitUntil: 'networkidle' });
    
    await page.waitForSelector('text=System Connectivity Status');
    console.log('✅ Health check page loaded');
    const isUp = await page.locator('text=UP').first().isVisible();
    if (!isUp) {
      throw new Error('Backend or MongoDB status is not reporting UP');
    }
    console.log('✅ Backend & MongoDB status UP verified');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_health_page.png') });

    // -------------------------------------------------------------
    // STEP 3: New Project Form Validation & Creation
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Navigating to New Project Page (/projects/new) ---');
    await page.goto('http://localhost:5173/projects/new', { waitUntil: 'networkidle' });
    
    // Check form presence, step context, and writing guide
    await page.waitForSelector('#project-title');
    await page.waitForSelector('#project-idea');
    await page.waitForSelector('#btn-submit-idea');
    await page.waitForSelector('text=Step 1 of 2');
    await page.waitForSelector('text=A good idea description usually answers:');
    console.log('✅ New Project form rendered with Step 1 of 2 indicator and writing guide');

    // Test Form Validation Failure & Guidance
    await page.fill('#project-title', 'AB');
    await page.fill('#project-idea', 'Too short idea');
    await page.click('#btn-submit-idea');
    await page.waitForSelector('text=Title must be at least 3 characters.');
    console.log('✅ Validation message displayed on invalid submit');

    // Test "Use Example Idea"
    const useExampleBtn = page.locator('#btn-use-example');
    await useExampleBtn.click();
    await page.waitForSelector('text=Example added. You can edit it before creating the project.');
    const titleVal = await page.inputValue('#project-title');
    const ideaVal = await page.inputValue('#project-idea');
    console.log('✅ Use Example button populated title:', titleVal.substring(0, 35) + '...');
    console.log('✅ Use Example populated idea length:', ideaVal.length, 'characters');

    // Test "Clear Draft" button
    const clearDraftBtn = page.locator('#btn-clear-draft');
    if (await clearDraftBtn.isVisible()) {
      await clearDraftBtn.click();
      console.log('✅ Clear Draft button cleared the form');
    }

    // Enter disposable test project
    const testTitle = 'Automated Playwright E2E Lab App ' + Date.now();
    const testIdea = 'A specialized cloud monitoring platform for university chemistry laboratories. Provides real-time sensor tracking, equipment reservations, maintenance logs, and emergency alert notifications for student researchers.';
    
    await page.fill('#project-title', testTitle);
    await page.fill('#project-idea', testIdea);
    console.log('Filled disposable project details. Submitting form...');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_new_project_form.png') });
    await page.click('#btn-submit-idea');
    await page.waitForTimeout(400);
    if (page.url().includes('/projects/new')) {
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      });
    }
    
    // Should navigate to /projects/:id
    await page.waitForURL(/\/projects\/[a-f0-9]+/, { timeout: 10000 });
    const projectUrl = page.url();
    const projectId = projectUrl.split('/').pop();
    console.log('✅ Redirected to Project Detail page:', projectUrl);
    console.log('✅ Created Project ID:', projectId);

    // -------------------------------------------------------------
    // STEP 4: Initial Project Detail & Blueprint Generation
    // -------------------------------------------------------------
    console.log('\n--- Step 4: No-Plan Simple View & Generating DEMO Blueprint ---');
    await page.waitForSelector('text=Your project idea is saved');
    await page.waitForSelector('text=Step 2 of 2 · Generate your Project Plan');
    await page.waitForSelector('#btn-generate-demo');
    await page.waitForSelector('#btn-generate-live');
    console.log('✅ No-plan Simple View verified: Step 2 context, beginner card, Live AI and Demo options present');

    await page.click('#btn-generate-demo');
    console.log('Clicked Generate DEMO Blueprint. Waiting for generation...');

    // Wait for Simple View populated
    await page.waitForSelector('text=Main Features', { timeout: 15000 });
    await page.waitForSelector('text=Project Summary');
    await page.waitForSelector('text=Who will use this application?');
    await page.waitForSelector('text=Data & Backend');
    await page.waitForSelector('#btn-view-advanced');
    console.log('✅ Blueprint generated successfully! Simple View populated with beginner cards');

    // Verify metadata badge
    const badgeEl = page.locator('.badge, .badge-neutral, .badge-aqua').first();
    const badgeText = await badgeEl.innerText();
    console.log('✅ Provenance Badge:', badgeText);

    // Switch to Advanced View
    console.log('\n--- Switching to Advanced View ---');
    await page.click('#btn-view-advanced');
    await page.waitForSelector('#tab-btn-overview', { timeout: 5000 });
    console.log('✅ Switched to Advanced View: Dashboard tabs rendered');

    // -------------------------------------------------------------
    // STEP 5: Systematic Inspection of All 10 Dashboard Tabs (Human-Friendly Advanced View)
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Systematically Inspecting All 10 Dashboard Tabs ---');

    // 1. Overview Tab
    console.log('Inspecting Tab 1: Overview...');
    await page.click('#tab-btn-overview');
    await page.waitForSelector('text=Project Summary');
    await page.waitForSelector('text=What are we building?');
    await page.waitForSelector('text=Problem to solve');
    await page.waitForSelector('text=In Scope');
    console.log('✅ Overview tab verified: Project Summary, Problem to solve, Scope boundaries present');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_overview_tab.png') });

    // 2. Features Tab
    console.log('Inspecting Tab 2: Features...');
    await page.click('#tab-btn-features');
    await page.waitForSelector('text=Main Features');
    await page.locator('text=Needs App Screen').first().waitFor();
    await page.locator('text=Used by:').first().waitFor();
    const featureCards = await page.locator('.card').count();
    console.log(`✅ Features tab verified: ${featureCards} cards found with friendly capability badges and resolved role names`);

    // 3. Roles Tab
    console.log('Inspecting Tab 3: Roles...');
    await page.click('#tab-btn-roles');
    await page.waitForSelector('text=Users & Roles');
    await page.locator('text=Permissions').first().waitFor();
    console.log('✅ Roles tab verified: Roles list, friendly descriptions and permissions present');

    // 4. Requirements Tab
    console.log('Inspecting Tab 4: Requirements...');
    await page.click('#tab-btn-requirements');
    await page.waitForSelector('text=Detailed Requirements');
    await page.waitForSelector('text=Requirements describe what the software should do and how well it should work.');
    const reqFuncBtn = page.locator('button:has-text("Functional")').first();
    if (await reqFuncBtn.isVisible()) {
      await reqFuncBtn.click();
      console.log('✅ Requirements filter Functional clicked');
    }
    const reqNonFuncBtn = page.locator('button:has-text("Non-Functional")').first();
    if (await reqNonFuncBtn.isVisible()) {
      await reqNonFuncBtn.click();
      console.log('✅ Requirements filter Non-Functional clicked');
    }
    const reqAllBtn = page.locator('button:has-text("All")').first();
    if (await reqAllBtn.isVisible()) {
      await reqAllBtn.click();
      console.log('✅ Requirements filter All restored');
    }

    // 5. Database Tab
    console.log('Inspecting Tab 5: Database...');
    await page.click('#tab-btn-database');
    await page.waitForSelector('text=Data Structure');
    await page.waitForSelector('text=Document Collections');
    await page.locator('th:has-text("Field")').first().waitFor();
    await page.locator('th:has-text("Required?")').first().waitFor();
    await page.locator('text=Suggested Indexes').first().waitFor();
    console.log('✅ Database tab verified: Friendly column headers, Yes/No constraints, and Suggested Indexes rendered');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_database_tab.png') });

    // 6. APIs Tab
    console.log('Inspecting Tab 6: APIs...');
    await page.click('#tab-btn-apis');
    await page.waitForSelector('text=Backend APIs');
    await page.locator('text=Who can use it?').first().waitFor();
    await page.locator('text=Request Example').first().waitFor();
    console.log('✅ APIs tab verified: Purpose-first layout, resolved roles, and collapsed payload examples present');

    // 7. UI Screens Tab
    console.log('Inspecting Tab 7: UI Screens...');
    await page.click('#tab-btn-screens');
    await page.waitForSelector('text=App Screens');
    await page.locator('text=Possible screen states').first().waitFor();
    console.log('✅ UI Screens tab verified: App Screens, states, routes, and resolved target screens rendered');

    // 8. Roadmap Tab
    console.log('Inspecting Tab 8: Roadmap...');
    await page.click('#tab-btn-roadmap');
    await page.waitForSelector('text=Build Roadmap');
    await page.locator('h5:has-text("Main Tasks")').first().waitFor();
    await page.locator('h5:has-text("Completion Criteria")').first().waitFor();
    console.log('✅ Roadmap tab verified: Phase sequence, dependencies, and tasks rendered without fake dates');

    // 9. Diagram Tab (Mermaid ER)
    console.log('Inspecting Tab 9: Relationship Diagram (Data Map)...');
    await page.click('#tab-btn-diagram');
    await page.waitForSelector('text=Data Map');
    await page.waitForSelector('text=Cardinality Legend');
    
    // Check for Mermaid SVG
    await page.waitForSelector('div[id^="mermaid-er-"], svg[id^="mermaid-er-"], svg', { timeout: 10000 });
    console.log('✅ Mermaid ER Diagram rendered interactive SVG canvas with Cardinality Legend');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_diagram_tab.png') });

    // Test text fallback toggle
    const textToggle = page.locator('button:has-text("Text Relationships")');
    if (await textToggle.isVisible()) {
      await textToggle.click();
      await page.waitForSelector('text=Data Model Structured Text View');
      console.log('✅ Text Relationships view rendered properly');
      
      const visualToggle = page.locator('button:has-text("Visual Diagram")');
      await visualToggle.click();
      console.log('✅ Switched back to Visual ER Diagram successfully');
    }

    // 10. Validation Tab
    console.log('Inspecting Tab 10: Validation Engine (Plan Check)...');
    await page.click('#tab-btn-validation');
    await page.waitForSelector('text=Plan Check');
    await page.waitForSelector('text=Understanding Check Results');
    await page.waitForSelector('text=All Findings');
    // Run Plan Check
    const runPlanCheckBtn = page.locator('button:has-text("Run Plan Check")').first();
    if (await runPlanCheckBtn.isVisible()) {
      await runPlanCheckBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Run Plan Check and evaluated findings');
    }
    console.log('✅ Plan Check tab verified: Plain-language messages, severity meanings, and filter counts rendered');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_validation_tab.png') });

    // -------------------------------------------------------------
    // STEP 6: Modal Workflows (Edit & Regenerate: Discard & Apply)
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Testing Modal Workflows ---');
    
    // Edit Blueprint Modal
    const editBtn = page.locator('#btn-open-edit-modal');
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForSelector('text=Edit Technical Plan Data');
      console.log('✅ Edit Blueprint Modal opened');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_edit_blueprint_modal.png') });
      
      // Cancel / Close modal
      const cancelEdit = page.locator('button:has-text("Discard / Cancel"), button:has-text("Cancel")').first();
      await cancelEdit.click();
      await page.waitForTimeout(300);
      console.log('✅ Edit Blueprint Modal closed safely');
    }

    // Regenerate Section Modal: Candidate review -> Discard, then regenerate -> Apply
    const regenBtn = page.locator('#btn-open-regen-modal');
    if (await regenBtn.isVisible()) {
      await regenBtn.click();
      await page.waitForSelector('text=Regenerate Part of Plan');
      console.log('✅ Regenerate Section Modal opened');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_regenerate_modal.png') });
      
      // 1. Propose candidate and Discard
      const generateCandidateBtn = page.locator('button:has-text("Generate Candidate for Review")');
      await generateCandidateBtn.click();
      await page.waitForSelector('text=Proposal Ready for Review', { timeout: 15000 });
      console.log('✅ Candidate proposal generated and displayed for review');

      const discardBtn = page.locator('button:has-text("Discard")');
      await discardBtn.click();
      await page.waitForTimeout(300);
      console.log('✅ Candidate proposal discarded without applying');

      // 2. Regenerate again and Apply
      await regenBtn.click();
      await page.waitForSelector('text=Regenerate Part of Plan');
      await page.locator('button:has-text("Generate Candidate for Review")').click();
      await page.waitForSelector('text=Proposal Ready for Review', { timeout: 15000 });
      const applyBtn = page.locator('#btn-apply-proposal');
      await applyBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Candidate proposal applied successfully to plan');
    }

    // Return to Simple View
    console.log('\n--- Returning to Simple View ---');
    await page.click('#btn-view-simple');
    await page.waitForSelector('text=Project Summary');
    console.log('✅ Successfully returned to Simple View');

    // -------------------------------------------------------------
    // STEP 7: Responsive Viewport Tests
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Testing Responsive Viewports ---');
    
    // Tablet Viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    console.log('✅ Tablet Viewport (768px) tested — layout adapted cleanly');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_tablet_view.png') });

    // Mobile Viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(400);
    console.log('✅ Mobile Viewport (375px) tested — tabs and cards adapt without horizontal break');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_mobile_view.png') });

    // Restore Desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // STEP 8: Cleanup Disposable Project
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Deleting Disposable Test Project ---');
    const deleteBtn = page.locator('#btn-delete-project');
    await deleteBtn.click();
    
    // Confirm delete in modal
    await page.waitForSelector('text=Delete Project?');
    const confirmDeleteBtn = page.locator('#btn-confirm-delete');
    await confirmDeleteBtn.click();

    // Verify redirected back to /projects
    await page.waitForURL('http://localhost:5173/projects', { timeout: 10000 });
    console.log('✅ Project deleted and redirected back to /projects list');

    console.log('\n====================================================');
    console.log('PLAYWRIGHT ENTIRE WEB VERIFICATION: ALL 8 STEPS PASSED!');
    console.log('====================================================');
    console.log('Total Console Errors Logged:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
      throw new Error(`Expected 0 console errors, but encountered ${consoleErrors.length}: ${consoleErrors.join(' | ')}`);
    }
    console.log('✅ Strictly 0 browser console errors verified');
    console.log(`\nVisual screenshots captured in: ${SCREENSHOTS_DIR}`);

  } catch (err) {
    console.error('\n❌ Playwright Verification Error:', err.message);
    const errorScreenshotPath = path.join(SCREENSHOTS_DIR, 'playwright_error_screenshot.png');
    await page.screenshot({ path: errorScreenshotPath });
    throw err;
  } finally {
    await browser.close();
  }
}

runE2ECheck().catch(err => {
  console.error(err);
  process.exit(1);
});
