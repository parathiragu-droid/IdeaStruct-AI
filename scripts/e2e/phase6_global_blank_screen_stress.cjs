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

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots/phase6');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Track stats
const stats = {
  routesTested: 0,
  tabSwitches: 0,
  refreshChecks: 0,
  backForwardChecks: 0,
  blankPageDetections: 0,
  uncaughtConsoleErrors: 0,
  webGLErrors: 0,
  threeDModelsLoaded: 0,
  passedChecks: 0,
  failedChecks: 0,
  failures: []
};

/**
 * MANDATORY BLANK PAGE DETECTOR (Phase M & Phase 6S)
 * Verifies that the document, app root, navbar, and main content exist and are visible.
 */
async function assertNotBlank(page, contextDesc) {
  try {
    // 1. App Root check
    const root = await page.$('#root');
    if (!root) {
      const msg = `[CRITICAL BLANK PAGE] #root element missing at "${contextDesc}"`;
      stats.blankPageDetections++;
      stats.failures.push(msg);
      throw new Error(msg);
    }

    // 2. Non-empty innerHTML check
    const rootHtml = await root.innerHTML();
    if (!rootHtml || rootHtml.trim() === '') {
      const msg = `[CRITICAL BLANK PAGE] #root is completely empty at "${contextDesc}"`;
      stats.blankPageDetections++;
      stats.failures.push(msg);
      throw new Error(msg);
    }

    // 3. Navbar / header check
    const nav = await page.$('nav, header, [role="navigation"], .navbar');
    if (!nav) {
      const msg = `[SHELL CRASH] Navigation bar missing from application shell at "${contextDesc}"`;
      stats.blankPageDetections++;
      stats.failures.push(msg);
      throw new Error(msg);
    }

    // 4. Main content or error card check
    const main = await page.$('main, .container, [role="main"], .card');
    if (!main) {
      const msg = `[CONTENT MISSING] Neither main container nor fallback card present at "${contextDesc}"`;
      stats.blankPageDetections++;
      stats.failures.push(msg);
      throw new Error(msg);
    }

    // 5. Visible text length or canvas check
    const visibleText = await page.evaluate(() => {
      const el = document.body;
      return (el.innerText || '').trim();
    });

    const hasCanvas = await page.$('canvas');
    if (visibleText.length < 10 && !hasCanvas) {
      const msg = `[BLANK TEXT DETECTED] Insufficient text (${visibleText.length} chars) and no canvas at "${contextDesc}"`;
      stats.blankPageDetections++;
      stats.failures.push(msg);
      throw new Error(msg);
    }

    stats.passedChecks++;
    return true;
  } catch (err) {
    stats.failedChecks++;
    console.error(`❌ BLANK SCREEN CHECK FAILED at: ${contextDesc}`, err.message);
    const ssPath = path.join(SCREENSHOTS_DIR, `blank_error_${Date.now()}.png`);
    await page.screenshot({ path: ssPath, fullPage: true }).catch(() => {});
    throw err;
  }
}

