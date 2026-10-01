/**
 * Entity Resolvers Utility
 *
 * Provides human-friendly name resolution for entity IDs in IdeaStruct AI.
 * Translates role IDs, feature IDs, screen IDs, and phase IDs into human-readable titles.
 * Translates relationship cardinalities into clear, plain-language sentences.
 */

/**
 * Resolves a role ID to its friendly role name.
 */
export function resolveRoleName(roleId, roles = []) {
  if (!roleId || typeof roleId !== 'string') return '';
  const list = Array.isArray(roles) ? roles.filter(Boolean) : [];
  const match = list.find((r) => r && r.id === roleId);
  return match?.name || roleId;
}

/**
 * Resolves an array of role IDs to an array of friendly role names.
 */
export function resolveRoleNames(roleIds = [], roles = []) {
  if (!roleIds) return [];
  const ids = Array.isArray(roleIds) ? roleIds : (typeof roleIds === 'string' ? [roleIds] : []);
  if (!ids.length) return [];
  return ids.map((id) => resolveRoleName(id, roles)).filter(Boolean);
}

/**
 * Resolves a feature ID to its friendly feature name.
 */
export function resolveFeatureName(featureId, features = []) {
  if (!featureId || typeof featureId !== 'string') return '';
  const list = Array.isArray(features) ? features.filter(Boolean) : [];
  const match = list.find((f) => f && f.id === featureId);
  return match?.name || featureId;
}

/**
 * Resolves an array of feature IDs to an array of friendly feature names.
 */
export function resolveFeatureNames(featureIds = [], features = []) {
  if (!featureIds) return [];
  const ids = Array.isArray(featureIds) ? featureIds : (typeof featureIds === 'string' ? [featureIds] : []);
  if (!ids.length) return [];
  return ids.map((id) => resolveFeatureName(id, features)).filter(Boolean);
}

/**
 * Resolves a screen ID to its friendly screen name.
 */
export function resolveScreenName(screenId, screens = []) {
  if (!screenId || typeof screenId !== 'string') return '';
  const list = Array.isArray(screens) ? screens.filter(Boolean) : [];
  const match = list.find((s) => s && s.id === screenId);
  return match?.name || screenId;
}

/**
 * Resolves an array of screen IDs to an array of friendly screen names.
 */
export function resolveScreenNames(screenIds = [], screens = []) {
  if (!screenIds) return [];
  const ids = Array.isArray(screenIds) ? screenIds : (typeof screenIds === 'string' ? [screenIds] : []);
  if (!ids.length) return [];
  return ids.map((id) => resolveScreenName(id, screens)).filter(Boolean);
}

/**
 * Resolves a roadmap phase ID to its phase title.
 */
export function resolvePhaseTitle(phaseId, phases = []) {
  if (!phaseId || typeof phaseId !== 'string') return '';
  const list = Array.isArray(phases) ? phases.filter(Boolean) : [];
  const match = list.find((p) => p && p.id === phaseId);
  if (!match) return phaseId;
  const rawTitle = match.title ?? match.phase ?? match.name ?? phaseId;
  if (typeof rawTitle === 'string') return rawTitle;
  if (typeof rawTitle === 'object' && rawTitle !== null) {
    return rawTitle.title || rawTitle.name || rawTitle.phase || phaseId;
  }
  return String(rawTitle);
}

/**
 * Resolves an array of phase IDs to friendly phase titles.
 */
export function resolvePhaseTitles(phaseIds = [], phases = []) {
  if (!phaseIds) return [];
  const ids = Array.isArray(phaseIds) ? phaseIds : (typeof phaseIds === 'string' ? [phaseIds] : []);
  if (!ids.length) return [];
  return ids.map((id) => resolvePhaseTitle(id, phases)).filter(Boolean);
}

/**
 * Translates a relationship cardinality into a human-friendly sentence.
 * E.g. "One Event can have many Registrations."
 */
export function formatCardinalitySentence(sourceColl = '', targetColl = '', cardinality = '') {
  const cleanSource = sourceColl.replace(/^col-/, '') || 'record';
  const cleanTarget = targetColl.replace(/^col-/, '') || 'record';

  const singSource = cleanSource.replace(/s$/, '') || cleanSource;
  const plurSource = cleanSource.endsWith('s') ? cleanSource : `${cleanSource}s`;
  const singTarget = cleanTarget.replace(/s$/, '') || cleanTarget;
  const plurTarget = cleanTarget.endsWith('s') ? cleanTarget : `${cleanTarget}s`;

  const capSingSource = singSource.charAt(0).toUpperCase() + singSource.slice(1);
  const capPlurSource = plurSource.charAt(0).toUpperCase() + plurSource.slice(1);
  const capSingTarget = singTarget.charAt(0).toUpperCase() + singTarget.slice(1);
  const capPlurTarget = plurTarget.charAt(0).toUpperCase() + plurTarget.slice(1);

  switch (cardinality) {
    case 'ONE_TO_ONE':
      return `One ${capSingSource} is linked to exactly one ${capSingTarget}.`;
    case 'ONE_TO_MANY':
      return `One ${capSingSource} can have many ${capPlurTarget}.`;
    case 'MANY_TO_ONE':
      return `Many ${capPlurSource} belong to one ${capSingTarget}.`;
    case 'MANY_TO_MANY':
      return `Multiple ${capPlurSource} can connect to multiple ${capPlurTarget}.`;
    default:
      return `${capSingSource} references ${capSingTarget}.`;
  }
}
