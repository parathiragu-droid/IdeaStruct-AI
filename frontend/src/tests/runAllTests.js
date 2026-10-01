import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.test.js') && file !== 'runAllTests.js')
  .sort();

console.log(`========================================`);
console.log(`Running ${testFiles.length} Frontend Verification Test Suites`);
console.log(`========================================\n`);

let passedCount = 0;
let failedCount = 0;
const failures = [];

for (const file of testFiles) {
  const filePath = path.join(__dirname, file);
  process.stdout.write(`• Running ${file}... `);
  
  const result = spawnSync(process.execPath, [filePath], {
    cwd: path.resolve(__dirname, '../../..'),
    encoding: 'utf8'
  });

  if (result.status === 0) {
    console.log(`\x1b[32mPASSED\x1b[0m`);
    passedCount++;
  } else {
    console.log(`\x1b[31mFAILED\x1b[0m (exit code: ${result.status})`);
    failedCount++;
    failures.push({ file, output: result.stderr || result.stdout });
  }
}

console.log(`\n========================================`);
console.log(`TOTAL PASSED: ${passedCount} / ${testFiles.length}`);
console.log(`TOTAL FAILED: ${failedCount} / ${testFiles.length}`);
console.log(`========================================\n`);

if (failedCount > 0) {
  console.error('Failure Details:');
  for (const f of failures) {
    console.error(`\n--- ${f.file} ---`);
    console.error(f.output);
  }
  process.exit(1);
} else {
  console.log('✅ ALL FRONTEND VERIFICATION TESTS PASSED!');
  process.exit(0);
}
