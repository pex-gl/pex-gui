import './common/es.typed-array.with-91c59224.js';
import './common/es.error.cause-be6c1e2c.js';
import './common/esnext.iterator.map-73de652f.js';

/**
 * @module utils
 */

/**
 * Two times PI.
 * @constant {number}
 */
const TAU = Math.PI * 2;

/**
 * Normalize a vector 3.
 * @param {number[]} v Vector 3 array
 * @returns {number[]} Normalized vector
 */
function normalize(v) {
  const l = 1 / (Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1);
  v[0] *= l;
  v[1] *= l;
  v[2] *= l;
  return v;
}

/**
 * Ensure first argument passed to the primitive functions is an object
 * @param {...*} args
 */
function checkArguments(args) {
  const argumentType = typeof args[0];
  if (argumentType !== "object" && argumentType !== "undefined") {
    console.error("First argument must be an object.");
  }
}

/**
 * @private
 */
let TYPED_ARRAY_TYPE;

/**
 * Enforce a typed array constructor for cells
 * @param {(Class<Uint8Array>|Class<Uint16Array>|Class<Uint32Array>)} type
 */
function setTypedArrayType(type) {
  TYPED_ARRAY_TYPE = type;
}

/**
 * Select cells typed array from a size determined by amount of vertices.
 *
 * @param {number} size The max value expected
 * @returns {(Uint8Array|Uint16Array|Uint32Array)}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */
const getCellsTypedArray = size => TYPED_ARRAY_TYPE || (size <= 255 ? Uint8Array : size <= 65535 ? Uint16Array : Uint32Array);

/**
 * @private
 */
const TMP = [0, 0, 0];

/**
 * @private
 */
const PLANE_DIRECTIONS = {
  z: [0, 1, 2, 1, -1, 1],
  "-z": [0, 1, 2, -1, -1, -1],
  "-x": [2, 1, 0, 1, -1, -1],
  x: [2, 1, 0, -1, -1, 1],
  y: [0, 2, 1, 1, 1, 1],
  "-y": [0, 2, 1, 1, -1, -1]
};

/**
 * @private
 */
function computePlane(geometry, indices, su, sv, nu, nv, direction = "z", pw = 0, quads = false, uvScale = [1, 1], uvOffset = [0, 0], center = [0, 0, 0]) {
  const {
    positions,
    normals,
    uvs,
    cells
  } = geometry;
  const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];
  const vertexOffset = indices.vertex;
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      positions[indices.vertex * 3 + u] = (-su / 2 + i * su / nu) * flipU + center[u];
      positions[indices.vertex * 3 + v] = (-sv / 2 + j * sv / nv) * flipV + center[v];
      positions[indices.vertex * 3 + w] = pw + center[w];
      normals[indices.vertex * 3 + w] = normal;
      uvs[indices.vertex * 2] = i / nu * uvScale[0] + uvOffset[0];
      uvs[indices.vertex * 2 + 1] = (1 - j / nv) * uvScale[1] + uvOffset[1];
      indices.vertex++;
      if (j < nv && i < nu) {
        const n = vertexOffset + j * (nu + 1) + i;
        if (quads) {
          const o = vertexOffset + (j + 1) * (nu + 1) + i;
          cells[indices.cell] = n;
          cells[indices.cell + 1] = o;
          cells[indices.cell + 2] = o + 1;
          cells[indices.cell + 3] = n + 1;
        } else {
          cells[indices.cell] = n;
          cells[indices.cell + 1] = n + nu + 1;
          cells[indices.cell + 2] = n + nu + 2;
          cells[indices.cell + 3] = n;
          cells[indices.cell + 4] = n + nu + 2;
          cells[indices.cell + 5] = n + 1;
        }
        indices.cell += quads ? 4 : 6;
      }
    }
  }
  return geometry;
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TAU: TAU,
  normalize: normalize,
  checkArguments: checkArguments,
  setTypedArrayType: setTypedArrayType,
  getCellsTypedArray: getCellsTypedArray,
  TMP: TMP,
  computePlane: computePlane
});

/**
 * @typedef {Object} QuadOptions
 * @property {number} [scale=0.5]
 */

/**
 * @alias module:quad
 * @param {QuadOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function quad({
  scale = 0.5
} = {}) {
  checkArguments(arguments);
  return {
    // prettier-ignore
    positions: Float32Array.of(-scale, -scale, 0, scale, -scale, 0, scale, scale, 0, -scale, scale, 0),
    // prettier-ignore
    normals: Int8Array.of(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1),
    // prettier-ignore
    uvs: Uint8Array.of(0, 0, 1, 0, 1, 1, 0, 1),
    // prettier-ignore
    cells: getCellsTypedArray(12).of(0, 1, 2, 2, 3, 0)
  };
}

/**
 * @typedef {Object} PlaneOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {PlaneDirection} [direction="z"]
 * @property {boolean} [quads=false]
 */

