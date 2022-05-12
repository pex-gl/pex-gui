import './web.dom-collections.iterator-70010183.js';
import { g as create$1, e as set, h as dot, s as sub, b as add, a as scale, i as cross, l as length } from './vec3-49e7f9a4.js';

/**
 * @typedef {number[][]} ray A ray defined by a starting 3D point origin and a 3D direction vector.
 */

/**
 * Enum for different intersections values
 * @readonly
 * @enum {number}
 */

const INTERSECTIONS = Object.freeze({
  INTERSECT: 1,
  NO_INTERSECT: 0,
  SAME_PLANE: -1,
  PARALLEL: -2,
  TRIANGLE_DEGENERATE: -2
});
const TEMP_0 = create$1();
const TEMP_1 = create$1();
const TEMP_2 = create$1();
const TEMP_3 = create$1();
const TEMP_4 = create$1();
const TEMP_5 = create$1();
const TEMP_6 = create$1();
const TEMP_7 = create$1();
const EPSILON = 1e-6;
/**
 * Creates a new ray
 * @returns {ray}
 */

function create() {
  return [[0, 0, 0], [0, 0, 1]];
}
/**
 * Determines if a ray intersect a plane
 * https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
 * @param {ray} ray
 * @param {import("pex-math").vec3} point
 * @param {import("pex-math").vec3} normal
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function hitTestPlane(ray, point, normal, out = create$1()) {
  const origin = set(TEMP_0, ray[0]);
  const direction = set(TEMP_1, ray[1]);
  const dotDirectionNormal = dot(direction, normal);
  if (dotDirectionNormal === 0) return INTERSECTIONS.SAME_PLANE;
  point = set(TEMP_2, point);
  const t = dot(sub(point, origin), normal) / dotDirectionNormal;
  if (t < 0) return INTERSECTIONS.PARALLEL;
  set(out, add(origin, scale(direction, t)));
  return INTERSECTIONS.INTERSECT;
}
/**
 * Determines if a ray intersect a triangle
 * http://geomalgorithms.com/a06-_intersect-2.html#intersect3D_RayTriangle()
 * @param {ray} ray
 * @param {triangle} triangle
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function hitTestTriangle([origin, direction], [p0, p1, p2], out = create$1()) {
  // get triangle edge vectors and plane normal
  const u = sub(set(TEMP_0, p1), p0);
  const v = sub(set(TEMP_1, p2), p0);
  const n = cross(set(TEMP_2, u), v);
  if (length(n) < EPSILON) return INTERSECTIONS.TRIANGLE_DEGENERATE; // ray vectors

  const w0 = sub(set(TEMP_3, origin), p0); // params to calc ray-plane intersect

  const a = -dot(n, w0);
  const b = dot(n, direction);

  if (Math.abs(b) < EPSILON) {
    if (a === 0) return INTERSECTIONS.SAME_PLANE;
    return INTERSECTIONS.NO_INTERSECT;
  } // get intersect point of ray with triangle plane


  const r = a / b; // ray goes away from triangle

  if (r < -EPSILON) return INTERSECTIONS.NO_INTERSECT; // for a segment, also test if (r > 1.0) => no intersect
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
  if (s < -EPSILON || s > 1.0 + EPSILON) return INTERSECTIONS.NO_INTERSECT;
  const t = (uv * wu - uu * wv) / D;
  if (t < -EPSILON || s + t > 1.0 + EPSILON) return INTERSECTIONS.NO_INTERSECT;
  set(out, u);
  scale(out, s);
  add(out, scale(set(TEMP_7, v), t));
  add(out, p0);
  return INTERSECTIONS.INTERSECT;
}
/**
 * Determines if a ray intersect an AABB bounding box
 * http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms
 * @param {ray} ray
 * @param {aabb} aabb
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

var ray = /*#__PURE__*/Object.freeze({
  __proto__: null,
  INTERSECTIONS: INTERSECTIONS,
  create: create,
  hitTestPlane: hitTestPlane,
  hitTestTriangle: hitTestTriangle,
  hitTestAABB: hitTestAABB,
  intersectsAABB: intersectsAABB
});

export { hitTestPlane as h, ray as r };