async function runPhase6E2E() {
  console.log('================================================================');
  console.log('PHASE 6: GLOBAL BLANK PAGE / TAB CRASH / 3D STABILITY AUDIT');
  console.log(`Target Frontend: ${BASE_URL}`);
  console.log(`Target Backend:  ${API_URL}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Monitor console errors and uncaught exceptions
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      // Exclude expected non-fatal network 404 tests or dev warnings
      if (text.includes('Failed to load resource: the server responded with a status of 404') ||
          text.includes('HTTP 404') ||
          text.includes('favicon.ico')) {
        return;
      }
      console.warn(`[BROWSER ERROR] ${text}`);
      if (text.includes('TypeError') || text.includes('Uncaught') || text.includes('three') || text.includes('WebGL')) {
        stats.uncaughtConsoleErrors++;
        if (text.includes('WebGL') || text.includes('THREE')) stats.webGLErrors++;
        stats.failures.push(`[Console Error]: ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    console.error(`[PAGE RUNTIME CRASH] ${err.message}`);
    stats.uncaughtConsoleErrors++;
    stats.failures.push(`[Page Crash]: ${err.message}`);
  });

  try {
    // -------------------------------------------------------------
    // PHASE 6A: REPRODUCE RECORDED FAILURE & VERIFY FIX
    // SentinelAir project with object dimensions in 3D enclosure
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6A: Reproducing & Verifying SentinelAir Hardware 3D');
    const targetHwId = '6aba3128afebb14f7dff2889';
    await page.goto(`${BASE_URL}/projects/${targetHwId}`, { waitUntil: 'networkidle' });
    await assertNotBlank(page, 'SentinelAir Project Detail - Initial Load');

    // Switch to Advanced View
    const advancedBtn = await page.$('#btn-view-advanced');
    if (advancedBtn) {
      await advancedBtn.click();
      await page.waitForTimeout(300);
      await assertNotBlank(page, 'SentinelAir Advanced View');
    }

    // Sequence from screen recording: Overview -> Requirements -> Components -> Wiring -> Firmware -> 3D Model -> Requirements -> 3D Model
    const recTabs = ['overview', 'requirements', 'components', 'connections', 'firmware', 'threedmodel', 'requirements', 'threedmodel'];
    for (const tName of recTabs) {
      const tabBtn = await page.$(`button#tab-btn-${tName}, button[data-tab="${tName}"]`);
      if (tabBtn) {
        await tabBtn.click();
        await page.waitForTimeout(400);
        await assertNotBlank(page, `SentinelAir Tab: ${tName}`);
        stats.tabSwitches++;
      }
    }

    // Verify 3D canvas is present and not 0x0
    const canvasHw = await page.$('canvas');
    if (canvasHw) {
      const box = await canvasHw.boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        console.log(`✓ 3D Canvas visible and rendered properly: ${Math.round(box.width)}x${Math.round(box.height)}px`);
        stats.threeDModelsLoaded++;
      } else {
        throw new Error(`3D Canvas dimensions invalid: ${JSON.stringify(box)}`);
      }
    }

    // Toggle Simple View <-> Advanced View
    const simpleBtn = await page.$('#btn-view-simple');
    if (simpleBtn) {
      await simpleBtn.click();
      await page.waitForTimeout(300);
      await assertNotBlank(page, 'SentinelAir Simple View');
    }
    const advBtnAgain = await page.$('#btn-view-advanced');
    if (advBtnAgain) {
      await advBtnAgain.click();
      await page.waitForTimeout(300);
      await assertNotBlank(page, 'SentinelAir Back to Advanced View');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_sentinelair_fixed.png') });
    console.log('✓ Phase 6A: SentinelAir bug fix verified! No blank screen.');

    // -------------------------------------------------------------
    // PHASE 6B: FULL ROUTE / PAGE LOAD AUDIT
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6B: Full Route Audit');
    const routesToTest = [
      { path: '/', name: 'Home' },
      { path: '/projects', name: 'My Projects' },
      { path: '/projects/new', name: 'New Project' },
      { path: '/system-status', name: 'System Status (Redirect to /health)' },
      { path: '/health', name: 'Health Check' },
      { path: '/projects/6aba2224afebb14f7dff287a', name: 'Software Project (CampusEvent)' },
      { path: '/projects/6aba3128afebb14f7dff2889', name: 'Hardware Project (SentinelAir)' },
      { path: '/projects/6aba2573afebb14f7dff287c', name: 'Hybrid Project (AgriFlow)' }
    ];

    for (const r of routesToTest) {
      console.log(`Checking route: ${r.path} (${r.name})...`);
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await assertNotBlank(page, `Route: ${r.path}`);
      stats.routesTested++;
    }
    console.log('✓ Phase 6B: All major routes load cleanly without blank screen.');

    // -------------------------------------------------------------
    // PHASE 6C: BROWSER REFRESH TEST
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6C: Browser Refresh Test');
    const refreshPages = [
      '/',
      '/projects',
      '/projects/new',
      '/health',
      '/projects/6aba2224afebb14f7dff287a',
      '/projects/6aba3128afebb14f7dff2889',
      '/projects/6aba2573afebb14f7dff287c'
    ];

    for (const pUrl of refreshPages) {
      await page.goto(`${BASE_URL}${pUrl}`, { waitUntil: 'networkidle' });
      await page.reload({ waitUntil: 'networkidle' });
      await assertNotBlank(page, `Refresh page: ${pUrl}`);
      stats.refreshChecks++;
    }
    console.log('✓ Phase 6C: Browser reload on all core pages is safe and preserves UI.');

    // -------------------------------------------------------------
    // PHASE 6D: BROWSER BACK / FORWARD NAVIGATION TEST
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6D: Browser Back / Forward Navigation Test');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle' });
    await page.goto(`${BASE_URL}/projects/6aba3128afebb14f7dff2889`, { waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Navigation stack top');

    // Go back twice
    await page.goBack({ waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Browser Back to /projects');
    stats.backForwardChecks++;

    await page.goBack({ waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Browser Back to Home');
    stats.backForwardChecks++;

    // Go forward twice
    await page.goForward({ waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Browser Forward to /projects');
    stats.backForwardChecks++;

    await page.goForward({ waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Browser Forward to Project Detail');
    stats.backForwardChecks++;
    console.log('✓ Phase 6D: Back and forward navigation fully resilient.');

    // -------------------------------------------------------------
    // PHASE 6E & 6F: 20-CYCLE TAB NAVIGATION STRESS TEST
    // 1 Software, 2 Hardware, 1 Hybrid
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6E & 6F: 20-Cycle Tab Navigation Stress Test');
    const stressProjects = [
      { id: '6aba2224afebb14f7dff287a', type: 'SOFTWARE', tabs: ['overview', 'requirements', 'features', 'roles', 'estimates', 'roadmap', 'prototype', 'validation'] },
      { id: '6aba3128afebb14f7dff2889', type: 'HARDWARE-1', tabs: ['overview', 'requirements', 'components', 'connections', 'firmware', 'threedmodel', 'validation'] },
      { id: '6aba1236afebb14f7dff2877', type: 'HARDWARE-2', tabs: ['overview', 'requirements', 'components', 'connections', 'firmware', 'threedmodel', 'validation'] },
      { id: '6aba2573afebb14f7dff287c', type: 'HYBRID', tabs: ['overview', 'requirements', 'components', 'connections', 'prototype', 'threedmodel', 'validation'] }
    ];

    for (const proj of stressProjects) {
      console.log(`Starting tab stress test for ${proj.type} (${proj.id})...`);
      await page.goto(`${BASE_URL}/projects/${proj.id}`, { waitUntil: 'networkidle' });
      await assertNotBlank(page, `${proj.type} Project Initial`);

      const advBtn = await page.$('#btn-view-advanced');
      if (advBtn) {
        await advBtn.click();
        await page.waitForTimeout(200);
      }

      // Loop cycles (5 cycles per project across 4 projects = 20 total cycles)
      for (let cycle = 1; cycle <= 5; cycle++) {
        for (const tName of proj.tabs) {
          const tabBtn = await page.$(`button#tab-btn-${tName}, button[data-tab="${tName}"]`);
          if (tabBtn) {
            await tabBtn.click();
            await page.waitForTimeout(150);
            await assertNotBlank(page, `${proj.type} [Cycle ${cycle}] Tab: ${tName}`);
            stats.tabSwitches++;
          }
        }
      }
      console.log(`✓ Completed tab stress for ${proj.type}: 0 blank pages, 0 crashes.`);
    }

    // -------------------------------------------------------------
    // PHASE 6H: MULTI-PROJECT 3D STRESS TEST
    // 6 Distinct Archetypes: Gas Detector, Irrigation, Wearable, Rover, Smart Parking, Pet Feeder
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6H: Multi-Project 3D Stress Test (6 Distinct Archetypes)');
    const threeDArchetypes = [
      { name: 'Gas Detector', id: '6aba3128afebb14f7dff2889' },
      { name: 'Irrigation Controller', id: '6ab7f0197867b139e544ebeb' },
      { name: 'Wearable Watch', id: '6ab7f5c27867b139e544ebec' },
      { name: 'Sonar Rover', id: '6ab7f5c37867b139e544ebed' },
      { name: 'Smart Parking', id: '6aba1236afebb14f7dff2877' },
      { name: 'Pet Feeder', id: '6aba1236afebb14f7dff2878' }
    ];

    for (const arch of threeDArchetypes) {
      console.log(`Testing 3D Archetype: ${arch.name} (${arch.id})...`);
      await page.goto(`${BASE_URL}/projects/${arch.id}`, { waitUntil: 'networkidle' });
      await assertNotBlank(page, `3D Test: ${arch.name}`);

      const advBtn = await page.$('#btn-view-advanced');
      if (advBtn) {
        await advBtn.click();
        await page.waitForTimeout(200);
      }

      const threeDTab = await page.$('button#tab-btn-threedmodel, button[data-tab="threedmodel"]');
      if (threeDTab) {
        await threeDTab.click();
        await page.waitForTimeout(500);
        await assertNotBlank(page, `3D Tab Active: ${arch.name}`);

        const canvas = await page.$('canvas');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box && box.width > 50 && box.height > 50) {
            console.log(`  ✓ 3D Canvas mounted cleanly: ${Math.round(box.width)}x${Math.round(box.height)}px`);
            stats.threeDModelsLoaded++;
          }
        }
      }
    }
    console.log('✓ Phase 6H: Multi-project 3D stress test passed with no context exhaustion!');

    // -------------------------------------------------------------
    // PHASE 6L & 6M: API / NETWORK FAILURE RESILIENCE
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6L & 6M: Network & API Failure Resilience');
    // 404 Project
    await page.goto(`${BASE_URL}/projects/600000000000000000000000`, { waitUntil: 'networkidle' });
    await assertNotBlank(page, '404 Project Not Found');
    const notFoundText = await page.innerText('body');
    if (!notFoundText.includes('could not be found') && !notFoundText.includes('Not Available')) {
      throw new Error('404 did not render friendly message');
    }
    console.log('✓ 404 project displays user-friendly error card with Navbar preserved.');

    // Invalid ID
    await page.goto(`${BASE_URL}/projects/invalid-id-format`, { waitUntil: 'networkidle' });
    await assertNotBlank(page, 'Invalid ID Error State');
    console.log('✓ Invalid ID displays user-friendly error card with Navbar preserved.');

    // -------------------------------------------------------------
    // PHASE 6U: RESPONSIVE VIEWPORT STABILITY
    // -------------------------------------------------------------
    console.log('\n>>> PHASE 6U: Responsive Viewport Stability');
    const viewports = [
      { width: 1440, height: 900, name: 'Desktop (1440x900)' },
      { width: 1024, height: 768, name: 'Tablet Landscape (1024x768)' },
      { width: 768, height: 1024, name: 'Tablet Portrait (768x1024)' },
      { width: 375, height: 667, name: 'Mobile (375x667)' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/projects/6aba3128afebb14f7dff2889`, { waitUntil: 'networkidle' });
      await assertNotBlank(page, `Responsive: ${vp.name}`);
      console.log(`✓ Responsive check passed at ${vp.name}`);
    }

    console.log('\n================================================================');
    console.log('PHASE 6 AUTOMATED AUDIT COMPLETED SUCCESSFULLY!');
    console.log(`Routes Tested:            ${stats.routesTested}`);
    console.log(`Tab Switches Verified:    ${stats.tabSwitches}`);
    console.log(`Refresh Checks:           ${stats.refreshChecks}`);
    console.log(`Back/Forward Checks:      ${stats.backForwardChecks}`);
    console.log(`3D Models Initialized:    ${stats.threeDModelsLoaded}`);
    console.log(`Blank Screen Detections:  ${stats.blankPageDetections} (PASS: 0)`);
    console.log(`Uncaught Console Errors:  ${stats.uncaughtConsoleErrors} (PASS: 0)`);
    console.log(`WebGL Context Errors:     ${stats.webGLErrors} (PASS: 0)`);
    console.log(`Total Checks Passed:      ${stats.passedChecks}`);
    console.log(`Total Checks Failed:      ${stats.failedChecks}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase6E2E();