/**
 * @typedef {"x" | "-x" | "y" | "-y" | "z" | "-z"} PlaneDirection
 */

/**
 * @alias module:plane
 * @param {PlaneOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function plane({
  sx = 1,
  sy = sx,
  nx = 1,
  ny = nx,
  direction = "z",
  quads = false
} = {}) {
  checkArguments(arguments);
  const size = (nx + 1) * (ny + 1);
  return computePlane({
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(nx * ny * (quads ? 4 : 6))
  }, {
    vertex: 0,
    cell: 0
  }, sx, sy, nx, ny, direction, 0, quads);
}

/**
 * @typedef {Object} CubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 */

/**
 * @alias module:cube
 * @param {CubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cube({
  sx = 1,
  sy = sx,
  sz = sx,
  nx = 1,
  ny = nx,
  nz = nx
} = {}) {
  checkArguments(arguments);
  const size = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))((nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6)
  };
  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;
  const indices = {
    vertex: 0,
    cell: 0
  };
  computePlane(geometry, indices, sx, sy, nx, ny, "z", halfSZ);
  computePlane(geometry, indices, sx, sy, nx, ny, "-z", -halfSZ);
  computePlane(geometry, indices, sz, sy, nz, ny, "-x", -halfSX);
  computePlane(geometry, indices, sz, sy, nz, ny, "x", halfSX);
  computePlane(geometry, indices, sx, sz, nx, nz, "y", halfSY);
  computePlane(geometry, indices, sx, sz, nx, nz, "-y", -halfSY);
  return geometry;
}

/**
 * @typedef {Object} RoundedCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [nz=nx]
 * @property {number} [radius=sx * 0.25]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 */

