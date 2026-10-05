const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache, no-store' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Polling Vercel and Render for new deployment...');
  let vercelLive = false;
  
  for (let i = 0; i < 24; i++) {
    try {
      const vercelRes = await fetchUrl('https://idea-struct-ai.vercel.app/?t=' + Date.now());
      const hasThemeScript = vercelRes.body.includes('ideastruct-theme');
      console.log(`[${new Date().toISOString()}] Attempt ${i + 1}: Vercel HTTP ${vercelRes.status}, theme script present: ${hasThemeScript}`);
      
      if (hasThemeScript) {
        console.log('>>> Vercel production has deployed commit with dark/light theme support!');
        vercelLive = true;
        break;
      }
    } catch (err) {
      console.error(`Attempt ${i + 1} error:`, err.message);
    }
    await new Promise(r => setTimeout(r, 10000));
  }

  if (!vercelLive) {
    console.error('Timed out waiting for Vercel deployment.');
    process.exit(1);
  }
}

main();
