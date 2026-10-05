const https = require('https');

https.get('https://idea-struct-ai.vercel.app/?t=' + Date.now(), { headers: { 'Cache-Control': 'no-cache, no-store' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const match = d.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/);
    console.log('Vercel current bundle:', match ? match[0] : 'None found');
  });
});
