import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const scriptPath = path.join(rootDir, 'scripts', 'verification', 'verify_canonical_schema.js');

const result = spawnSync(process.execPath, [scriptPath], {
  cwd: rootDir,
  encoding: 'utf8'
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

assert.strictEqual(result.status, 0, 'Canonical schema verification must pass with exit code 0');
console.log('Canonical schema conformance passed.');
