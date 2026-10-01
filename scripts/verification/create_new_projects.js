// Use native global fetch

async function setupNewProjects() {
  const API_BASE = 'http://localhost:8080/api/projects';
  
  // 1. Create Smart Parking Project
  const p1Res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'SpotSense Smart Parking Bay Occupancy Detector',
      idea: 'SpotSense is an overhead smart parking sensor unit that uses ultrasonic distance sensing, an RGB LED beacon, and an OLED display to signal available spots in a garage.',
      typeOverride: 'HARDWARE'
    })
  });
  const p1 = await p1Res.json();
  console.log('Created P1:', p1.id, p1.title);

  // Generate blueprint for P1
  const p1GenRes = await fetch(`${API_BASE}/${p1.id}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedRevision: p1.revision, mode: 'DEMO' })
  });
  const p1Gen = await p1GenRes.json();
  console.log('P1 ID:', p1.id);
  console.log('P1 Blueprint Type:', p1Gen.blueprint?.projectType);
  console.log('P1 Components Count:', p1Gen.blueprint?.hardware?.components?.length);
  console.log('P1 Components:', p1Gen.blueprint?.hardware?.components?.map(c => c.name));
  console.log('P1 Connections Count:', p1Gen.blueprint?.hardware?.connections?.length);
  console.log('P1 Enclosure:', p1Gen.blueprint?.hardware?.threeDModel?.enclosure?.type);

  // 2. Create Pet Feeder Project
  const p2Res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'NutriPaw Automatic Pet Feeder & Scale',
      idea: 'NutriPaw is a precision weight-dosed automated pet food dispenser with MG996R servo motor, strain-gauge load cell, HX711 ADC, and DS3231 RTC.',
      typeOverride: 'HARDWARE'
    })
  });
  const p2 = await p2Res.json();
  console.log('\nCreated P2:', p2.id, p2.title);

  // Generate blueprint for P2
  const p2GenRes = await fetch(`${API_BASE}/${p2.id}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedRevision: p2.revision, mode: 'DEMO' })
  });
  const p2Gen = await p2GenRes.json();
  console.log('P2 ID:', p2.id);
  console.log('P2 Blueprint Type:', p2Gen.blueprint?.projectType);
  console.log('P2 Components Count:', p2Gen.blueprint?.hardware?.components?.length);
  console.log('P2 Components:', p2Gen.blueprint?.hardware?.components?.map(c => c.name));
  console.log('P2 Connections Count:', p2Gen.blueprint?.hardware?.connections?.length);
  console.log('P2 Enclosure:', p2Gen.blueprint?.hardware?.threeDModel?.enclosure?.type);
}

setupNewProjects().catch(console.error);