/**
 * @alias module:rounded-cube
 * @param {RoundedCubeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function roundedCube({
  sx = 1,
  sy = sx,
  sz = sx,
  nx = 1,
  ny = nx,
  nz = nx,
  radius = sx * 0.25,
  roundSegments = 8,
  edgeSegments = 1
} = {}) {
  checkArguments(arguments);
  const size = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2 + (roundSegments + 1) * (roundSegments + 1) * 24 + (roundSegments + 1) * (edgeSegments + 1) * 24;
  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))((nx * ny * 2 + nx * nz * 2 + nz * ny * 2 + roundSegments * roundSegments * 24 + roundSegments * edgeSegments * 24) * 6)
  };
  const halfSX = sx * 0.5;
  const halfSY = sy * 0.5;
  const halfSZ = sz * 0.5;
  const r2 = radius * 2;
  const widthX = sx - r2;
  const widthY = sy - r2;
  const widthZ = sz - r2;
  const faceSX = widthX / sx;
  const faceSY = widthY / sy;
  const faceSZ = widthZ / sz;
  const radiusSX = radius / sx;
  const radiusSY = radius / sy;
  const radiusSZ = radius / sz;
  const indices = {
    vertex: 0,
    cell: 0
  };
  const PLANES = [[widthX, widthY, nx, ny, "z", halfSZ, [faceSX, faceSY], [radiusSX, radiusSY], (x, y) => [x, y, 0]], [widthX, widthY, nx, ny, "-z", -halfSZ, [faceSX, faceSY], [radiusSX, radiusSY], (x, y) => [-x, y, 0]], [widthZ, widthY, nz, ny, "-x", -halfSX, [faceSZ, faceSY], [radiusSZ, radiusSY], (x, y) => [0, y, x]], [widthZ, widthY, nz, ny, "x", halfSX, [faceSZ, faceSY], [radiusSZ, radiusSY], (x, y) => [0, y, -x]], [widthX, widthZ, nx, nz, "y", halfSY, [faceSX, faceSZ], [radiusSX, radiusSZ], (x, y) => [x, 0, -y]], [widthX, widthZ, nx, nz, "-y", -halfSY, [faceSX, faceSZ], [radiusSX, radiusSZ], (x, y) => [x, 0, y]]];
  const uvOffsetCorner = (su, sv) => [[0, 0], [1 - radius / (su + r2), 0], [1 - radius / (su + r2), 1 - radius / (sv + r2)], [0, 1 - radius / (sv + r2)]];
  const uvOffsetStart = (_, sv) => [0, radius / (sv + r2)];
  const uvOffsetEnd = (su, sv) => [1 - radius / (su + r2), radius / (sv + r2)];
  for (let j = 0; j < PLANES.length; j++) {
    const [su, sv, nu, nv, direction, pw, uvScale, uvOffset, center] = PLANES[j];

    // Cube faces
    computePlane(geometry, indices, su, sv, nu, nv, direction, pw, false, uvScale, uvOffset);

    // Corner order: ccw uv-like order and L/B (0) R/T (2)
    // 0,1 -- 1,1
    //  |  --  |
    // 0,0 -- 1,0
    for (let i = 0; i < 4; i++) {
      const ceil = Math.ceil(i / 2) % 2;
      const floor = Math.floor(i / 2) % 2;
      const x = (ceil === 0 ? -1 : 1) * (su + radius) * 0.5;
      const y = (floor === 0 ? -1 : 1) * (sv + radius) * 0.5;

      // Corners
      computePlane(geometry, indices, radius, radius, roundSegments, roundSegments, direction, pw, false, [radius / (su + r2), radius / (sv + r2)], uvOffsetCorner(su, sv)[i], center(x, y));

      // Edges
      if (i === 0 || i === 2) {
        // Left / Right
        computePlane(geometry, indices, radius, sv, roundSegments, edgeSegments, direction, pw, false, [uvOffset[0], uvScale[1]], ceil === 0 ? uvOffsetStart(su, sv) : uvOffsetEnd(su, sv), center(x, 0));
        // Bottom/Top
        computePlane(geometry, indices, su, radius, edgeSegments, roundSegments, direction, pw, false, [uvScale[0], uvOffset[1]], floor === 0 ? [...uvOffsetStart(sv, su)].reverse() : [...uvOffsetEnd(sv, su)].reverse(), center(0, y));
      }
    }
  }
  const rx = widthX * 0.5;
  const ry = widthY * 0.5;
  const rz = widthZ * 0.5;
  for (let i = 0; i < geometry.positions.length; i += 3) {
    const position = [geometry.positions[i], geometry.positions[i + 1], geometry.positions[i + 2]];
    TMP[0] = position[0];
    TMP[1] = position[1];
    TMP[2] = position[2];
    if (position[0] < -rx) {
      position[0] = -rx;
    } else if (position[0] > rx) {
      position[0] = rx;
    }
    if (position[1] < -ry) {
      position[1] = -ry;
    } else if (position[1] > ry) {
      position[1] = ry;
    }
    if (position[2] < -rz) {
      position[2] = -rz;
    } else if (position[2] > rz) {
      position[2] = rz;
    }
    TMP[0] -= position[0];
    TMP[1] -= position[1];
    TMP[2] -= position[2];
    normalize(TMP);
    geometry.normals[i] = TMP[0];
    geometry.normals[i + 1] = TMP[1];
    geometry.normals[i + 2] = TMP[2];
    geometry.positions[i] = position[0] + radius * TMP[0];
    geometry.positions[i + 1] = position[1] + radius * TMP[1];
    geometry.positions[i + 2] = position[2] + radius * TMP[2];
  }
  return geometry;
}

/**
 * @typedef {Object} CylinderOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [radiusApex=radius]
 * @property {number} [capSegments=1]
 * @property {boolean} [capApex=true]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:cylinder
 * @param {CylinderOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cylinder({
  height = 1,
  radius = 0.25,
  nx = 16,
  ny = 1,
  radiusApex = radius,
  capSegments = 1,
  capApex = true,
  capBase = true,
  capBaseSegments = capSegments,
  phi = TAU
} = {}) {
  checkArguments(arguments);
  let capCount = 0;
  if (capApex) capCount += capSegments;
  if (capBase) capCount += capBaseSegments;
  const segments = nx + 1;
  const slices = ny + 1;
  const size = segments * slices + segments * 2 * capCount;
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))((nx * ny + nx * capCount) * 6);
  let vertexIndex = 0;
  let cellIndex = 0;
  const halfHeight = height / 2;
  const segmentIncrement = 1 / (segments - 1);
  const ringIncrement = 1 / (slices - 1);
  for (let i = 0; i < segments; i++) {
    const u = i * segmentIncrement;
    for (let j = 0; j < slices; j++) {
      const v = j * ringIncrement;
      const p = u * phi;
      const cosPhi = -Math.cos(p);
      const sinPhi = Math.sin(p);
      const r = radius * (1 - v) + radiusApex * v;
      positions[vertexIndex * 3] = r * cosPhi;
      positions[vertexIndex * 3 + 1] = height * v - halfHeight;
      positions[vertexIndex * 3 + 2] = r * sinPhi;
      TMP[0] = height * cosPhi;
      TMP[1] = radius - radiusApex;
      TMP[2] = height * sinPhi;
      normalize(TMP);
      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];
      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;
      vertexIndex++;
    }
  }
  for (let j = 0; j < slices - 1; j++) {
    for (let i = 0; i < segments - 1; i++) {
      cells[cellIndex + 0] = (i + 0) * slices + (j + 0);
      cells[cellIndex + 1] = (i + 1) * slices + (j + 0);
      cells[cellIndex + 2] = (i + 1) * slices + (j + 1);
      cells[cellIndex + 3] = (i + 0) * slices + (j + 0);
      cells[cellIndex + 4] = (i + 1) * slices + (j + 1);
      cells[cellIndex + 5] = (i + 0) * slices + (j + 1);
      cellIndex += 6;
    }
  }
  function computeCap(flip, height, radius, capSegments) {
    const index = vertexIndex;
    const segmentIncrement = 1 / (segments - 1);
    for (let r = 0; r < capSegments; r++) {
      for (let i = 0; i < segments; i++) {
        const p = i * segmentIncrement * phi;
        const cosPhi = -Math.cos(p);
        const sinPhi = Math.sin(p);

        // inner point
        positions[vertexIndex * 3] = radius * cosPhi * r / capSegments;
        positions[vertexIndex * 3 + 1] = height;
        positions[vertexIndex * 3 + 2] = radius * sinPhi * r / capSegments;
        normals[vertexIndex * 3 + 1] = -flip;
        uvs[vertexIndex * 2] = 0.5 * cosPhi * r / capSegments + 0.5;
        uvs[vertexIndex * 2 + 1] = 0.5 * sinPhi * r / capSegments + 0.5;
        vertexIndex++;

        // outer point
        positions[vertexIndex * 3] = radius * cosPhi * (r + 1) / capSegments;
        positions[vertexIndex * 3 + 1] = height;
        positions[vertexIndex * 3 + 2] = radius * sinPhi * (r + 1) / capSegments;
        normals[vertexIndex * 3 + 1] = -flip;
        uvs[vertexIndex * 2] = 0.5 * (cosPhi * (r + 1)) / capSegments + 0.5;
        uvs[vertexIndex * 2 + 1] = 0.5 * (sinPhi * (r + 1)) / capSegments + 0.5;
        vertexIndex++;
      }
    }
    for (let r = 0; r < capSegments; r++) {
      for (let i = 0; i < segments - 1; i++) {
        const n = index + r * segments * 2 + i * 2;
        const a = n + 0;
        const b = n + 1;
        const c = n + 2;
        const d = n + 3;
        if (flip === 1) {
          cells[cellIndex] = a;
          cells[cellIndex + 1] = c;
          cells[cellIndex + 2] = d;
          cells[cellIndex + 3] = a;
          cells[cellIndex + 4] = d;
          cells[cellIndex + 5] = b;
        } else {
          cells[cellIndex + 0] = a;
          cells[cellIndex + 1] = d;
          cells[cellIndex + 2] = c;
          cells[cellIndex + 3] = a;
          cells[cellIndex + 4] = b;
          cells[cellIndex + 5] = d;
        }
        cellIndex += 6;
      }
    }
  }
  if (capBase) computeCap(1, -halfHeight, radius, capBaseSegments);
  if (capApex) computeCap(-1, halfHeight, radiusApex, capSegments);
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @module cone
 */

