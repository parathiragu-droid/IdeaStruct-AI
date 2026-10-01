import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const schemaPath = path.join(rootDir, 'shared', 'schemas', 'blueprint.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

/**
 * Lightweight, zero-dependency Draft 2020-12 schema validator
 * specialized for IdeaStruct canonical blueprint schemas.
 */
function validateValue(val, propSchema, jsonPath, errors) {
  if (val === undefined) return;

  // Type check
  if (propSchema.type) {
    const types = Array.isArray(propSchema.type) ? propSchema.type : [propSchema.type];
    const matched = types.some(t => {
      if (t === 'null') return val === null;
      if (t === 'string') return typeof val === 'string';
      if (t === 'number') return typeof val === 'number';
      if (t === 'integer') return typeof val === 'number' && Number.isInteger(val);
      if (t === 'boolean') return typeof val === 'boolean';
      if (t === 'array') return Array.isArray(val);
      if (t === 'object') return typeof val === 'object' && val !== null && !Array.isArray(val);
      return false;
    });

    if (!matched) {
      errors.push(`${jsonPath}: Expected type [${types.join(', ')}], got ${Array.isArray(val) ? 'array' : val === null ? 'null' : typeof val}`);
      return;
    }
  }

  // Enum check
  if (propSchema.enum) {
    if (!propSchema.enum.includes(val)) {
      errors.push(`${jsonPath}: Value "${val}" not in enum [${propSchema.enum.join(', ')}]`);
    }
  }

  // String constraints
  if (typeof val === 'string') {
    if (propSchema.minLength !== undefined && val.length < propSchema.minLength) {
      errors.push(`${jsonPath}: String length ${val.length} < minLength ${propSchema.minLength}`);
    }
    if (propSchema.maxLength !== undefined && val.length > propSchema.maxLength) {
      errors.push(`${jsonPath}: String length ${val.length} > maxLength ${propSchema.maxLength}`);
    }
    if (propSchema.pattern) {
      const reg = new RegExp(propSchema.pattern);
      if (!reg.test(val)) {
        errors.push(`${jsonPath}: Value "${val}" does not match pattern "${propSchema.pattern}"`);
      }
    }
  }

  // Number constraints
  if (typeof val === 'number') {
    if (propSchema.minimum !== undefined && val < propSchema.minimum) {
      errors.push(`${jsonPath}: Value ${val} < minimum ${propSchema.minimum}`);
    }
    if (propSchema.maximum !== undefined && val > propSchema.maximum) {
      errors.push(`${jsonPath}: Value ${val} > maximum ${propSchema.maximum}`);
    }
  }

  // Array constraints
  if (Array.isArray(val)) {
    if (propSchema.minItems !== undefined && val.length < propSchema.minItems) {
      errors.push(`${jsonPath}: Array length ${val.length} < minItems ${propSchema.minItems}`);
    }
    if (propSchema.items) {
      val.forEach((item, idx) => {
        validateValue(item, propSchema.items, `${jsonPath}[${idx}]`, errors);
      });
    }
  }

  // Object constraints
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    if (propSchema.required) {
      for (const reqKey of propSchema.required) {
        if (val[reqKey] === undefined || val[reqKey] === null) {
          errors.push(`${jsonPath}: Missing required property "${reqKey}"`);
        }
      }
    }
    if (propSchema.properties) {
      for (const [key, childSchema] of Object.entries(propSchema.properties)) {
        if (val[key] !== undefined) {
          validateValue(val[key], childSchema, `${jsonPath}.${key}`, errors);
        }
      }
    }
  }
}

export function validateBlueprint(blueprint, targetName = 'blueprint') {
  const errors = [];
  validateValue(blueprint, schema, targetName, errors);
  return errors;
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('verify_canonical_schema.js')) {
  console.log('====================================================');
  console.log('IDEASTRUCT AI: CANONICAL SCHEMA VALIDATION SUITE');
  console.log(`Schema ID: ${schema.$id}`);
  console.log('====================================================\n');

  const targets = [
    {
      name: 'Software Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'software_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Hardware Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'hardware_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Hardware Agriculture Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'hardware_agriculture_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Hardware Wearable Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'hardware_wearable_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Hardware Robotics Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'hardware_robotics_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Hybrid Fixture',
      path: path.join(rootDir, 'shared', 'fixtures', 'hybrid_blueprint.json'),
      extract: d => d
    },
    {
      name: 'Software API Example',
      path: path.join(rootDir, 'api', 'examples', 'generate-blueprint.response.json'),
      extract: d => d.blueprint
    },
    {
      name: 'Hardware API Example',
      path: path.join(rootDir, 'api', 'examples', 'generate-blueprint-hardware.response.json'),
      extract: d => d.blueprint
    },
    {
      name: 'Hybrid API Example',
      path: path.join(rootDir, 'api', 'examples', 'generate-blueprint-hybrid.response.json'),
      extract: d => d.blueprint
    },
    {
      name: 'Database Project Document Example',
      path: path.join(rootDir, 'database', 'schemas', 'project-document.example.json'),
      extract: d => d.blueprint
    }
  ];

  let totalFailures = 0;

  for (const t of targets) {
    process.stdout.write(`• Validating ${t.name}... `);
    if (!fs.existsSync(t.path)) {
      console.log(`\x1b[31mFILE NOT FOUND\x1b[0m (${t.path})`);
      totalFailures++;
      continue;
    }

    try {
      const raw = JSON.parse(fs.readFileSync(t.path, 'utf8'));
      const bp = t.extract(raw);
      if (!bp) {
        console.log(`\x1b[31mFAILED\x1b[0m: No embedded blueprint found in ${t.path}`);
        totalFailures++;
        continue;
      }

      const errors = validateBlueprint(bp, t.name);
      if (errors.length === 0) {
        console.log(`\x1b[32mPASS\x1b[0m (0 errors)`);
      } else {
        console.log(`\x1b[31mFAIL\x1b[0m (${errors.length} errors)`);
        errors.forEach(e => console.error(`    - ${e}`));
        totalFailures++;
      }
    } catch (err) {
      console.log(`\x1b[31mPARSE ERROR\x1b[0m: ${err.message}`);
      totalFailures++;
    }
  }

  console.log('\n====================================================');
  if (totalFailures === 0) {
    console.log('✅ ALL CANONICAL FIXTURES AND EXAMPLES CONFORM 100% TO SCHEMA!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error(`❌ SCHEMA VERIFICATION FAILED: ${totalFailures} target(s) had errors.`);
    console.log('====================================================');
    process.exit(1);
  }
}
