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

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../docs/screenshots/phase7');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function createProject(title, idea) {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, idea })
  });
  if (!res.ok) {
    throw new Error(`Failed to create project: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function runTest() {
  console.log('===============================================================');
  console.log('PHASE 7 E2E: Live AI Generation Error State & Recovery Test');
  console.log('===============================================================');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Simulated 503 Failure -> In-Card Error -> Fallback Demo
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Create fresh test project ---');
    const project1 = await createProject(
      'Autonomous Drone Perimeter Sentry',
      'An autonomous security drone patrolling industrial perimeters with thermal cameras, GPS fencing, and edge AI intruder recognition.'
    );
    console.log(`Created project: ${project1.id} ("${project1.title}")`);

    console.log('\n--- Step 2: Navigate to project detail page ---');
    await page.goto(`${BASE_URL}/projects/${project1.id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#btn-generate-live', { timeout: 10000 });
    console.log('✅ Generation choices rendered: #btn-generate-live and #btn-generate-demo found');

    console.log('\n--- Step 3: Intercept generation API with simulated 503 High Demand error ---');
    let mockIntercepted = false;
    await page.route(`**/api/projects/${project1.id}/generate`, async route => {
      mockIntercepted = true;
      // Delay response slightly to verify in-flight disabled state and progress indicator
      await new Promise(r => setTimeout(r, 800));
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'AI_SERVICE_ERROR',
          message: 'Gemini model is currently experiencing high demand. Please try again shortly.',
          technical: 'HTTP 503 Service Unavailable: The model is overloaded. Please try again later.'
        })
      });
    });

    console.log('\n--- Step 4: Click "Generate with Live AI" ---');
    await page.click('#btn-generate-live');

    // Assert buttons disabled during generation
    const liveBtnDisabled = await page.$eval('#btn-generate-live', el => el.disabled);
    const demoBtnDisabled = await page.$eval('#btn-generate-demo', el => el.disabled);
    if (!liveBtnDisabled || !demoBtnDisabled) {
      throw new Error('Buttons were NOT properly disabled during generation!');
    }
    console.log('✅ Concurrency Guard Verified: Both buttons disabled during active generation');

    // Wait for in-card error card to appear
    console.log('\n--- Step 5: Wait for In-Card Generation Error Display ---');
    await page.waitForSelector('#generation-error-card', { timeout: 10000 });
    console.log('✅ In-card error element #generation-error-card rendered!');

    // Check error text content
    const errorCardText = await page.$eval('#generation-error-card', el => el.innerText);
    if (!errorCardText.includes('Live AI generation failed')) {
      throw new Error('Expected "Live AI generation failed" heading in error card!');
    }
    if (!errorCardText.includes('experiencing high demand')) {
      throw new Error('Expected human-readable message in error card!');
    }
    console.log('✅ Human-readable error message and heading verified in #generation-error-card');

    // Verify recovery buttons inside error card
    await page.waitForSelector('#btn-retry-live-ai', { timeout: 5000 });
    await page.waitForSelector('#btn-fallback-demo-plan', { timeout: 5000 });
    console.log('✅ Recovery buttons [#btn-retry-live-ai] and [#btn-fallback-demo-plan] present and interactive');

    // Capture screenshot of the error card
    const errorScreenshotPath = path.join(SCREENSHOTS_DIR, 'phase7_generation_error_card.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${errorScreenshotPath}`);

    // -------------------------------------------------------------
    // TEST 2: Fallback to Demo Plan from Error State
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Test Recovery via "[Use Demo Plan]" button ---');
    // Unroute mock to let real demo generation proceed
    await page.unroute(`**/api/projects/${project1.id}/generate`);

    await page.click('#btn-fallback-demo-plan');
    console.log('Clicked #btn-fallback-demo-plan');

    // Wait for project plan to render
    await page.waitForSelector('[data-view-mode], .metric-card, [role="tablist"]', { timeout: 15000 });
    console.log('✅ Project Plan successfully loaded after clicking fallback Demo Plan!');

    const successScreenshotPath = path.join(SCREENSHOTS_DIR, 'phase7_recovery_demo_plan_success.png');
    await page.screenshot({ path: successScreenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${successScreenshotPath}`);

    // -------------------------------------------------------------
    // TEST 3: Real Live AI Generation Pipeline
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Test Real Live AI Generation Pipeline ---');
    const project2 = await createProject(
      'Solar Powered Smart Irrigation',
      'A smart irrigation controller that uses soil moisture sensors, weather forecasting, and solar power to optimize water usage in remote farms.'
    );
    console.log(`Created project: ${project2.id} ("${project2.title}")`);

    await page.goto(`${BASE_URL}/projects/${project2.id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#btn-generate-live', { timeout: 10000 });

    console.log('Triggering real Live AI generation via #btn-generate-live...');
    await page.click('#btn-generate-live');

    // Wait for either the plan to load OR the error card to appear
    const resultSelector = await Promise.race([
      page.waitForSelector('[role="tablist"], .metric-card', { timeout: 30000 }).then(() => 'PLAN_LOADED'),
      page.waitForSelector('#generation-error-card', { timeout: 30000 }).then(() => 'ERROR_CARD_DISPLAYED')
    ]);

    console.log(`Real Live AI generation result: ${resultSelector}`);
    if (resultSelector === 'PLAN_LOADED') {
      console.log('🎉 Real Live AI generation succeeded and blueprint rendered!');
    } else {
      console.log('⚠️ Real Live AI returned error (e.g. rate limit/demand), and UI successfully showed #generation-error-card without silent reset!');
    }

    const liveResultScreenshotPath = path.join(SCREENSHOTS_DIR, 'phase7_real_live_ai_result.png');
    await page.screenshot({ path: liveResultScreenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${liveResultScreenshotPath}`);

    console.log('\n===============================================================');
    console.log('✅ ALL PHASE 7 E2E VERIFICATION CHECKS PASSED!');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTest();
