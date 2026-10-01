import assert from 'node:assert';
import { generateMermaidErDiagram } from './mermaidTransformer.js';

console.log('====================================================');
console.log('Running Phase 6 Mermaid Transformer Test Suite');
console.log('====================================================\n');

// Test 1: Standard collections and relationships
console.log('--- Test 1: Standard Collections & Relationships ---');
const sampleDb = {
  collections: [
    {
      id: 'coll-users',
      name: 'users',
      fields: [
        { name: '_id', dataType: 'ObjectId', required: true, unique: true },
        { name: 'email', dataType: 'String', required: true, unique: true },
        { name: 'fullName', dataType: 'String', required: true }
      ]
    },
    {
      id: 'coll-orders',
      name: 'orders',
      fields: [
        { name: '_id', dataType: 'ObjectId', required: true, unique: true },
        { name: 'userId', dataType: 'ObjectId', required: true }
      ]
    }
  ],
  relationships: [
    {
      id: 'rel-1',
      sourceCollectionId: 'coll-orders',
      targetCollectionId: 'coll-users',
      sourceField: 'userId',
      targetField: '_id',
      cardinality: 'ONE_TO_MANY',
      description: 'Order placed by user'
    }
  ]
};

const res1 = generateMermaidErDiagram(sampleDb);
assert.strictEqual(res1.hasCollections, true, 'Test 1: hasCollections should be true');
assert(res1.mermaidCode.includes('USERS {'), 'Test 1: USERS entity should exist');
assert(res1.mermaidCode.includes('ORDERS {'), 'Test 1: ORDERS entity should exist');
assert(res1.mermaidCode.includes('USERS ||--o{ ORDERS : "Order placed by user"'), 'Test 1: Relationship correctly formatted');
assert.strictEqual(res1.unresolvedLinks.length, 0, 'Test 1: No unresolved links');
console.log('✅ Test 1 PASSED: Standard collections and relationships transformed deterministically');

// Test 2: Full Cardinality Mapping Allowlist
console.log('\n--- Test 2: Cardinality Allowlist Mapping ---');
const cardinalityDb = {
  collections: [
    { id: 'c-a', name: 'tableA', fields: [{ name: 'id', dataType: 'String' }] },
    { id: 'c-b', name: 'tableB', fields: [{ name: 'id', dataType: 'String' }] },
    { id: 'c-c', name: 'tableC', fields: [{ name: 'id', dataType: 'String' }] },
    { id: 'c-d', name: 'tableD', fields: [{ name: 'id', dataType: 'String' }] }
  ],
  relationships: [
    { id: 'r1', sourceCollectionId: 'c-a', targetCollectionId: 'c-b', sourceField: 'id', targetField: 'id', cardinality: 'ONE_TO_ONE', description: 'one-to-one link' },
    { id: 'r2', sourceCollectionId: 'c-a', targetCollectionId: 'c-c', sourceField: 'id', targetField: 'id', cardinality: 'ONE_TO_MANY', description: 'one-to-many link' },
    { id: 'r3', sourceCollectionId: 'c-b', targetCollectionId: 'c-c', sourceField: 'id', targetField: 'id', cardinality: 'MANY_TO_ONE', description: 'many-to-one link' },
    { id: 'r4', sourceCollectionId: 'c-c', targetCollectionId: 'c-d', sourceField: 'id', targetField: 'id', cardinality: 'MANY_TO_MANY', description: 'many-to-many link' },
    { id: 'r5', sourceCollectionId: 'c-a', targetCollectionId: 'c-d', sourceField: 'id', targetField: 'id', cardinality: 'INVALID_UNKNOWN', description: 'bogus link' }
  ]
};

const res2 = generateMermaidErDiagram(cardinalityDb);
assert(res2.mermaidCode.includes('TABLEB ||--|| TABLEA'), 'Test 2: ONE_TO_ONE maps to ||--||');
assert(res2.mermaidCode.includes('TABLEC ||--o{ TABLEA'), 'Test 2: ONE_TO_MANY maps to ||--o{');
assert(res2.mermaidCode.includes('TABLEC }o--|| TABLEB'), 'Test 2: MANY_TO_ONE maps to }o--||');
assert(res2.mermaidCode.includes('TABLED }o--o{ TABLEC'), 'Test 2: MANY_TO_MANY maps to }o--o{');
assert.strictEqual(res2.unresolvedLinks.length, 1, 'Test 2: Unsupported cardinality flagged in unresolved links');
assert(res2.unresolvedLinks[0].reason.includes('Unsupported cardinality'), 'Test 2: Clear reason for unsupported cardinality');
console.log('✅ Test 2 PASSED: All 4 cardinalities mapped correctly and unsupported cardinality safely rejected');

