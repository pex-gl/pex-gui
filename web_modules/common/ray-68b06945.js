import './web.dom-collections.iterator-24f03f52.js';
import { f as set, s as sub, n as normalize, g as dot, t as toString$2, h as create$2, b as add, a as scale, i as cross, l as length } from './vec3-0fe60268.js';

/**
 * Enum for different side values
 * @readonly
 * @enum {number}
 */

const Side = Object.freeze({
  OnPlane: 0,
  Same: -1,
  Opposite: 1
});
const TEMP_0 = create$2();
/**
 * Creates a new plane
 * @returns {import("./types.js").plane}
 */

function create() {
  return [[0, 0, 0], [0, 1, 0]];
}
/**
 * Returns on which side a point is.
 * @param {import("./types.js").plane} plane
 * @param {import("pex-math/types/types").vec3} point
 * @returns {number}
 */

function side([planePoint, planeNormal], point) {
  set(TEMP_0, planePoint);
  sub(TEMP_0, point);
  normalize(TEMP_0);
  const dot$1 = dot(TEMP_0, planeNormal);
  if (dot$1 > 0) return Side.Opposite;
  if (dot$1 < 0) return Side.Same;
  return Side.OnPlane;
}
/**
 * Prints a plane to a string.
 * @param {import("./types.js").plane} a
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString(a, precision = 4) {
  // prettier-ignore
  return `[${toString$2(a[0], precision)}, ${toString$2(a[1], precision)}]`;
}

var plane = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Side: Side,
  create: create,
  side: side,
  toString: toString
});

/**
 * Enum for different intersections values
 * @readonly
 * @enum {number}
 */

const Intersections = Object.freeze({
  Intersect: 1,
  NoIntersect: 0,
  SamePlane: -1,
  Parallel: -2,
  TriangleDegenerate: -2
});
const TEMP_0$1 = create$2();
const TEMP_1 = create$2();
const TEMP_2 = create$2();
const TEMP_3 = create$2();
const TEMP_4 = create$2();
const TEMP_5 = create$2();
const TEMP_6 = create$2();
const TEMP_7 = create$2();
const EPSILON = 1e-6;
/**
 * Creates a new ray
 * @returns {import("./types.js").ray}
 */

function create$1() {
  return [[0, 0, 0], [0, 0, 1]];
}
/**
 * Determines if a ray intersect a plane and set intersection point
 * @see {@link https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").plane} plane
 * @param {import("pex-math/types/types").vec3} out
 * @returns {number}
 */

function hitTestPlane([origin, direction], [point, normal], out = create$2()) {
  set(TEMP_0$1, origin);
  set(TEMP_1, direction);
  const dotDirectionNormal = dot(TEMP_1, normal);
  if (dotDirectionNormal === 0) return Intersections.SamePlane;
  set(TEMP_2, point);
  const t = dot(sub(TEMP_2, TEMP_0$1), normal) / dotDirectionNormal;
  if (t < 0) return Intersections.Parallel;
  set(out, add(TEMP_0$1, scale(TEMP_1, t)));
  return Intersections.Intersect;
}
/**
 * Determines if a ray intersect a triangle and set intersection point
 * @see {@link http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").triangle} triangle
 * @param {import("pex-math/types/types").vec3} out
 * @returns {number}
 */

function hitTestTriangle([origin, direction], [p0, p1, p2], out = create$2()) {
  // get triangle edge vectors and plane normal
  const u = sub(set(TEMP_0$1, p1), p0);
  const v = sub(set(TEMP_1, p2), p0);
  const n = cross(set(TEMP_2, u), v);
  if (length(n) < EPSILON) return Intersections.TriangleDegenerate; // ray vectors

  const w0 = sub(set(TEMP_3, origin), p0); // params to calc ray-plane intersect

  const a = -dot(n, w0);
  const b = dot(n, direction);

  if (Math.abs(b) < EPSILON) {
    if (a === 0) return Intersections.SamePlane;
    return Intersections.NoIntersect;
  } // get intersect point of ray with triangle plane


  const r = a / b; // ray goes away from triangle

  if (r < -EPSILON) return Intersections.NoIntersect; // for a segment, also test if (r > 1.0) => no intersect
  // intersect point of ray and plane

  const I = add(set(TEMP_4, origin), scale(set(TEMP_5, direction), r));
  const uu = dot(u, u);
  const uv = dot(u, v);
  const vv = dot(v, v);
  const w = sub(set(TEMP_6, I), p0);
  const wu = dot(w, u);
  const wv = dot(w, v);
  const D = uv * uv - uu * vv; // get and test parametric coords

  const s = (uv * wv - vv * wu) / D;
  if (s < -EPSILON || s > 1.0 + EPSILON) return Intersections.NoIntersect;
  const t = (uv * wu - uu * wv) / D;
  if (t < -EPSILON || s + t > 1.0 + EPSILON) return Intersections.NoIntersect;
  set(out, u);
  scale(out, s);
  add(out, scale(set(TEMP_7, v), t));
  add(out, p0);
  return Intersections.Intersect;
}
/**
 * Determines if a ray intersect an AABB bounding box
 * @see {@link http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms}
 * @param {import("./types.js").ray} ray
 * @param {import("./types.js").aabb} aabb
 * @returns {boolean}
 */

function hitTestAABB([origin, direction], aabb) {
  const dirFracx = 1.0 / direction[0];
  const dirFracy = 1.0 / direction[1];
  const dirFracz = 1.0 / direction[2];
  const min = aabb[0];
  const max = aabb[1];
  const minx = min[0];
  const miny = min[1];
  const minz = min[2];
  const maxx = max[0];
  const maxy = max[1];
  const maxz = max[2];
  const t1 = (minx - origin[0]) * dirFracx;
  const t2 = (maxx - origin[0]) * dirFracx;
  const t3 = (miny - origin[1]) * dirFracy;
  const t4 = (maxy - origin[1]) * dirFracy;
  const t5 = (minz - origin[2]) * dirFracz;
  const t6 = (maxz - origin[2]) * dirFracz;
  const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
  return !(tmax < 0 || tmin > tmax);
}
/**
 * Alias for {@link hitTestAABB}
 * @function
 */

const intersectsAABB = hitTestAABB;
/**
 * Prints a plane to a string.
 * @param {import("./types.js").ray} a
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString$1(a, precision = 4) {
  // prettier-ignore
  return `[${toString$2(a[0], precision)}, ${toString$2(a[1], precision)}]`;
}

var ray = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Intersections: Intersections,
  create: create$1,
  hitTestPlane: hitTestPlane,
  hitTestTriangle: hitTestTriangle,
  hitTestAABB: hitTestAABB,
  intersectsAABB: intersectsAABB,
  toString: toString$1
});

export { hitTestPlane as h, plane as p, ray as r };
