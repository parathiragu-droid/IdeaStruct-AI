// scripts/verification/verify_phase6_diagram.js
// Verification of Phase 6 Deterministic MongoDB Data Relationship Diagram

const http = require('http');
const { generateMermaidErDiagram } = require('../../frontend/src/utils/mermaidTransformer.js');

const API_BASE = 'http://localhost:8080/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          if (body) json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('PHASE 6: DETERMINISTIC MONGODB RELATIONSHIP DIAGRAM VERIFICATION');
  console.log('================================================================\n');

  let disposableId = null;

  try {
    // 1. CREATE DISPOSABLE PROJECT
    console.log('Step 1: Creating disposable test project for Phase 6...');
    const createRes = await request('/projects', {
      method: 'POST',
      body: {
        title: 'Phase 6 Diagram Verification Project',
        idea: 'An enterprise fleet telemetry and dispatch management platform designed to test deterministic Mermaid diagram generation, database edit synchronization, and broken reference resilience.'
      }
    });

    if (createRes.status !== 201) {
      throw new Error(`Failed to create project: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }

    disposableId = createRes.data.id;
    console.log(`✅ Created test project with ID: ${disposableId}, Revision: ${createRes.data.revision}`);

    // 2. GENERATE DEMO BLUEPRINT
    console.log('\nStep 2: Generating initial blueprint...');
    const genRes = await request(`/projects/${disposableId}/generate`, {
      method: 'POST',
      body: {
        expectedRevision: 1,
        mode: 'DEMO'
      }
    });

    if (genRes.status !== 200) {
      throw new Error(`Failed to generate demo blueprint: ${genRes.status}`);
    }
    const initialProject = genRes.data;
    console.log(`✅ Blueprint generated. Revision: ${initialProject.revision}`);

    // 3. VERIFY INITIAL DIAGRAM TRANSFORMATION FROM SAVED BLUEPRINT
    console.log('\nStep 3: Generating deterministic Mermaid diagram from saved blueprint...');
    const initialDb = initialProject.blueprint.database;
    const initialDiagram = generateMermaidErDiagram(initialDb);

    console.log(`   Collections in blueprint: ${initialDb.collections.length}`);
    console.log(`   Relationships in blueprint: ${initialDb.relationships.length}`);
    console.log(`   Mermaid syntax generated: ${initialDiagram.mermaidCode.split('\n').length} lines`);

    if (!initialDiagram.hasCollections) {
      throw new Error('Expected initialDiagram.hasCollections to be true');
    }
    if (!initialDiagram.mermaidCode.startsWith('erDiagram')) {
      throw new Error('Mermaid syntax does not start with erDiagram header');
    }
    console.log('✅ Initial diagram generated deterministically from saved blueprint.database');

    // 4. VERIFY NO SEPARATE PERSISTED DIAGRAM FIELD
    console.log('\nStep 4: Verifying single source of truth (no separate diagram field in MongoDB document)...');
    if (initialProject.diagram || initialProject.mermaidDiagram || initialProject.erDiagram) {
      throw new Error('Found redundant/stale diagram field directly persisted in project document!');
    }
    console.log('✅ Single source of truth confirmed: diagram is strictly computed on-the-fly from database collections & relationships');

    // 5. DATABASE EDIT SYNCHRONIZATION
    console.log('\nStep 5: Editing database section (adding "telematics" collection & relationship)...');
    const updatedBp = JSON.parse(JSON.stringify(initialProject.blueprint));

    // Add new collection
    const newCollection = {
      id: 'collection-telematics',
      name: 'telematics',
      description: 'Vehicle GPS and engine sensor telemetry stream',
      featureIds: ['feature-core-tracking'],
      fields: [
        { name: 'id', dataType: 'ObjectId', required: true, unique: true, description: 'Telemetry log ID' },
        { name: 'vehicleId', dataType: 'String', required: true, unique: false, description: 'Identifier of tracked vehicle' },
        { name: 'speedMph', dataType: 'Double', required: true, unique: false, description: 'Speed in mph' },
        { name: 'gpsCoords', dataType: 'Object', required: true, unique: false, description: 'Latitude and Longitude coordinates', embeddedShape: { lat: 'Double', lng: 'Double' } }
      ],
      indexes: ['vehicleId_1_timestamp_-1']
    };
    updatedBp.database.collections.push(newCollection);

    // Add new relationship
    const firstCollectionId = updatedBp.database.collections[0].id;
    const firstCollectionPk = updatedBp.database.collections[0].fields[0].name;
    const newRelationship = {
      id: 'rel-telematics-link',
      sourceCollectionId: 'collection-telematics',
      targetCollectionId: firstCollectionId,
      sourceField: 'vehicleId',
      targetField: firstCollectionPk,
      cardinality: 'MANY_TO_ONE',
      description: 'Telemetry log linked to fleet vehicle'
    };
    updatedBp.database.relationships.push(newRelationship);

    // Save updated blueprint to MongoDB
    const saveRes = await request(`/projects/${disposableId}/blueprint`, {
      method: 'PUT',
      headers: { 'If-Match': '2' },
      body: {
        blueprint: updatedBp,
        expectedRevision: 2
      }
    });

    if (saveRes.status !== 200) {
      throw new Error(`Failed to save updated blueprint: ${saveRes.status} ${JSON.stringify(saveRes.data)}`);
    }
    console.log(`✅ Saved blueprint with added collection. New revision: ${saveRes.data.revision}`);

    // 6. RELOAD FROM MONGODB & VERIFY DIAGRAM SYNCHRONIZATION
    console.log('\nStep 6: Reopening project from MongoDB and confirming diagram reflects updated blueprint...');
    const reloadRes = await request(`/projects/${disposableId}`);
    if (reloadRes.status !== 200) {
      throw new Error(`Failed to reload project: ${reloadRes.status}`);
    }

    const reloadedDb = reloadRes.data.blueprint.database;
    const reloadedDiagram = generateMermaidErDiagram(reloadedDb);

    if (!reloadedDiagram.mermaidCode.includes('TELEMATICS {')) {
      throw new Error('Expected updated diagram to include new node TELEMATICS');
    }
    if (!reloadedDiagram.mermaidCode.includes('Double speedMph')) {
      throw new Error('Expected updated diagram to include field speedMph');
    }
    if (!reloadedDiagram.mermaidCode.includes('}o--|| TELEMATICS')) {
      throw new Error('Expected updated diagram to include MANY_TO_ONE relationship edge }o--||');
    }
    console.log('✅ Diagram synchronization confirmed: reloading project reflects new collection and relationship immediately');

    // 7. BROKEN REFERENCE RESILIENCE TEST
    console.log('\nStep 7: Testing diagram resilience against broken collection & field references...');
    const brokenDb = JSON.parse(JSON.stringify(reloadedDb));
    brokenDb.relationships.push({
      id: 'rel-ghost-collection',
      sourceCollectionId: 'collection-telematics',
      targetCollectionId: 'collection-nonexistent-ghost',
      sourceField: 'vehicleId',
      targetField: 'id',
      cardinality: 'ONE_TO_ONE',
      description: 'Broken link to ghost collection'
    });
    brokenDb.relationships.push({
      id: 'rel-ghost-field',
      sourceCollectionId: 'collection-telematics',
      targetCollectionId: firstCollectionId,
      sourceField: 'nonexistentField',
      targetField: firstCollectionPk,
      cardinality: 'ONE_TO_ONE',
      description: 'Broken link with ghost source field'
    });

    const brokenDiagram = generateMermaidErDiagram(brokenDb);
    console.log(`   Broken relationships injected: 2`);
    console.log(`   Unresolved links reported: ${brokenDiagram.unresolvedLinks.length}`);

    if (brokenDiagram.unresolvedLinks.length !== 2) {
      throw new Error(`Expected exactly 2 unresolved links, got: ${brokenDiagram.unresolvedLinks.length}`);
    }
    if (brokenDiagram.mermaidCode.includes('nonexistent-ghost')) {
      throw new Error('Broken relationship target collection was improperly included in diagram syntax!');
    }
    console.log('✅ Broken references safely omitted from diagram syntax and reported in unresolvedLinks without crashing');

    console.log('\n================================================================');
    console.log('ALL PHASE 6 REAL BACKEND & MONGODB CHECKS PASSED!');
    console.log('================================================================\n');

  } finally {
    // 8. CLEANUP
    if (disposableId) {
      console.log(`Step 8: Cleaning up disposable test project (${disposableId})...`);
      try {
        const delRes = await request(`/projects/${disposableId}`, { method: 'DELETE' });
        console.log(`✅ Cleanup completed with status: ${delRes.status}`);
      } catch (err) {
        console.error('Warning: Failed to delete test project:', err.message);
      }
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ PHASE 6 VERIFICATION FAILURE:', err.message);
  process.exit(1);
});