/**
 * @typedef {Object} ConeOptions
 * @property {number} [height=1]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [capSegments=1]
 * @property {boolean} [capBase=true]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:cone
 * @param {ConeOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function cone({
  height,
  radius,
  nx,
  ny,
  capSegments,
  capBase,
  phi
} = {}) {
  checkArguments(arguments);
  return cylinder({
    height,
    radius,
    nx,
    ny,
    capSegments,
    capBase,
    phi,
    radiusApex: 0,
    capApex: false
  });
}

/**
 * @typedef {Object} CapsuleOptions
 * @property {number} [height=0.5]
 * @property {number} [radius=0.25]
 * @property {number} [nx=16]
 * @property {number} [ny=1]
 * @property {number} [roundSegments=32]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:capsule
 * @param {CapsuleOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */

function capsule({
  height = 0.5,
  radius = 0.25,
  nx = 16,
  ny = 1,
  roundSegments = 16,
  phi = TAU
} = {}) {
  checkArguments(arguments);
  const ringsBody = ny + 1;
  const ringsCap = roundSegments * 2;
  const ringsTotal = ringsCap + ringsBody;
  const size = ringsTotal * nx;
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))((ringsTotal - 1) * (nx - 1) * 6);
  let vertexIndex = 0;
  let cellIndex = 0;
  const segmentIncrement = 1 / (nx - 1);
  const ringIncrement = 1 / (ringsCap - 1);
  const bodyIncrement = 1 / (ringsBody - 1);
  function computeRing(r, y, dy) {
    for (let s = 0; s < nx; s++, vertexIndex++) {
      const x = -Math.cos(s * segmentIncrement * phi) * r;
      const z = Math.sin(s * segmentIncrement * phi) * r;
      const py = radius * y + height * dy;
      positions[vertexIndex * 3] = radius * x;
      positions[vertexIndex * 3 + 1] = py;
      positions[vertexIndex * 3 + 2] = radius * z;
      normals[vertexIndex * 3] = x;
      normals[vertexIndex * 3 + 1] = y;
      normals[vertexIndex * 3 + 2] = z;
      uvs[vertexIndex * 2] = s * segmentIncrement;
      uvs[vertexIndex * 2 + 1] = 1 - (0.5 - py / (2 * radius + height));
    }
  }
  for (let r = 0; r < roundSegments; r++) {
    computeRing(Math.sin(Math.PI * r * ringIncrement), Math.sin(Math.PI * (r * ringIncrement - 0.5)), -0.5);
  }
  for (let r = 0; r < ringsBody; r++) {
    computeRing(1, 0, r * bodyIncrement - 0.5);
  }
  for (let r = roundSegments; r < ringsCap; r++) {
    computeRing(Math.sin(Math.PI * r * ringIncrement), Math.sin(Math.PI * (r * ringIncrement - 0.5)), 0.5);
  }
  for (let r = 0; r < ringsTotal - 1; r++) {
    for (let s = 0; s < nx - 1; s++) {
      const a = r * nx;
      const b = (r + 1) * nx;
      const s1 = s + 1;
      cells[cellIndex] = a + s;
      cells[cellIndex + 1] = a + s1;
      cells[cellIndex + 2] = b + s1;
      cells[cellIndex + 3] = a + s;
      cells[cellIndex + 4] = b + s1;
      cells[cellIndex + 5] = b + s;
      cellIndex += 6;
    }
  }
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @typedef {Object} EllipsoidOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [rx=1]
 * @property {number} [rx=0.5]
 * @property {number} [rz=ry]
 * @property {number} [theta=Math.PI]
 * @property {number} [phi=TAU]
 */

