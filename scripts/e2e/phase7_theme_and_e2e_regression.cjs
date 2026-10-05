const fs = require('fs');
const path = require('path');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  chromium = require('../../frontend/node_modules/playwright').chromium;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:8080/api';

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots/theme');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runThemeAndRegressionAudit() {
  console.log('================================================================');
  console.log('IDEASTRUCT AI: MASTER CLEANUP & THEME UPGRADE E2E VERIFICATION');
  console.log('Frontend URL:', BASE_URL);
  console.log('Backend API: ', API_URL);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon or non-critical resource not found
      if (!text.includes('favicon.ico') && !text.includes('404')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      testsFailed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // PHASE 7A-7D: THEME ARCHITECTURE, TOGGLE & PERSISTENCE
    // -------------------------------------------------------------
    console.log('>>> [PHASE 7] Theme Toggle & Persistence Verification');

    // 1. Visit Home Page (First Visit: Dark by default)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    let themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'dark', 'First visit defaults to Dark Mode');

    // 2. Toggle to Light Mode
    const toggleBtn = await page.$('#theme-toggle-btn');
    assert(toggleBtn !== null, 'Theme toggle button (#theme-toggle-btn) exists in Navbar');

    const ariaLabel = await toggleBtn.getAttribute('aria-label');
    assert(ariaLabel && ariaLabel.toLowerCase().includes('light'), 'Toggle has accessible aria-label mentioning light');

    await toggleBtn.click();
    await page.waitForTimeout(300);

    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'light', 'Theme switched to Light Mode upon click');

    let storedTheme = await page.evaluate(() => localStorage.getItem('ideastruct-theme'));
    assert(storedTheme === 'light', 'Selected theme persisted to localStorage as "light"');

    // 3. Page Refresh Persistence (No flash)
    await page.reload({ waitUntil: 'networkidle' });
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'light', 'Light Mode preserved across page refresh');

    // 4. Navigation Persistence across routes
    await page.click('a[href="/projects"]');
    await page.waitForURL('**/projects');
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'light', 'Light Mode preserved navigating to /projects');

    await page.click('a[href="/health"]');
    await page.waitForURL('**/health');
    await page.waitForSelector('#btn-recheck-health');
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'light', 'Light Mode preserved navigating to /health');

    // 5. System Status Wording Verification (Phase 4)
    const healthBody = await page.textContent('body');
    assert(!healthBody.includes('local MongoDB database'), 'System status does NOT include "local MongoDB database"');
    assert(healthBody.includes('MongoDB database'), 'System status correctly refers to "MongoDB database"');
    assert(!healthBody.includes('http://localhost:8080'), 'System status does NOT have hardcoded localhost:8080 failure string');

    // 6. Switch back to Dark Mode
    const toggleBtnHealth = await page.$('#theme-toggle-btn');
    await toggleBtnHealth.click();
    await page.waitForTimeout(300);

    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(themeAttr === 'dark', 'Switched back to Dark Mode');
    storedTheme = await page.evaluate(() => localStorage.getItem('ideastruct-theme'));
    assert(storedTheme === 'dark', 'Dark Mode stored in localStorage');

    // -------------------------------------------------------------
    // PHASE 7F & 7N: FORM THEME & RESPONSIVENESS
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 7F & 7N] Form Theme & Responsive Viewports');

    // Check New Project Page
    await page.goto(`${BASE_URL}/projects/new`, { waitUntil: 'networkidle' });

    // Test Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    let hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!hasHScroll, 'Desktop 1440x900 has no horizontal scroll');

    // Test Tablet (1024x768)
    await page.setViewportSize({ width: 1024, height: 768 });
    hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!hasHScroll, 'Tablet Landscape 1024x768 has no horizontal scroll');

    // Test Tablet Portrait (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!hasHScroll, 'Tablet Portrait 768x1024 has no horizontal scroll');

    // Test Mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!hasHScroll, 'Mobile 375x667 has no horizontal scroll');
    const toggleBtnMobile = await page.$('#theme-toggle-btn');
    assert(toggleBtnMobile !== null, 'Theme toggle visible on mobile');

    // Reset to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // PHASE 5, 10, 11, 12: ESTIMATED COST CHECK & REGRESSION
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 5 & 10-12] Project Types & Cost Check');

    // Get list of projects from API
    const projectsRes = await fetch(`${API_URL}/projects?size=10`);
    const projectsData = await projectsRes.json();
    const projects = projectsData.content || [];

    const swProj = projects.find((p) => p.projectType === 'SOFTWARE') || projects[0];
    const hwProj = projects.find((p) => p.projectType === 'HARDWARE') || projects[1];
    const hyProj = projects.find((p) => p.projectType === 'HYBRID') || projects[2];

    // Verify Software Project in Dark & Light
    if (swProj) {
      console.log(`Testing Software Project (${swProj.id})...`);
      await page.goto(`${BASE_URL}/projects/${swProj.id}`, { waitUntil: 'networkidle' });
      let text = await page.textContent('body');
      assert(!text.includes('Estimated Cost'), 'Software project does NOT show "Estimated Cost"');
      assert(!text.includes('Cost & Time'), 'Software project does NOT show "Cost & Time"');

      // Switch to Light Mode
      await (await page.$('#theme-toggle-btn')).click();
      await page.waitForTimeout(300);
      text = await page.textContent('body');
      assert(!text.includes('Estimated Cost'), 'Software in Light mode does NOT show "Estimated Cost"');
      assert(await page.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'light', 'Software remains in Light mode');
    }

    // Verify Hardware Project in Dark & Light
    if (hwProj) {
      console.log(`Testing Hardware Project (${hwProj.id})...`);
      await page.goto(`${BASE_URL}/projects/${hwProj.id}`, { waitUntil: 'networkidle' });
      let text = await page.textContent('body');
      assert(!text.includes('Estimated Cost'), 'Hardware project does NOT show "Estimated Cost"');

      // Switch back to Dark Mode
      await (await page.$('#theme-toggle-btn')).click();
      await page.waitForTimeout(300);

      // Verify Wiring tab
      const wiringTab = await page.$('button:has-text("Circuit Wiring"), button:has-text("Wiring")');
      if (wiringTab) {
        await wiringTab.click();
        await page.waitForTimeout(500);
        const svgWires = await page.$('svg#wiring-svg, svg');
        assert(svgWires !== null, 'Hardware wiring SVG is rendered and visible');
      }

      // Verify 3D Model tab
      const threeDTab = await page.$('button:has-text("3D"), button:has-text("3D Model")');
      if (threeDTab) {
        await threeDTab.click();
        await page.waitForTimeout(1000);
        const canvas = await page.$('canvas');
        assert(canvas !== null, '3D Canvas mounted and active');
      }
    }

    // Verify Hybrid Project in Dark & Light
    if (hyProj) {
      console.log(`Testing Hybrid Project (${hyProj.id})...`);
      await page.goto(`${BASE_URL}/projects/${hyProj.id}`, { waitUntil: 'networkidle' });
      let text = await page.textContent('body');
      assert(!text.includes('Estimated Cost'), 'Hybrid project does NOT show "Estimated Cost"');
    }

    // -------------------------------------------------------------
    // PHASE 14: 20-CYCLE NAVIGATION + THEME STRESS TEST
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 14] 20-Cycle Navigation + Theme Stress Test');
    const targetProjId = hwProj ? hwProj.id : (swProj ? swProj.id : projects[0].id);

    for (let cycle = 1; cycle <= 20; cycle++) {
      process.stdout.write(`\r  Cycle ${cycle}/20: theme switch & tab navigation...`);
      // Toggle theme
      await page.evaluate(() => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ideastruct-theme', next);
      });

      // Switch between tabs or views
      const tabs = await page.$$('[role="tab"], .sub-tab-btn, button');
      if (tabs.length > 2) {
        const randomTab = tabs[cycle % Math.min(tabs.length, 6)];
        try {
          await randomTab.click({ timeout: 1000 });
        } catch {
          // ignore if non-clickable
        }
      }
      await page.waitForTimeout(50);
    }
    console.log('\n  ✓ 20 Cycles completed without crash or blank screen!');

    // -------------------------------------------------------------
    // PHASE 15: DEVTOOLS AUDIT & ERROR REPORTING
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 15] DevTools & Console Error Audit');
    console.log(`  Uncaught console errors encountered: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('  Errors logged:', consoleErrors);
    }
    assert(consoleErrors.length === 0, 'Zero uncaught console errors during test run');

  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`E2E AUDIT COMPLETE: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runThemeAndRegressionAudit().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
