import { e as set$2, s as sub, n as normalize, h as dot, g as create$3 } from './common/vec3-49e7f9a4.js';
import { h as hitTestPlane } from './common/ray-8673e8ad.js';
export { r as ray } from './common/ray-8673e8ad.js';
import './common/web.dom-collections.iterator-70010183.js';
import './common/set-to-string-tag-9ca80194.js';

/**
 * @module aabb
 */

/**
 * @typedef {number[][]} aabb An axis-aligned bounding box defined by two min and max 3D points.
 */

/**
 * Creates a new bounding box.
 * @returns {aabb}
 */
function create() {
  // [min, max]
  return [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
}
/**
 * Reset a bounding box.
 * @param {aabb} a
 * @returns {rect}
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
 * @param {aabb} a
 * @returns {aabb}
 */

function copy(a) {
  return [a[0].slice(), a[1].slice()];
}
/**
 * Sets a bounding box to another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
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
 * @param {aabb} aabb
 * @returns {boolean}
 */

function isEmpty(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}
/**
 * Creates a bounding box from a list of points.
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function fromPoints(points) {
  return setPoints(create(), points);
}
/**
 * Updates a bounding box from a list of points.
 * @param {aabb} a
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function setPoints(a, points) {
  for (let i = 0; i < points.length; i++) {
    includePoint(a, points[i]);
  }

  return a;
}
/**
 * @private
 */

function setVec3(v = [], x, y, z) {
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}
/**
 * Returns a list of 8 points from a bounding box.
 * @param {aabb} aabb
 * @param {import("pex-math").vec3[]} points
 * @returns {import("pex-math").vec3[]}
 */


function getPoints(a, points = []) {
  points[0] = setVec3(points[0], a[0][0], a[0][1], a[0][2]);
  points[1] = setVec3(points[1], a[1][0], a[0][1], a[0][2]);
  points[2] = setVec3(points[2], a[1][0], a[0][1], a[1][2]);
  points[3] = setVec3(points[3], a[0][0], a[0][1], a[1][2]);
  points[4] = setVec3(points[4], a[0][0], a[1][1], a[0][2]);
  points[5] = setVec3(points[5], a[1][0], a[1][1], a[0][2]);
  points[6] = setVec3(points[6], a[1][0], a[1][1], a[1][2]);
  points[7] = setVec3(points[7], a[0][0], a[1][1], a[1][2]);
  return points;
}
/**
 * Returns the center of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function center(a, out = [0, 0, 0]) {
  out[0] = (a[0][0] + a[1][0]) / 2;
  out[1] = (a[0][1] + a[1][1]) / 2;
  out[2] = (a[0][2] + a[1][2]) / 2;
  return out;
}
/**
 * Returns the size of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function size(a, out = [0, 0, 0]) {
  out[0] = Math.abs(a[1][0] - a[0][0]);
  out[1] = Math.abs(a[1][1] - a[0][1]);
  out[2] = Math.abs(a[1][2] - a[0][2]);
  return out;
}
/**
 * Includes a bounding box in another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
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
 * @param {aabb} a
 * @param {import("pex-math").vec3} p
 * @returns {import("pex-math").vec3}
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

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  empty: empty,
  copy: copy,
  set: set,
  isEmpty: isEmpty,
  fromPoints: fromPoints,
  setPoints: setPoints,
  getPoints: getPoints,
  center: center,
  size: size,
  includeAABB: includeAABB,
  includePoint: includePoint
});

/**
 * @module plane
 */
/**
 * @typedef {number[][]} plane A plane defined by a 3D point and a normal vector perpendicular to the plane’s surface.
 */

const TEMP_0 = create$3();
/**
 * Creates a new plane
 * @returns {plane}
 */

function create$1() {
  return [[0, 0, 0], [0, 1, 0]];
}
/**
 * Set the point of intersection betweeen a plane and a ray if it exists to out.
 * @param {plane} plane
 * @param {ray} ray
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function getRayIntersection(plane, ray, out) {
  return hitTestPlane(ray, plane[0], plane[1], out);
}
/**
 * Returns on which side a point is.
 * @param {plane} plane
 * @param {import("pex-math").vec3} point
 * @returns {number}
 */

function side(plane, point) {
  const planePoint = plane[0];
  const planeNormal = plane[1];
  set$2(TEMP_0, planePoint);
  sub(TEMP_0, point);
  normalize(TEMP_0);
  const dot$1 = dot(TEMP_0, planeNormal);
  if (dot$1 > 0) return 1;
  if (dot$1 < 0) return -1;
  return 0;
}

var plane = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$1,
  getRayIntersection: getRayIntersection,
  side: side
});