/**
 * Default to an oblate spheroid.
 * @alias module:ellipsoid
 * @param {EllipsoidOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function ellipsoid({
  radius = 1,
  nx = 32,
  ny = 16,
  rx = 0.5,
  ry = 0.25,
  rz = ry,
  theta = Math.PI,
  phi = TAU
} = {}) {
  checkArguments(arguments);
  const size = (ny + 1) * (nx + 1);
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(ny * nx * 6);
  let vertexIndex = 0;
  let cellIndex = 0;
  for (let y = 0; y <= ny; y++) {
    const v = y / ny;
    const t = v * theta;
    const cosTheta = Math.cos(t);
    const sinTheta = Math.sin(t);
    for (let x = 0; x <= nx; x++) {
      const u = x / nx;
      const p = u * phi;
      const cosPhi = Math.cos(p);
      const sinPhi = Math.sin(p);
      TMP[0] = -rx * cosPhi * sinTheta;
      TMP[1] = -ry * cosTheta;
      TMP[2] = rz * sinPhi * sinTheta;
      positions[vertexIndex * 3] = radius * TMP[0];
      positions[vertexIndex * 3 + 1] = radius * TMP[1];
      positions[vertexIndex * 3 + 2] = radius * TMP[2];
      normalize(TMP);
      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];
      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;
      vertexIndex++;
    }
    if (y > 0) {
      for (let i = vertexIndex - 2 * (nx + 1); i + nx + 2 < vertexIndex; i++) {
        const a = i;
        const b = i + 1;
        const c = i + nx + 1;
        const d = i + nx + 2;
        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = c;
        cells[cellIndex + 3] = c;
        cells[cellIndex + 4] = b;
        cells[cellIndex + 5] = d;
        cellIndex += 6;
      }
    }
  }
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @module sphere
 */

/**
 * @typedef {Object} SphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [nx=32]
 * @property {number} [ny=16]
 * @property {number} [theta=Math.PI]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:sphere
 * @param {SphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function sphere({
  radius = 0.5,
  nx = 32,
  ny = 16,
  theta,
  phi
} = {}) {
  checkArguments(arguments);
  return ellipsoid({
    radius,
    nx,
    ny,
    theta,
    phi,
    rx: 1,
    ry: 1
  });
}

const f = 0.5 + Math.sqrt(5) / 2;

/**
 * @typedef {Object} IcosphereOptions
 * @property {number} [radius=0.5]
 * @property {number} [subdivisions=2]
 */