// Test 3: Missing Collection and Field References
console.log('\n--- Test 3: Missing Source/Target Collection and Field References ---');
const brokenDb = {
  collections: [
    { id: 'c1', name: 'items', fields: [{ name: '_id', dataType: 'ObjectId' }, { name: 'validField', dataType: 'String' }] },
    { id: 'c2', name: 'stores', fields: [{ name: '_id', dataType: 'ObjectId' }] }
  ],
  relationships: [
    { id: 'r-broken-target', sourceCollectionId: 'c1', targetCollectionId: 'nonexistent-coll', sourceField: 'validField', targetField: '_id', cardinality: 'ONE_TO_ONE' },
    { id: 'r-broken-src-field', sourceCollectionId: 'c1', targetCollectionId: 'c2', sourceField: 'ghostField', targetField: '_id', cardinality: 'ONE_TO_ONE' },
    { id: 'r-broken-tgt-field', sourceCollectionId: 'c1', targetCollectionId: 'c2', sourceField: 'validField', targetField: 'ghostField', cardinality: 'ONE_TO_ONE' }
  ]
};

const res3 = generateMermaidErDiagram(brokenDb);
assert.strictEqual(res3.unresolvedLinks.length, 3, 'Test 3: Exactly 3 broken links detected');
assert(res3.unresolvedLinks.some(u => u.reason.includes('Broken collection reference')), 'Test 3: Missing collection caught');
assert(res3.unresolvedLinks.some(u => u.reason.includes('Missing source field')), 'Test 3: Missing source field caught');
assert(res3.unresolvedLinks.some(u => u.reason.includes('Missing target field')), 'Test 3: Missing target field caught');
assert(!res3.mermaidCode.includes('nonexistent-coll'), 'Test 3: Broken references excluded from diagram');
console.log('✅ Test 3 PASSED: Broken collection and field references detected without crashing');

// Test 4: Duplicate Collection and Relationship IDs
console.log('\n--- Test 4: Duplicate Collection & Relationship IDs ---');
const duplicateDb = {
  collections: [
    { id: 'c-dup', name: 'products', fields: [{ name: '_id', dataType: 'ObjectId' }] },
    { id: 'c-dup', name: 'products', fields: [{ name: '_id', dataType: 'ObjectId' }] },
    { id: 'c-other', name: 'reviews', fields: [{ name: '_id', dataType: 'ObjectId' }] }
  ],
  relationships: [
    { id: 'rel-dup', sourceCollectionId: 'c-dup', targetCollectionId: 'c-other', sourceField: '_id', targetField: '_id', cardinality: 'ONE_TO_MANY', description: 'Reviews' },
    { id: 'rel-dup', sourceCollectionId: 'c-dup', targetCollectionId: 'c-other', sourceField: '_id', targetField: '_id', cardinality: 'ONE_TO_MANY', description: 'Duplicate Reviews' }
  ]
};

const res4 = generateMermaidErDiagram(duplicateDb);
assert(res4.unresolvedLinks.some(u => u.reason.includes('Duplicate collection ID')), 'Test 4: Duplicate collection ID flagged');
assert(res4.unresolvedLinks.some(u => u.reason.includes('Duplicate relationship ID')), 'Test 4: Duplicate relationship ID flagged');
assert(res4.mermaidCode.includes('PRODUCTS {'), 'Test 4: First node rendered');
assert(res4.mermaidCode.includes('PRODUCTS_2 {'), 'Test 4: Colliding node disambiguated with suffix');
console.log('✅ Test 4 PASSED: Duplicate IDs handled deterministically with disambiguated node names');