/**
 * @module rect
 */

/**
 * @typedef {number[][]} rect A rectangle defined by two diagonally opposite 2D points.
 */

/**
 * Creates a new rectangle.
 * @returns {rect}
 */
function create$2() {
  return [[Infinity, Infinity], [-Infinity, -Infinity]];
}
/**
 * Reset a rectangle.
 * @param {rect} a
 * @returns {rect}
 */

function empty$1(a) {
  a[0][0] = a[0][1] = Infinity;
  a[1][0] = a[1][1] = -Infinity;
  return a;
}
/**
 * Copies a rectangle.
 * @param {rect} b
 * @returns {rect}
 */

function copy$1(a) {
  return [a[0].slice(), a[1].slice()];
}
/**
 * Sets a rectangle to another.
 * @param {rect} a
 * @param {rect} b
 * @returns {rect}
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
 * @param {rect} a
 * @returns {boolean}
 */

function isEmpty$1(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1];
}
/**
 * Updates a rectangle from a list of points.
 * @param {rect} a
 * @param {import("pex-math").vec2[]} points
 * @returns {rect}
 */

function fromPoints$1(a, points) {
  for (let i = 0; i < points.length; i++) {
    includePoint$1(a, points[i]);
  }

  return a;
}
/**
 * Returns a list of 4 points from a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2[]} points
 * @returns {import("pex-math").vec2[]}
 */

function getPoints$1(a, points = []) {
  points[0] = a[0].slice();
  points[1] = [a[0][1], a[1][0]];
  points[2] = a[1].slice();
  points[3] = [a[1][0], a[0][1]];
  return points;
}
/**
 * Scales a rectangle.
 * @param {rect} a
 * @param {number} n
 * @returns {rect}
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
 * @param {rect} a
 * @param {import("pex-math").vec2} size
 * @returns {rect}
 */

function setSize(a, size) {
  a[1][0] = a[0][0] + size[0];
  a[1][1] = a[0][1] + size[1];
  return a;
}
/**
 * Returns the size of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} out
 * @returns {import("pex-math").vec2}
 */

function size$1(a, out = []) {
  out[0] = width(a);
  out[1] = height(a);
  return out;
}
/**
 * Returns the width of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function width(a) {
  return a[1][0] - a[0][0];
}
/**
 * Returns the height of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function height(a) {
  return a[1][1] - a[0][1];
}
/**
 * Returns the aspect ratio of a rectangle.
 * @param {rect} a
 * @returns {number}
 */

function aspectRatio(a) {
  return width(a) / height(a);
}
/**
 * Sets the position of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {rect}
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
 * @param {rect} a
 * @param {import("pex-math").vec2} out
 * @returns {rect}
 */

function center$1(a, out = []) {
  out[0] = a[0][0] + width(a) * 0.5;
  out[1] = a[0][1] + height(a) * 0.5;
  return out;
}
/**
 * Checks if a point is inside a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {boolean}
 */

function containsPoint(a, [x, y]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1];
}
/**
 * Checks if a rectangle is inside another rectangle.
 * @param {rect} a
 * @param {rect} b
 * @returns {boolean}
 */

function containsRect(a, b) {
  return containsPoint(a, b[0]) && containsPoint(a, b[1]);
}
/**
 * Includes a point in a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {rect}
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
 * @param {rect} a
 * @param {rect} b
 * @returns {rect}
 */

function includeRect(a, b) {
  includePoint$1(a, b[0]);
  includePoint$1(a, b[1]);
  return a;
}
/**
 * Maps a point into the dimensions of a rectangle.
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {import("pex-math").vec2}
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
 * @param {rect} a
 * @param {import("pex-math").vec2} p
 * @returns {import("pex-math").vec2}
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

var rect = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$2,
  empty: empty$1,
  copy: copy$1,
  set: set$1,
  isEmpty: isEmpty$1,
  fromPoints: fromPoints$1,
  getPoints: getPoints$1,
  scale: scale,
  setSize: setSize,
  size: size$1,
  width: width,
  height: height,
  aspectRatio: aspectRatio,
  setPosition: setPosition,
  center: center$1,
  containsPoint: containsPoint,
  containsRect: containsRect,
  includePoint: includePoint$1,
  includeRect: includeRect,
  mapPoint: mapPoint,
  clampPoint: clampPoint
});

export { aabb, plane, rect };