/**
 * @alias module:icosphere
 * @param {IcosphereOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function icosphere({
  radius = 0.5,
  subdivisions = 2
} = {}) {
  checkArguments(arguments);
  if (subdivisions > 10) throw new Error("Max subdivisions is 10.");
  const T = Math.pow(4, subdivisions);
  const numVertices = 10 * T + 2;
  const numDuplicates = subdivisions === 0 ? 3 : Math.pow(2, subdivisions) * 3 + 9;
  const size = numVertices + numDuplicates;
  const positions = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);

  // prettier-ignore
  positions.set(Float32Array.of(-1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0, 0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1));
  // prettier-ignore
  let cells = Uint16Array.of(0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7);
  let vertexIndex = 12;
  const midCache = subdivisions ? {} : null;
  function addMidPoint(a, b) {
    // Cantor's pairing function
    const key = Math.floor((a + b) * (a + b + 1) / 2 + Math.min(a, b));
    const i = midCache[key];
    if (i !== undefined) {
      delete midCache[key];
      return i;
    }
    midCache[key] = vertexIndex;
    positions[3 * vertexIndex + 0] = (positions[3 * a + 0] + positions[3 * b + 0]) * 0.5;
    positions[3 * vertexIndex + 1] = (positions[3 * a + 1] + positions[3 * b + 1]) * 0.5;
    positions[3 * vertexIndex + 2] = (positions[3 * a + 2] + positions[3 * b + 2]) * 0.5;
    return vertexIndex++;
  }
  let cellsPrev = cells;
  const IndexArray = subdivisions > 5 ? Uint32Array : getCellsTypedArray(size);

  // Subdivide
  for (let i = 0; i < subdivisions; i++) {
    const prevLen = cellsPrev.length;
    cells = new IndexArray(prevLen * 4);
    for (let k = 0; k < prevLen; k += 3) {
      const v1 = cellsPrev[k + 0];
      const v2 = cellsPrev[k + 1];
      const v3 = cellsPrev[k + 2];
      const a = addMidPoint(v1, v2);
      const b = addMidPoint(v2, v3);
      const c = addMidPoint(v3, v1);
      cells[k * 4 + 0] = v1;
      cells[k * 4 + 1] = a;
      cells[k * 4 + 2] = c;
      cells[k * 4 + 3] = v2;
      cells[k * 4 + 4] = b;
      cells[k * 4 + 5] = a;
      cells[k * 4 + 6] = v3;
      cells[k * 4 + 7] = c;
      cells[k * 4 + 8] = b;
      cells[k * 4 + 9] = a;
      cells[k * 4 + 10] = b;
      cells[k * 4 + 11] = c;
    }
    cellsPrev = cells;
  }

  // Normalize
  for (let i = 0; i < numVertices * 3; i += 3) {
    const v1 = positions[i + 0];
    const v2 = positions[i + 1];
    const v3 = positions[i + 2];
    const m = 1 / Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
    positions[i + 0] *= m;
    positions[i + 1] *= m;
    positions[i + 2] *= m;
  }
  for (let i = 0; i < numVertices; i++) {
    uvs[2 * i + 0] = -Math.atan2(positions[3 * i + 2], positions[3 * i]) / TAU + 0.5;
    uvs[2 * i + 1] = Math.asin(positions[3 * i + 1]) / Math.PI + 0.5;
  }
  const duplicates = {};
  function addDuplicate(i, uvx, uvy, cached) {
    if (cached) {
      const dupe = duplicates[i];
      if (dupe !== undefined) return dupe;
    }
    positions[3 * vertexIndex + 0] = positions[3 * i + 0];
    positions[3 * vertexIndex + 1] = positions[3 * i + 1];
    positions[3 * vertexIndex + 2] = positions[3 * i + 2];
    uvs[2 * vertexIndex + 0] = uvx;
    uvs[2 * vertexIndex + 1] = uvy;
    if (cached) duplicates[i] = vertexIndex;
    return vertexIndex++;
  }
  for (let i = 0; i < cells.length; i += 3) {
    const a = cells[i + 0];
    const b = cells[i + 1];
    const c = cells[i + 2];
    let ax = uvs[2 * a];
    let bx = uvs[2 * b];
    let cx = uvs[2 * c];
    const ay = uvs[2 * a + 1];
    const by = uvs[2 * b + 1];
    const cy = uvs[2 * c + 1];
    if (ax - bx >= 0.5 && ay !== 1) bx += 1;
    if (bx - cx > 0.5) cx += 1;
    if (ax < 0.5 && cx - ax > 0.5 || ax === 1 && cy === 0) ax += 1;
    if (bx < 0.5 && ax - bx > 0.5) bx += 1;

    // Poles
    const isPoleA = ay === 0 || ay === 1;
    const isPoleB = by === 0 || by === 1;
    const isPoleC = cy === 0 || cy === 1;
    if (isPoleA) {
      ax = (bx + cx) * 0.5;
      if (ay === 1 - bx) {
        uvs[2 * a] = ax;
      } else {
        cells[i + 0] = addDuplicate(a, ax, ay, false);
      }
    } else if (isPoleB) {
      bx = (ax + cx) * 0.5;
      if (by === ax) {
        uvs[2 * b] = bx;
      } else {
        cells[i + 1] = addDuplicate(b, bx, by, false);
      }
    } else if (isPoleC) {
      cx = (ax + bx) * 0.5;
      if (cy === ax) {
        uvs[2 * c] = cx;
      } else {
        cells[i + 2] = addDuplicate(c, cx, cy, false);
      }
    }

    // Seam zipper
    if (ax !== uvs[2 * a] && !isPoleA) {
      cells[i + 0] = addDuplicate(a, ax, ay, true);
    }
    if (bx !== uvs[2 * b] && !isPoleB) {
      cells[i + 1] = addDuplicate(b, bx, by, true);
    }
    if (cx !== uvs[2 * c] && !isPoleC) {
      cells[i + 2] = addDuplicate(c, cx, cy, true);
    }
  }
  return {
    positions: positions.map(v => v * radius),
    normals: positions,
    uvs,
    cells
  };
}

/**
 * @typedef {Object} TorusOptions
 * @property {number} [radius=0.4]
 * @property {number} [segments=64]
 * @property {number} [minorRadius=0.1]
 * @property {number} [minorSegments=32]
 * @property {number} [theta=TAU]
 * @property {number} [phi=TAU]
 */

