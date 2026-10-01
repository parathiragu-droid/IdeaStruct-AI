/**
 * Beginner-Friendly UI Terminology Mapping
 *
 * Translates technical architecture terms into beginner-accessible language
 * for display only. Does NOT mutate backend keys or canonical blueprint data.
 */

export const TERMINOLOGY_MAP = {
  // Core Sections & Concepts
  blueprint: {
    display: 'Project Plan',
    technical: 'Blueprint',
    explanation: 'A structured software or hardware plan describing what your application or device needs before building starts.',
  },
  overview: {
    display: 'Project Summary',
    technical: 'Overview',
    explanation: 'Understand what the software or hardware is supposed to solve, target users, and key problem statement.',
  },
  features: {
    display: 'Main Features',
    technical: 'Feature Modules',
    explanation: 'See the important functions your application or hardware needs.',
  },
  roles: {
    display: 'Users & Roles',
    technical: 'Roles',
    explanation: 'Who interacts with this application or hardware system and what permissions they have.',
  },
  requirements: {
    display: 'Detailed Requirements',
    technical: 'Requirements',
    explanation: 'Specific rules and acceptance criteria the software or hardware must satisfy.',
  },
  database: {
    display: 'Data Structure',
    technical: 'Database Collections',
    explanation: 'What kinds of records, telemetry, and information the application stores.',
  },
  apis: {
    display: 'Backend APIs',
    technical: 'REST APIs',
    explanation: 'How different parts of the software, cloud, and embedded devices communicate with each other.',
  },
  uiScreens: {
    display: 'App Screens',
    technical: 'UI Screens',
    explanation: 'Visual screens users navigate through while using the application.',
  },
  roadmap: {
    display: 'Build Roadmap',
    technical: 'Roadmap Phases',
    explanation: 'Step-by-step milestones ordered by what must be built first.',
  },
  diagram: {
    display: 'Data Map',
    technical: 'ER Diagram',
    explanation: 'A visual diagram showing how different types of data relate to one another.',
  },
  validation: {
    display: 'Plan Check',
    technical: 'Deterministic Validation',
    explanation: 'Automatic checks verifying that screens, APIs, data, and requirements connect cleanly.',
  },
  assumptions: {
    display: 'Assumptions',
    technical: 'Assumptions',
    explanation: 'Beliefs or working assumptions about technology or users taken during planning.',
  },
  openQuestions: {
    display: 'Things to Clarify',
    technical: 'Open Questions',
    explanation: 'Design decisions or business questions that need confirmation from project owners.',
  },

  // Technical Metadata & System Terms
  canonicalSchema: {
    display: 'Technical Data Format',
    technical: 'Canonical Schema',
    explanation: 'The standardized structure storing all 11 parts of your project plan.',
  },
  schemaVersion: {
    display: 'Schema Version',
    technical: 'schemaVersion',
    explanation: 'The blueprint format specification version.',
  },
  revision: {
    display: 'Project Version',
    technical: 'Revision',
    explanation: 'A counter that updates every time this project plan is saved or regenerated.',
  },
  optimisticConcurrency: {
    display: 'Edit Conflict Protection',
    technical: 'Optimistic Concurrency',
    explanation: 'Guards against overwriting newer changes if two people edit at the same time.',
  },
  ruleCode: {
    display: 'Technical Rule',
    technical: 'Rule Code',
    explanation: 'The identifier for the architecture rule checked by the validation engine.',
  },
  traceEvidence: {
    display: 'Why This Was Flagged',
    technical: 'Trace Evidence',
    explanation: 'The specific entity IDs and connections that caused this check to trigger.',
  },
  suggestedAction: {
    display: 'How to Fix This',
    technical: 'Suggested Action',
    explanation: 'Recommended modification to resolve the discrepancy in your plan.',
  },

  // Entity Mapping Attributes
  roleIds: {
    display: 'Linked Roles',
    technical: 'roleIds',
    explanation: 'Which user types have access to this screen, API, or feature.',
  },
  featureIds: {
    display: 'Linked Features',
    technical: 'featureIds',
    explanation: 'Which features this screen, API, or requirement belongs to.',
  },
  needsApi: {
    display: 'Needs Backend API',
    technical: 'needsApi',
    explanation: 'Whether this feature requires a backend server endpoint.',
  },
  needsUi: {
    display: 'Needs User Interface',
    technical: 'needsUi',
    explanation: 'Whether users interact with this feature through a visual screen.',
  },
  needsPersistence: {
    display: 'Needs Database Storage',
    technical: 'needsPersistence',
    explanation: 'Whether this feature saves information permanently in the database.',
  },
  interactive: {
    display: 'Interactive User',
    technical: 'interactive: true',
    explanation: 'A human user interacting through a browser or app, rather than a background service.',
  },
  unresolvedLinks: {
    display: 'Unconnected Items',
    technical: 'unresolvedLinks',
    explanation: 'Items that reference other data records that do not exist yet.',
  },
};

/**
 * Returns a beginner-friendly display label for a technical key.
 * If no mapping exists, returns the key formatted cleanly.
 */
export function getDisplayLabel(key) {
  if (!key) return '';
  const item = TERMINOLOGY_MAP[key];
  if (item && item.display) return item.display;

  // Fallback: convert camelCase or snake_case to readable words
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/**
 * Returns the formal technical label for a key.
 */
export function getTechnicalLabel(key) {
  if (!key) return '';
  const item = TERMINOLOGY_MAP[key];
  if (item && item.technical) return item.technical;
  return key;
}

/**
 * Returns a short beginner-friendly explanation of what the term means.
 */
export function getTermExplanation(key) {
  if (!key) return '';
  const item = TERMINOLOGY_MAP[key];
  return item?.explanation || '';
}
