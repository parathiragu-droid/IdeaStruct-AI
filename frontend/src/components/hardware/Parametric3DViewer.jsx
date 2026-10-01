import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { parseDimensions3D, parseVector3D } from '../../utils/dimensions';

/**
 * Cached check for WebGL rendering context support to avoid leaking contexts.
 */
let _webglSupportCache = null;
function isWebGLAvailable() {
  if (_webglSupportCache !== null) return _webglSupportCache;
  try {
    const canvas = document.createElement('canvas');
    const gl = (
      (window.WebGL2RenderingContext || window.WebGLRenderingContext) &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
    if (gl) {
      const ext = canvas.getContext('webgl')?.getExtension('WEBGL_lose_context') || canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
    _webglSupportCache = !!gl;
    return !!gl;
  } catch {
    _webglSupportCache = false;
    return false;
  }
}

/**
 * Detects the specific physical hardware archetype from project metadata,
 * enclosure type, sensors, actuators, and controller.
 */
export function detectHardwareArchetype({ threeDModel = {}, components = [], enclosure = {}, blueprint = {} } = {}) {
  const encType = ((threeDModel?.enclosure?.type || enclosure?.type || '') + '').toUpperCase();
  const title = ((blueprint?.overview?.projectName || blueprint?.title || '') + '').toLowerCase();
  const summary = ((blueprint?.overview?.summary || blueprint?.idea || '') + '').toLowerCase();
  const safeComponents = Array.isArray(components) ? components.filter((c) => c && typeof c === 'object') : [];
  const compNames = safeComponents
    .map((c) => ((c.name || '') + ' ' + (c.purpose || '') + ' ' + (c.specification || '')).toLowerCase())
    .join(' ');
  const combinedText = `${encType} ${title} ${summary} ${compNames}`;

  // 1. Wearable / Health Device
  if (
    encType.includes('WEARABLE') ||
    combinedText.includes('wearable') ||
    combinedText.includes('wrist') ||
    combinedText.includes('smartwatch') ||
    combinedText.includes('pulse oximeter') ||
    combinedText.includes('heart rate') ||
    combinedText.includes('oximeter') ||
    combinedText.includes('max30102') ||
    combinedText.includes('biometric') ||
    combinedText.includes('pulsetrack') ||
    combinedText.includes('vitapulse')
  ) {
    return {
      id: 'WEARABLE_HEALTH',
      name: 'Bio-Telemetry Wearable Chassis',
      icon: '⌚',
      badgeClass: 'badge-purple',
      description: 'Ergonomic wrist-worn smart case with curved silicone straps, top circular display, and skin-contact optical biosensor window.',
      defaultDims: [54, 16, 44],
      cameraPos: [55, 48, 65],
      cameraTarget: [0, 6, 0],
      enclosureColor: '#0f172a',
      accentColor: '#8b5cf6',
    };
  }

  // 2. Robotics / Autonomous Rover
  if (
    encType.includes('ROBOT') ||
    combinedText.includes('robot') ||
    combinedText.includes('rover') ||
    (combinedText.includes('chassis') && combinedText.includes('wheel')) ||
    combinedText.includes('differential drive') ||
    combinedText.includes('motor driver') ||
    combinedText.includes('l298n') ||
    combinedText.includes('rovernav') ||
    combinedText.includes('aerorover')
  ) {
    return {
      id: 'ROBOTICS_ROVER',
      name: 'Autonomous Mobile Robot Platform',
      icon: '🤖',
      badgeClass: 'badge-blue',
      description: 'Dual-deck acrylic chassis with left/right drive wheels, rubber tread tires, front caster, and bumper-mounted ultrasonic distance eyes.',
      defaultDims: [180, 75, 140],
      cameraPos: [130, 95, 150],
      cameraTarget: [0, 20, 0],
      enclosureColor: '#1e293b',
      accentColor: '#38bdf8',
    };
  }

  // 3. Smart Agriculture / Precision Irrigation Controller
  if (
    encType.includes('WEATHERPROOF') ||
    combinedText.includes('soil') ||
    combinedText.includes('irrigat') ||
    combinedText.includes('moisture') ||
    combinedText.includes('plant') ||
    combinedText.includes('crop') ||
    combinedText.includes('greenhouse') ||
    combinedText.includes('farm') ||
    combinedText.includes('solenoid') ||
    combinedText.includes('valve') ||
    combinedText.includes('agriflow') ||
    combinedText.includes('hydrosync')
  ) {
    return {
      id: 'AGRICULTURE_CONTROLLER',
      name: 'IP67 Weatherproof Agricultural Controller',
      icon: '🌱',
      badgeClass: 'badge-green',
      description: 'Rugged outdoor electrical enclosure with silicone sealing gasket, transparent lid, bottom dual waterproof PG7 cable glands, and high-voltage relay block.',
      defaultDims: [150, 60, 110],
      cameraPos: [95, 90, 120],
      cameraTarget: [0, 15, 0],
      enclosureColor: '#14532d',
      accentColor: '#10b981',
    };
  }

  // 4. Smart Parking Occupancy Detector & Ceiling Beacon
  if (
    encType.includes('OVERHEAD') ||
    encType.includes('PARKING') ||
    combinedText.includes('parking') ||
    combinedText.includes('spotsense') ||
    combinedText.includes('garage') ||
    combinedText.includes('bay occupancy') ||
    combinedText.includes('parking spot')
  ) {
    return {
      id: 'PARKING_DETECTOR',
      name: 'Ceiling-Mount Smart Parking Bay Beacon',
      icon: '🅿️',
      badgeClass: 'badge-blue',
      description: 'Overhead ceiling-mount bay housing with downward ultrasonic transducer, 360° RGB LED diffuser ring, and driver telemetry screen.',
      defaultDims: [130, 50, 90],
      cameraPos: [80, 75, 110],
      cameraTarget: [0, 12, 0],
      enclosureColor: '#1e293b',
      accentColor: '#3b82f6',
    };
  }

  // 5. Automatic Pet Feeder & Precision Dispenser
  if (
    encType.includes('DISPENSER') ||
    encType.includes('FEEDER') ||
    encType.includes('HOPPER') ||
    combinedText.includes('pet feeder') ||
    combinedText.includes('feeder') ||
    combinedText.includes('kibble') ||
    combinedText.includes('nutripaw') ||
    combinedText.includes('dispenser') ||
    combinedText.includes('load cell') ||
    combinedText.includes('hx711')
  ) {
    return {
      id: 'DISPENSER_FEEDER',
      name: 'Precision Motorized Hopper & Dispenser Tower',
      icon: '🐾',
      badgeClass: 'badge-orange',
      description: 'Vertical food hopper tower with clear acrylic grain cylinder, motorized paddle chute, and base strain-gauge weighing platform.',
      defaultDims: [160, 140, 140],
      cameraPos: [110, 110, 140],
      cameraTarget: [0, 45, 0],
      enclosureColor: '#0f172a',
      accentColor: '#f59e0b',
    };
  }

  // 6. Industrial Control / DIN Rail
  if (
    encType.includes('DIN') ||
    combinedText.includes('din-rail') ||
    combinedText.includes('din rail') ||
    combinedText.includes('industrial') ||
    combinedText.includes('plc') ||
    combinedText.includes('automation unit')
  ) {
    return {
      id: 'INDUSTRIAL_CONTROL',
      name: 'DIN-Rail Industrial Automation Unit',
      icon: '🏭',
      badgeClass: 'badge-orange',
      description: 'Modular DIN-rail mount housing with top/bottom screw terminal blocks, rear rail clips, and front status LED diagnostic panel.',
      defaultDims: [70, 90, 90],
      cameraPos: [85, 75, 110],
      cameraTarget: [0, 30, 0],
      enclosureColor: '#334155',
      accentColor: '#f59e0b',
    };
  }

  // 7. Gas / Smoke Detector & Alarm Device (Default for environmental safety)
  if (
    encType.includes('WALL') ||
    combinedText.includes('gas') ||
    combinedText.includes('smoke') ||
    combinedText.includes('mq-') ||
    combinedText.includes('mq135') ||
    combinedText.includes('mq2') ||
    combinedText.includes('voc') ||
    combinedText.includes('air quality') ||
    combinedText.includes('alarm') ||
    combinedText.includes('buzzer') ||
    combinedText.includes('sentinelair') ||
    combinedText.includes('leak')
  ) {
    return {
      id: 'DETECTOR_ALARM',
      name: 'Wall-Mount Hazardous Gas & Alarm Appliance',
      icon: '🚨',
      badgeClass: 'badge-orange',
      description: 'Wall-mountable safety case with top/bottom mounting tabs, louvered gas intake vents, front acoustic siren cone, and red warning beacon strobe.',
      defaultDims: [120, 50, 85],
      cameraPos: [80, 75, 110],
      cameraTarget: [0, 12, 0],
      enclosureColor: '#1e293b',
      accentColor: '#f97316',
    };
  }

  // 8. Generic Ambient / Smart Home Monitor fallback
  return {
    id: 'HOME_MONITOR',
    name: 'Smart Desktop Environmental Station',
    icon: '📊',
    badgeClass: 'badge-aqua',
    description: 'Angled tabletop console with recessed display bezel, rear ambient air slots, and internal sensor mount.',
    defaultDims: [110, 45, 80],
    cameraPos: [85, 70, 105],
    cameraTarget: [0, 10, 0],
    enclosureColor: '#0f172a',
    accentColor: '#06b6d4',
  };
}

/**
 * Creates dynamic 2D canvas texture for in-scene floating 3D billboard labels.
 */
function createLabelSprite(text, category = '', color = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Background rounded pill
  ctx.fillStyle = 'rgba(10, 15, 28, 0.88)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 20);
  ctx.fill();
  ctx.stroke();

  // Color indicator dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(28, canvas.height / 2, 8, 0, Math.PI * 2);
  ctx.fill();

  // Component Name text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const cleanName = text.length > 22 ? text.substring(0, 20) + '…' : text;
  ctx.fillText(cleanName, 48, 38);

  // Category badge subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px sans-serif';
  ctx.fillText((category || 'PART').toUpperCase(), 48, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(32, 8, 1);
  return sprite;
}

/**
 * Creates rich Three.js meshes for a component with archetype and domain awareness.
 */
function createPrimitiveMesh(item, isExploded = false, archetype = null) {
  const {
    primitiveType = 'GENERIC_MODULE',
    dimensions = [20, 10, 20],
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    color = '#38bdf8',
    label = '',
    category = '',
  } = item;

  const [w, h, d] = parseDimensions3D(dimensions, [20, 10, 20]);
  const explodeFactor = isExploded ? 1.6 : 1.0;
  const [px, py, pz] = parseVector3D(position, [0, 0, 0]).map((v) => (Number(v) || 0) * explodeFactor);
  const [rx, ry, rz] = parseVector3D(rotation, [0, 0, 0]).map((v) => (Number(v) * Math.PI) / 180 || 0);

  const group = new THREE.Group();
  group.userData = { ...item, originalColor: color, bounds: [w, h, d] };

  const prim = (primitiveType || '').toUpperCase();
  const lowerName = (label || item.name || '').toLowerCase();
  let mainMesh = null;

  switch (prim) {
    case 'BOARD': {
      // Main PCB Substrate (green, black, or blue)
      const pcbColor = color || (lowerName.includes('esp32') ? '#065f46' : lowerName.includes('relay') ? '#1e3a8a' : '#0f172a');
      const geom = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: pcbColor, roughness: 0.35, metalness: 0.15 });
      mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);

      // Microcontroller QFN/QFP Chip in center
      const chipW = Math.min(w * 0.45, 16);
      const chipD = Math.min(d * 0.45, 16);
      const chipGeom = new THREE.BoxGeometry(chipW, h * 0.6, chipD);
      const chipMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.2, metalness: 0.4 });
      const chip = new THREE.Mesh(chipGeom, chipMat);
      chip.position.y = h / 2 + (h * 0.3);
      group.add(chip);

      // Dual header pin rows (gold/silver pins)
      const pinCount = 8;
      const pinGeom = new THREE.BoxGeometry(w * 0.9, h * 0.5, d * 0.08);
      const pinMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 });
      const pinRow1 = new THREE.Mesh(pinGeom, pinMat);
      pinRow1.position.set(0, h / 2 + h * 0.2, d * 0.38);
      const pinRow2 = new THREE.Mesh(pinGeom, pinMat);
      pinRow2.position.set(0, h / 2 + h * 0.2, -d * 0.38);
      group.add(pinRow1);
      group.add(pinRow2);

      // Metal USB port shield at one end
      const usbGeom = new THREE.BoxGeometry(w * 0.18, h * 0.9, d * 0.28);
      const usbMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 });
      const usb = new THREE.Mesh(usbGeom, usbMat);
      usb.position.set(-w / 2 + (w * 0.09), h / 2 + h * 0.4, 0);
      group.add(usb);
      break;
    }

    case 'SENSOR_MODULE': {
      // Breakout PCB base
      const baseGeom = new THREE.BoxGeometry(w, h * 0.35, d);
      const baseMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.4 });
      const base = new THREE.Mesh(baseGeom, baseMat);
      group.add(base);
      mainMesh = base;

      if (lowerName.includes('gas') || lowerName.includes('mq-') || lowerName.includes('mq135') || lowerName.includes('mq2')) {
        // Electrochemical metallic mesh cylinder chamber
        const meshCylGeom = new THREE.CylinderGeometry(w * 0.38, w * 0.38, h * 0.7, 24);
        const meshCylMat = new THREE.MeshStandardMaterial({
          color: '#d97706',
          metalness: 0.85,
          roughness: 0.25,
          wireframe: false,
        });
        const meshCyl = new THREE.Mesh(meshCylGeom, meshCylMat);
        meshCyl.position.y = h * 0.45;
        group.add(meshCyl);

        // Gold cap ring
        const capGeom = new THREE.CylinderGeometry(w * 0.4, w * 0.4, h * 0.12, 24);
        const capMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.2 });
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.y = h * 0.82;
        group.add(cap);
      } else if (lowerName.includes('ultrasonic') || lowerName.includes('sonar') || lowerName.includes('hc-sr04')) {
        // Dual aluminum cylinder eye barrels
        const barrelR = Math.min(w * 0.22, d * 0.35);
        const barrelGeom = new THREE.CylinderGeometry(barrelR, barrelR, h * 0.75, 20);
        const barrelMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.25 });
        
        const barrelLeft = new THREE.Mesh(barrelGeom, barrelMat);
        barrelLeft.rotation.x = Math.PI / 2;
        barrelLeft.position.set(-w * 0.25, h * 0.35, d * 0.3);
        
        const barrelRight = new THREE.Mesh(barrelGeom, barrelMat);
        barrelRight.rotation.x = Math.PI / 2;
        barrelRight.position.set(w * 0.25, h * 0.35, d * 0.3);

        group.add(barrelLeft);
        group.add(barrelRight);
      } else if (lowerName.includes('soil') || lowerName.includes('moisture')) {
        // Capacitive dual probe prongs extending outwards
        const prongGeom = new THREE.BoxGeometry(w * 0.2, h * 0.2, d * 1.2);
        const prongMat = new THREE.MeshStandardMaterial({ color: '#16a34a', metalness: 0.3, roughness: 0.4 });
        const p1 = new THREE.Mesh(prongGeom, prongMat);
        p1.position.set(-w * 0.25, 0, d * 0.8);
        const p2 = new THREE.Mesh(prongGeom, prongMat);
        p2.position.set(w * 0.25, 0, d * 0.8);
        group.add(p1);
        group.add(p2);
      } else if (lowerName.includes('pulse') || lowerName.includes('heart') || lowerName.includes('max30102') || lowerName.includes('oximeter')) {
        // Optical biosensor disc with center red/green LED emitter
        const optGeom = new THREE.CylinderGeometry(w * 0.3, w * 0.3, h * 0.4, 16);
        const optMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.3 });
        const opt = new THREE.Mesh(optGeom, optMat);
        opt.position.y = h * 0.3;

        const ledDotGeom = new THREE.SphereGeometry(w * 0.08, 12, 12);
        const ledDotMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 0.9 });
        const ledDot = new THREE.Mesh(ledDotGeom, ledDotMat);
        ledDot.position.set(0, h * 0.45, 0);

        group.add(opt);
        group.add(ledDot);
      } else {
        // Generic sensor housing with air perforation slots
        const sensGeom = new THREE.BoxGeometry(w * 0.8, h * 0.65, d * 0.8);
        const sensMat = new THREE.MeshStandardMaterial({ color: color || '#0284c7', roughness: 0.4 });
        const sens = new THREE.Mesh(sensGeom, sensMat);
        sens.position.y = h * 0.4;
        group.add(sens);
      }
      break;
    }

    case 'DISPLAY_PANEL': {
      const isCircular = lowerName.includes('circular') || lowerName.includes('round');
      if (isCircular) {
        // Circular smartwatch display
        const radius = Math.min(w, d) / 2;
        const bezelGeom = new THREE.CylinderGeometry(radius, radius, h, 32);
        const bezelMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 });
        mainMesh = new THREE.Mesh(bezelGeom, bezelMat);
        group.add(mainMesh);

        const screenGeom = new THREE.CircleGeometry(radius * 0.84, 32);
        const screenMat = new THREE.MeshStandardMaterial({
          color: '#06b6d4',
          emissive: '#0891b2',
          emissiveIntensity: 0.75,
          roughness: 0.1,
        });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.rotation.x = -Math.PI / 2;
        screen.position.y = h / 2 + 0.1;
        group.add(screen);
      } else {
        // Rectangular OLED or 16x2 LCD Panel
        const frameGeom = new THREE.BoxGeometry(w, h, d);
        const frameMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
        mainMesh = new THREE.Mesh(frameGeom, frameMat);
        group.add(mainMesh);

        const isLcd = lowerName.includes('1602') || lowerName.includes('lcd');
        const screenGeom = new THREE.PlaneGeometry(w * 0.84, d * 0.78);
        const screenMat = new THREE.MeshStandardMaterial({
          color: isLcd ? '#15803d' : '#0284c7',
          emissive: isLcd ? '#16a34a' : '#0369a1',
          emissiveIntensity: 0.65,
          roughness: 0.15,
        });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.rotation.x = -Math.PI / 2;
        screen.position.y = h / 2 + 0.1;
        group.add(screen);
      }
      break;
    }

    case 'ACTUATOR': {
      if (lowerName.includes('buzzer') || lowerName.includes('siren')) {
        // Cylindrical black acoustic horn
        const buzzGeom = new THREE.CylinderGeometry(w * 0.45, w * 0.4, h, 24);
        const buzzMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.5 });
        mainMesh = new THREE.Mesh(buzzGeom, buzzMat);
        group.add(mainMesh);

        // Center sound orifice
        const holeGeom = new THREE.CylinderGeometry(w * 0.1, w * 0.1, h * 0.2, 16);
        const holeMat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const hole = new THREE.Mesh(holeGeom, holeMat);
        hole.position.y = h / 2 + 0.05;
        group.add(hole);
      } else if (lowerName.includes('relay')) {
        // Bright blue industrial relay block
        const relayGeom = new THREE.BoxGeometry(w, h, d);
        const relayMat = new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.3 });
        mainMesh = new THREE.Mesh(relayGeom, relayMat);
        group.add(mainMesh);

        // Screw terminal block
        const termGeom = new THREE.BoxGeometry(w * 0.85, h * 0.35, d * 0.25);
        const termMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
        const term = new THREE.Mesh(termGeom, termMat);
        term.position.set(0, -h * 0.1, d * 0.4);
        group.add(term);
      } else if (lowerName.includes('valve') || lowerName.includes('solenoid')) {
        // Brass metallic solenoid valve body
        const valveGeom = new THREE.CylinderGeometry(w * 0.4, w * 0.4, h, 20);
        const valveMat = new THREE.MeshStandardMaterial({ color: '#b45309', metalness: 0.8, roughness: 0.3 });
        mainMesh = new THREE.Mesh(valveGeom, valveMat);
        group.add(mainMesh);

        // Pipe inlet nipples
        const pipeGeom = new THREE.CylinderGeometry(w * 0.15, w * 0.15, d * 1.2, 16);
        const pipeMat = new THREE.MeshStandardMaterial({ color: '#78350f', metalness: 0.7, roughness: 0.4 });
        const pipe = new THREE.Mesh(pipeGeom, pipeMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.y = -h * 0.2;
        group.add(pipe);
      } else if (lowerName.includes('motor') || lowerName.includes('servo')) {
        // Geared DC motor or micro servo
        const motorGeom = new THREE.BoxGeometry(w, h, d);
        const motorMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4, metalness: 0.3 });
        mainMesh = new THREE.Mesh(motorGeom, motorMat);
        group.add(mainMesh);

        // Output axle / horn
        const axleGeom = new THREE.CylinderGeometry(w * 0.12, w * 0.12, h * 0.5, 12);
        const axleMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 });
        const axle = new THREE.Mesh(axleGeom, axleMat);
        axle.position.set(w * 0.3, h / 2 + h * 0.2, 0);
        group.add(axle);
      } else {
        const geom = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color || '#ef4444', roughness: 0.4 });
        mainMesh = new THREE.Mesh(geom, mat);
        group.add(mainMesh);
      }
      break;
    }

    case 'LED': {
      // 5mm optical dome
      const ledGeom = new THREE.CylinderGeometry(w * 0.35, w * 0.35, h * 0.6, 16);
      const ledMat = new THREE.MeshStandardMaterial({
        color: color || '#ef4444',
        emissive: color || '#ef4444',
        emissiveIntensity: 0.85,
        roughness: 0.1,
      });
      mainMesh = new THREE.Mesh(ledGeom, ledMat);

      const domeGeom = new THREE.SphereGeometry(w * 0.35, 16, 16);
      const dome = new THREE.Mesh(domeGeom, ledMat);
      dome.position.y = h * 0.3;
      group.add(mainMesh);
      group.add(dome);
      break;
    }

    case 'BUTTON': {
      const baseGeom = new THREE.BoxGeometry(w, h * 0.4, d);
      const baseMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.5 });
      mainMesh = new THREE.Mesh(baseGeom, baseMat);
      group.add(mainMesh);

      const capGeom = new THREE.CylinderGeometry(w * 0.28, w * 0.28, h * 0.5, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: color || '#dc2626', roughness: 0.3 });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.y = h * 0.35;
      group.add(cap);
      break;
    }

    case 'POWER':
    case 'CONNECTOR': {
      const geom = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: color || '#16a34a', roughness: 0.4 });
      mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);

      // Screw slots
      const screwGeom = new THREE.CylinderGeometry(w * 0.1, w * 0.1, h * 0.1, 8);
      const screwMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.9 });
      const s1 = new THREE.Mesh(screwGeom, screwMat);
      s1.position.set(-w * 0.25, h / 2 + 0.1, 0);
      const s2 = new THREE.Mesh(screwGeom, screwMat);
      s2.position.set(w * 0.25, h / 2 + 0.1, 0);
      group.add(s1);
      group.add(s2);
      break;
    }

    case 'CYLINDER': {
      const geom = new THREE.CylinderGeometry(w / 2, w / 2, h, 20);
      const mat = new THREE.MeshStandardMaterial({ color: color || '#94a3b8', roughness: 0.4 });
      mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);
      break;
    }

    case 'SPHERE': {
      const geom = new THREE.SphereGeometry(w / 2, 20, 20);
      const mat = new THREE.MeshStandardMaterial({ color: color || '#94a3b8', roughness: 0.4 });
      mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);
      break;
    }

    case 'BOX':
    case 'GENERIC_MODULE':
    default: {
      const geom = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: color || '#64748b', roughness: 0.5 });
      mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);
      break;
    }
  }

  // Shadows
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.position.set(px, py, pz);
  group.rotation.set(rx, ry, rz);

  // In-scene floating label badge
  const labelSprite = createLabelSprite(label || item.id, category, color);
  labelSprite.position.set(0, h + 10, 0);
  labelSprite.name = 'componentLabel';
  group.add(labelSprite);

  return group;
}