/**
 * @alias module:torus
 * @param {TorusOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function torus({
  radius = 0.4,
  segments = 64,
  minorRadius = 0.1,
  minorSegments = 32,
  theta = TAU,
  phi = TAU
} = {}) {
  checkArguments(arguments);
  const size = (minorSegments + 1) * (segments + 1);
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(minorSegments * segments * 6);
  let vertexIndex = 0;
  let cellIndex = 0;
  for (let j = 0; j <= minorSegments; j++) {
    const v = j / minorSegments;
    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const u = i / segments;
      const p = u * phi;
      const cosPhi = -Math.cos(p);
      const sinPhi = Math.sin(p);
      const t = v * theta;
      const cosTheta = -Math.cos(t);
      const sinTheta = Math.sin(t);
      TMP[0] = (radius + minorRadius * cosTheta) * cosPhi;
      TMP[1] = (radius + minorRadius * cosTheta) * sinPhi;
      TMP[2] = minorRadius * sinTheta;
      positions[vertexIndex * 3] = TMP[0];
      positions[vertexIndex * 3 + 1] = TMP[1];
      positions[vertexIndex * 3 + 2] = TMP[2];
      TMP[0] -= radius * cosPhi;
      TMP[1] -= radius * sinPhi;
      normalize(TMP);
      normals[vertexIndex * 3] = TMP[0];
      normals[vertexIndex * 3 + 1] = TMP[1];
      normals[vertexIndex * 3 + 2] = TMP[2];
      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;
      if (j > 0 && i > 0) {
        const a = (segments + 1) * j + i - 1;
        const b = (segments + 1) * (j - 1) + i - 1;
        const c = (segments + 1) * (j - 1) + i;
        const d = (segments + 1) * j + i;
        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = d;
        cells[cellIndex + 3] = b;
        cells[cellIndex + 4] = c;
        cells[cellIndex + 5] = d;
        cellIndex += 6;
      }
    }
  }
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @module tetrahedron
 */

/**
 * @typedef {Object} TetrahedronOptions
 * @property {number} [radius=0.5]
 */

/**
 * @alias module:tetrahedron
 * @param {TetrahedronOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function tetrahedron({
  radius = 0.5
} = {}) {
  checkArguments(arguments);
  return cylinder({
    height: radius * 1.5,
    radius,
    nx: 3,
    ny: 1,
    radiusApex: 0,
    capSegments: 0,
    capApex: false,
    capBaseSegments: 1
  });
}

/**
 * @module icosahedron
 */

/**
 * @typedef {Object} IcosahedronOptions
 * @property {number} [radius=0.5]
 */

/**
 * @alias module:icosahedron
 * @param {IcosahedronOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function icosahedron({
  radius
} = {}) {
  checkArguments(arguments);
  return icosphere({
    subdivisions: 0,
    radius
  });
}

/**
 * @typedef {Object} DiscOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 */

