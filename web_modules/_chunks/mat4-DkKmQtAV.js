/** @module utils */ /**
 * @constant {number}
 */ const EPSILON = 0.000001;
/**
 * @constant {import("./types.js").vec3}
 */ const Y_UP = Object.freeze([
    0,
    1,
    0
]);
/**
 * Linear interpolation between two numbers.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */ function lerp(a, b, t) {
    return a + (b - a) * t;
}
/**
 * Clamps a number between two numbers.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */ function clamp(n, min, max) {
    return Math.max(min, Math.min(n, max));
}
/**
 * Smooth Hermite interpolation between 0 and 1
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */ function smoothstep(n, min, max) {
    n = clamp((n - min) / (max - min), 0, 1);
    return n * n * (3 - 2 * n);
}
/**
 * Maps a number from one range to another.
 * @param {number} n
 * @param {number} inStart
 * @param {number} inEnd
 * @param {number} outStart
 * @param {number} outEnd
 * @returns {number}
 */ function remap(n, inStart, inEnd, outStart, outEnd) {
    return outStart + (outEnd - outStart) * (n - inStart) / (inEnd - inStart);
}
/**
 * @deprecated Use "remap()"
 * @ignore
 */ function map() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return remap(...args);
}
/**
 * Transforms degrees into radians.
 * @param {import("./types.js").Degrees} degrees
 * @returns {import("./types.js").Radians}
 */ function toRadians(degrees) {
    return degrees * Math.PI / 180;
}
/**
 * Transforms radians into degrees.
 * @param {import("./types.js").Radians} radians
 * @returns {import("./types.js").Degrees}
 */ function toDegrees(radians) {
    return radians * 180 / Math.PI;
}
/**
 * Check if a number is a power of two
 * @param {number} a
 * @returns {boolean}
 */ function isPowerOfTwo(a) {
    return (a & a - 1) === 0;
}
/**
 * Returns the next highest power of two.
 * @param {number} n
 * @returns {number}
 */ function nextPowerOfTwo(n) {
    if (n === 0) return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
}
/**
 * Returns the previous power of two.
 * @param {number} n
 * @returns {number}
 */ function prevPowerOfTwo(n) {
    if (n <= 1) return 0;
    return nextPowerOfTwo(n) / 2;
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  EPSILON: EPSILON,
  Y_UP: Y_UP,
  clamp: clamp,
  isPowerOfTwo: isPowerOfTwo,
  lerp: lerp,
  map: map,
  nextPowerOfTwo: nextPowerOfTwo,
  prevPowerOfTwo: prevPowerOfTwo,
  remap: remap,
  smoothstep: smoothstep,
  toDegrees: toDegrees,
  toRadians: toRadians
});