/**
 * Creates project-specific physical enclosure body, accessories, and mounting
 * based on the identified hardware archetype.
 */
function createPhysicalEnclosure(scene, archetype, dimensions, enclosureMode) {
  if (enclosureMode === 'HIDDEN') return null;

  const [ew, eh, ed] = parseDimensions3D(dimensions, archetype?.defaultDims || [50, 20, 50]);
  const opacity = enclosureMode === 'TRANSLUCENT' ? 0.22 : 0.85;
  const encGroup = new THREE.Group();
  encGroup.name = 'enclosureGroup';

  const baseMat = new THREE.MeshStandardMaterial({
    color: archetype.enclosureColor || '#1e293b',
    transparent: true,
    opacity,
    roughness: 0.35,
    metalness: 0.2,
  });

  const wireMat = new THREE.LineBasicMaterial({
    color: archetype.accentColor || '#38bdf8',
    transparent: true,
    opacity: 0.45,
  });

  switch (archetype.id) {
    case 'WEARABLE_HEALTH': {
      // 1. Curved Smartwatch / Wristband Chassis
      const caseGeom = new THREE.BoxGeometry(ew, eh, ed);
      const caseMesh = new THREE.Mesh(caseGeom, baseMat);
      caseMesh.position.y = eh / 2;
      encGroup.add(caseMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(caseGeom), wireMat);
      caseMesh.add(edges);

      // Top chamfer bezel ring
      const bezelGeom = new THREE.CylinderGeometry(Math.min(ew, ed) * 0.46, Math.min(ew, ed) * 0.48, eh * 0.15, 32);
      const bezelMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', metalness: 0.8, roughness: 0.2 });
      const bezel = new THREE.Mesh(bezelGeom, bezelMat);
      bezel.position.y = eh + (eh * 0.08);
      encGroup.add(bezel);

      // Flexible silicone wrist straps extending out in -Z and +Z
      const strapLength = 70;
      const strapWidth = Math.min(ew, ed) * 0.65;
      const strapThick = 4;
      const strapGeom = new THREE.BoxGeometry(strapWidth, strapThick, strapLength);
      const strapMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.7 });

      const strapTop = new THREE.Mesh(strapGeom, strapMat);
      strapTop.position.set(0, strapThick / 2, -ed / 2 - strapLength / 2);
      const strapBottom = new THREE.Mesh(strapGeom, strapMat);
      strapBottom.position.set(0, strapThick / 2, ed / 2 + strapLength / 2);

      encGroup.add(strapTop);
      encGroup.add(strapBottom);
      break;
    }

    case 'ROBOTICS_ROVER': {
      // 2. Dual-Deck Mobile Robotics Platform
      const deckThick = 4;
      const deckGeom = new THREE.BoxGeometry(ew, deckThick, ed);
      const lowerDeck = new THREE.Mesh(deckGeom, baseMat);
      lowerDeck.position.y = 15;
      encGroup.add(lowerDeck);

      const upperDeck = new THREE.Mesh(deckGeom, baseMat);
      upperDeck.position.y = 15 + eh;
      encGroup.add(upperDeck);

      // 4 Brass Standoff Pillars
      const standoffGeom = new THREE.CylinderGeometry(3, 3, eh, 12);
      const standoffMat = new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.85, roughness: 0.2 });
      const offsets = [
        [-ew * 0.42, -ed * 0.42],
        [ew * 0.42, -ed * 0.42],
        [-ew * 0.42, ed * 0.42],
        [ew * 0.42, ed * 0.42],
      ];
      offsets.forEach(([ox, oz]) => {
        const pillar = new THREE.Mesh(standoffGeom, standoffMat);
        pillar.position.set(ox, 15 + eh / 2, oz);
        encGroup.add(pillar);
      });

      // Left & Right Motor Drive Wheels with Treaded Tires
      const wheelRadius = 26;
      const wheelWidth = 12;
      const tireGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      const tireMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.85 });
      const rimGeom = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 1.05, 20);
      const rimMat = new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.4, roughness: 0.3 });

      const wheelLeft = new THREE.Mesh(tireGeom, tireMat);
      wheelLeft.rotation.z = Math.PI / 2;
      wheelLeft.position.set(-ew / 2 - wheelWidth / 2 - 2, wheelRadius, 0);
      const rimLeft = new THREE.Mesh(rimGeom, rimMat);
      wheelLeft.add(rimLeft);

      const wheelRight = new THREE.Mesh(tireGeom, tireMat);
      wheelRight.rotation.z = Math.PI / 2;
      wheelRight.position.set(ew / 2 + wheelWidth / 2 + 2, wheelRadius, 0);
      const rimRight = new THREE.Mesh(rimGeom, rimMat);
      wheelRight.add(rimRight);

      encGroup.add(wheelLeft);
      encGroup.add(wheelRight);

      // Front omni-directional caster ball
      const casterGeom = new THREE.SphereGeometry(12, 16, 16);
      const casterMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 });
      const caster = new THREE.Mesh(casterGeom, casterMat);
      caster.position.set(0, 12, ed * 0.4);
      encGroup.add(caster);
      break;
    }

    case 'AGRICULTURE_CONTROLLER': {
      // 3. IP67 Weatherproof Outdoor Junction Enclosure
      const encGeom = new THREE.BoxGeometry(ew, eh, ed);
      const encMesh = new THREE.Mesh(encGeom, baseMat);
      encMesh.position.y = eh / 2;
      encGroup.add(encMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(encGeom), wireMat);
      encMesh.add(edges);

      // Silicone waterproof gasket rim
      const gasketGeom = new THREE.BoxGeometry(ew * 1.02, eh * 0.08, ed * 1.02);
      const gasketMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.6 });
      const gasket = new THREE.Mesh(gasketGeom, gasketMat);
      gasket.position.y = eh * 0.85;
      encGroup.add(gasket);

      // Bottom dual PG7/PG9 waterproof cable glands
      const glandGeom = new THREE.CylinderGeometry(7, 7, 20, 16);
      const glandMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.4 });
      const g1 = new THREE.Mesh(glandGeom, glandMat);
      g1.rotation.x = Math.PI / 2;
      g1.position.set(-ew * 0.25, 12, ed / 2 + 10);
      const g2 = new THREE.Mesh(glandGeom, glandMat);
      g2.rotation.x = Math.PI / 2;
      g2.position.set(ew * 0.25, 12, ed / 2 + 10);
      encGroup.add(g1);
      encGroup.add(g2);
      break;
    }

    case 'PARKING_DETECTOR': {
      // 4. Overhead Ceiling Parking Bay Unit
      const encGeom = new THREE.BoxGeometry(ew, eh, ed);
      const encMesh = new THREE.Mesh(encGeom, baseMat);
      encMesh.position.y = eh / 2;
      encGroup.add(encMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(encGeom), wireMat);
      encMesh.add(edges);

      // Top Ceiling Mounting Flange Brackets
      const tabGeom = new THREE.BoxGeometry(ew * 0.9, 4, 16);
      const tabMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
      const tabTop = new THREE.Mesh(tabGeom, tabMat);
      tabTop.position.set(0, eh, -ed / 2 - 8);
      const tabBottom = new THREE.Mesh(tabGeom, tabMat);
      tabBottom.position.set(0, eh, ed / 2 + 8);
      encGroup.add(tabTop);
      encGroup.add(tabBottom);

      // 360-degree glowing RGB Beacon Diffuser Ring
      const ringR = Math.min(ew, ed) * 0.22;
      const ringGeom = new THREE.CylinderGeometry(ringR, ringR, eh * 0.35, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: '#3b82f6',
        emissive: '#1d4ed8',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(-ew * 0.28, eh + eh * 0.15, -ed * 0.15);
      encGroup.add(ring);
      break;
    }

    case 'DISPENSER_FEEDER': {
      // 5. Motorized Food Hopper Tower & Weighing Scale
      const basePlatformGeom = new THREE.BoxGeometry(ew, 12, ed);
      const basePlatform = new THREE.Mesh(basePlatformGeom, baseMat);
      basePlatform.position.y = 6;
      encGroup.add(basePlatform);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(basePlatformGeom), wireMat);
      basePlatform.add(edges);

      // Weighing Bowl Scale Tray at front
      const trayGeom = new THREE.BoxGeometry(ew * 0.75, 8, ed * 0.42);
      const trayMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.3, metalness: 0.2 });
      const tray = new THREE.Mesh(trayGeom, trayMat);
      tray.position.set(0, 10, ed * 0.28);
      encGroup.add(tray);

      // Clear Vertical Food Hopper Tower Cylinder
      const hopperR = Math.min(ew, ed) * 0.32;
      const hopperH = eh * 0.85;
      const hopperGeom = new THREE.CylinderGeometry(hopperR, hopperR * 0.9, hopperH, 28);
      const hopperMat = new THREE.MeshStandardMaterial({
        color: '#93c5fd',
        transparent: true,
        opacity: 0.28,
        roughness: 0.1,
        metalness: 0.1,
      });
      const hopper = new THREE.Mesh(hopperGeom, hopperMat);
      hopper.position.set(0, 12 + hopperH / 2, -ed * 0.15);
      encGroup.add(hopper);

      // Top Hopper Lid Cap
      const lidGeom = new THREE.CylinderGeometry(hopperR * 1.05, hopperR * 1.05, 8, 28);
      const lidMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });
      const lid = new THREE.Mesh(lidGeom, lidMat);
      lid.position.set(0, 12 + hopperH + 4, -ed * 0.15);
      encGroup.add(lid);

      // Dispense Chute Nozzle
      const chuteGeom = new THREE.BoxGeometry(ew * 0.28, 14, ed * 0.25);
      const chuteMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
      const chute = new THREE.Mesh(chuteGeom, chuteMat);
      chute.position.set(0, 22, ed * 0.05);
      chute.rotation.x = Math.PI / 8;
      encGroup.add(chute);
      break;
    }

    case 'DETECTOR_ALARM': {
      // 6. Wall-Mount Enclosure with Louvered Gas Vents & Screw Tabs
      const encGeom = new THREE.BoxGeometry(ew, eh, ed);
      const encMesh = new THREE.Mesh(encGeom, baseMat);
      encMesh.position.y = eh / 2;
      encGroup.add(encMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(encGeom), wireMat);
      encMesh.add(edges);

      // Top/Bottom Wall-Mounting Flange Tabs with Screw Holes
      const tabGeom = new THREE.BoxGeometry(ew * 0.85, 4, 18);
      const tabMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
      const tabTop = new THREE.Mesh(tabGeom, tabMat);
      tabTop.position.set(0, 2, -ed / 2 - 9);
      const tabBottom = new THREE.Mesh(tabGeom, tabMat);
      tabBottom.position.set(0, 2, ed / 2 + 9);
      encGroup.add(tabTop);
      encGroup.add(tabBottom);

      // Louvered gas intake grill slats on front/top
      const slatCount = 5;
      const slatGeom = new THREE.BoxGeometry(ew * 0.4, 3, 2);
      const slatMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.6, roughness: 0.3 });
      for (let i = 0; i < slatCount; i++) {
        const slat = new THREE.Mesh(slatGeom, slatMat);
        slat.position.set(-ew * 0.25, eh + 1, -ed * 0.15 + i * 6);
        encGroup.add(slat);
      }
      break;
    }

    case 'INDUSTRIAL_CONTROL': {
      // 5. DIN Rail Module with Terminal Blocks
      const encGeom = new THREE.BoxGeometry(ew, eh, ed);
      const encMesh = new THREE.Mesh(encGeom, baseMat);
      encMesh.position.y = eh / 2;
      encGroup.add(encMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(encGeom), wireMat);
      encMesh.add(edges);

      // Rear DIN Rail mounting clip
      const railGeom = new THREE.BoxGeometry(ew * 0.9, 35, 12);
      const railMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.85, roughness: 0.25 });
      const rail = new THREE.Mesh(railGeom, railMat);
      rail.position.set(0, eh / 2, -ed / 2 - 6);
      encGroup.add(rail);
      break;
    }

    case 'HOME_MONITOR':
    default: {
      // 6. Angled Desktop Console Enclosure with Bezel & Cooling Vents
      const encGeom = new THREE.BoxGeometry(ew, eh, ed);
      const encMesh = new THREE.Mesh(encGeom, baseMat);
      encMesh.position.y = eh / 2;
      encGroup.add(encMesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(encGeom), wireMat);
      encMesh.add(edges);

      // Top console display bezel frame
      const bezelGeom = new THREE.BoxGeometry(ew * 0.7, 3, ed * 0.45);
      const bezelMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.3 });
      const bezel = new THREE.Mesh(bezelGeom, bezelMat);
      bezel.position.set(0, eh + 1.5, ed * 0.05);
      encGroup.add(bezel);

      // 4 Rubber Base Feet
      const footGeom = new THREE.CylinderGeometry(5, 5, 4, 16);
      const footMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.9 });
      const footOffsets = [
        [-ew * 0.4, -ed * 0.4],
        [ew * 0.4, -ed * 0.4],
        [-ew * 0.4, ed * 0.4],
        [ew * 0.4, ed * 0.4],
      ];
      footOffsets.forEach(([fx, fz]) => {
        const foot = new THREE.Mesh(footGeom, footMat);
        foot.position.set(fx, 2, fz);
        encGroup.add(foot);
      });

      // Rear cooling ventilation grill slots
      const ventSlatGeom = new THREE.BoxGeometry(ew * 0.6, 2, 2);
      const ventSlatMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.5 });
      for (let i = 0; i < 4; i++) {
        const vent = new THREE.Mesh(ventSlatGeom, ventSlatMat);
        vent.position.set(0, eh * 0.3 + i * 6, -ed / 2 - 1);
        encGroup.add(vent);
      }
      break;
    }
  }

  scene.add(encGroup);
  return encGroup;
}

