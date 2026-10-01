/**
 * Pure deterministic transformation from blueprint database collections and relationships
 * to valid Mermaid ER diagram syntax (erDiagram).
 *
 * Rules:
 * 1. Safe alphanumeric node names with collision disambiguation.
 * 2. Field types and names sanitized against special characters; embedded documents remain inside collection.
 * 3. Cardinality whitelist: ONE_TO_ONE (||--||), ONE_TO_MANY (||--o{), MANY_TO_ONE (}o--||), MANY_TO_MANY (}o--o{).
 * 4. Missing target or source collections/fields are safely omitted as unresolved edges rather than breaking rendering.
 * 5. Strict escaping prevents injection of Mermaid directives or script execution.
 */
export function generateMermaidErDiagram(database) {
  const collections = database?.collections || [];
  const relationships = database?.relationships || [];
  const unresolved = [];

  if (collections.length === 0) {
    return {
      mermaidCode: 'erDiagram\n    EMPTY_SCHEMA {\n        string message "No collections defined in database design"\n    }',
      unresolvedLinks: [],
      hasCollections: false
    };
  }

  // 1. Detect duplicate collection IDs & build unique node names
  const seenCollectionIds = new Set();
  collections.forEach((c, idx) => {
    if (c.id) {
      if (seenCollectionIds.has(c.id)) {
        unresolved.push({
          id: c.id,
          reason: `Duplicate collection ID detected: '${c.id}' at index ${idx}.`
        });
      }
      seenCollectionIds.add(c.id);
    }
  });

  const usedNodeNames = new Set();
  const idToNode = new Map();
  const nameToNode = new Map();
  const collectionFieldMap = new Map();
  const collectionNodeNames = [];

  collections.forEach((c, idx) => {
    const rawName = c.name || `Collection_${idx}`;
    let safeName = rawName.toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (!safeName || /^[0-9]/.test(safeName)) {
      safeName = `COLL_${safeName}`;
    }
    // Disambiguate colliding node names
    if (usedNodeNames.has(safeName)) {
      safeName = `${safeName}_${idx + 1}`;
    }
    usedNodeNames.add(safeName);
    collectionNodeNames.push(safeName);

    if (c.id && !idToNode.has(c.id)) idToNode.set(c.id, safeName);
    if (c.name && !nameToNode.has(c.name)) nameToNode.set(c.name, safeName);

    // Index field names for cross-reference validation
    const fieldNames = new Set();
    if (Array.isArray(c.fields)) {
      c.fields.forEach((f) => {
        if (f && f.name) fieldNames.add(f.name);
      });
    }
    if (c.id && !collectionFieldMap.has(c.id)) collectionFieldMap.set(c.id, fieldNames);
    if (c.name && !collectionFieldMap.has(c.name)) collectionFieldMap.set(c.name, fieldNames);
  });

  const lines = ['erDiagram'];

  // 2. Entities & Fields (Embedded documents remain strictly inside containing collection)
  collections.forEach((c, idx) => {
    const nodeName = collectionNodeNames[idx];
    lines.push(`    ${nodeName} {`);

    const fields = Array.isArray(c.fields) && c.fields.length > 0 ? c.fields : [
      { name: 'id', dataType: 'ObjectId', required: true, unique: true }
    ];

    fields.slice(0, 15).forEach((f) => {
      // Strip brackets, special characters, and newlines from data type
      let typeStr = (f.dataType || 'String')
        .replace(/<[^>]+>/g, (m) => '_' + m.replace(/[^a-zA-Z0-9]/g, ''))
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      if (!typeStr) typeStr = 'String';

      let nameStr = (f.name || 'field')
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_');
      if (nameStr === '_id') nameStr = 'id';
      if (!nameStr) nameStr = 'field';

      let constraint = '';
      if (f.name === '_id' || f.name === 'id') {
        constraint = 'PK';
      } else if (f.unique) {
        constraint = 'UK';
      }

      if (constraint) {
        lines.push(`        ${typeStr} ${nameStr} ${constraint}`);
      } else {
        lines.push(`        ${typeStr} ${nameStr}`);
      }
    });

    lines.push('    }');
  });

  // 3. Relationships & Edge Allowlisting
  const seenRelIds = new Set();
  const CARDINALITY_MAP = {
    'ONE_TO_ONE': '||--||',
    'ONE_TO_MANY': '||--o{',
    'MANY_TO_ONE': '}o--||',
    'MANY_TO_MANY': '}o--o{'
  };

  relationships.forEach((rel) => {
    // Check duplicate relationship IDs
    if (rel.id) {
      if (seenRelIds.has(rel.id)) {
        unresolved.push({
          id: rel.id,
          reason: `Duplicate relationship ID detected: '${rel.id}'. Skipping duplicate edge.`
        });
        return;
      }
      seenRelIds.add(rel.id);
    }

    const sourceNode = idToNode.get(rel.sourceCollectionId) || nameToNode.get(rel.sourceCollectionId);
    const targetNode = idToNode.get(rel.targetCollectionId) || nameToNode.get(rel.targetCollectionId);

    // Check missing collection references
    if (!sourceNode || !targetNode) {
      unresolved.push({
        id: rel.id,
        source: rel.sourceCollectionId,
        target: rel.targetCollectionId,
        reason: `Broken collection reference: source="${rel.sourceCollectionId}", target="${rel.targetCollectionId}"`
      });
      return;
    }

    // Check missing field references where fields are defined
    const sourceFields = collectionFieldMap.get(rel.sourceCollectionId);
    if (sourceFields && sourceFields.size > 0 && rel.sourceField && !sourceFields.has(rel.sourceField)) {
      unresolved.push({
        id: rel.id,
        source: rel.sourceCollectionId,
        target: rel.targetCollectionId,
        reason: `Missing source field: collection '${rel.sourceCollectionId}' does not have field '${rel.sourceField}'`
      });
      return;
    }

    const targetFields = collectionFieldMap.get(rel.targetCollectionId);
    if (targetFields && targetFields.size > 0 && rel.targetField && !targetFields.has(rel.targetField)) {
      unresolved.push({
        id: rel.id,
        source: rel.sourceCollectionId,
        target: rel.targetCollectionId,
        reason: `Missing target field: collection '${rel.targetCollectionId}' does not have field '${rel.targetField}'`
      });
      return;
    }

    // Cardinality allowlist
    const cardSymbol = CARDINALITY_MAP[rel.cardinality];
    if (!cardSymbol) {
      unresolved.push({
        id: rel.id,
        source: rel.sourceCollectionId,
        target: rel.targetCollectionId,
        reason: `Unsupported cardinality: '${rel.cardinality}'. Allowed: ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY.`
      });
      return;
    }

    // Label sanitization: strip quotes, newlines, brackets, directives, and special characters
    let rawDesc = rel.description || rel.sourceField || 'references';
    let label = rawDesc
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[^a-zA-Z0-9_ -]/g, '')
      .replace(/\b(click|callback|script)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (label.length > 25) {
      label = label.substring(0, 22) + '...';
    }
    if (!label) label = 'references';

    lines.push(`    ${targetNode} ${cardSymbol} ${sourceNode} : "${label}"`);
  });

  return {
    mermaidCode: lines.join('\n'),
    unresolvedLinks: unresolved,
    hasCollections: true
  };
}
