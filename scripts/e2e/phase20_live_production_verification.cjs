const { chromium } = require('d:/IdeaStruct AI/frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/screenshots/phase20');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PUBLIC_URL = 'https://idea-struct-ai.vercel.app';

async function runLiveProductionVerification() {
  console.log('====================================================');
  console.log('PHASE 20: LIVE PUBLIC PRODUCTION VERIFICATION');
  console.log('Target Frontend: ' + PUBLIC_URL);
  console.log('Target Backend:  https://ideastruct-api.onrender.com');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  let passCount = 0;
  let totalCount = 0;

  function assert(condition, message) {
    totalCount++;
    if (condition) {
      console.log(`[PASS ${totalCount}] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL ${totalCount}] ${message}`);
    }
  }

  try {
    // 1. Load public site
    console.log('--- Step 1: Initial Load & Theme Default ---');
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(initialTheme === 'dark', `Default theme is dark (got: ${initialTheme})`);

    const initialBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert(initialBg === 'rgb(8, 19, 31)', `Dark theme body background is rgb(8, 19, 31) / #08131F (got: ${initialBg})`);

    const toggleBtn = await page.$('#theme-toggle-btn');
    assert(toggleBtn !== null, '#theme-toggle-btn exists in public DOM');

    const toggleAria = await page.evaluate(() => document.getElementById('theme-toggle-btn')?.getAttribute('aria-label'));
    assert(toggleAria === 'Switch to light mode', `Initial toggle button aria-label is "Switch to light mode" (got: "${toggleAria}")`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_live_vercel_dark.png') });

    // 2. Toggle to Light mode
    console.log('\n--- Step 2: Toggle to Light Mode ---');
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(500);

    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(lightTheme === 'light', `Switched theme attribute to light (got: ${lightTheme})`);

    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert(lightBg === 'rgb(241, 245, 249)', `Light theme body background is rgb(241, 245, 249) / #f1f5f9 (got: ${lightBg})`);

    const lightStorage = await page.evaluate(() => localStorage.getItem('ideastruct-theme'));
    assert(lightStorage === 'light', `localStorage 'ideastruct-theme' is 'light' (got: ${lightStorage})`);

    const lightAria = await page.evaluate(() => document.getElementById('theme-toggle-btn')?.getAttribute('aria-label'));
    assert(lightAria === 'Switch to dark mode', `Light mode toggle button aria-label is "Switch to dark mode" (got: "${lightAria}")`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_live_vercel_light.png') });

    // 3. Test Persistence across page reload
    console.log('\n--- Step 3: Persistence Across Page Reload ---');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(reloadedTheme === 'light', `Theme persisted as light after full page reload (got: ${reloadedTheme})`);

    // Toggle back to Dark mode
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(500);
    const backToDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(backToDark === 'dark', `Toggled back to dark mode successfully`);

    // 4. Test System Status Page
    console.log('\n--- Step 4: System Status Page Inspection ---');
    await page.goto(`${PUBLIC_URL}/system-status`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const statusText = await page.evaluate(() => document.body.innerText);
    assert(!statusText.includes('http://localhost:8080'), 'Zero occurrences of "http://localhost:8080" on public System Status');
    assert(!statusText.toLowerCase().includes('local mongodb'), 'Zero occurrences of "local MongoDB" on public System Status');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_live_system_status.png') });

    // 5. Test Projects & Project Detail Surfaces
    console.log('\n--- Step 5: Cost Audit & Feature Verification on Project Surfaces ---');
    await page.goto(`${PUBLIC_URL}/projects`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    let bodyText = await page.evaluate(() => document.body.innerText);
    assert(!bodyText.includes('Estimated Cost'), 'Zero "Estimated Cost" on projects list page');

    // Find and click the PulseIoT project card or first project
    let projectLink = await page.$('a[href*="6ac32dd43cf39e104b2fe013"], .project-card:has-text("PulseIoT")');
    if (!projectLink) {
      projectLink = await page.$('.project-card, a[href^="/projects/"]');
    }

    if (projectLink) {
      console.log('   Navigating to project detail page...');
      await projectLink.click();
      await page.waitForTimeout(3000);

      // Verify no Estimated Cost on detail page in Simple View
      let detailText = await page.evaluate(() => document.body.innerText);
      assert(!detailText.includes('Estimated Cost'), 'Zero "Estimated Cost" on project detail Simple View');

      // Switch to Advanced View
      const advBtn = await page.$('#btn-view-advanced');
      if (advBtn) {
        console.log('   Switching to Advanced Developer Specification view...');
        await advBtn.click();
        await page.waitForTimeout(1500);

        detailText = await page.evaluate(() => document.body.innerText);
        assert(!detailText.includes('Estimated Cost'), 'Zero "Estimated Cost" in Advanced View');

        // Test specific technical tabs
        const tabsToTest = [
          { name: 'Roadmap', selector: 'button:has-text("Roadmap")' },
          { name: 'Architecture', selector: 'button:has-text("Architecture")' },
          { name: 'Wiring & Connections', selector: 'button:has-text("Wiring & Connections")' },
          { name: '3D Model', selector: 'button:has-text("3D Model")' }
        ];

        for (const tab of tabsToTest) {
          const tabBtn = await page.$(tab.selector);
          if (tabBtn) {
            console.log(`   Testing tab: ${tab.name}...`);
            await tabBtn.click();
            await page.waitForTimeout(1500);

            const tabText = await page.evaluate(() => document.body.innerText);
            assert(!tabText.includes('Estimated Cost'), `Zero "Estimated Cost" in ${tab.name} tab`);

            if (tab.name === '3D Model') {
              const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
              assert(canvasCount > 0, `3D Model tab renders WebGL canvas element (count: ${canvasCount})`);
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_live_hardware_3d_viewer.png') });
            }

            if (tab.name === 'Wiring & Connections') {
              const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length);
              assert(svgCount > 0, `Wiring tab renders EDA SVG diagram (count: ${svgCount})`);
            }
          }
        }

        // Test theme toggle inside Project Detail view
        await page.click('#theme-toggle-btn');
        await page.waitForTimeout(500);
        const detailTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        assert(detailTheme === 'light', 'Theme toggled to light cleanly inside Project Detail view');
        
        await page.click('#theme-toggle-btn');
        await page.waitForTimeout(500);
        const backTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        assert(backTheme === 'dark', 'Theme restored to dark mode cleanly');
      }
    }

    // 6. Test Responsive Viewports in both themes
    console.log('\n--- Step 6: Responsive Viewports Check ---');
    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Laptop (1024x768)', width: 1024, height: 768 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (375x667)', width: 375, height: 667 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      assert(!overflow, `No horizontal overflow at ${vp.name}`);
    }

    // Switch to light mode on mobile to capture screenshot
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_live_mobile_light.png') });

    // 7. Verify Console Errors
    console.log('\n--- Step 7: Console & Runtime Errors Audit ---');
    console.log(`Observed console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    assert(consoleErrors.length === 0, `Zero console runtime errors on live public site`);

  } catch (err) {
    console.error('Test execution error:', err);
    totalCount++;
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`PHASE 20 LIVE PRODUCTION SUMMARY: ${passCount} / ${totalCount} checks passed`);
  console.log('====================================================');

  if (passCount !== totalCount) {
    process.exit(1);
  }
}

runLiveProductionVerification();
