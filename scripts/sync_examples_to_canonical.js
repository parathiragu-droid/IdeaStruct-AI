import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const swBp = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared', 'fixtures', 'software_blueprint.json'), 'utf8'));
const hwBp = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared', 'fixtures', 'hardware_blueprint.json'), 'utf8'));
const hyBp = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared', 'fixtures', 'hybrid_blueprint.json'), 'utf8'));

// 1. Update api/examples/create-project.response.json
const createProjResPath = path.join(rootDir, 'api', 'examples', 'create-project.response.json');
const createProjRes = {
  id: "6740a1b2c3d4e5f678901234",
  title: "CampusBite — Student Food Ordering",
  idea: "An on-demand food pre-ordering and pickup system tailored for university campus dining halls, allowing students to order meals ahead, pay with campus meal points, and track pickup lockers in real-time.",
  typeOverride: null,
  revision: 1,
  createdAt: "2026-09-24T10:00:00Z",
  updatedAt: "2026-09-24T10:00:00Z",
  blueprint: null,
  blueprintBasedOnIdeaHash: null,
  blueprintOutdated: false,
  generationMetadata: null,
  validationIssues: [],
  validationCheckedAt: null
};
fs.writeFileSync(createProjResPath, JSON.stringify(createProjRes, null, 2), 'utf8');

// 2. Update api/examples/generate-blueprint.response.json
const genSwPath = path.join(rootDir, 'api', 'examples', 'generate-blueprint.response.json');
const genSwRes = {
  id: "6740a1b2c3d4e5f678901234",
  title: "CampusBite — Student Campus Food Ordering & Pickup",
  idea: "CampusBite is a campus-focused food ordering and pickup platform designed for university students, campus dining halls, and independent food trucks parked on university grounds.",
  typeOverride: null,
  revision: 2,
  createdAt: "2026-09-24T10:00:00Z",
  updatedAt: "2026-09-24T10:01:00Z",
  blueprint: swBp,
  blueprintBasedOnIdeaHash: "b3e944db76ce938d2f6645318e803530f2f3e82b79a8385732dc51e5927ad154",
  blueprintOutdated: false,
  generationMetadata: {
    source: "DEMO",
    provider: null,
    model: "deterministic-fixture-v2",
    timestamp: "2026-09-24T10:01:00Z"
  },
  validationIssues: [],
  validationCheckedAt: "2026-09-24T10:01:05Z"
};
fs.writeFileSync(genSwPath, JSON.stringify(genSwRes, null, 2), 'utf8');

// 3. Update api/examples/generate-blueprint-hardware.response.json
const genHwPath = path.join(rootDir, 'api', 'examples', 'generate-blueprint-hardware.response.json');
const genHwRes = {
  id: "6740a1b2c3d4e5f678905678",
  title: "SentinelAir — Autonomous Hazardous Gas & Smoke Detection Circuit",
  idea: "SentinelAir is a standalone embedded safety appliance designed to detect dangerous concentrations of flammable gas, smoke, and toxic VOCs in workshops, kitchens, and maker laboratories.",
  typeOverride: "HARDWARE",
  revision: 2,
  createdAt: "2026-09-24T10:00:00Z",
  updatedAt: "2026-09-24T10:01:00Z",
  blueprint: hwBp,
  blueprintBasedOnIdeaHash: "d8e3b4a2c1f0987654321fedcba0987654321fedcba0987654321fedcba09876",
  blueprintOutdated: false,
  generationMetadata: {
    source: "DEMO",
    provider: null,
    model: "deterministic-fixture-v2",
    timestamp: "2026-09-24T10:01:00Z"
  },
  validationIssues: [],
  validationCheckedAt: "2026-09-24T10:01:05Z"
};
fs.writeFileSync(genHwPath, JSON.stringify(genHwRes, null, 2), 'utf8');

// 4. Update api/examples/generate-blueprint-hybrid.response.json
const genHyPath = path.join(rootDir, 'api', 'examples', 'generate-blueprint-hybrid.response.json');
const genHyRes = {
  id: "6740a1b2c3d4e5f678909876",
  title: "ColdTrack — Connected Cold-Chain Environmental Telemetry Monitor",
  idea: "ColdTrack is a cellular IoT cold-chain environmental monitor designed for refrigerated pharmaceutical transport vans, vaccine storage chillers, and refrigerated shipping containers.",
  typeOverride: "HYBRID",
  revision: 2,
  createdAt: "2026-09-24T10:00:00Z",
  updatedAt: "2026-09-24T10:01:00Z",
  blueprint: hyBp,
  blueprintBasedOnIdeaHash: "fa45b234c9871234567890abcdef1234567890abcdef1234567890abcdef1234",
  blueprintOutdated: false,
  generationMetadata: {
    source: "DEMO",
    provider: null,
    model: "deterministic-fixture-v2",
    timestamp: "2026-09-24T10:01:00Z"
  },
  validationIssues: [],
  validationCheckedAt: "2026-09-24T10:01:05Z"
};
fs.writeFileSync(genHyPath, JSON.stringify(genHyRes, null, 2), 'utf8');

// 5. Update database/schemas/project-document.example.json
const dbDocPath = path.join(rootDir, 'database', 'schemas', 'project-document.example.json');
const dbDoc = {
  _id: {
    $oid: "673f8e219b13ab2c4e123456"
  },
  title: "CampusBite — Student Campus Food Ordering & Pickup",
  idea: "CampusBite is a campus-focused food ordering and pickup platform designed for university students, campus dining halls, and independent food trucks parked on university grounds.",
  typeOverride: null,
  revision: 2,
  createdAt: {
    $date: "2026-09-24T10:00:00.000Z"
  },
  updatedAt: {
    $date: "2026-09-24T10:05:00.000Z"
  },
  blueprint: swBp,
  blueprintBasedOnIdeaHash: "b3e944db76ce938d2f6645318e803530f2f3e82b79a8385732dc51e5927ad154",
  blueprintOutdated: false,
  generationMetadata: {
    source: "DEMO",
    provider: null,
    model: "deterministic-fixture-v2",
    timestamp: "2026-09-24T10:01:00Z"
  },
  validationIssues: [],
  validationCheckedAt: "2026-09-24T10:05:00Z",
  _class: "com.ideastruct.domain.model.Project"
};
fs.writeFileSync(dbDocPath, JSON.stringify(dbDoc, null, 2), 'utf8');

console.log('✅ Successfully synchronized API and Database examples with canonical schemas.');