/**
 * @alias module:disc
 * @param {DiscOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function disc({
  radius = 0.5,
  segments = 32,
  theta = TAU
} = {}) {
  checkArguments(arguments);
  const size = segments + 2;
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))((size + 2) * 3);

  // Center
  normals[2] = 1;
  uvs[0] = 0.5;
  uvs[1] = 0.5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * theta;
    positions[(i + 1) * 3] = radius * Math.cos(t);
    positions[(i + 1) * 3 + 1] = radius * Math.sin(t);
    normals[(i + 1) * 3 + 2] = 1;
    uvs[(i + 1) * 2] = (positions[(i + 1) * 3] / radius + 1) / 2;
    uvs[(i + 1) * 2 + 1] = (positions[(i + 1) * 3 + 1] / radius + 1) / 2;
    cells[(i + 1) * 3] = i;
    cells[(i + 1) * 3 + 1] = i + 1;
  }
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @typedef {Object} AnnulusOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [innerRadius=radius * 0.5]
 * @property {number} [innerSegments=1]
 */

/**
 * @alias module:annulus
 * @param {AnnulusOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function annulus({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  innerRadius = radius * 0.5,
  innerSegments = 1
} = {}) {
  checkArguments(arguments);
  const size = (segments + 1) * (innerSegments + 1);
  const positions = new Float32Array(size * 3);
  const normals = new Float32Array(size * 3);
  const uvs = new Float32Array(size * 2);
  const cells = new (getCellsTypedArray(size))(size * 6);
  let vertexIndex = 0;
  let cellIndex = 0;
  for (let j = 0; j <= innerSegments; j++) {
    const r = innerRadius + (radius - innerRadius) * (j / innerSegments);
    for (let i = 0; i <= segments; i++, vertexIndex++) {
      const t = i / segments * theta;
      positions[vertexIndex * 3] = r * Math.cos(t);
      positions[vertexIndex * 3 + 1] = r * Math.sin(t);
      normals[vertexIndex * 3 + 2] = 1;
      uvs[vertexIndex * 2] = (positions[vertexIndex * 3] / radius + 1) / 2;
      uvs[vertexIndex * 2 + 1] = (positions[vertexIndex * 3 + 1] / radius + 1) / 2;
      if (i < segments && j < innerSegments) {
        const a = j * (segments + 1) + i;
        const b = a + segments + 1;
        const c = a + segments + 2;
        const d = a + 1;
        cells[cellIndex] = a;
        cells[cellIndex + 1] = b;
        cells[cellIndex + 2] = d;
        cells[cellIndex + 3] = b;
        cells[cellIndex + 4] = c;
        cells[cellIndex + 5] = d;
        cellIndex += 6;
      }
    }
  }
  return {
    positions,
    normals,
    uvs,
    cells
  };
}

/**
 * @typedef {Object} BoxOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 */

/**
 * @alias module:box
 * @param {BoxOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function box({
  sx = 1,
  sy = sx,
  sz = sx
} = {}) {
  checkArguments(arguments);
  const x = sx / 2;
  const y = sy / 2;
  const z = sz / 2;
  return {
    // prettier-ignore
    positions: Float32Array.of(-x, y, z, -x, -y, z, x, -y, z, x, y, z,
    // -z
    x, y, -z, x, -y, -z, -x, -y, -z, -x, y, -z),
    // prettier-ignore
    cells: Uint8Array.of(0, 1, 2, 3,
    // +z
    3, 2, 5, 4,
    // +x
    4, 5, 6, 7,
    // -z
    7, 6, 1, 0,
    // -x
    7, 0, 3, 4,
    // +y
    1, 6, 5, 2 // -y
    )
  };
}

/**
 * @typedef {Object} CircleOptions
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {boolean} [closed=false]
 */

/**
 * @alias module:circle
 * @param {CircleOptions} [options={}]
 * @returns {import("../types.js").BasicSimplicialComplex}
 */
function circle({
  radius = 0.5,
  segments = 32,
  theta = TAU,
  closed = false
} = {}) {
  checkArguments(arguments);
  const positions = new Float32Array(segments * 2);
  const cells = new (getCellsTypedArray(segments))((segments - (closed ? 0 : 1)) * 2);
  for (let i = 0; i < segments; i++) {
    const t = i / segments * theta;
    positions[i * 2] = radius * Math.cos(t);
    positions[i * 2 + 1] = radius * Math.sin(t);
    if (i > 0) {
      cells[(i - 1) * 2] = i - 1;
      cells[(i - 1) * 2 + 1] = i;
    }
  }
  if (closed) {
    cells[(segments - 1) * 2] = segments - 1;
    cells[(segments - 1) * 2 + 1] = 0;
  }
  return {
    positions,
    cells
  };
}

export { annulus, box, capsule, circle, cone, cube, cylinder, disc, ellipsoid, icosahedron, icosphere, plane, quad, roundedCube, sphere, tetrahedron, torus, utils };