// Test 5: Embedded Documents Preserved Inside Collection
console.log('\n--- Test 5: Embedded Documents Kept Inside Collection ---');
const embeddedDb = {
  collections: [
    {
      id: 'c-orders',
      name: 'orders',
      fields: [
        { name: '_id', dataType: 'ObjectId', required: true },
        { name: 'shippingAddress', dataType: 'Object', embeddedShape: { street: 'String', city: 'String', zip: 'String' } },
        { name: 'lineItems', dataType: 'Array<Item>', embeddedShape: { sku: 'String', qty: 'Integer' } }
      ]
    }
  ],
  relationships: []
};

const res5 = generateMermaidErDiagram(embeddedDb);
assert(res5.mermaidCode.includes('Object shippingAddress'), 'Test 5: Embedded object field is attribute inside ORDERS');
assert(res5.mermaidCode.includes('Array_Item lineItems'), 'Test 5: Embedded array field is attribute inside ORDERS');
assert(!res5.mermaidCode.includes('SHIPPINGADDRESS {'), 'Test 5: No fake standalone collection created for embedded object');
assert(!res5.mermaidCode.includes('LINEITEMS {'), 'Test 5: No fake standalone collection created for embedded array');
console.log('✅ Test 5 PASSED: Embedded documents remain strictly inside containing collection');

// Test 6: Special Characters and Malicious Injection Safety
console.log('\n--- Test 6: Special Characters & Injection Safety ---');
const maliciousDb = {
  collections: [
    {
      id: 'c-attack',
      name: 'users"; click USERS href "http://malicious.com" //',
      fields: [
        { name: 'field<script>alert(1)</script>', dataType: 'Array<Special & Object>' },
        { name: 'odd:field[name](test)', dataType: 'String//comment' }
      ]
    },
    {
      id: 'c-target',
      name: 'accounts',
      fields: [
        { name: 'accId', dataType: 'ObjectId' }
      ]
    }
  ],
  relationships: [
    {
      id: 'rel-attack',
      sourceCollectionId: 'c-attack',
      targetCollectionId: 'c-target',
      sourceField: 'field_script_alert_1__script_',
      targetField: 'accId',
      cardinality: 'ONE_TO_MANY',
      description: 'click USERS href "javascript:alert(1)" \n\r <script>'
    }
  ]
};

const res6 = generateMermaidErDiagram(maliciousDb);
assert(!res6.mermaidCode.includes('<script>'), 'Test 6: <script> tags completely stripped');
assert(!res6.mermaidCode.includes('javascript:'), 'Test 6: javascript: URI completely stripped');
assert(!res6.mermaidCode.includes('"http:'), 'Test 6: Malicious URL quotes stripped');
assert(!res6.mermaidCode.includes('\n :'), 'Test 6: Newline injection stripped from label');
assert(res6.mermaidCode.includes('USERS_CLICK_USERS_HREF_HTTP_MALICIOUS_COM'), 'Test 6: Collection name safely sanitized');
console.log('✅ Test 6 PASSED: Attempted script tags, click directives, and syntax injections sanitized to inert text');

// Test 7: Empty and Single-Collection Databases
console.log('\n--- Test 7: Empty and Single-Collection Databases ---');
const emptyDb = { collections: [], relationships: [] };
const res7Empty = generateMermaidErDiagram(emptyDb);
assert.strictEqual(res7Empty.hasCollections, false, 'Test 7: Empty db hasCollections is false');
assert(res7Empty.mermaidCode.includes('EMPTY_SCHEMA'), 'Test 7: Empty db has fallback entity');

const singleDb = {
  collections: [
    { id: 'c-single', name: 'logs', fields: [{ name: '_id', dataType: 'ObjectId' }] }
  ],
  relationships: []
};
const res7Single = generateMermaidErDiagram(singleDb);
assert.strictEqual(res7Single.hasCollections, true, 'Test 7: Single db hasCollections is true');
assert(res7Single.mermaidCode.includes('LOGS {'), 'Test 7: Single entity rendered cleanly');
assert.strictEqual(res7Single.unresolvedLinks.length, 0, 'Test 7: No errors on single collection without relationships');
console.log('✅ Test 7 PASSED: Empty and single-collection databases handled gracefully');

console.log('\n====================================================');
console.log('ALL PHASE 6 MERMAID TRANSFORMER TESTS PASSED!');
console.log('====================================================\n');
