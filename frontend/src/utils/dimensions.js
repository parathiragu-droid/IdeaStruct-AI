/**
 * Utility functions for safely parsing and formatting 3D dimensions, vectors, and sizes.
 * Supports arrays ([x, y, z]), objects ({ width, height, depth } or { length, width, height } or { x, y, z }),
 * strings ("100mm x 70mm x 40mm", "100x70x40", "100, 70, 40"), and null/undefined fallbacks.
 */

/**
 * Safely parses any 3D dimensions input into a 3-element numeric array [width, height, depth].
 *
 * @param {any} dims - Raw input (array, object, string, number, null)
 * @param {number[]} defaultDims - Fallback array [w, h, d]
 * @returns {[number, number, number]}
 */
export function parseDimensions3D(dims, defaultDims = [50, 20, 50]) {
  if (!dims) return [...defaultDims];

  // 1. Array format: [w, h, d] or [x, y, z] or [l, w, h]
  if (Array.isArray(dims)) {
    const w = Number(dims[0]);
    const h = Number(dims[1]);
    const d = Number(dims[2]);
    return [
      !isNaN(w) && w > 0 ? w : defaultDims[0],
      !isNaN(h) && h > 0 ? h : defaultDims[1],
      !isNaN(d) && d > 0 ? d : defaultDims[2],
    ];
  }

  // 2. Object format: { width, height, depth } or { length, width, height } or { x, y, z }
  if (typeof dims === 'object') {
    const rawW = dims.width ?? dims.w ?? dims.y ?? defaultDims[0];
    const rawH = dims.height ?? dims.h ?? dims.z ?? defaultDims[1];
    const rawD = dims.depth ?? dims.d ?? dims.length ?? dims.l ?? dims.x ?? defaultDims[2];

    const w = Number(rawW);
    const h = Number(rawH);
    const d = Number(rawD);

    return [
      !isNaN(w) && w > 0 ? w : defaultDims[0],
      !isNaN(h) && h > 0 ? h : defaultDims[1],
      !isNaN(d) && d > 0 ? d : defaultDims[2],
    ];
  }

  // 3. String format: "100mm x 70mm x 40mm", "100, 70, 40", "100x70x40"
  if (typeof dims === 'string') {
    const numbers = dims.match(/[-+]?\d*\.?\d+/g);
    if (numbers && numbers.length >= 3) {
      const w = Number(numbers[0]);
      const h = Number(numbers[1]);
      const d = Number(numbers[2]);
      return [
        !isNaN(w) && w > 0 ? w : defaultDims[0],
        !isNaN(h) && h > 0 ? h : defaultDims[1],
        !isNaN(d) && d > 0 ? d : defaultDims[2],
      ];
    }
  }

  return [...defaultDims];
}

/**
 * Safely parses any 3D vector (position, rotation) into a 3-element numeric array [x, y, z].
 *
 * @param {any} vec - Raw input (array, object, null)
 * @param {number[]} defaultVec - Fallback array [x, y, z]
 * @returns {[number, number, number]}
 */
export function parseVector3D(vec, defaultVec = [0, 0, 0]) {
  if (!vec) return [...defaultVec];

  if (Array.isArray(vec)) {
    const x = Number(vec[0]);
    const y = Number(vec[1]);
    const z = Number(vec[2]);
    return [
      !isNaN(x) ? x : defaultVec[0],
      !isNaN(y) ? y : defaultVec[1],
      !isNaN(z) ? z : defaultVec[2],
    ];
  }

  if (typeof vec === 'object') {
    const x = Number(vec.x ?? defaultVec[0]);
    const y = Number(vec.y ?? defaultVec[1]);
    const z = Number(vec.z ?? defaultVec[2]);
    return [
      !isNaN(x) ? x : defaultVec[0],
      !isNaN(y) ? y : defaultVec[1],
      !isNaN(z) ? z : defaultVec[2],
    ];
  }

  return [...defaultVec];
}

/**
 * Safely formats any dimensions representation into a clean human-readable string.
 * Prevents "Objects are not valid as a React child" crashes.
 *
 * @param {any} dims
 * @returns {string} e.g. "120 × 80 × 45 mm"
 */
export function formatDimensions(dims) {
  if (!dims) return 'N/A';
  if (typeof dims === 'string') return dims;
  if (Array.isArray(dims)) {
    return `${dims.join(' × ')} mm`;
  }
  if (typeof dims === 'object') {
    const l = dims.length ?? dims.l ?? dims.depth ?? dims.d ?? dims.x ?? '';
    const w = dims.width ?? dims.w ?? dims.y ?? '';
    const h = dims.height ?? dims.h ?? dims.z ?? '';
    if (l && w && h) {
      return `${l} × ${w} × ${h} mm`;
    }
    const values = Object.values(dims).filter((v) => typeof v === 'number' || typeof v === 'string');
    return values.length > 0 ? `${values.join(' × ')} mm` : 'Custom Dimensions';
  }
  return String(dims);
}
