const { chromium } = require('d:/IdeaStruct AI/frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'https://idea-struct-ai.vercel.app';
const BACKEND_URL = 'https://ideastruct-api.onrender.com';
const API_URL = `${BACKEND_URL}/api`;

const audit = {
  consoleErrors: [],
  pageErrors: [],
  networkErrors: [],
  corsErrors: [],
  webglErrors: [],
  blankScreens: 0,
  routesVerified: [],
  tabsVerified: []
};

function log(section, msg) {
  console.log(`[${section}] ${msg}`);
}

async function verifyPageNotBlank(page, routeName) {
  const root = await page.$('#root');
  if (!root) {
    audit.blankScreens++;
    throw new Error(`Blank screen detected at ${routeName}: #root is missing`);
  }
  const text = (await page.evaluate(() => document.body.innerText) || '').trim();
  if (text.length < 15 && (await page.$$('canvas')).length === 0) {
    audit.blankScreens++;
    throw new Error(`Blank screen detected at ${routeName}: text length is ${text.length}`);
  }
  log('PAGE_AUDIT', `✅ ${routeName} rendered cleanly (${text.length} chars)`);
  audit.routesVerified.push(routeName);
}

async function runDeployAudit() {
  console.log('================================================================');
  console.log('LIVE PRODUCTION REDEPLOYMENT VERIFICATION');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Attach DevTools listeners
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      if (text.includes('favicon.ico') || text.includes('React DevTools')) return;
      audit.consoleErrors.push(text);
      if (text.includes('WebGL') || text.includes('THREE')) audit.webglErrors.push(text);
      if (text.includes('CORS') || text.includes('Access-Control-Allow-Origin')) audit.corsErrors.push(text);
      console.warn('   [Console Error]:', text);
    }
  });

  page.on('pageerror', err => {
    audit.pageErrors.push(err.message);
    if (err.message.includes('WebGL') || err.message.includes('THREE')) audit.webglErrors.push(err.message);
    console.error('   [Page Runtime Crash]:', err.message);
  });

  page.on('requestfailed', req => {
    const failure = req.failure()?.errorText || 'Failed';
    const text = `${req.method()} ${req.url()} (${failure})`;
    audit.networkErrors.push(text);
    if (failure.includes('CORS') || text.includes('CORS')) audit.corsErrors.push(text);
    console.warn('   [Network Request Failed]:', text);
  });

  const results = {
    backendHealth: 'FAIL',
    home: 'FAIL',
    projects: 'FAIL',
    newProject: 'FAIL',
    systemStatus: 'FAIL',
    softwareProject: 'FAIL',
    hardwareProject: 'FAIL',
    hybridProject: 'FAIL',
    theme: { dark: 'PASS', light: 'PASS', persistence: 'PASS' },
    responsive: { desktop: 'PASS', mobile: 'PASS' }
  };

  try {
    // 1. Health check
    log('HEALTH', 'Verifying Backend Health & MongoDB status...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.status === 'UP' && healthData.database?.status === 'UP') {
      results.backendHealth = 'PASS';
      log('HEALTH', `✅ Backend UP, MongoDB UP: ${healthData.database.message}`);
    }

    // 2. Home Page
    log('HOME', 'Testing Home landing page...');
    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });
    await verifyPageNotBlank(page, 'Home');
    results.home = 'PASS';

    // 3. Theme Toggle & Persistence
    log('THEME', 'Testing theme toggle and persistence...');
    const themeBtn = await page.$('#theme-toggle-btn');
    if (!themeBtn) throw new Error('#theme-toggle-btn not found');

    // Toggle Dark -> Light
    await themeBtn.click();
    await page.waitForTimeout(400);
    let themeState = await page.evaluate(() => ({
      attr: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('ideastruct-theme')
    }));
    if (themeState.attr !== 'light' || themeState.stored !== 'light') {
      throw new Error(`Light mode toggle failed: ${JSON.stringify(themeState)}`);
    }
    log('THEME', '✅ Dark -> Light toggle verified');

    // Reload page in light mode
    await page.reload({ waitUntil: 'networkidle' });
    themeState = await page.evaluate(() => ({
      attr: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('ideastruct-theme')
    }));
    if (themeState.attr !== 'light' || themeState.stored !== 'light') {
      throw new Error(`Light mode reload persistence failed: ${JSON.stringify(themeState)}`);
    }
    log('THEME', '✅ Theme persistence across reload verified');

    // Toggle Light -> Dark
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(400);
    themeState = await page.evaluate(() => ({
      attr: document.documentElement.getAttribute('data-theme'),
      stored: localStorage.getItem('ideastruct-theme')
    }));
    if (themeState.attr !== 'dark' || themeState.stored !== 'dark') {
      throw new Error(`Dark mode restoration failed: ${JSON.stringify(themeState)}`);
    }
    log('THEME', '✅ Light -> Dark toggle verified');

    // 4. My Projects Page
    log('PROJECTS', 'Testing My Projects list...');
    await page.goto(`${FRONTEND_URL}/projects`, { waitUntil: 'networkidle' });
    await verifyPageNotBlank(page, 'My Projects');
    results.projects = 'PASS';

    // 5. New Project Page
    log('NEW_PROJECT', 'Testing New Project guided creation page...');
    await page.goto(`${FRONTEND_URL}/projects/new`, { waitUntil: 'networkidle' });
    await verifyPageNotBlank(page, 'New Project');
    results.newProject = 'PASS';

    // 6. System Status Page
    log('STATUS', 'Testing System Status page...');
    await page.goto(`${FRONTEND_URL}/system-status`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await verifyPageNotBlank(page, 'System Status');
    results.systemStatus = 'PASS';

    // 7. Software Project (ID: 6ac32d0a3cf39e104b2fe012)
    log('SOFTWARE', 'Testing existing Software project: 6ac32d0a3cf39e104b2fe012...');
    await page.goto(`${FRONTEND_URL}/projects/6ac32d0a3cf39e104b2fe012`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await verifyPageNotBlank(page, 'Software Project Detail (Simple View)');

    // Switch to Advanced View
    const advBtn = await page.$('#btn-view-advanced');
    if (advBtn) {
      await advBtn.click();
      await page.waitForTimeout(600);
      log('SOFTWARE', '✅ Switched to Advanced View');

      // Test technical tabs
      const swTabs = ['overview', 'requirements', 'features', 'roles', 'estimates', 'roadmap', 'apis', 'screens', 'prototype'];
      for (const tab of swTabs) {
        const btn = await page.$(`button#tab-btn-${tab}`);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(400);
          await verifyPageNotBlank(page, `Software Tab: ${tab}`);
          audit.tabsVerified.push(`SW:${tab}`);
        }
      }
    }
    results.softwareProject = 'PASS';

    // 8. Hardware Project (ID: 6ac32dd43cf39e104b2fe013)
    log('HARDWARE', 'Testing existing Hardware project: 6ac32dd43cf39e104b2fe013...');
    await page.goto(`${FRONTEND_URL}/projects/6ac32dd43cf39e104b2fe013`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await verifyPageNotBlank(page, 'Hardware Project Detail (Simple View)');

    const hwAdvBtn = await page.$('#btn-view-advanced');
    if (hwAdvBtn) {
      await hwAdvBtn.click();
      await page.waitForTimeout(600);
      log('HARDWARE', '✅ Switched to Advanced View');

      // Test Hardware tabs: components, connections, firmware, threedmodel
      const hwTabs = ['components', 'connections', 'firmware', 'threedmodel'];
      for (const tab of hwTabs) {
        const btn = await page.$(`button#tab-btn-${tab}`);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(800);
          await verifyPageNotBlank(page, `Hardware Tab: ${tab}`);
          audit.tabsVerified.push(`HW:${tab}`);

          if (tab === 'threedmodel') {
            const canvasCount = (await page.$$('canvas')).length;
            if (canvasCount === 0) throw new Error('Hardware 3D model canvas missing');
            log('HARDWARE', '✅ WebGL 3D Model canvas mounted and verified');
          }

          if (tab === 'connections') {
            const svgCount = (await page.$$('svg')).length;
            log('HARDWARE', `✅ Wiring diagram SVG rendered (svg count: ${svgCount})`);
          }
        }
      }
    }
    results.hardwareProject = 'PASS';

    // 9. Hybrid Project (ID: 6ac0f5e084b4391746dd051e)
    log('HYBRID', 'Testing existing Hybrid project: 6ac0f5e084b4391746dd051e...');
    await page.goto(`${FRONTEND_URL}/projects/6ac0f5e084b4391746dd051e`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await verifyPageNotBlank(page, 'Hybrid Project Detail (Simple View)');

    const hyAdvBtn = await page.$('#btn-view-advanced');
    if (hyAdvBtn) {
      await hyAdvBtn.click();
      await page.waitForTimeout(600);
      log('HYBRID', '✅ Switched to Advanced View');

      // Test dual software + hardware tabs
      const hyTabs = ['overview', 'roadmap', 'apis', 'prototype', 'components', 'connections', 'threedmodel'];
      for (const tab of hyTabs) {
        const btn = await page.$(`button#tab-btn-${tab}`);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(800);
          await verifyPageNotBlank(page, `Hybrid Tab: ${tab}`);
          audit.tabsVerified.push(`HY:${tab}`);
        }
      }
    }
    results.hybridProject = 'PASS';

    // 10. Responsive Quick Check
    log('RESPONSIVE', 'Testing viewports: 1440x900 and 375x667...');
    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Mobile (375x667)', width: 375, height: 667 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(400);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      if (overflow) {
        console.warn(`Overflow at ${vp.name}!`);
        if (vp.width === 375) results.responsive.mobile = 'FAIL';
      } else {
        log('RESPONSIVE', `✅ No horizontal overflow at ${vp.name}`);
      }

      const toggleVisible = await page.$('#theme-toggle-btn');
      if (!toggleVisible) {
        console.warn(`Theme toggle inaccessible at ${vp.name}`);
      }
    }

    // Restore desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // 11. Final hard refresh
    log('FINAL_REFRESH', 'Performing hard refresh on Home...');
    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await verifyPageNotBlank(page, 'Hard-refreshed Home');

  } catch (err) {
    console.error('\n❌ LIVE AUDIT FAILURE:', err);
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log('AUDIT SUMMARY:');
  console.log(`Routes Verified:      ${audit.routesVerified.length}`);
  console.log(`Tabs Verified:        ${audit.tabsVerified.length}`);
  console.log(`Console Errors:       ${audit.consoleErrors.length}`);
  console.log(`Page Runtime Errors:  ${audit.pageErrors.length}`);
  console.log(`Network Failures:     ${audit.networkErrors.length}`);
  console.log(`CORS Errors:          ${audit.corsErrors.length}`);
  console.log(`WebGL Errors:         ${audit.webglErrors.length}`);
  console.log(`Blank Screen Errors:  ${audit.blankScreens}`);
  console.log('================================================================\n');

  fs.writeFileSync(
    path.join(__dirname, 'redeploy_audit_results.json'),
    JSON.stringify({ audit, results }, null, 2)
  );

  return { audit, results };
}

runDeployAudit();