/**
 * Returns a 4x4 identity matrix.
 *
 * Row major memory layout:
 *
 * ```
 *  0   1   2   3
 *  4   5   6   7
 *  8   9  10  11
 * 12  13  14  15
 * ```
 *
 * Equivalent to the column major OpenGL spec:
 *
 * ```
 *  0   4   8  12
 *  1   5   9  13
 *  2   6  10  14
 *  3   7  11  15
 *
 *  m00 m10 m20 m30
 *  m01 m11 m21 m31
 *  m02 m12 m22 m32
 *  m03 m13 m23 m33
 * ```
 * @returns {import("./types.js").mat4}
 */ function create() {
    // prettier-ignore
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    ];
}
/**
 * Sets a matrix to the identity matrix.
 * @param {import("./types.js").mat4} a
 * @returns {import("./types.js").mat4}
 */ function identity(a) {
    a[0] = a[5] = a[10] = a[15] = 1;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
    return a;
}
/**
 * Returns a copy of a matrix.
 * @param {import("./types.js").mat4} a
 * @returns {import("./types.js").mat4}
 */ function copy(a) {
    return a.slice();
}
/**
 * Sets a matrix from another matrix.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").mat4} b
 * @returns {import("./types.js").mat4}
 */ function set(a, b) {
    a[0] = b[0];
    a[1] = b[1];
    a[2] = b[2];
    a[3] = b[3];
    a[4] = b[4];
    a[5] = b[5];
    a[6] = b[6];
    a[7] = b[7];
    a[8] = b[8];
    a[9] = b[9];
    a[10] = b[10];
    a[11] = b[11];
    a[12] = b[12];
    a[13] = b[13];
    a[14] = b[14];
    a[15] = b[15];
    return a;
}
/**
 * Compares two matrices.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").mat4} b
 * @returns {boolean}
 */ function equals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
 * Multiplies two matrices.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").mat4} b
 * @returns {import("./types.js").mat4}
 */ function mult(a, b) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    let b0 = b[0];
    let b1 = b[1];
    let b2 = b[2];
    let b3 = b[3];
    a[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    a[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    a[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    a[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    a[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    a[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    a[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    a[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    a[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    a[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    a[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    a[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    a[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    a[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    a[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    a[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return a;
}
/**
 * Inverts a matrix.
 * @param {import("./types.js").mat4} a
 * @returns {import("./types.js").mat4}
 */ function invert(a) {
    const a00 = a[0];
    const a10 = a[1];
    const a20 = a[2];
    const a30 = a[3];
    const a01 = a[4];
    const a11 = a[5];
    const a21 = a[6];
    const a31 = a[7];
    const a02 = a[8];
    const a12 = a[9];
    const a22 = a[10];
    const a32 = a[11];
    const a03 = a[12];
    const a13 = a[13];
    const a23 = a[14];
    const a33 = a[15];
    const a22a33 = a22 * a33;
    const a32a23 = a32 * a23;
    const a21a33 = a21 * a33;
    const a31a23 = a31 * a23;
    const a21a32 = a21 * a32;
    const a31a22 = a31 * a22;
    const a20a33 = a20 * a33;
    const a30a23 = a30 * a23;
    const a20a32 = a20 * a32;
    const a30a22 = a30 * a22;
    const a20a31 = a20 * a31;
    const a30a21 = a30 * a21;
    const a00a11 = a00 * a11;
    const a01a10 = a01 * a10;
    const a02a10 = a02 * a10;
    const a03a10 = a03 * a10;
    const a12a33 = a12 * a33;
    const a32a13 = a32 * a13;
    const a00a31 = a00 * a31;
    const a03a11 = a03 * a11;
    const a12a23 = a12 * a23;
    const a22a13 = a22 * a13;
    const a02a11 = a02 * a11;
    const a21a13 = a21 * a13;
    const a21a12 = a21 * a12;
    const a02a30 = a02 * a30;
    const a03a30 = a03 * a30;
    const a02a20 = a02 * a20;
    const a03a20 = a03 * a20;
    const a01a30 = a01 * a30;
    const a01a20 = a01 * a20;
    a[0] = a11 * a22a33 - a11 * a32a23 - a12 * a21a33 + a12 * a31a23 + a13 * a21a32 - a13 * a31a22;
    a[4] = -a01 * a22a33 + a01 * a32a23 + a02 * a21a33 - a02 * a31a23 - a03 * a21a32 + a03 * a31a22;
    a[8] = a01 * a12a33 - a01 * a32a13 - a02a11 * a33 + a02 * a31 * a13 + a03a11 * a32 - a03 * a31 * a12;
    a[12] = -a01 * a12a23 + a01 * a22a13 + a02a11 * a23 - a02 * a21a13 - a03a11 * a22 + a03 * a21a12;
    a[1] = -a10 * a22a33 + a10 * a32a23 + a12 * a20a33 - a12 * a30a23 - a13 * a20a32 + a13 * a30a22;
    a[5] = a00 * a22a33 - a00 * a32a23 - a02 * a20a33 + a02 * a30a23 + a03 * a20a32 - a03 * a30a22;
    a[9] = -a00 * a12a33 + a00 * a32a13 + a02a10 * a33 - a02a30 * a13 - a03a10 * a32 + a03a30 * a12;
    a[13] = a00 * a12a23 - a00 * a22a13 - a02a10 * a23 + a02a20 * a13 + a03a10 * a22 - a03a20 * a12;
    a[2] = a10 * a21a33 - a10 * a31a23 - a11 * a20a33 + a11 * a30a23 + a13 * a20a31 - a13 * a30a21;
    a[6] = -a00 * a21a33 + a00 * a31a23 + a01 * a20a33 - a01 * a30a23 - a03 * a20a31 + a03 * a30a21;
    a[10] = a00a11 * a33 - a00a31 * a13 - a01a10 * a33 + a01a30 * a13 + a03a10 * a31 - a03a30 * a11;
    a[14] = -a00a11 * a23 + a00 * a21a13 + a01a10 * a23 - a01a20 * a13 - a03a10 * a21 + a03a20 * a11;
    a[3] = -a10 * a21a32 + a10 * a31a22 + a11 * a20a32 - a11 * a30a22 - a12 * a20a31 + a12 * a30a21;
    a[7] = a00 * a21a32 - a00 * a31a22 - a01 * a20a32 + a01 * a30a22 + a02 * a20a31 - a02 * a30a21;
    a[11] = -a00a11 * a32 + a00a31 * a12 + a01a10 * a32 - a01a30 * a12 - a02a10 * a31 + a02a30 * a11;
    a[15] = a00a11 * a22 - a00 * a21a12 - a01a10 * a22 + a01a20 * a12 + a02a10 * a21 - a02a20 * a11;
    let det = a00 * a[0] + a10 * a[4] + a20 * a[8] + a30 * a[12];
    if (!det) return null;
    det = 1 / det;
    a[0] *= det;
    a[1] *= det;
    a[2] *= det;
    a[3] *= det;
    a[4] *= det;
    a[5] *= det;
    a[6] *= det;
    a[7] *= det;
    a[8] *= det;
    a[9] *= det;
    a[10] *= det;
    a[11] *= det;
    a[12] *= det;
    a[13] *= det;
    a[14] *= det;
    a[15] *= det;
    return a;
}
/**
 * Transposes a matrix.
 * @param {import("./types.js").mat4} a
 * @returns {import("./types.js").mat4}
 */ function transpose(a) {
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    // 1st row - keeping a00
    a[1] = a[4];
    a[2] = a20;
    a[3] = a30;
    // 2nd row - keeping a11
    a[4] = a01;
    a[6] = a21;
    a[7] = a31;
    // 3rd row - keeping a22
    a[8] = a02;
    a[9] = a12;
    a[11] = a32;
    // 4th row - keeping a33
    a[12] = a03;
    a[13] = a13;
    a[14] = a23;
    return a;
}
/**
 * Translates a matrix by a vector.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} v
 * @returns {import("./types.js").mat4}
 */ function translate(a, param) {
    let [x, y, z] = param;
    a[12] += a[0] * x + a[4] * y + a[8] * z;
    a[13] += a[1] * x + a[5] * y + a[9] * z;
    a[14] += a[2] * x + a[6] * y + a[10] * z;
    a[15] += a[3] * x + a[7] * y + a[11] * z;
    return a;
}
/**
 * Rotates a matrix by an angle at an axis.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").Radians} r
 * @param {import("./types.js").vec3} v
 * @returns {import("./types.js").mat4}
 */ function rotate(a, r, param) {
    let [x, y, z] = param;
    let len = Math.sqrt(x * x + y * y + z * z);
    if (len < EPSILON) {
        return null;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    const s = Math.sin(r);
    const c = Math.cos(r);
    const t = 1 - c;
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const b00 = x * x * t + c;
    const b01 = y * x * t + z * s;
    const b02 = z * x * t - y * s;
    const b10 = x * y * t - z * s;
    const b11 = y * y * t + c;
    const b12 = z * y * t + x * s;
    const b20 = x * z * t + y * s;
    const b21 = y * z * t - x * s;
    const b22 = z * z * t + c;
    a[0] = a00 * b00 + a10 * b01 + a20 * b02;
    a[1] = a01 * b00 + a11 * b01 + a21 * b02;
    a[2] = a02 * b00 + a12 * b01 + a22 * b02;
    a[3] = a03 * b00 + a13 * b01 + a23 * b02;
    a[4] = a00 * b10 + a10 * b11 + a20 * b12;
    a[5] = a01 * b10 + a11 * b11 + a21 * b12;
    a[6] = a02 * b10 + a12 * b11 + a22 * b12;
    a[7] = a03 * b10 + a13 * b11 + a23 * b12;
    a[8] = a00 * b20 + a10 * b21 + a20 * b22;
    a[9] = a01 * b20 + a11 * b21 + a21 * b22;
    a[10] = a02 * b20 + a12 * b21 + a22 * b22;
    a[11] = a03 * b20 + a13 * b21 + a23 * b22;
    return a;
}
/**
 * Scales a matrix by a vector.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} v
 * @returns {import("./types.js").mat4}
 */ function scale(a, param) {
    let [x, y, z] = param;
    a[0] *= x;
    a[1] *= x;
    a[2] *= x;
    a[3] *= x;
    a[4] *= y;
    a[5] *= y;
    a[6] *= y;
    a[7] *= y;
    a[8] *= z;
    a[9] *= z;
    a[10] *= z;
    a[11] *= z;
    return a;
}
/**
 * Sets a matrix to a quaternion.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").quat} q
 * @returns {import("./types.js").mat4}
 */ function fromQuat(a, q) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    a[0] = 1 - (yy + zz);
    a[4] = xy - wz;
    a[8] = xz + wy;
    a[1] = xy + wz;
    a[5] = 1 - (xx + zz);
    a[9] = yz - wx;
    a[2] = xz - wy;
    a[6] = yz + wx;
    a[10] = 1 - (xx + yy);
    a[3] = a[7] = a[11] = a[12] = a[13] = a[14] = 0;
    a[15] = 1;
    return a;
}
/**
 * Sets a matrix to the TRS matrix.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} v
 * @param {import("./types.js").quat} q
 * @param {import("./types.js").vec3} s
 * @returns {import("./types.js").mat4}
 */ function fromTranslationRotationScale(a, v, q, s) {
    // const TEMP_0 = create();
    // identity(a);
    // translate(a, translation);
    // mult(a, fromQuat(TEMP_0, rotation));
    // scale(a, scaling);
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    a[3] = a[7] = a[11] = 0;
    a[15] = 1;
    a[0] = (1 - (yy + zz)) * s[0];
    a[1] = (xy + wz) * s[0];
    a[2] = (xz - wy) * s[0];
    a[4] = (xy - wz) * s[1];
    a[5] = (1 - (xx + zz)) * s[1];
    a[6] = (yz + wx) * s[1];
    a[8] = (xz + wy) * s[2];
    a[9] = (yz - wx) * s[2];
    a[10] = (1 - (xx + yy)) * s[2];
    a[12] = v[0];
    a[13] = v[1];
    a[14] = v[2];
    return a;
}
/**
 * Sets a 4x4 matrix to a 3x3 matrix.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").mat3} b
 * @returns {import("./types.js").mat4}
 */ function fromMat3(a, b) {
    a[0] = b[0];
    a[1] = b[1];
    a[2] = b[2];
    a[4] = b[3];
    a[5] = b[4];
    a[6] = b[5];
    a[8] = b[6];
    a[9] = b[7];
    a[10] = b[8];
    a[3] = a[7] = a[11] = a[12] = a[13] = a[14] = 0;
    a[15] = 1;
    return a;
}
/**
 * Creates a frustum matrix.
 * @param {import("./types.js").mat4} a
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} near
 * @param {number} far
 * @returns {import("./types.js").mat4}
 */ function frustum(a, left, right, bottom, top, near, far) {
    const rl = 1 / (right - left);
    const tb = 1 / (top - bottom);
    const nf = 1 / (near - far);
    const near2 = near * 2;
    a[0] = near2 * rl;
    a[1] = a[2] = 0;
    a[3] = 0;
    a[4] = 0;
    a[5] = near2 * tb;
    a[6] = 0;
    a[7] = 0;
    a[8] = (right + left) * rl;
    a[9] = (top + bottom) * tb;
    a[10] = (far + near) * nf;
    a[11] = -1;
    a[12] = 0;
    a[13] = 0;
    a[14] = far * near2 * nf;
    a[15] = 0;
    return a;
}
/**
 * Creates a perspective matrix.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").Radians} fovy
 * @param {number} aspectRatio
 * @param {number} near
 * @param {number} far
 * @returns {import("./types.js").mat4}
 */ function perspective(a, fovy, aspectRatio, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;
    a[0] = f / aspectRatio;
    a[5] = f;
    a[10] = (far + near) * nf;
    a[11] = -1;
    a[14] = 2 * far * near * nf;
    return a;
}
/**
 * Creates an orthographic matrix.
 * @param {import("./types.js").mat4} a
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} near
 * @param {number} far
 * @returns {import("./types.js").mat4}
 */ function ortho(a, left, right, bottom, top, near, far) {
    const lr = left - right;
    const bt = bottom - top;
    const nf = near - far;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = 0;
    a[0] = -2 / lr;
    a[5] = -2 / bt;
    a[10] = 2 / nf;
    a[12] = (left + right) / lr;
    a[13] = (top + bottom) / bt;
    a[14] = (far + near) / nf;
    a[15] = 1;
    return a;
}
/**
 * Calculates a lookAt matrix from position, target and up vectors.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} from
 * @param {import("./types.js").vec3} to
 * @param {import("./types.js").vec3} [up=Y_UP]
 * @returns {import("./types.js").mat4}
 */ function lookAt(a, param, param1, param2) {
    let [eyex, eyey, eyez] = param;
    let [targetx, targety, targetz] = param1;
    let [upx, upy, upz] = param2 === undefined ? Y_UP : param2;
    if (Math.abs(eyex - targetx) < EPSILON && Math.abs(eyey - targety) < EPSILON && Math.abs(eyez - targetz) < EPSILON) {
        return identity(a);
    }
    let z0 = eyex - targetx;
    let z1 = eyey - targety;
    let z2 = eyez - targetz;
    let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    let x0 = upy * z2 - upz * z1;
    let x1 = upz * z0 - upx * z2;
    let x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (len) {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    let y0 = z1 * x2 - z2 * x1;
    let y1 = z2 * x0 - z0 * x2;
    let y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (len) {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    a[0] = x0;
    a[1] = y0;
    a[2] = z0;
    a[3] = 0;
    a[4] = x1;
    a[5] = y1;
    a[6] = z1;
    a[7] = 0;
    a[8] = x2;
    a[9] = y2;
    a[10] = z2;
    a[11] = 0;
    a[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    a[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    a[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    a[15] = 1;
    return a;
}
/**
 * Sets a matrix from a direction.
 * Note: we assume +Z facing models.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} direction
 * @param {import("./types.js").vec3} [up=Y_UP]
 * @returns {import("./types.js").mat4}
 */ function fromDirection(a, param, param1) {
    let [z0, z1, z2] = param;
    let [upx, upy, upz] = param1 === undefined ? Y_UP : param1;
    let len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
    }
    let x0 = upy * z2 - upz * z1;
    let x1 = upz * z0 - upx * z2;
    let x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    upx = z1 * x2 - z2 * x1;
    upy = z2 * x0 - z0 * x2;
    upz = z0 * x1 - z1 * x0;
    len = upx * upx + upy * upy + upz * upz;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        upx *= len;
        upy *= len;
        upz *= len;
    }
    a[0] = x0;
    a[1] = x1;
    a[2] = x2;
    a[3] = 0;
    a[4] = upx;
    a[5] = upy;
    a[6] = upz;
    a[7] = 0;
    a[8] = z0;
    a[9] = z1;
    a[10] = z2;
    a[11] = 0;
    a[12] = 0;
    a[13] = 0;
    a[14] = 0;
    a[15] = 1;
    return a;
}
/**
 * Sets a matrix from a point to another.
 * @param {import("./types.js").mat4} a
 * @param {import("./types.js").vec3} from
 * @param {import("./types.js").vec3} to
 * @param {import("./types.js").vec3} [up=Y_UP]
 * @returns {import("./types.js").mat4}
 */ function fromPointToPoint(a, param, param1, up) {
    let [fromX, fromY, fromZ] = param;
    let [toX, toY, toZ] = param1;
    return fromDirection(a, [
        toX - fromX,
        toY - fromY,
        toZ - fromZ
    ], up);
}

var mat4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  copy: copy,
  create: create,
  equals: equals,
  fromDirection: fromDirection,
  fromMat3: fromMat3,
  fromPointToPoint: fromPointToPoint,
  fromQuat: fromQuat,
  fromTranslationRotationScale: fromTranslationRotationScale,
  frustum: frustum,
  identity: identity,
  invert: invert,
  lookAt: lookAt,
  mult: mult,
  ortho: ortho,
  perspective: perspective,
  rotate: rotate,
  scale: scale,
  set: set,
  translate: translate,
  transpose: transpose
});

export { EPSILON as E, clamp as a, toRadians as b, create as c, lerp as d, fromDirection as e, frustum as f, fromPointToPoint as g, invert as i, lookAt as l, mat4 as m, ortho as o, perspective as p, set as s, toDegrees as t, utils as u };
