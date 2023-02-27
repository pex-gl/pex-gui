import { t as toString$2, j as toString$3 } from './common/vec3-55746b39.js';
import { s as set3 } from './common/avec3-cbc6775b.js';
export { p as plane, r as ray } from './common/ray-7913f86e.js';

/** @module aabb */

/**
 * Creates a new bounding box.
 * @returns {import("./types.js").aabb}
 */
function create() {
  // [min, max]
  return [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
}

/**
 * Reset a bounding box.
 * @param {import("./types.js").aabb} a
 * @returns {import("./types.js").rect}
 */
function empty(a) {
  a[0][0] = Infinity;
  a[0][1] = Infinity;
  a[0][2] = Infinity;
  a[1][0] = -Infinity;
  a[1][1] = -Infinity;
  a[1][2] = -Infinity;
  return a;
}

/**
 * Copies a bounding box.
 * @param {import("./types.js").aabb} a
 * @returns {import("./types.js").aabb}
 */
function copy(a) {
  return [a[0].slice(), a[1].slice()];
}

/**
 * Sets a bounding box to another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */
function set(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[0][2] = b[0][2];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  a[1][2] = b[1][2];
  return a;
}

/**
 * Checks if a bounding box is empty.
 * @param {import("./types.js").aabb} aabb
 * @returns {boolean}
 */
function isEmpty(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}

/**
 * Updates a bounding box from a list of points.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3[] | import("pex-math/types/types").TypedArray} points
 * @returns {import("./types.js").aabb}
 */
function fromPoints(a, points) {
  const isTypedArray = !Array.isArray(points);
  for (let i = 0; i < points.length / (isTypedArray ? 3 : 1); i++) {
    includePoint(a, isTypedArray ? points.slice(i * 3) : points[i]);
  }
  return a;
}

/**
 * Returns a list of 8 points from a bounding box.
 * @param {import("./types.js").aabb} aabb
 * @param {import("pex-math/types/types").vec3[]} [points]
 * @returns {import("pex-math/types/types").vec3[]}
 */
function getCorners(a, points = Array.from({
  length: 8
}, () => [])) {
  set3(points[0], 0, a[0][0], a[0][1], a[0][2]);
  set3(points[1], 0, a[1][0], a[0][1], a[0][2]);
  set3(points[2], 0, a[1][0], a[0][1], a[1][2]);
  set3(points[3], 0, a[0][0], a[0][1], a[1][2]);
  set3(points[4], 0, a[0][0], a[1][1], a[0][2]);
  set3(points[5], 0, a[1][0], a[1][1], a[0][2]);
  set3(points[6], 0, a[1][0], a[1][1], a[1][2]);
  set3(points[7], 0, a[0][0], a[1][1], a[1][2]);
  return points;
}

/**
 * Returns the center of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} out
 * @returns {import("pex-math/types/types").vec3}
 */
function center(a, out = [0, 0, 0]) {
  out[0] = (a[0][0] + a[1][0]) / 2;
  out[1] = (a[0][1] + a[1][1]) / 2;
  out[2] = (a[0][2] + a[1][2]) / 2;
  return out;
}

/**
 * Returns the size of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} out
 * @returns {import("pex-math/types/types").vec3}
 */
function size(a, out = [0, 0, 0]) {
  out[0] = Math.abs(a[1][0] - a[0][0]);
  out[1] = Math.abs(a[1][1] - a[0][1]);
  out[2] = Math.abs(a[1][2] - a[0][2]);
  return out;
}

/**
 * Checks if a point is inside a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} p
 * @returns {boolean}
 */
function containsPoint(a, [x, y, z]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1] && z >= a[0][2] && z <= a[1][2];
}

/**
 * Includes a bounding box in another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */
function includeAABB(a, b) {
  if (isEmpty(a)) {
    set(a, b);
  } else if (isEmpty(b)) ; else {
    a[0][0] = Math.min(a[0][0], b[0][0]);
    a[0][1] = Math.min(a[0][1], b[0][1]);
    a[0][2] = Math.min(a[0][2], b[0][2]);
    a[1][0] = Math.max(a[1][0], b[1][0]);
    a[1][1] = Math.max(a[1][1], b[1][1]);
    a[1][2] = Math.max(a[1][2], b[1][2]);
  }
  return a;
}

/**
 * Includes a point in a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} p
 * @returns {import("pex-math/types/types").vec3}
 */
function includePoint(a, p) {
  a[0][0] = Math.min(a[0][0], p[0]);
  a[0][1] = Math.min(a[0][1], p[1]);
  a[0][2] = Math.min(a[0][2], p[2]);
  a[1][0] = Math.max(a[1][0], p[0]);
  a[1][1] = Math.max(a[1][1], p[1]);
  a[1][2] = Math.max(a[1][2], p[2]);
  return a;
}

/**
 * Prints a bounding box to a string.
 * @param {import("./types.js").aabb} a
 * @param {number} [precision=4]
 * @returns {string}
 */
function toString(a, precision = 4) {
  // prettier-ignore
  return `[${toString$2(a[0], precision)}, ${toString$2(a[1], precision)}]`;
}

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  empty: empty,
  copy: copy,
  set: set,
  isEmpty: isEmpty,
  fromPoints: fromPoints,
  getCorners: getCorners,
  center: center,
  size: size,
  containsPoint: containsPoint,
  includeAABB: includeAABB,
  includePoint: includePoint,
  toString: toString
});

/** @module rect */

/**
 * Creates a new rectangle.
 * @returns {import("./types.js").rect}
 */
