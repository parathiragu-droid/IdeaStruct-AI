/**
 * Roadmap Normalization Utility
 *
 * Provides a robust, single-source-of-truth normalization layer for project roadmaps.
 * Handles variations across Software, Hardware, and Hybrid projects:
 * - Format A: Array of phase objects ({ id, title/phase, duration, tasks, completionCriteria })
 * - Format B: Object with phases array ({ phases: [...] })
 * - Format C: Object with milestones array ({ milestones: [...] })
 * - Format D: Array of strings (["Planning", "Development", "Testing"])
 * - Format E: null, undefined, empty object, or missing roadmap
 *
 * Guarantees that:
 * 1. Output is always an array of NormalizedPhase objects.
 * 2. completionCriteria is ALWAYS an array of strings (never a raw string or undefined).
 * 3. tasks is ALWAYS an array of strings (handles string tasks, object tasks, or single strings).
 * 4. Raw objects are NEVER exposed where React child strings are expected.
 * 5. dependsOnPhaseIds and featureIds are ALWAYS arrays of string identifiers.
 */

/**
 * Safely extracts a non-object string representation from any value.
 * Prevents `[object Object]` or React child rendering crashes.
 */
export function safeString(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // Attempt to extract known text/name properties
    const candidate =
      val.title ||
      val.name ||
      val.label ||
      val.description ||
      val.text ||
      val.criteria ||
      val.summary ||
      val.task ||
      val.phase;
    if (typeof candidate === 'string') return candidate.trim();
    if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
    return fallback;
  }
  return fallback;
}

/**
 * Safely normalizes any value into a flat array of clean, non-empty strings.
 * Handles single strings, arrays of strings, arrays of objects, and comma/newline separated text.
 */
export function safeStringList(val) {
  if (val === null || val === undefined) return [];

  // Single string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    // If multiline with bullets/newlines, split cleanly
    if (trimmed.includes('\n')) {
      return trimmed
        .split('\n')
        .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter(Boolean);
    }
    return [trimmed];
  }

  // Array of items
  if (Array.isArray(val)) {
    const result = [];
    for (const item of val) {
      if (item === null || item === undefined) continue;
      if (typeof item === 'string') {
        const s = item.trim();
        if (s) result.push(s);
      } else if (typeof item === 'number' || typeof item === 'boolean') {
        result.push(String(item));
      } else if (typeof item === 'object') {
        const text = safeString(item);
        if (text) result.push(text);
      }
    }
    return result;
  }

  // Object with values (e.g. { "0": "task1", "1": "task2" })
  if (typeof val === 'object') {
    return Object.values(val)
      .map((v) => safeString(v))
      .filter(Boolean);
  }

  return [];
}

/**
 * Safely normalizes an ID collection into an array of string IDs.
 */
export function safeIdList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') return safeString(item.id || item.phaseId || item.featureId);
        return '';
      })
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

/**
 * Central normalization function for any roadmap payload.
 *
 * @param {any} rawRoadmap - The blueprint.roadmap payload or blueprint itself
 * @returns {Array<NormalizedPhase>} Array of safe, normalized phase objects
 */
export function normalizeRoadmap(rawRoadmap) {
  if (!rawRoadmap) return [];

  let candidates = [];

  if (Array.isArray(rawRoadmap)) {
    candidates = rawRoadmap;
  } else if (typeof rawRoadmap === 'object') {
    // Check if rawRoadmap is the full blueprint passed accidentally
    if (rawRoadmap.roadmap) {
      return normalizeRoadmap(rawRoadmap.roadmap);
    }

    if (Array.isArray(rawRoadmap.phases)) {
      candidates = rawRoadmap.phases;
    } else if (Array.isArray(rawRoadmap.milestones)) {
      candidates = rawRoadmap.milestones;
    } else if (Array.isArray(rawRoadmap.steps)) {
      candidates = rawRoadmap.steps;
    } else if (Array.isArray(rawRoadmap.stages)) {
      candidates = rawRoadmap.stages;
    } else if (rawRoadmap.title || rawRoadmap.phase || rawRoadmap.name || rawRoadmap.id) {
      // Single phase object not wrapped in array
      candidates = [rawRoadmap];
    } else {
      return [];
    }
  } else if (typeof rawRoadmap === 'string') {
    candidates = safeStringList(rawRoadmap);
  } else {
    return [];
  }

  return candidates
    .filter((item) => item !== null && item !== undefined)
    .map((item, idx) => {
      const phaseNum = idx + 1;

      // Handle simple string entries: ["Planning", "Development", ...]
      if (typeof item === 'string') {
        const titleText = item.trim() || `Phase ${phaseNum}`;
        return {
          id: `phase-${phaseNum}`,
          phaseNumber: phaseNum,
          title: titleText,
          description: '',
          duration: null,
          featureIds: [],
          dependsOnPhaseIds: [],
          tasks: [],
          completionCriteria: [],
          milestones: [],
          raw: { title: titleText },
        };
      }

      // Handle object entries
      const id =
        safeString(item.id) ||
        safeString(item.phaseId) ||
        safeString(item.key) ||
        `phase-${phaseNum}`;

      const rawTitle =
        safeString(item.title) ||
        safeString(item.phase) ||
        safeString(item.name) ||
        safeString(item.stage) ||
        `Phase ${phaseNum}`;

      const description =
        safeString(item.description) ||
        safeString(item.summary) ||
        safeString(item.details) ||
        '';

      const duration =
        safeString(item.duration) ||
        safeString(item.weeks ? `${item.weeks} weeks` : null) ||
        safeString(item.timeline) ||
        safeString(item.timeframe) ||
        null;

      const featureIds = safeIdList(item.featureIds || item.features);
      const dependsOnPhaseIds = safeIdList(
        item.dependsOnPhaseIds || item.dependencies || item.dependsOn || item.prerequisites
      );

      const tasks = safeStringList(item.tasks || item.activities || item.actionItems || item.todos);
      const completionCriteria = safeStringList(
        item.completionCriteria ||
          item.criteria ||
          item.acceptanceCriteria ||
          item.deliverables ||
          item.definitionOfDone
      );
      const milestones = safeStringList(item.milestones || item.deliverables);

      return {
        id,
        phaseNumber: phaseNum,
        title: rawTitle,
        description,
        duration,
        featureIds,
        dependsOnPhaseIds,
        tasks,
        completionCriteria,
        milestones,
        raw: item,
      };
    });
}
