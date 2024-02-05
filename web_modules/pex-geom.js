import { t as toString$3, s as set$2, a as sub, n as normalize, d as dot, c as create$3, b as toString$4 } from './_chunks/vec3-ZbfXqRLW.js';
import { s as set3 } from './_chunks/avec3-iLO3gi3v.js';
export { r as ray } from './_chunks/ray-MfPV-GPU.js';

/**
 * Creates a new bounding box.
 * @returns {import("./types.js").aabb}
 */ function create$2() {
    // [min, max]
    return [
        [
            Infinity,
            Infinity,
            Infinity
        ],
        [
            -Infinity,
            -Infinity,
            -Infinity
        ]
    ];
}
/**
 * Reset a bounding box.
 * @param {import("./types.js").aabb} a
 * @returns {import("./types.js").rect}
 */ function empty$1(a) {
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
 */ function copy$1(a) {
    return [
        a[0].slice(),
        a[1].slice()
    ];
}
/**
 * Sets a bounding box to another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */ function set$1(a, b) {
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
 * @param {import("./types.js").aabb} a
 * @returns {boolean}
 */ function isEmpty$1(a) {
    return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}
/**
 * Updates a bounding box from a list of points.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3[] | import("pex-math/types/types").TypedArray} points
 * @returns {import("./types.js").aabb}
 */ function fromPoints$1(a, points) {
    const isFlatArray = !points[0]?.length;
    const l = points.length / (isFlatArray ? 3 : 1);
    for(let i = 0; i < l; i++){
        if (isFlatArray) {
            includePoint$1(a, points, i * 3);
        } else {
            includePoint$1(a, points[i]);
        }
    }
    return a;
}
/**
 * Returns a list of 8 points from a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3[]} [points]
 * @returns {import("pex-math/types/types").vec3[]}
 */ function getCorners$1(a, points) {
    if (points === void 0) points = Array.from({
        length: 8
    }, ()=>[]);
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
 */ function center$1(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
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
 */ function size$1(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
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
 */ function containsPoint$1(a, param) {
    let [x, y, z] = param;
    return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1] && z >= a[0][2] && z <= a[1][2];
}
/**
 * Includes a bounding box in another.
 * @param {import("./types.js").aabb} a
 * @param {import("./types.js").aabb} b
 * @returns {import("./types.js").aabb}
 */ function includeAABB(a, b) {
    if (isEmpty$1(a)) {
        set$1(a, b);
    } else if (isEmpty$1(b)) ; else {
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
 * @param {number} [i=0] offset in the point array
 * @returns {import("pex-math/types/types").vec3}
 */ function includePoint$1(a, p, i) {
    if (i === void 0) i = 0;
    a[0][0] = Math.min(a[0][0], p[i + 0]);
    a[0][1] = Math.min(a[0][1], p[i + 1]);
    a[0][2] = Math.min(a[0][2], p[i + 2]);
    a[1][0] = Math.max(a[1][0], p[i + 0]);
    a[1][1] = Math.max(a[1][1], p[i + 1]);
    a[1][2] = Math.max(a[1][2], p[i + 2]);
    return a;
}
/**
 * Prints a bounding box to a string.
 * @param {import("./types.js").aabb} a
 * @param {number} [precision=4]
 * @returns {string}
 */ function toString$2(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$3(a[0], precision)}, ${toString$3(a[1], precision)}]`;
}

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  center: center$1,
  containsPoint: containsPoint$1,
  copy: copy$1,
  create: create$2,
  empty: empty$1,
  fromPoints: fromPoints$1,
  getCorners: getCorners$1,
  includeAABB: includeAABB,
  includePoint: includePoint$1,
  isEmpty: isEmpty$1,
  set: set$1,
  size: size$1,
  toString: toString$2
});

/**
 * Enum for different side values
 * @readonly
 * @enum {number}
 */ const Side = Object.freeze({
    OnPlane: 0,
    Same: -1,
    Opposite: 1
});
const TEMP_0 = create$3();
/**
 * Creates a new plane
 * @returns {import("./types.js").plane}
 */ function create$1() {
    return [
        [
            0,
            0,
            0
        ],
        [
            0,
            1,
            0
        ]
    ];
}
/**
 * Returns on which side a point is.
 * @param {import("./types.js").plane} plane
 * @param {import("pex-math/types/types").vec3} point
 * @returns {number}
 */ function side(param, point) {
    let [planePoint, planeNormal] = param;
    set$2(TEMP_0, planePoint);
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
 */ function toString$1(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$3(a[0], precision)}, ${toString$3(a[1], precision)}]`;
}

var plane = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Side: Side,
  create: create$1,
  side: side,
  toString: toString$1
});

/**
 * Creates a new rectangle.
 * @returns {import("./types.js").rect}
 */ function create() {
    return [
        [
            Infinity,
            Infinity
        ],
        [
            -Infinity,
            -Infinity
        ]
    ];
}
/**
 * Reset a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {import("./types.js").rect}
 */ function empty(a) {
    a[0][0] = a[0][1] = Infinity;
    a[1][0] = a[1][1] = -Infinity;
    return a;
}
/**
 * Copies a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {import("./types.js").rect}
 */ function copy(a) {
    return [
        a[0].slice(),
        a[1].slice()
    ];
}
/**
 * Sets a rectangle to another.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {import("./types.js").rect}
 */ function set(a, b) {
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
 */ function isEmpty(a) {
    return a[0][0] > a[1][0] || a[0][1] > a[1][1];
}
/**
 * Updates a rectangle from a list of points.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2[] | import("pex-math/types/types").TypedArray} points
 * @returns {import("./types.js").rect}
 */ function fromPoints(a, points) {
    const isTypedArray = !Array.isArray(points);
    for(let i = 0; i < points.length / (isTypedArray ? 2 : 1); i++){
        includePoint(a, isTypedArray ? points.slice(i * 2) : points[i]);
    }
    return a;
}
/**
 * Returns a list of 4 points from a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2[]} points
 * @returns {import("pex-math/types/types").vec2[]}
 */ function getCorners(a, points) {
    if (points === void 0) points = [];
    points[0] = a[0].slice();
    points[1] = [
        a[0][1],
        a[1][0]
    ];
    points[2] = a[1].slice();
    points[3] = [
        a[1][0],
        a[0][1]
    ];
    return points;
}
/**
 * Scales a rectangle.
 * @param {import("./types.js").rect} a
 * @param {number} n
 * @returns {import("./types.js").rect}
 */ function scale(a, n) {
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
 */ function setSize(a, size) {
    a[1][0] = a[0][0] + size[0];
    a[1][1] = a[0][1] + size[1];
    return a;
}
/**
 * Returns the size of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} out
 * @returns {import("pex-math/types/types").vec2}
 */ function size(a, out) {
    if (out === void 0) out = [];
    out[0] = width(a);
    out[1] = height(a);
    return out;
}
/**
 * Returns the width of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function width(a) {
    return a[1][0] - a[0][0];
}
/**
 * Returns the height of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function height(a) {
    return a[1][1] - a[0][1];
}
/**
 * Returns the aspect ratio of a rectangle.
 * @param {import("./types.js").rect} a
 * @returns {number}
 */ function aspectRatio(a) {
    return width(a) / height(a);
}
/**
 * Sets the position of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("./types.js").rect}
 */ function setPosition(a, param) {
    let [x, y] = param;
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
 */ function center(a, out) {
    if (out === void 0) out = [];
    out[0] = a[0][0] + width(a) * 0.5;
    out[1] = a[0][1] + height(a) * 0.5;
    return out;
}
/**
 * Checks if a point is inside a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {boolean}
 */ function containsPoint(a, param) {
    let [x, y] = param;
    return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1];
}
/**
 * Checks if a rectangle is inside another rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("./types.js").rect} b
 * @returns {boolean}
 */ function containsRect(a, b) {
    return containsPoint(a, b[0]) && containsPoint(a, b[1]);
}
/**
 * Includes a point in a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("./types.js").rect}
 */ function includePoint(a, param) {
    let [x, y] = param;
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
 */ function includeRect(a, b) {
    includePoint(a, b[0]);
    includePoint(a, b[1]);
    return a;
}
/**
 * Maps a point into the dimensions of a rectangle.
 * @param {import("./types.js").rect} a
 * @param {import("pex-math/types/types").vec2} p
 * @returns {import("pex-math/types/types").vec2}
 */ function mapPoint(a, p) {
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
 */ function clampPoint(a, p) {
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
 */ function toString(a, precision) {
    if (precision === void 0) precision = 4;
    // prettier-ignore
    return `[${toString$4(a[0], precision)}, ${toString$4(a[1], precision)}]`;
}

var rect = /*#__PURE__*/Object.freeze({
  __proto__: null,
  aspectRatio: aspectRatio,
  center: center,
  clampPoint: clampPoint,
  containsPoint: containsPoint,
  containsRect: containsRect,
  copy: copy,
  create: create,
  empty: empty,
  fromPoints: fromPoints,
  getCorners: getCorners,
  height: height,
  includePoint: includePoint,
  includeRect: includeRect,
  isEmpty: isEmpty,
  mapPoint: mapPoint,
  scale: scale,
  set: set,
  setPosition: setPosition,
  setSize: setSize,
  size: size,
  toString: toString,
  width: width
});

export { aabb, plane, rect };