function create$1() {
  return [[Infinity, Infinity], [-Infinity, -Infinity]];
}

/**
 * Reset a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {import("./types.js").rect}
 */
function empty$1(a) {
  a[0][0] = a[0][1] = Infinity;
  a[1][0] = a[1][1] = -Infinity;
  return a;
}

/**
 * Copies a rectangle.
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */
function copy$1(a) {
  return [a[0].slice(), a[1].slice()];
}

/**
 * Sets a rectangle to another.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */
function set$1(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  return a;
}

/**
 * Checks if a rectangle is empty.
 * @param {import("./types.js").rect} a
 * @returns {boolean}
 */
function isEmpty$1(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1];
}

/**
 * Updates a rectangle from a list of points.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2[] | import("pex-math/types/types").TypedArray} points
 * @returns {import("./types.js").rect}
 */
function fromPoints$1(a, points) {
  const isTypedArray = !Array.isArray(points);
  for (let i = 0; i < points.length / (isTypedArray ? 2 : 1); i++) {
    includePoint$1(a, isTypedArray ? points.slice(i * 2) : points[i]);
  }
  return a;
}

/**
 * Returns a list of 4 points from a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2[]} points
 * @returns {import("pex-math/types/types").vec2[]}
 */
function getCorners$1(a, points = []) {
  points[0] = a[0].slice();
  points[1] = [a[0][1], a[1][0]];
  points[2] = a[1].slice();
  points[3] = [a[1][0], a[0][1]];
  return points;
}

/**
 * Scales a rectangle.
 * @param {import("./types.js").rect} a
 * @param {number} n
 * @returns {import("./types.js").rect}
 */
function scale(a, n) {
  a[0][0] *= n;
  a[0][1] *= n;
  a[1][0] *= n;
  a[1][1] *= n;
  return a;
}

/**
 * Sets the size of a rectangle using width and height.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} size
 * @returns {import("./types.js").rect}
 */
function setSize(a, size) {
  a[1][0] = a[0][0] + size[0];
  a[1][1] = a[0][1] + size[1];
  return a;
}

/**
 * Returns the size of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} out
 * @returns {import("pex-math/types/types").vec2}
 */
function size$1(a, out = []) {
  out[0] = width(a);
  out[1] = height(a);
  return out;
}

/**
 * Returns the width of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */
function width(a) {
  return a[1][0] - a[0][0];
}

/**
 * Returns the height of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */
function height(a) {
  return a[1][1] - a[0][1];
}

/**
 * Returns the aspect ratio of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */
function aspectRatio(a) {
  return width(a) / height(a);
}

/**
 * Sets the position of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("./types.js").rect}
 */
function setPosition(a, [x, y]) {
  const w = width(a);
  const h = height(a);
  a[0][0] = x;
  a[0][1] = y;
  a[1][0] = x + w;
  a[1][1] = y + h;
  return a;
}

/**
 * Returns the center of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} out
 * @returns {import("./types.js").rect}
 */
function center$1(a, out = []) {
  out[0] = a[0][0] + width(a) * 0.5;
  out[1] = a[0][1] + height(a) * 0.5;
  return out;
}

/**
 * Checks if a point is inside a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {boolean}
 */
function containsPoint$1(a, [x, y]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1];
}

/**
 * Checks if a rectangle is inside another rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {boolean}
 */
function containsRect(a, b) {
  return containsPoint$1(a, b[0]) && containsPoint$1(a, b[1]);
}

/**
 * Includes a point in a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("./types.js").rect}
 */
function includePoint$1(a, [x, y]) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  a[0][0] = minx > x ? x : minx;
  a[0][1] = miny > y ? y : miny;
  a[1][0] = maxx < x ? x : maxx;
  a[1][1] = maxy < y ? y : maxy;
  return a;
}

/**
 * Includes a rectangle in another rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */
function includeRect(a, b) {
  includePoint$1(a, b[0]);
  includePoint$1(a, b[1]);
  return a;
}

/**
 * Maps a point into the dimensions of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("pex-math/types/types").vec2}
 */
function mapPoint(a, p) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  p[0] = Math.max(minx, Math.min(p[0], maxx)) - minx;
  p[1] = Math.max(miny, Math.min(p[1], maxy)) - miny;
  return p;
}

/**
 * Clamps a point into the dimensions of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("pex-math/types/types").vec2}
 */
function clampPoint(a, p) {
  const minx = a[0][0];
  const miny = a[0][1];
  const maxx = a[1][0];
  const maxy = a[1][1];
  p[0] = Math.max(minx, Math.min(p[0], maxx));
  p[1] = Math.max(miny, Math.min(p[1], maxy));
  return p;
}

/**
 * Prints a rect to a string.
 * @param {import("./types.js").rect} a
 * @param {number} [precision=4]
 * @returns {string}
 */
function toString$1(a, precision = 4) {
  // prettier-ignore
  return `[${toString$3(a[0], precision)}, ${toString$3(a[1], precision)}]`;
}

var rect = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$1,
  empty: empty$1,
  copy: copy$1,
  set: set$1,
  isEmpty: isEmpty$1,
  fromPoints: fromPoints$1,
  getCorners: getCorners$1,
  scale: scale,
  setSize: setSize,
  size: size$1,
  width: width,
  height: height,
  aspectRatio: aspectRatio,
  setPosition: setPosition,
  center: center$1,
  containsPoint: containsPoint$1,
  containsRect: containsRect,
  includePoint: includePoint$1,
  includeRect: includeRect,
  mapPoint: mapPoint,
  clampPoint: clampPoint,
  toString: toString$1
});

export { aabb, rect };