/**
 * Intelligent Parametric 3D Hardware Prototype Engine.
 * Dynamically adapts 3D mesh, enclosure, component layout, and camera to the project archetype.
 */
export default function Parametric3DViewer({
  threeDModel = {},
  components = [],
  connections = [],
  onSelectComponent,
  selectedComponentId,
  blueprint = {},
  enclosure = {},
  projectType = 'HARDWARE',
  onReturnToPlan = null,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const meshesRef = useRef([]);
  const highlightBoxRef = useRef(null);
  const defaultCameraPosRef = useRef(null);
  const defaultCameraTargetRef = useRef(null);

  const [hasWebGL, setHasWebGL] = useState(true);
  const [initError, setInitError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [enclosureMode, setEnclosureMode] = useState('TRANSLUCENT'); // 'TRANSLUCENT' | 'SOLID' | 'HIDDEN'
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedCompData, setSelectedCompData] = useState(null);

  const onSelectCompRef = useRef(onSelectComponent);
  onSelectCompRef.current = onSelectComponent;

  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;

  // 1. Detect hardware archetype
  const archetype = useMemo(() => {
    return detectHardwareArchetype({
      threeDModel,
      components,
      enclosure: enclosure || threeDModel?.enclosure,
      blueprint,
    });
  }, [threeDModel, components, enclosure, blueprint]);

  // 2. Compute project-specific component arrangement
  const modelComponents = useMemo(() => {
    const rawDims = threeDModel?.enclosure?.dimensions || enclosure?.dimensions || archetype?.defaultDims || [50, 20, 50];
    const [ew, eh, ed] = parseDimensions3D(rawDims, archetype?.defaultDims || [50, 20, 50]);

    // Map existing 3D coordinates by componentId
    const explicit3dMap = new Map();
    if (threeDModel?.components && Array.isArray(threeDModel.components)) {
      threeDModel.components.forEach((c) => {
        if (c && c.componentId) {
          explicit3dMap.set(c.componentId, c);
        }
      });
    }

    const catCounts = {
      MICROCONTROLLER: 0,
      SENSOR: 0,
      ACTUATOR: 0,
      DISPLAY: 0,
      POWER: 0,
      COMMUNICATION: 0,
      OTHER: 0,
    };

    const safeComponents = Array.isArray(components) ? components.filter((c) => c && typeof c === 'object') : [];

    // Every visible component MUST come from the current blueprint's components list (prevents stale components)
    return safeComponents.map((c, idx) => {
      const explicit = explicit3dMap.get(c.id);
      if (explicit) {
        return {
          componentId: c.id,
          primitiveType: explicit.primitiveType || 'BOX',
          dimensions: explicit.dimensions || [20, 10, 20],
          position: explicit.position || [0, 5, 0],
          rotation: explicit.rotation || [0, 0, 0],
          color: explicit.color || '#38bdf8',
          label: c.name || explicit.label || `Part ${idx + 1}`,
          name: c.name,
          category: c.category || explicit.category || '',
          purpose: c.purpose || explicit.purpose || '',
          specification: c.specification || explicit.specification || '',
          estimatedUnitCost: c.estimatedUnitCost,
          quantity: c.quantity || 1,
        };
      }

      // Dynamic parametric placement for components without explicit pre-baked coordinates
      const cat = (c.category || 'OTHER').toUpperCase();
      const slot = catCounts[cat] !== undefined ? catCounts[cat]++ : 0;
      const lower = ((c.name || '') + ' ' + (c.purpose || '')).toLowerCase();
      let primitiveType = 'BOX';
      let dims = [22, 10, 22];
      let color = '#38bdf8';
      let pos = [0, 5, 0];
      let rot = [0, 0, 0];

      if (cat === 'MICROCONTROLLER') {
        primitiveType = 'BOARD';
        dims = [Math.min(ew * 0.55, 55), 6, Math.min(ed * 0.45, 30)];
        color = '#065f46';
        pos = slot === 0 ? [0, 5, 0] : [-ew * 0.25 - slot * 12, 5, ed * 0.2];
      } else if (cat === 'SENSOR') {
        primitiveType = 'SENSOR_MODULE';
        dims = [20, 14, 20];
        color = '#b45309';

        if (archetype.id === 'DETECTOR_ALARM') {
          // Gas/smoke sensors arranged across intake vents with slot offsets
          pos = slot === 0 ? [-ew * 0.25, 12, -ed * 0.15] : [ew * 0.25 - (slot - 1) * 20, 12, -ed * 0.15 + slot * 8];
        } else if (archetype.id === 'ROBOTICS_ROVER') {
          // Sonar / distance sensors at bumper
          dims = [44, 16, 20];
          pos = slot === 0 ? [0, 22, ed * 0.42] : [-ew * 0.25 + slot * 18, 16, ed * 0.35];
        } else if (archetype.id === 'WEARABLE_HEALTH') {
          // Biometric sensor on bottom skin contact
          dims = [18, 5, 18];
          pos = slot === 0 ? [0, 1, 0] : [-14 + slot * 12, -3, 8];
        } else if (archetype.id === 'PARKING_DETECTOR') {
          dims = [45, 20, 18];
          pos = slot === 0 ? [0, 24, 25] : [ew * 0.22 - slot * 18, 18, 20];
        } else if (archetype.id === 'DISPENSER_FEEDER') {
          if (lower.includes('load cell') || lower.includes('strain')) {
            primitiveType = 'BOX';
            dims = [70, 14, 18];
            pos = [0, 6, 45];
          } else if (lower.includes('hx711')) {
            primitiveType = 'BOARD';
            dims = [24, 5, 16];
            pos = [38, 8, 40];
          } else {
            dims = [24, 6, 18];
            pos = [-42 + slot * 15, 8, 15];
          }
        } else {
          // Generic fallback arrangement: distributed along sensor bay
          pos = [ew * 0.25 - slot * 25, 8, -ed * 0.2 + slot * 14];
        }
      } else if (cat === 'DISPLAY') {
        primitiveType = 'DISPLAY_PANEL';
        if (archetype.id === 'WEARABLE_HEALTH') {
          dims = [34, 4, 34];
          pos = [0, eh + 2, 0];
        } else if (archetype.id === 'DISPENSER_FEEDER') {
          dims = [70, 8, 30];
          pos = [0, 95, -48];
        } else if (archetype.id === 'PARKING_DETECTOR') {
          dims = [38, 7, 26];
          pos = [0, 22, -22];
        } else {
          dims = [Math.min(ew * 0.55, 65), 7, Math.min(ed * 0.35, 30)];
          pos = [ew * 0.18 - slot * 20, 20, ed * 0.15];
        }
        color = '#0284c7';
      } else if (cat === 'ACTUATOR') {
        if (lower.includes('buzzer') || lower.includes('siren')) {
          primitiveType = 'BUZZER';
          dims = [16, 12, 16];
          color = '#18181b';
          pos = [ew * 0.25 - slot * 14, 12, ed * 0.2];
        } else if (lower.includes('relay')) {
          primitiveType = 'ACTUATOR';
          dims = [40, 16, 32];
          color = '#1d4ed8';
          pos = [-ew * 0.28 + slot * 15, 10, ed * 0.15];
        } else if (lower.includes('servo') || lower.includes('motor')) {
          primitiveType = 'ACTUATOR';
          dims = [40, 36, 20];
          color = '#334155';
          pos = [slot === 0 ? 0 : ew * 0.25 * (slot % 2 === 0 ? 1 : -1), 65, 0];
        } else if (lower.includes('button')) {
          primitiveType = 'BUTTON';
          dims = [24, 10, 14];
          color = '#dc2626';
          pos = [42 - slot * 16, 85, -45];
        } else if (lower.includes('rgb') || lower.includes('ws2812')) {
          primitiveType = 'LED';
          dims = [22, 16, 22];
          color = '#10b981';
          pos = [-35 + slot * 16, 26, -15];
        } else {
          primitiveType = 'LED';
          dims = [8, 14, 8];
          color = '#ef4444';
          pos = [ew * 0.3 - slot * 14, 14, slot * 12];
        }
      } else if (cat === 'POWER') {
        primitiveType = 'CONNECTOR';
        dims = [22, 12, 18];
        color = '#f59e0b';
        pos = [-ew * 0.32 - slot * 15, 6, -ed * 0.28];
      } else {
        // Spatial distribution around board center for generic/other components
        const angle = (idx / Math.max(components.length, 1)) * Math.PI * 2;
        pos = [Math.cos(angle) * (ew * 0.32), 6, Math.sin(angle) * (ed * 0.32)];
      }

      return {
        componentId: c.id,
        primitiveType,
        dimensions: dims,
        position: pos,
        rotation: rot,
        color,
        label: c.name || `Part ${idx + 1}`,
        name: c.name,
        category: c.category,
        purpose: c.purpose,
        specification: c.specification,
        estimatedUnitCost: c.estimatedUnitCost,
        quantity: c.quantity || 1,
      };
    });
  }, [threeDModel, components, enclosure, archetype]);

  // Check WebGL availability
  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // Initialize Three.js Scene, Camera, Lights, and Objects
  useEffect(() => {
    if (!hasWebGL || !containerRef.current) return;
    const containerEl = containerRef.current;
    if (!containerEl) return;

    let isRunning = true;
    let renderer = null;
    let controls = null;
    let resizeObserver = null;

    try {
      const width = containerEl.clientWidth || 720;
      const height = 480;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#070b14');
      sceneRef.current = scene;

      // Atmospheric Grid Floor
      const grid = new THREE.GridHelper(260, 26, '#1e293b', '#0f172a');
      grid.position.y = -0.5;
      scene.add(grid);

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(42, width / height, 1, 2000);
      cameraRef.current = camera;

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      rendererRef.current = renderer;

      containerEl.innerHTML = '';
      containerEl.appendChild(renderer.domElement);

      // 4. OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI / 2 + 0.08;
      controlsRef.current = controls;

      // 5. Lighting
      const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight('#ffffff', '#1e293b', 0.7);
      hemiLight.position.set(0, 100, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight('#ffffff', 1.25);
      keyLight.position.set(100, 140, 80);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(archetype.accentColor || '#38bdf8', 0.65);
      fillLight.position.set(-80, 50, -60);
      scene.add(fillLight);

      // 6. Build Physical Enclosure
      const encDims = threeDModel?.enclosure?.dimensions || archetype.defaultDims;
      const encGroup = createPhysicalEnclosure(scene, archetype, encDims, enclosureMode);

      // 7. Build Component Meshes
      const meshes = [];
      modelComponents.forEach((item) => {
        const meshGroup = createPrimitiveMesh(item, isExploded, archetype);
        scene.add(meshGroup);
        meshes.push(meshGroup);
      });
      meshesRef.current = meshes;

      // 8. Automatic Camera Framing via THREE.Box3 Bounding Box
      const boundingBox = new THREE.Box3();
      if (encGroup) {
        boundingBox.expandByObject(encGroup);
      }
      meshes.forEach((m) => {
        boundingBox.expandByObject(m);
      });

      if (!boundingBox.isEmpty()) {
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z, 25);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.55;
        cameraDistance = Math.max(cameraDistance, 70);

        const viewDir = new THREE.Vector3(1, 0.85, 1.25).normalize();
        camera.position.copy(center).addScaledVector(viewDir, cameraDistance);

        camera.near = Math.max(0.5, cameraDistance / 200);
        camera.far = Math.max(2000, cameraDistance * 30);
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.update();

        defaultCameraPosRef.current = camera.position.clone();
        defaultCameraTargetRef.current = center.clone();
      } else {
        const [cx, cy, cz] = archetype.cameraPos || [90, 80, 120];
        const [tx, ty, tz] = archetype.cameraTarget || [0, 10, 0];
        camera.position.set(cx, cy, cz);
        controls.target.set(tx, ty, tz);
        controls.update();
        defaultCameraPosRef.current = new THREE.Vector3(cx, cy, cz);
        defaultCameraTargetRef.current = new THREE.Vector3(tx, ty, tz);
      }

      // Update zoom level state on user zoom
      controls.addEventListener('change', () => {
        if (!defaultCameraPosRef.current || !defaultCameraTargetRef.current) return;
        const initialDist = defaultCameraPosRef.current.distanceTo(defaultCameraTargetRef.current);
        const currentDist = camera.position.distanceTo(controls.target);
        const pct = Math.round((initialDist / Math.max(currentDist, 10)) * 100);
        setZoomLevel(Math.min(Math.max(pct, 30), 300));
      });

      // 9. Selection Highlight Helper
      const highlightBox = new THREE.BoxHelper(new THREE.Mesh(), '#16d9e3');
      highlightBox.visible = false;
      highlightBox.material.depthTest = false;
      highlightBox.material.transparent = true;
      highlightBox.material.opacity = 0.9;
      scene.add(highlightBox);
      highlightBoxRef.current = highlightBox;

      // 10. Raycasting for Component Selection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const handlePointerDown = (event) => {
        if (!renderer?.domElement) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let selectedGroup = null;
        for (const hit of intersects) {
          let parent = hit.object;
          while (parent && parent !== scene) {
            if (parent.userData?.componentId) {
              selectedGroup = parent;
              break;
            }
            parent = parent.parent;
          }
          if (selectedGroup) break;
        }

        if (selectedGroup) {
          const compId = selectedGroup.userData.componentId;
          const matchedComp = components.find((c) => c.id === compId) || selectedGroup.userData;
          setSelectedCompData(matchedComp);
          if (onSelectCompRef.current) onSelectCompRef.current(matchedComp);
        }
      };

      renderer.domElement.addEventListener('pointerdown', handlePointerDown);

      const handleContextLost = (event) => {
        event.preventDefault();
        console.warn('WebGL context lost in Parametric3DViewer. Switching to recovery state.');
        setInitError('WebGL context was temporarily lost. You can retry loading the 3D model.');
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

      // 11. Animation Loop
      const animate = () => {
        if (!isRunning) return;
        if (controls) controls.update();

        meshes.forEach((m) => {
          const lbl = m.getObjectByName('componentLabel');
          if (lbl) lbl.visible = showLabelsRef.current;
        });

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
        animFrameIdRef.current = requestAnimationFrame(animate);
      };
      animate();

      // 12. Resize Handling via ResizeObserver & window resize
      const updateDimensions = (w, h) => {
        if (w > 0 && h > 0 && camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      };

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const nw = entry.contentRect.width > 0 ? entry.contentRect.width : (containerEl.clientWidth || 720);
            const nh = entry.contentRect.height > 0 ? entry.contentRect.height : (containerEl.clientHeight || 480);
            if (nw > 0 && nh > 0) {
              updateDimensions(nw, nh);
            }
          }
        });
        resizeObserver.observe(containerEl);
      }

      const handleWindowResize = () => {
        if (!containerEl) return;
        const nw = containerEl.clientWidth || 720;
        const nh = containerEl.clientHeight || 480;
        if (nw > 0) updateDimensions(nw, nh);
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        isRunning = false;
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
        window.removeEventListener('resize', handleWindowResize);
        if (renderer?.domElement) {
          renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        }
        if (controls) {
          controls.dispose();
          controlsRef.current = null;
        }
        if (scene) {
          scene.traverse((child) => {
            if (child.isMesh || child.isLine || child.isSprite) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m) => {
                    if (m && m.map) m.map.dispose();
                    if (m && typeof m.dispose === 'function') m.dispose();
                  });
                } else {
                  if (child.material.map) child.material.map.dispose();
                  if (typeof child.material.dispose === 'function') child.material.dispose();
                }
              }
            }
          });
          sceneRef.current = null;
        }
        if (renderer) {
          try {
            renderer.forceContextLoss();
            renderer.dispose();
          } catch {
            // Ignore renderer disposal error
          }
          rendererRef.current = null;
        }
        cameraRef.current = null;
        meshesRef.current = [];
        highlightBoxRef.current = null;
        if (containerEl) containerEl.innerHTML = '';
      };
    } catch (err) {
      console.error('Three.js scene initialization error:', err);
      setInitError('Failed to initialize 3D scene');
      if (containerEl) containerEl.innerHTML = '';
    }
  }, [hasWebGL, modelComponents, enclosureMode, isExploded, archetype, retryKey]);

  // Sync selected component highlight
  useEffect(() => {
    if (!selectedCompData || !highlightBoxRef.current || !meshesRef.current.length) {
      if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
      return;
    }

    const targetGroup = meshesRef.current.find(
      (g) => g.userData?.componentId === selectedCompData.id || g.userData?.id === selectedCompData.id
    );

    if (targetGroup) {
      highlightBoxRef.current.setFromObject(targetGroup);
      highlightBoxRef.current.visible = true;
    } else {
      highlightBoxRef.current.visible = false;
    }
  }, [selectedCompData]);

  // Sync external selectedComponentId
  useEffect(() => {
    if (selectedComponentId) {
      const found = components.find((c) => c.id === selectedComponentId);
      if (found) setSelectedCompData(found);
    }
  }, [selectedComponentId, components]);

  // Toolbar Handlers
  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current) {
      if (defaultCameraPosRef.current && defaultCameraTargetRef.current) {
        cameraRef.current.position.copy(defaultCameraPosRef.current);
        controlsRef.current.target.copy(defaultCameraTargetRef.current);
      } else {
        const [cx, cy, cz] = archetype.cameraPos || [90, 80, 120];
        const [tx, ty, tz] = archetype.cameraTarget || [0, 10, 0];
        cameraRef.current.position.set(cx, cy, cz);
        controlsRef.current.target.set(tx, ty, tz);
      }
      controlsRef.current.update();
      setZoomLevel(100);
    }
  };

  const handleZoom = (delta) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const factor = delta > 0 ? 0.85 : 1.18;
    cameraRef.current.position.sub(controlsRef.current.target).multiplyScalar(factor).add(controlsRef.current.target);
    controlsRef.current.update();
  };

  const handleRotate = (angleDegrees) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const rad = (angleDegrees * Math.PI) / 180;
    const offset = cameraRef.current.position.clone().sub(controlsRef.current.target);
    const x = offset.x * Math.cos(rad) - offset.z * Math.sin(rad);
    const z = offset.x * Math.sin(rad) + offset.z * Math.cos(rad);
    cameraRef.current.position.set(controlsRef.current.target.x + x, cameraRef.current.position.y, controlsRef.current.target.z + z);
    controlsRef.current.update();
  };

  // Find connections involving the selected component
  const selectedConnections = useMemo(() => {
    if (!selectedCompData) return [];
    return connections.filter(
      (c) => c.fromComponentId === selectedCompData.id || c.toComponentId === selectedCompData.id
    );
  }, [selectedCompData, connections]);

  // 1. Safe fallback when hardware data is genuinely missing
  const hasUsableHardwareData =
    (components && components.length > 0) ||
    (threeDModel?.components && threeDModel.components.length > 0);

  if (!hasUsableHardwareData) {
    return (
      <div
        className="card"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🧊</span>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          3D Model Unavailable
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '520px', margin: '0.5rem auto 0' }}>
          3D model data is unavailable for this project.
        </p>
      </div>
    );
  }

  // 2. Fallback when WebGL is unsupported
  if (!hasWebGL) {
    return (
      <div
        className="card"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🖥️</span>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          3D Hardware Preview Requires WebGL
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '520px', margin: '0.5rem auto 0' }}>
          Interactive 3D preview is unavailable in this browser session. Component specifications and deterministic circuit wiring schematics are fully available above.
        </p>
      </div>
    );
  }

  // 3. Fallback when initialization threw an exception
  if (initError) {
    return (
      <div
        className="card"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 94, 122, 0.35)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>⚠️</span>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          3D model could not be loaded.
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
          {initError || 'The 3D physical concept viewer could not be initialized in this session.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setInitError(null);
              setRetryKey((k) => k + 1);
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
          >
            🔄 Retry 3D Model
          </button>
          {onReturnToPlan && (
            <button
              type="button"
              onClick={onReturnToPlan}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
            >
              ⬅️ Return to Hardware Plan
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Archetype Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{archetype.icon}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${archetype.badgeClass || 'badge-aqua'}`} style={{ fontSize: '0.6875rem' }}>
                PROJECT-SPECIFIC ARCHETYPE
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {archetype.name}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
              {archetype.description}
            </p>
          </div>
        </div>

        {/* Quick View Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>📦 {modelComponents.length} 3D Parts</span>
          <span>•</span>
          <span>⚡ {connections.length} Pin Circuits</span>
        </div>
      </div>

      {/* 3D Viewer Interactive Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Left Toolbar: Enclosure, Exploded & Labels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enclosure:</span>
          {['TRANSLUCENT', 'SOLID', 'HIDDEN'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setEnclosureMode(mode)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: enclosureMode === mode ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: enclosureMode === mode ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {mode}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsExploded((v) => !v)}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isExploded ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: isExploded ? 'var(--accent-purple)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {isExploded ? '💥 Exploded View' : '📦 Compact View'}
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: showLabels ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: showLabels ? 'var(--accent-green)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            🏷️ Labels: {showLabels ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Right Toolbar: Zoom, Rotate & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleRotate(-25)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
            title="Rotate Left"
          >
            ↺ -25°
          </button>
          <button
            type="button"
            onClick={() => handleRotate(25)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
            title="Rotate Right"
          >
            ↻ +25°
          </button>

          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
            title="Zoom Out"
          >
            🔍 -
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
            title="Zoom In"
          >
            🔍 +
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            title="Reset Camera View"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Component Quick Selector Chips */}
      {components && components.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Click to Inspect:</span>
          {components.map((comp) => {
            const isSelected = selectedCompData?.id === comp.id;
            return (
              <button
                key={comp.id}
                id={`btn-inspect-3d-${comp.id}`}
                data-testid="inspect-3d-comp"
                type="button"
                onClick={() => {
                  setSelectedCompData(comp);
                  if (onSelectComponent) onSelectComponent(comp);
                }}
                className={`badge ${isSelected ? 'badge-aqua' : 'badge-subtle'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  backgroundColor: isSelected ? 'rgba(22, 217, 227, 0.15)' : 'var(--bg-elevated)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                }}
              >
                {comp.name || comp.id}
              </button>
            );
          })}
        </div>
      )}

      {/* Main 3D Canvas Viewport */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-default)',
          backgroundColor: '#070b14',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '480px', cursor: 'grab' }} />

        {/* Floating Interaction Controls Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        >
          🖱️ Left Click: Rotate • Right Click: Pan • Scroll / Buttons: Zoom • Click Mesh to Inspect
        </div>
      </div>

      {/* Selected Component Inspection Panel */}
      {selectedCompData && (
        <div
          id="selected-component-inspector"
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--accent-cyan)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-aqua" style={{ fontSize: '0.6875rem' }}>
                  {selectedCompData.category || 'HARDWARE COMPONENT'}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedCompData.name || selectedCompData.label}
                </h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {selectedCompData.purpose || 'Physical circuit element'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCompData(null)}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              ✕ Close
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Specification:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {selectedCompData.specification || 'Standard hardware rating'}
              </span>
            </div>
            {selectedCompData.quantity != null && (
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Quantity:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedCompData.quantity}
                </span>
              </div>
            )}
          </div>

          {/* Connected Pins & Signal Traces */}
          {selectedConnections.length > 0 && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                CIRCUIT WIRING & PIN CONNECTIONS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedConnections.map((conn) => {
                  const isSource = conn.fromComponentId === selectedCompData.id;
                  const myPin = isSource ? conn.fromPin : conn.toPin;
                  const targetCompId = isSource ? conn.toComponentId : conn.fromComponentId;
                  const targetPin = isSource ? conn.toPin : conn.fromPin;
                  const targetComp = components.find((c) => c.id === targetCompId);

                  return (
                    <div
                      key={conn.id}
                      style={{
                        padding: '0.35rem 0.65rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{myPin}</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.35rem' }}>↔</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {targetComp?.name || targetCompId} ({targetPin})
                      </span>
                      <span style={{ color: 'var(--accent-orange)', marginLeft: '0.35rem', fontWeight: 600 }}>
                        [{conn.signalType} • {conn.voltage || '3.3V'}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purpose & Limitations Disclaimer */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        ⚠️ Interactive 3D Hardware Prototype — Parametric concept model communicating physical layout, enclosure shape, and component placement.
      </div>
    </div>
  );
}
