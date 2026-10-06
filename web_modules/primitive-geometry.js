import { n as __exportAll } from "./_chunks/rolldown-runtime-og5q1MHW.js";

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} QuadGridOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {import("../../../types.js").PositiveInteger} [nx=10]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
*/
/**
* A grid of quads.
*
* @param {QuadGridOptions} [options={}]
* @returns {import("../../../types.js").PolygonalComplex}
*/
function quadGrid({ sx = 1, sy = sx, nx = 10, ny = nx } = {}) {
	const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
	const cells = [];
	let vertexIndex = 0;
	for (let row = 0; row <= ny; row++) {
		const y = -sy / 2 + row * sy / ny;
		for (let col = 0; col <= nx; col++) {
			const x = -sx / 2 + col * sx / nx;
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			if (row < ny && col < nx) {
				const o = vertexIndex + nx + 1;
				cells.push([
					vertexIndex,
					vertexIndex + 1,
					o + 1,
					o
				]);
			}
			vertexIndex++;
		}
	}
	return {
		positions,
		cells
	};
}

/**
* @module utils
* @ignore
*/
/**
* Two times PI.
*
* @constant {number}
*/
const TAU = Math.PI * 2;
/**
* Half of PI.
*
* @constant {number}
*/
const HALF_PI = Math.PI / 2;
/**
* Square root of 2.
*
* @constant {number}
*/
const SQRT2 = Math.sqrt(2);
/**
* Square root of 3.
*
* @constant {number}
*/
const SQRT3 = Math.sqrt(3);
/**
* Square root of 6.
*
* @constant {number}
*/
const SQRT6 = Math.sqrt(6);
/**
* Golden ratio: (1 + √5) / 2.
*
* @constant {number}
*/
const PHI = (1 + Math.sqrt(5)) / 2;
/**
* Regular {points/density} star polygon inner to outer radius ratio.
*
* @private
* @param {number} points
* @param {number} [density=2]
* @returns {number}
* @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
*/
function computeStarRatio(points, density = 2) {
	return Math.cos(density * Math.PI / points) / Math.cos((density - 1) * Math.PI / points);
}
/**
* Normalize a vector 3.
*
* @private
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
* Restrict a value to [min, max].
*
* @private
* @param {number} value
* @param {number} min
* @param {number} max
* @returns {number}
*/
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
/**
* Clamp a meridian sweep within [0, PI] so poles only sit at its ends.
*
* @private
* @param {number} theta
* @param {number} thetaOffset
* @returns {[number, number] | undefined} Theta, thetaOffset
*/
function clampMeridianSweep(theta, thetaOffset) {
	const clampedThetaOffset = clamp(thetaOffset, 0, Math.PI);
	return [clamp(theta, -clampedThetaOffset, Math.PI - clampedThetaOffset), clampedThetaOffset];
}
/**
* Linear interpolation between a and b at t.
*
* @private
* @param {number} a
* @param {number} b
* @param {number} t
* @returns {number}
*/
function lerp(a, b, t) {
	return a + (b - a) * t;
}
/**
* Snap a near-zero value to 0: trig at multiples of PI/2 isn't exact, which
* cracks welds and blows up under negative `signedPow` exponents.
*
* @private
* @param {number} x
* @returns {number}
*/
function snapToZero(x) {
	return Math.abs(x) < 1e-9 ? 0 : x;
}
/**
* Sign(x) * |x|^e, and 0 at x = 0 rather than `0 ** negative` or `0 ** 0`.
*
* @private
* @param {number} x
* @param {number} e
* @returns {number}
*/
function signedPow(x, e) {
	return x === 0 ? 0 : Math.sign(x) * Math.abs(x) ** e;
}
/** @private */
function cross$1(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}
/** @private */
function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
const SLERP_MIN_ANGLE = 1e-6;
const BARYCENTRIC_MIN_WEIGHT = 1e-9;
/**
* Point on the great circle between unit vectors p and q, at fraction t.
*
* @private
*/
function slerp(p, q, t) {
	const cosTheta = Math.min(1, Math.max(-1, dot(p, q)));
	const theta = Math.acos(cosTheta);
	if (theta < SLERP_MIN_ANGLE) return normalize([...p]);
	const sinTheta = Math.sin(theta);
	const wp = Math.sin((1 - t) * theta) / sinTheta;
	const wq = Math.sin(t * theta) / sinTheta;
	return [
		p[0] * wp + q[0] * wq,
		p[1] * wp + q[1] * wq,
		p[2] * wp + q[2] * wq
	];
}
/**
* Barycentric point (weight v toward uB, w toward uC) on a spherical triangle
* of unit vectors, via nested slerp along BC then A to that point.
*
* @private
*/
function slerpTriangle(uA, uB, uC, v, w) {
	return v + w < BARYCENTRIC_MIN_WEIGHT ? normalize([...uA]) : slerp(uA, slerp(uB, uC, w / (v + w)), v + w);
}
/**
* A single triangle covering clip space, for fullscreen passes. xy positions
* only.
*
* @returns {{ positions: Float32Array }}
*/
function fullscreenTriangle() {
	return { positions: Float32Array.of(-1, -1, 3, -1, -1, 3) };
}
/** @private */
let TYPED_ARRAY_TYPE;
/**
* Enforce a typed array constructor for cells.
*
* @param {Class<Uint8Array> | Class<Uint16Array> | Class<Uint32Array>} type
*/
function setTypedArrayType(type) {
	TYPED_ARRAY_TYPE = type;
}
/**
* Select the smallest cells typed array fitting `size`.
*
* @param {number} size The max value expected
* @returns {Uint8Array | Uint16Array | Uint32Array}
* @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
*/
const getCellsTypedArray = (size) => TYPED_ARRAY_TYPE || (size <= 255 ? Uint8Array : size <= 65535 ? Uint16Array : Uint32Array);
/**
* Fan-triangulate convex, planar polygon cells.
*
* @param {import("../../types.js").TypedArrayLike[]} cells
* @param {number} numVertices Picks the typed array size
* @returns {Uint8Array | Uint16Array | Uint32Array}
*/
function triangulateFaces(cells, numVertices) {
	let numTriangles = 0;
	for (const face of cells) numTriangles += face.length - 2;
	const triangles = new (getCellsTypedArray(numVertices))(numTriangles * 3);
	let index = 0;
	for (const face of cells) {
		const anchor = face.at(-1);
		for (let i = 0; i < face.length - 2; i++) {
			triangles[index] = anchor;
			triangles[index + 1] = face[i];
			triangles[index + 2] = face[i + 1];
			index += 3;
		}
	}
	return triangles;
}
/**
* Concatenate geometries, without welding coincident positions.
*
* @param {import("../../types.js").SimplicialComplex[]} geometries
* @returns {import("../../types.js").SimplicialComplex}
*/
function concatGeometries(geometries) {
	let vertexCount = 0;
	let cellCount = 0;
	for (const { positions, cells } of geometries) {
		vertexCount += positions.length / 3;
		cellCount += cells.length;
	}
	const positions = new Float32Array(vertexCount * 3);
	const normals = new Float32Array(vertexCount * 3);
	const uvs = new Float32Array(vertexCount * 2);
	const cells = new (getCellsTypedArray(vertexCount))(cellCount);
	let vertexOffset = 0;
	let cellIndex = 0;
	for (const geometry of geometries) {
		positions.set(geometry.positions, vertexOffset * 3);
		normals.set(geometry.normals, vertexOffset * 3);
		uvs.set(geometry.uvs, vertexOffset * 2);
		for (let i = 0; i < geometry.cells.length; i++, cellIndex++) cells[cellIndex] = geometry.cells[i] + vertexOffset;
		vertexOffset += geometry.positions.length / 3;
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* Flip a geometry inside out: negated normals, reversed winding.
*
* @param {import("../../types.js").SimplicialComplex} geometry
* @returns {import("../../types.js").SimplicialComplex}
*/
function invert({ positions, normals, uvs, cells }) {
	const invertedNormals = new Float32Array(normals.length);
	for (let i = 0; i < normals.length; i++) invertedNormals[i] = -normals[i];
	const invertedCells = cells.slice();
	for (let i = 0; i < invertedCells.length; i += 3) {
		const tmp = invertedCells[i + 1];
		invertedCells[i + 1] = invertedCells[i + 2];
		invertedCells[i + 2] = tmp;
	}
	return {
		positions,
		normals: invertedNormals,
		uvs,
		cells: invertedCells
	};
}
/** @private */
function point(positions, index) {
	return [
		positions[index * 3],
		positions[index * 3 + 1],
		positions[index * 3 + 2]
	];
}
/** @private */
function subtract(positions, a, b) {
	return [
		positions[a * 3] - positions[b * 3],
		positions[a * 3 + 1] - positions[b * 3 + 1],
		positions[a * 3 + 2] - positions[b * 3 + 2]
	];
}
/**
* Per-face flat normal and tangent basis, for planar uv unwrapping.
*
* @private
*/
function computeFaceContext(seedPositions, face) {
	const normal = [
		0,
		0,
		0
	];
	for (let i = 0; i < face.length; i++) {
		const a = point(seedPositions, face[i]);
		const b = point(seedPositions, face[(i + 1) % face.length]);
		normal[0] += (a[1] - b[1]) * (a[2] + b[2]);
		normal[1] += (a[2] - b[2]) * (a[0] + b[0]);
		normal[2] += (a[0] - b[0]) * (a[1] + b[1]);
	}
	normalize(normal);
	const v = normalize(subtract(seedPositions, face[0], face[1]));
	const u = cross$1(v, normal);
	const centroid = [
		0,
		0,
		0
	];
	for (const index of face) {
		centroid[0] += seedPositions[index * 3];
		centroid[1] += seedPositions[index * 3 + 1];
		centroid[2] += seedPositions[index * 3 + 2];
	}
	centroid[0] /= face.length;
	centroid[1] /= face.length;
	centroid[2] /= face.length;
	let extent = 0;
	for (const index of face) {
		const p = [
			seedPositions[index * 3] - centroid[0],
			seedPositions[index * 3 + 1] - centroid[1],
			seedPositions[index * 3 + 2] - centroid[2]
		];
		extent = Math.max(extent, Math.abs(dot(p, u)), Math.abs(dot(p, v)));
	}
	return {
		normal,
		u,
		v,
		centroid,
		extent: extent || 1
	};
}
/**
* Point on edge (a, b) at k/S from a to b, canonicalized on min(a, b) so two
* faces sharing this edge compute bit-identical floats regardless of winding.
*
* @private
*/
function edgePoint(seedPositions, a, b, k, S, slerped) {
	const lo = Math.min(a, b);
	const hi = Math.max(a, b);
	const t = (a < b ? k : S - k) / S;
	const p = [
		seedPositions[lo * 3],
		seedPositions[lo * 3 + 1],
		seedPositions[lo * 3 + 2]
	];
	const q = [
		seedPositions[hi * 3],
		seedPositions[hi * 3 + 1],
		seedPositions[hi * 3 + 2]
	];
	if (slerped) return slerp(normalize(p), normalize(q), t);
	const t1 = 1 - t;
	return [
		p[0] * t1 + q[0] * t,
		p[1] * t1 + q[1] * t,
		p[2] * t1 + q[2] * t
	];
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TriangularGridOptions
* @property {number} [sx=1]
* @property {import("../../../types.js").PositiveInteger} [nx=10]
* @property {import("../../../types.js").PositiveInteger} [ny=10]
* @property {boolean} [inscribed=true]
*/
/**
* An isometric grid of equilateral triangles.
*
* @param {TriangularGridOptions} [options={}]
* @returns {import("../../../types.js").PolygonalComplex}
*/
function triangularGrid({ sx = 1, nx = 10, ny = 10, inscribed = true } = {}) {
	const dx = sx / nx;
	const dy = dx * SQRT3 / 2;
	const halfHeight = ny * dy / 2;
	const positions = [];
	const cells = [];
	const rowStart = [];
	const addRow = (row) => {
		const odd = row % 2 === 1;
		const y = row * dy - halfHeight;
		const offset = odd ? dx / 2 : 0;
		const count = odd ? nx : nx + 1;
		rowStart.push(positions.length / 3);
		for (let col = 0; col < count; col++) positions.push(-sx / 2 + offset + col * dx, y, 0);
	};
	const addRowCells = (smallStart, bigStart, offsetIsLower) => {
		for (let col = 0; col < nx; col++) {
			const s = smallStart + col;
			const b0 = bigStart + col;
			const b1 = bigStart + col + 1;
			cells.push(offsetIsLower ? [
				s,
				b1,
				b0
			] : [
				s,
				b0,
				b1
			]);
		}
		for (let col = 0; col < nx - 1; col++) {
			const s0 = smallStart + col;
			const s1 = smallStart + col + 1;
			const b1 = bigStart + col + 1;
			cells.push(offsetIsLower ? [
				s0,
				s1,
				b1
			] : [
				s1,
				s0,
				b1
			]);
		}
	};
	const addInscribedEdges = () => {
		for (let row = 1; row < ny; row += 2) cells.push([
			rowStart[row - 1],
			rowStart[row],
			rowStart[row + 1]
		], [
			rowStart[row - 1] + nx,
			rowStart[row + 1] + nx,
			rowStart[row] + nx - 1
		]);
		if (ny % 2 !== 1) return;
		const topLeft = positions.length / 3;
		positions.push(-sx / 2, halfHeight, 0);
		const topRight = topLeft + 1;
		positions.push(sx / 2, halfHeight, 0);
		cells.push([
			rowStart[ny - 1],
			rowStart[ny],
			topLeft
		], [
			rowStart[ny - 1] + nx,
			topRight,
			rowStart[ny] + nx - 1
		]);
	};
	for (let row = 0; row <= ny; row++) addRow(row);
	for (let row = 0; row < ny; row++) {
		const offsetIsLower = row % 2 === 1;
		addRowCells(rowStart[offsetIsLower ? row : row + 1], rowStart[offsetIsLower ? row + 1 : row], offsetIsLower);
	}
	if (inscribed) addInscribedEdges();
	return {
		positions: Float32Array.from(positions),
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
const WELD_KEY_SCALE = 1e9;
/**
* @typedef {object} HexagonalGridOptions
* @property {number} [sx=1]
* @property {import("../../../types.js").PositiveInteger} [nx=10]
* @property {import("../../../types.js").PositiveInteger} [ny=10]
* @property {boolean} [inscribed=true]
*/
/**
* A grid of regular hexagons.
*
* @param {HexagonalGridOptions} [options={}]
* @returns {import("../../../types.js").PolygonalComplex}
*/
function hexagonalGrid({ sx = 1, nx = 10, ny = 10, inscribed = true } = {}) {
	const dx = sx / nx;
	const r = dx / SQRT3;
	const dy = 1.5 * r;
	const leftBound = -dx / 2;
	const rightBound = (nx - 1) * dx + dx / 2;
	const topBound = (ny - 1) * dy + r / 2;
	const bottomBound = -r / 2;
	const cornerOffsets = [
		[0, r],
		[-dx / 2, r / 2],
		[-dx / 2, -r / 2],
		[0, -r],
		[dx / 2, -r / 2],
		[dx / 2, r / 2]
	];
	const centerX = (leftBound + rightBound + (inscribed || ny === 1 ? 0 : dx / 2)) / 2;
	const centerY = (bottomBound + topBound) / 2;
	const cache = /* @__PURE__ */ new Map();
	const positions = [];
	const cells = [];
	const getVertex = (x, y) => {
		const key = `${Math.round(x / dx * WELD_KEY_SCALE)}_${Math.round(y / dx * WELD_KEY_SCALE)}`;
		let index = cache.get(key);
		if (index === void 0) {
			index = positions.length / 3;
			positions.push(x - centerX, y - centerY, 0);
			cache.set(key, index);
		}
		return index;
	};
	const corner = (row, col, k) => {
		const rowOffset = row % 2 * (dx / 2);
		let x = col * dx + rowOffset + cornerOffsets[k][0];
		let y = row * dy + cornerOffsets[k][1];
		if (inscribed) {
			if (rowOffset > 0 && col === nx - 1 && (k === 4 || k === 5)) x = rightBound;
			if (row === ny - 1 && k === 0) y = topBound;
			else if (row === 0 && k === 3) y = bottomBound;
		}
		return getVertex(x, y);
	};
	for (let row = 0; row < ny; row++) {
		const rowOffset = row % 2 * (dx / 2);
		for (let col = 0; col < nx; col++) {
			const face = [];
			for (let k = 0; k < 6; k++) face.push(corner(row, col, k));
			cells.push(face);
		}
		if (inscribed && rowOffset > 0) {
			if (row <= ny - 2) cells.push([
				corner(row - 1, 0, 1),
				corner(row - 1, 0, 0),
				corner(row, 0, 1),
				corner(row + 1, 0, 2)
			]);
			else cells.push([
				corner(row - 1, 0, 1),
				corner(row - 1, 0, 0),
				corner(row, 0, 1),
				getVertex(leftBound, topBound)
			]);
		}
	}
	return {
		positions: Float32Array.from(positions),
		cells
	};
}

/** @module mappings */
var mappings_exports = /* @__PURE__ */ __exportAll({
	circumferential: () => circumferential,
	concentric: () => concentric,
	cornerificTapered2: () => cornerificTapered2,
	elliptical: () => elliptical,
	fgSquircular: () => fgSquircular,
	lamé: () => lamé,
	nonAxial2Pinch: () => nonAxial2Pinch,
	nonAxialHalfPinch: () => nonAxialHalfPinch,
	polar: () => polar,
	radial: () => radial,
	rectangular: () => rectangular,
	spherical: () => spherical,
	squelched: () => squelched,
	squelchedHorizontal: () => squelchedHorizontal,
	squelchedVertical: () => squelchedVertical,
	tapered4: () => tapered4,
	threeSquircular: () => threeSquircular,
	twoSquircular: () => twoSquircular
});
/**
* @callback MappingFn
* @param {object} mappingOptions
* @param {Float32Array} [mappingOptions.uvs]
* @param {number} [mappingOptions.index]
* @param {number} [mappingOptions.x]
* @param {number} [mappingOptions.y]
* @param {number} [mappingOptions.radius]
* @param {number} [mappingOptions.nx]
* @param {number} [mappingOptions.ny]
* @param {number} [mappingOptions.nz]
* @param {number} [mappingOptions.sx]
* @param {number} [mappingOptions.sy]
* @param {number} [mappingOptions.t]
* @param {number} [mappingOptions.radiusRatio]
* @param {number} [mappingOptions.thetaRatio]
* @param {number} [mappingOptions.perimeter] Cap rim length, solid caps only
*/
const safeSqrt = (x) => Math.sqrt(Math.max(x, 0));
const safeDivide = (x, y) => x / (y + Number.EPSILON);
const isNegligeable = (x) => Math.abs(x) < Number.EPSILON * 2;
const remapRectangular = (x, radius) => (x / radius + 1) / 2;
const remap = (x) => (x + 1) / 2;
/** @type {MappingsFn} */
function rectangular({ uvs, index, x, y, radius, sx = 1, sy = 1 }) {
	uvs[index] = remapRectangular(x, radius * sx);
	uvs[index + 1] = remapRectangular(y, radius * sy);
}
/**
* Solid caps only: centered, undistorted and at the same scale as the body's u
* around the rim.
*
* @type {MappingsFn}
*/
function circumferential({ uvs, index, x, y, perimeter }) {
	uvs[index] = .5 + x / perimeter;
	uvs[index + 1] = .5 + y / perimeter;
}
/** @type {MappingsFn} */
function polar({ uvs, index, radiusRatio, thetaRatio }) {
	uvs[index] = radiusRatio;
	uvs[index + 1] = thetaRatio;
}
/** @type {MappingsFn} */
function spherical({ uvs, index, nx, ny, nz }) {
	uvs[index] = -Math.atan2(nz, nx) / TAU + .5;
	uvs[index + 1] = Math.asin(Math.min(1, Math.max(-1, ny))) / Math.PI + .5;
}
/** @type {MappingsFn} */
function radial({ uvs, index, u, v }) {
	const x = safeDivide(Math.sqrt(u ** 2 + v ** 2), Math.max(Math.abs(u), Math.abs(v)));
	uvs[index] = remap(x * u);
	uvs[index + 1] = remap(x * v);
}
const FOUR_OVER_PI = 4 / Math.PI;
/** @type {MappingsFn} */
function concentric({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const x = Math.sqrt(u2 + v2);
	if (u2 > v2) {
		uvs[index] = remap(x * Math.sign(u));
		uvs[index + 1] = remap(x * (FOUR_OVER_PI * Math.atan(safeDivide(v, Math.abs(u)))));
	} else {
		uvs[index] = remap(x * (FOUR_OVER_PI * Math.atan(safeDivide(u, Math.abs(v)))));
		uvs[index + 1] = remap(x * Math.sign(v));
	}
}
/** @type {MappingsFn} */
function lamé({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	uvs[index] = remap(Math.sign(u) * Math.abs(u) ** (1 - u2 - v2));
	uvs[index + 1] = remap(Math.sign(v) * Math.abs(v) ** (1 - u2 - v2));
}
/** @type {MappingsFn} */
function elliptical({ uvs, index, u, v }) {
	const t = u ** 2 - v ** 2;
	const pu1 = .5 * safeSqrt(2 + t + 2 * SQRT2 * u);
	const pu2 = .5 * safeSqrt(2 + t - 2 * SQRT2 * u);
	const pv1 = .5 * safeSqrt(2 - t + 2 * SQRT2 * v);
	const pv2 = .5 * safeSqrt(2 - t - 2 * SQRT2 * v);
	uvs[index] = remap(pu1 - pu2);
	uvs[index + 1] = remap(pv1 - pv2);
}
function fixFGSingularities(uvs, index, u, v) {
	if (isNegligeable(u) || isNegligeable(v)) {
		uvs[index] = remap(u);
		uvs[index + 1] = remap(v);
	} else return true;
}
/** @type {MappingsFn} */
function fgSquircular({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt(uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 4 * u2 * v2)));
	uvs[index] = remap(sign / (v * SQRT2) * sqrtUV);
	uvs[index + 1] = remap(sign / (u * SQRT2) * sqrtUV);
}
/** @type {MappingsFn} */
function twoSquircular({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const sign = Math.sign(u * v);
	const sqrtUV = Math.sqrt(1 - safeSqrt(1 - 4 * u ** 2 * v ** 2));
	uvs[index] = remap(sign / (v * SQRT2) * sqrtUV);
	uvs[index + 1] = remap(sign / (u * SQRT2) * sqrtUV);
}
/** @type {MappingsFn} */
function threeSquircular({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const sqrtUV = Math.sqrt((1 - safeSqrt(1 - 4 * u ** 4 * v2 - 4 * u2 * v ** 4)) / (2 * (u2 + v2)));
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
/** @type {MappingsFn} */
function cornerificTapered2({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt((uv2Sum - Math.sqrt(uv2Sum * (uv2Sum - 4 * u2 * v2 * (2 - u2 - v2)))) / (2 * (2 - u2 - v2)));
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
/** @type {MappingsFn} */
function tapered4({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const divider = 3 - u ** 4 - 2 * u2 * v2 - v ** 4;
	const sqrtUV = Math.sqrt((uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 2 * u2 * v2 * divider))) / divider);
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
const FOURTH_SQRT2 = 2 ** (1 / 4);
/** @type {MappingsFn} */
function nonAxial2Pinch({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = (uv2Sum - 2 * u2 * v2 - safeSqrt((uv2Sum - 4 * u2 * v2) * uv2Sum)) ** (1 / 4);
	if (isNegligeable(v)) {
		uvs[index] = remap(Math.sign(u) * Math.sqrt(Math.abs(u)));
		uvs[index + 1] = remap(safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV);
	} else {
		uvs[index] = remap(safeDivide(sign, v * FOURTH_SQRT2) * sqrtUV);
		uvs[index + 1] = remap(isNegligeable(u) ? Math.sign(v) * Math.sqrt(Math.abs(v)) : safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV);
	}
}
/** @type {MappingsFn} */
function nonAxialHalfPinch({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt(safeDivide(1 - safeSqrt(1 - 4 * u2 * v2 * uv2Sum ** 2), 2 * uv2Sum));
	if (isNegligeable(v)) {
		uvs[index] = remap(Math.sign(u) * u2);
		uvs[index + 1] = remap(safeDivide(sign, u) * sqrtUV);
	} else {
		uvs[index] = remap(safeDivide(sign, v) * sqrtUV);
		uvs[index + 1] = remap(isNegligeable(u) ? Math.sign(v) * v2 : safeDivide(sign, u) * sqrtUV);
	}
}
/** @type {MappingsFn} */
function squelched({ uvs, index, u, v, t }) {
	uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t) ? .5 : remap(u / Math.sqrt(1 - v ** 2));
	uvs[index + 1] = [
		0,
		TAU,
		Math.PI
	].includes(t) ? .5 : remap(v / Math.sqrt(1 - u ** 2));
}
/** @type {MappingsFn} */
function squelchedVertical({ uvs, index, u, v, t }) {
	uvs[index] = remap(u);
	uvs[index + 1] = [
		0,
		TAU,
		Math.PI
	].includes(t) ? .5 : remap(v / Math.sqrt(1 - u ** 2));
}
/** @type {MappingsFn} */
function squelchedHorizontal({ uvs, index, u, v, t }) {
	uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t) ? .5 : remap(u / Math.sqrt(1 - v ** 2));
	uvs[index + 1] = remap(v);
}

/**
* @module utils
* @ignore
*/
/**
* @private
* @typedef {object} CenteredCorners
* @property {number[][]} centeredCorners
* @property {number} cx
* @property {number} cy
*/
/**
* Center corners on their average, returned as (cx, cy) to translate back.
*
* @private
* @param {number[][]} corners
* @returns {CenteredCorners}
*/
function centerCorners(corners) {
	const [cx, cy] = corners.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0]).map((sum) => sum / corners.length);
	return {
		centeredCorners: corners.map(([x, y]) => [x - cx, y - cy]),
		cx,
		cy
	};
}
/**
* Translate positions in place by (dx, dy).
*
* @private
* @param {Float32Array} positions
* @param {number} dx
* @param {number} dy
*/
function translatePositions(positions, dx, dy) {
	for (let i = 0; i < positions.length; i += 3) {
		positions[i] += dx;
		positions[i + 1] += dy;
	}
}
/**
* Point at angle t on an outline of arbitrary corners, one equal sector each.
*
* @private
* @param {number[][]} corners
* @param {number} thetaOffset
* @param {number} t
* @returns {[number, number]}
*/
function computeOutlineEdge(corners, thetaOffset, t) {
	const cornerCount = corners.length;
	const sector = TAU / cornerCount;
	const local = (t - thetaOffset) / sector;
	const corner = Math.floor(local) % cornerCount;
	const frac = local - Math.floor(local);
	const [x0, y0] = corners[corner];
	const [x1, y1] = corners[(corner + 1) % cornerCount];
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
function computeColumnCount(segments, theta) {
	return segments + (theta !== 0 && theta % TAU === 0 ? 0 : 1);
}
function computeCentroidCount(mergeCentroid, mergeSeam, segments, mapCentroid) {
	if (!mergeCentroid) return 0;
	if (mergeSeam) return 1;
	const probe = /* @__PURE__ */ new Float32Array(4);
	mapCentroid(probe, 0, 0);
	mapCentroid(probe, 2, .5);
	return probe[0] === probe[2] && probe[1] === probe[3] ? 1 : segments;
}
function computeRingCells(cells, indices, { ringOffset, cols, segments, centroidCount, fan }) {
	for (let i = 0; i < segments; i++) {
		const i1 = (i + 1) % cols;
		if (fan) {
			cells[indices.cell] = ringOffset + i;
			cells[indices.cell + 1] = ringOffset + i1;
			cells[indices.cell + 2] = centroidCount === 1 ? 0 : i;
			indices.cell += 3;
		} else {
			const a = ringOffset - cols + i;
			const b = ringOffset + i;
			const c = ringOffset + i1;
			const d = ringOffset - cols + i1;
			cells[indices.cell] = a;
			cells[indices.cell + 1] = b;
			cells[indices.cell + 2] = d;
			cells[indices.cell + 3] = b;
			cells[indices.cell + 4] = c;
			cells[indices.cell + 5] = d;
			indices.cell += 6;
		}
	}
}
/**
* Concentric rings at angular columns, fan-triangulated. `equation` maps
* samples to positions, `mapping` (required) to uvs. `mergeSeam: false` keeps a
* separate wrap column, and a centroid per wedge when its uv depends on the
* angle.
*
* @private
*/
function computePolarGeometry({ sx = 1, sy = 1, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = 0, mergeCentroid = true, mergeSeam = true, mapping, equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta] } = {}) {
	const closed = computeColumnCount(segments, theta) === segments;
	const cols = closed && mergeSeam ? segments : segments + 1;
	const mapCentroid = (target, index, thetaRatio) => mapping({
		uvs: target,
		index,
		u: 0,
		v: 0,
		radius,
		radiusRatio: 0,
		thetaRatio,
		t: thetaOffset + thetaRatio * theta,
		x: 0,
		y: 0,
		sx,
		sy
	});
	const centroidCount = computeCentroidCount(mergeCentroid, mergeSeam, segments, mapCentroid);
	const size = centroidCount + (mergeCentroid ? innerSegments : innerSegments + 1) * cols;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(mergeCentroid ? segments * 3 + (innerSegments - 1) * segments * 6 : innerSegments * segments * 6);
	for (let i = 0; i < centroidCount; i++) {
		normals[i * 3 + 2] = 1;
		mapCentroid(uvs, i * 2, centroidCount === 1 ? 0 : (i + .5) / segments);
	}
	const thetaAt = (i) => thetaOffset + (closed && i === segments ? 0 : i / segments) * theta;
	let vertexIndex = centroidCount;
	const indices = { cell: 0 };
	for (let j = mergeCentroid ? 1 : 0; j <= innerSegments; j++) {
		const radiusRatio = j / innerSegments;
		const r = innerRadius + (radius - innerRadius) * radiusRatio;
		const ringOffset = vertexIndex;
		for (let i = 0; i < cols; i++, vertexIndex++) {
			const thetaRatio = i / segments;
			const t = thetaAt(i);
			const cosTheta = Math.cos(t);
			const sinTheta = Math.sin(t);
			const [x, y] = equation({
				rx: sx * r,
				ry: sy * r,
				cosTheta,
				sinTheta,
				s: radiusRatio,
				t
			});
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			normals[vertexIndex * 3 + 2] = 1;
			mapping({
				uvs,
				index: vertexIndex * 2,
				u: radiusRatio * cosTheta,
				v: radiusRatio * sinTheta,
				radius,
				radiusRatio,
				thetaRatio,
				t,
				x,
				y,
				sx,
				sy
			});
		}
		if (j > 0) computeRingCells(cells, indices, {
			ringOffset,
			cols,
			segments,
			centroidCount,
			fan: mergeCentroid && j === 1
		});
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* `computePolarGeometry`'s outline: one ring of points, `closed` repeating
* index 0.
*
* @private
*/
function computePolarPathGeometry({ segments, theta, thetaOffset, closed, equation }) {
	const cols = computeColumnCount(segments, theta);
	const positions = new Float32Array(cols * 3);
	const path = Array.from({ length: cols + (closed ? 1 : 0) });
	for (let i = 0; i < cols; i++) {
		const [x, y] = equation(i / segments * theta + thetaOffset);
		positions[i * 3] = x;
		positions[i * 3 + 1] = y;
		path[i] = i;
	}
	if (closed) path[cols] = 0;
	return {
		positions,
		cells: [path]
	};
}
/**
* Point at angle t on a polygon boundary, its corners scaled per quadrant by
* the factors.
*
* @private
*/
function computePolygonEdge(thetaOffset, cornerCount, rx, ry, t, xFactor = 1, negativeXFactor = 1, yFactor = 1, negativeYFactor = 1) {
	const sector = TAU / cornerCount;
	const local = (t - thetaOffset) / sector;
	const corner = Math.floor(local);
	const frac = local - corner;
	const angle0 = thetaOffset + corner * sector;
	const angle1 = angle0 + sector;
	const x0 = rx * (Math.cos(angle0) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle0);
	const x1 = rx * (Math.cos(angle1) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle1);
	const y0 = ry * (Math.sin(angle0) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle0);
	const y1 = ry * (Math.sin(angle1) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle1);
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
const COLLAPSE_EPSILON = 1e-6;
/**
* Column `i` of `[uMin, uMax]`, Chebyshev-spaced: denser at both ends, where a
* pinching sweep's boundary is steepest.
*
* @private
*/
function computeChebyshevColumn(i, segments, uMin, uMax) {
	return i === 0 ? uMin : i === segments ? uMax : 2 * i === segments ? (uMin + uMax) / 2 : uMin + (1 - Math.cos(Math.PI * i / segments)) / 2 * (uMax - uMin);
}
/**
* Fill between two boundary curves swept along `u`: `bounds(u)` gives `[vMin,
* vMax]`, `point(u, v)` the position.
*
* - A collapsed column (`vMin === vMax`) is one vertex, fanned to its neighbor.
* - `point` must be right-handed for CCW winding, or pass `flip: true`.
* - Uvs default to `(uRatio, vRatio)`. `mapping` receives `(x, y)` relative to
*   `center`.
*
* @private
*/
function computeSweptArc({ segments, innerSegments, uMin, uMax, bounds, point, flip = false, mapping, center = [0, 0], radius = 1, sx = 1, sy = 1 }) {
	const cols = segments + 1;
	const rows = innerSegments + 1;
	const columnBounds = Array.from({ length: cols });
	const collapsed = new Uint8Array(cols);
	let vertexCount = 0;
	for (let i = 0; i < cols; i++) {
		const u = computeChebyshevColumn(i, segments, uMin, uMax);
		const [vMin, vMax] = bounds(u);
		columnBounds[i] = [
			u,
			vMin,
			vMax
		];
		collapsed[i] = Math.abs(vMax - vMin) < COLLAPSE_EPSILON ? 1 : 0;
		vertexCount += collapsed[i] ? 1 : rows;
	}
	const stripCellCount = (i) => collapsed[i] && collapsed[i + 1] ? 0 : collapsed[i] || collapsed[i + 1] ? (rows - 1) * 3 : (rows - 1) * 6;
	let cellCount = 0;
	for (let i = 0; i < segments; i++) cellCount += stripCellCount(i);
	const positions = new Float32Array(vertexCount * 3);
	const normals = new Float32Array(vertexCount * 3);
	const uvs = new Float32Array(vertexCount * 2);
	const cells = new (getCellsTypedArray(vertexCount))(cellCount);
	const columnOffsets = new Int32Array(cols);
	let vertexIndex = 0;
	let cellIndex = 0;
	const writeColumn = (i) => {
		const [u, vMin, vMax] = columnBounds[i];
		const uRatio = i / segments;
		const rowCount = collapsed[i] ? 1 : rows;
		for (let j = 0; j < rowCount; j++, vertexIndex++) {
			const vRatio = collapsed[i] ? .5 : j / innerSegments;
			const v = vMin + (collapsed[i] ? 0 : vRatio) * (vMax - vMin);
			const [x, y] = point(u, v);
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			normals[vertexIndex * 3 + 2] = 1;
			if (mapping) mapping({
				uvs,
				index: vertexIndex * 2,
				x: x - center[0],
				y: y - center[1],
				radius,
				sx,
				sy,
				u,
				v,
				uRatio,
				vRatio
			});
			else {
				uvs[vertexIndex * 2] = uRatio;
				uvs[vertexIndex * 2 + 1] = vRatio;
			}
		}
	};
	for (let i = 0; i < cols; i++) {
		columnOffsets[i] = vertexIndex;
		writeColumn(i);
	}
	const [rim0, rim1] = flip ? [2, 1] : [1, 2];
	const [end0, end1] = flip ? [2, 0] : [0, 2];
	const writeStrip = (i) => {
		if (collapsed[i] && collapsed[i + 1]) return;
		const a = columnOffsets[i];
		const b = columnOffsets[i + 1];
		if (collapsed[i]) {
			for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
				cells[cellIndex] = a;
				cells[cellIndex + rim0] = b + j;
				cells[cellIndex + rim1] = b + j + 1;
			}
			return;
		}
		if (collapsed[i + 1]) {
			for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
				cells[cellIndex + end0] = a + j;
				cells[cellIndex + 1] = b;
				cells[cellIndex + end1] = a + j + 1;
			}
			return;
		}
		for (let j = 0; j < rows - 1; j++, cellIndex += 6) {
			const p = a + j;
			const q = b + j;
			cells[cellIndex] = p;
			cells[cellIndex + rim0] = q;
			cells[cellIndex + rim1] = q + 1;
			cells[cellIndex + 3] = p;
			cells[cellIndex + 3 + rim0] = q + 1;
			cells[cellIndex + 3 + rim1] = p + 1;
		}
	};
	for (let i = 0; i < segments; i++) writeStrip(i);
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT$2 = 3;
function computeTriangleCorners(sx, sy, apexOffset) {
	return centerCorners([
		[-sx, -sy],
		[sx, -sy],
		[apexOffset, sy]
	]);
}
/**
* @typedef {object} TriangleOptions
* @property {number} [sx=1] Base half-width.
* @property {number} [sy=1] Half-height.
* @property {number} [apexOffset=0] Horizontal apex shift.
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU] Negative values
*   aren't supported.
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A triangle with a horizontal base, swept CCW from the bottom-left corner.
*
* Special cases: isosceles (apexOffset = 0), right (apexOffset = ±sx), scalene
* otherwise.
*
* @param {TriangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Triangle]{@link https://mathworld.wolfram.com/Triangle.html}
*/
function triangle({ sx = 1, sy = 1, apexOffset = 0, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = rectangular } = {}) {
	const { centeredCorners, cx, cy } = computeTriangleCorners(sx, sy, apexOffset);
	const geometry = computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: edgeSegments * CORNER_COUNT$2,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [rx * x, rx * y];
		}
	});
	if (cx !== 0 || cy !== 0) translatePositions(geometry.positions, radius * cx, radius * cy);
	return geometry;
}
/**
* @typedef {object} TrianglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [apexOffset=0]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `triangle`.
*
* @param {TrianglePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function trianglePath({ sx = 1, sy = 1, apexOffset = 0, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const { centeredCorners, cx, cy } = computeTriangleCorners(sx, sy, apexOffset);
	const dx = radius * cx;
	const dy = radius * cy;
	return computePolarPathGeometry({
		segments: edgeSegments * CORNER_COUNT$2,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [radius * x + dx, radius * y + dy];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RightTriangleOptions
* @property {number} [sx=1] Horizontal leg half-length.
* @property {number} [sy=1] Vertical leg half-length.
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A right triangle: `triangle` with `apexOffset = -sx`.
*
* @param {RightTriangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function rightTriangle({ sx = 1, sy = 1, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mergeSeam, mapping } = {}) {
	return triangle({
		sx,
		sy,
		apexOffset: -sx,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} RightTrianglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `rightTriangle`.
*
* @param {RightTrianglePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function rightTrianglePath({ sx = 1, sy = 1, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return trianglePath({
		sx,
		sy,
		apexOffset: -sx,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module utils
* @ignore
*/
/** @private */
const PLANE_DIRECTIONS = {
	z: [
		0,
		1,
		2,
		1,
		-1,
		1
	],
	"-z": [
		0,
		1,
		2,
		-1,
		-1,
		-1
	],
	"-x": [
		2,
		1,
		0,
		1,
		-1,
		-1
	],
	x: [
		2,
		1,
		0,
		-1,
		-1,
		1
	],
	y: [
		0,
		2,
		1,
		1,
		1,
		1
	],
	"-y": [
		0,
		2,
		1,
		1,
		-1,
		-1
	]
};
/**
* Piecewise sampling so region boundaries are bit-exact. n = 0 collapses the
* straight section, cornerSegments = 0 gives a plain grid.
*
* @private
*/
function getPlaneCoordinate(index, n, size, cornerRadius, cornerSegments) {
	return index < cornerSegments ? -size / 2 - cornerRadius + index * cornerRadius / cornerSegments : index <= cornerSegments + n ? -size / 2 + (n ? (index - cornerSegments) * size / n : 0) : size / 2 + (index - cornerSegments - n) * cornerRadius / cornerSegments;
}
/**
* Remap a corner offset onto the circular arc: same angle, Chebyshev distance
* rescaled to Euclidean.
*
* @private
* @param {number} dx
* @param {number} dy
* @returns {[number, number]}
*/
function remapCornerOffset(dx, dy) {
	const scale = Math.max(Math.abs(dx), Math.abs(dy)) / Math.hypot(dx, dy);
	return [dx * scale, dy * scale];
}
/**
* Whether a grid index falls in a corner range, before 0 or after n.
*
* @private
*/
function isPlaneCorner(index, n, cornerSegments) {
	return index < cornerSegments || index >= cornerSegments + n;
}
/**
* Corner coordinate a value is beyond, or null within the straight span.
*
* @private
*/
function getPlaneCornerReference(value, half) {
	return value < -half ? -half : value > half ? half : null;
}
/**
* Whether the corner at [cx, cy] is rounded. `roundCorners` is a boolean or a
* [-u-v, +u-v, +u+v, -u+v] array.
*
* @private
*/
function isPlaneCornerRounded(cx, cy, roundCorners) {
	if (cx === null || cy === null) return false;
	if (roundCorners === true || roundCorners === false) return roundCorners;
	return roundCorners[cx < 0 ? cy < 0 ? 0 : 3 : cy < 0 ? 1 : 2];
}
/**
* A plane as one welded grid, optionally with rounded corners. su/sv are the
* inner face sizes. `roundCorners` is a boolean or a [-u-v, +u-v, +u+v, -u+v]
* array.
*
* @private
*/
function computePlane(geometry, indices, su, sv, nu, nv, direction = "z", pw = 0, uvScale = [1, 1], uvOffset = [0, 0], center = [
	0,
	0,
	0
], ccw = true, cornerRadius = 0, cornerSegments = 0, roundCorners = false) {
	const { positions, normals, uvs, cells } = geometry;
	const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];
	const cols = 2 * cornerSegments + nu;
	const rows = 2 * cornerSegments + nv;
	const width = su + 2 * cornerRadius;
	const height = sv + 2 * cornerRadius;
	const vertexOffset = indices.vertex;
	const [s1, s2, s4, s5] = ccw ? [
		1,
		2,
		4,
		5
	] : [
		2,
		1,
		5,
		4
	];
	const writeVertex = (x0, y0) => {
		let x = x0;
		let y = y0;
		if (cornerRadius > 0) {
			const cx = getPlaneCornerReference(x0, su / 2);
			const cy = getPlaneCornerReference(y0, sv / 2);
			if (isPlaneCornerRounded(cx, cy, roundCorners)) {
				const [dx, dy] = remapCornerOffset(x0 - cx, y0 - cy);
				x = cx + dx;
				y = cy + dy;
			}
		}
		positions[indices.vertex * 3 + u] = x * flipU + center[u];
		positions[indices.vertex * 3 + v] = y * flipV + center[v];
		positions[indices.vertex * 3 + w] = pw + center[w];
		normals[indices.vertex * 3 + w] = normal;
		uvs[indices.vertex * 2] = (x0 + width / 2) / width * uvScale[0] + uvOffset[0];
		uvs[indices.vertex * 2 + 1] = (1 - (y0 + height / 2) / height) * uvScale[1] + uvOffset[1];
		indices.vertex++;
	};
	const writeQuad = (i, j, radial) => {
		const n = vertexOffset + j * (cols + 1) + i;
		const o = n + cols + 1;
		if (radial) {
			cells[indices.cell] = n + 1;
			cells[indices.cell + s1] = n;
			cells[indices.cell + s2] = o;
			cells[indices.cell + 3] = n + 1;
			cells[indices.cell + s4] = o;
			cells[indices.cell + s5] = o + 1;
		} else {
			cells[indices.cell] = n;
			cells[indices.cell + s1] = o;
			cells[indices.cell + s2] = o + 1;
			cells[indices.cell + 3] = n;
			cells[indices.cell + s4] = o + 1;
			cells[indices.cell + s5] = n + 1;
		}
		indices.cell += 6;
	};
	for (let j = 0; j <= rows; j++) {
		const y0 = getPlaneCoordinate(j, nv, sv, cornerRadius, cornerSegments);
		const cornerV = isPlaneCorner(j, nv, cornerSegments);
		for (let i = 0; i <= cols; i++) {
			const x0 = getPlaneCoordinate(i, nu, su, cornerRadius, cornerSegments);
			const cornerU = isPlaneCorner(i, nu, cornerSegments);
			writeVertex(x0, y0);
			if (j < rows && i < cols) writeQuad(i, j, cornerU && cornerV && i < cornerSegments !== j < cornerSegments);
		}
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PlaneOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {import("../../../types.js").PositiveInteger} [nx=1]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
* @property {PlaneDirection} [direction="z"]
*/
/** @typedef {"x" | "-x" | "y" | "-y" | "z" | "-z"} PlaneDirection */
/**
* A flat rectangular grid, facing `direction`.
*
* @param {PlaneOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function plane({ sx = 1, sy = sx, nx = 1, ny = nx, direction = "z" } = {}) {
	const size = (nx + 1) * (ny + 1);
	return computePlane({
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(nx * ny * 6)
	}, {
		vertex: 0,
		cell: 0
	}, sx, sy, nx, ny, direction, 0);
}
/**
* @typedef {object} RectanglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along
*   the bottom/top edges
* @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments
*   along the left/right edges
*/
/**
* Outline dual of `plane`, facing z.
*
* @param {RectanglePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function rectanglePath({ sx = 1, sy = .5, nx = 1, ny = nx } = {}) {
	const x = sx * .5;
	const y = sy * .5;
	const corners = [
		[-x, -y],
		[x, -y],
		[x, y],
		[-x, y]
	];
	const segments = [
		nx,
		ny,
		nx,
		ny
	];
	const size = 2 * (nx + ny);
	const positions = new Float32Array(size * 3);
	const path = Array.from({ length: size });
	let vertexIndex = 0;
	for (let edge = 0; edge < 4; edge++) {
		const [x0, y0] = corners[edge];
		const [x1, y1] = corners[(edge + 1) % 4];
		const n = segments[edge];
		for (let i = 0; i < n; i++) {
			const t = i / n;
			positions[vertexIndex * 3] = x0 + (x1 - x0) * t;
			positions[vertexIndex * 3 + 1] = y0 + (y1 - y0) * t;
			path[vertexIndex] = vertexIndex;
			vertexIndex++;
		}
	}
	return {
		positions,
		cells: [path]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} QuadOptions
* @property {number} [scale=1] Side length.
*/
/**
* A square, filled with 2 triangles.
*
* @param {QuadOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function quad({ scale = 1 } = {}) {
	const { positions, cells } = squarePath({ scale });
	return {
		positions,
		normals: Float32Array.of(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1),
		uvs: Float32Array.of(0, 0, 1, 0, 1, 1, 0, 1),
		cells: triangulateFaces(cells, 4)
	};
}
/**
* @typedef {object} SquarePathOptions
* @property {number} [scale=1] Side length.
* @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along
*   the bottom/top edges
* @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments
*   along the left/right edges
*/
/**
* Outline dual of `quad`.
*
* @param {SquarePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function squarePath({ scale = 1, nx = 1, ny = nx } = {}) {
	return rectanglePath({
		sx: scale,
		sy: scale,
		nx,
		ny
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/** @typedef {"top-left" | "top-right" | "bottom-right" | "bottom-left"} RoundedRectangleCorner */
/**
* @typedef {object} RoundedRectangleOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [radius=sx * 0.25]
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
* @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along
*   the straight top/bottom sections.
* @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments
*   along the straight left/right sections.
* @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
*/
const CORNER_ORDER = [
	"top-left",
	"top-right",
	"bottom-right",
	"bottom-left"
];
/**
* A rectangle with rounded corners.
*
* @param {RoundedRectangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedRectangle({ sx = 1, sy = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, roundedCorners = CORNER_ORDER } = {}) {
	const r2 = radius * 2;
	const widthX = sx - r2;
	const widthY = sy - r2;
	if (widthX === 0) nx = 0;
	if (widthY === 0) ny = 0;
	const cols = 2 * roundSegments + nx;
	const rows = 2 * roundSegments + ny;
	const size = (cols + 1) * (rows + 1);
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(cols * rows * 6)
	};
	computePlane(geometry, {
		vertex: 0,
		cell: 0
	}, widthX, widthY, nx, ny, "z", 0, [1, 1], [0, 0], [
		0,
		0,
		0
	], true, radius, roundSegments, CORNER_ORDER.map((corner) => roundedCorners.includes(corner)));
	return geometry;
}
const PATH_CORNERS = [
	{
		name: "bottom-left",
		signX: -1,
		signY: -1,
		angleStart: Math.PI
	},
	{
		name: "bottom-right",
		signX: 1,
		signY: -1,
		angleStart: 1.5 * Math.PI
	},
	{
		name: "top-right",
		signX: 1,
		signY: 1,
		angleStart: 0
	},
	{
		name: "top-left",
		signX: -1,
		signY: 1,
		angleStart: HALF_PI
	}
];
/**
* @typedef {object} RoundedRectanglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [radius=sx * 0.25]
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
* @property {import("../../../types.js").PositiveInteger} [nx=1]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
* @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `roundedRectangle`.
*
* @param {RoundedRectanglePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function roundedRectanglePath({ sx = 1, sy = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, roundedCorners = CORNER_ORDER, closed = false } = {}) {
	const x = sx * .5;
	const y = sy * .5;
	if (sx === radius * 2) nx = 0;
	if (sy === radius * 2) ny = 0;
	const isRounded = PATH_CORNERS.map(({ name }) => radius > 0 && roundedCorners.includes(name));
	const cornerCounts = isRounded.map((rounded) => rounded ? roundSegments : 1);
	const edgeCounts = [
		nx,
		ny,
		nx,
		ny
	].map((n, c) => n > 0 && !isRounded[c] ? n - 1 : n);
	const point = (c, sweep) => {
		const { signX, signY, angleStart } = PATH_CORNERS[c];
		if (!isRounded[c]) return [signX * x, signY * y];
		const cx = signX * (x - radius);
		const cy = signY * (y - radius);
		const angle = angleStart + sweep;
		return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
	};
	const size = cornerCounts.reduce((a, b) => a + b, 0) + edgeCounts.reduce((a, b) => a + b, 0);
	const positions = new Float32Array(size * 3);
	const path = Array.from({ length: size + (closed ? 1 : 0) });
	let vertexIndex = 0;
	const writeVertex = (px, py) => {
		positions[vertexIndex * 3] = px;
		positions[vertexIndex * 3 + 1] = py;
		path[vertexIndex] = vertexIndex;
		vertexIndex++;
	};
	const writeCorner = (c) => {
		for (let s = 0; s < cornerCounts[c]; s++) {
			const [px, py] = point(c, isRounded[c] ? s / roundSegments * HALF_PI : 0);
			writeVertex(px, py);
		}
	};
	const writeEdge = (c) => {
		const n = [
			nx,
			ny,
			nx,
			ny
		][c];
		if (n <= 0) return;
		const [x0, y0] = point(c, HALF_PI);
		const [x1, y1] = point((c + 1) % 4, 0);
		const start = isRounded[c] ? 0 : 1;
		for (let i = start; i < n; i++) {
			const t = i / n;
			writeVertex(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
		}
	};
	for (let c = 0; c < 4; c++) {
		writeCorner(c);
		writeEdge(c);
	}
	if (closed) path[size] = 0;
	return {
		positions,
		cells: [path]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} StadiumOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=1]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
*/
/**
* A stadium (discorectangle): `roundedRectangle` with `radius` fixed to half
* the shorter side.
*
* @param {StadiumOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function stadium({ sx = 1, sy = .5, nx, ny, roundSegments } = {}) {
	return roundedRectangle({
		sx,
		sy,
		nx,
		ny,
		radius: Math.min(sx, sy) * .5,
		roundSegments
	});
}
/**
* @typedef {object} StadiumPathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=1]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `stadium`.
*
* @param {StadiumPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function stadiumPath({ sx = 1, sy = .5, nx, ny, roundSegments, closed } = {}) {
	return roundedRectanglePath({
		sx,
		sy,
		nx,
		ny,
		radius: Math.min(sx, sy) * .5,
		roundSegments,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} KiteOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [ratio=0.5] Bottom vertex distance from the center, as a
*   fraction of the top's.
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A kite: a rhombus with its bottom vertex pulled toward the center.
*
* Special cases: rhombus (ratio = 1).
*
* @param {KiteOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function kite({ sx = 1, sy = 1, ratio = .5, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = HALF_PI, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments: edgeSegments * 4,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, ry, t }) => computePolygonEdge(thetaOffset, 4, rx, ry, t, 1, 1, 1, ratio)
	});
}
/**
* @typedef {object} KitePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [ratio=0.5]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `kite`.
*
* @param {KitePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function kitePath({ sx = 1, sy = 1, ratio = .5, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = HALF_PI, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: edgeSegments * 4,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computePolygonEdge(thetaOffset, 4, sx * radius, sy * radius, t, 1, 1, 1, ratio)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PolygonOptions
* @property {import("../../types.js").PositiveInteger} [sides=6]
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A regular polygon, stretched when sx != sy.
*
* Special cases: rhombus (sides = 4).
*
* @param {PolygonOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
*/
function polygon({ sides = 6, sx = 1, sy = 1, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments: edgeSegments * sides,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, ry, t }) => computePolygonEdge(thetaOffset, sides, rx, ry, t)
	});
}
/**
* @typedef {object} PolygonPathOptions
* @property {import("../../types.js").PositiveInteger} [sides=6]
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `polygon`.
*
* @param {PolygonPathOptions} [options={}]
* @returns {import("../../types.js").PolylineComplex}
*/
function polygonPath({ sides = 6, sx = 1, sy = 1, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: edgeSegments * sides,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computePolygonEdge(thetaOffset, sides, sx * radius, sy * radius, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RhombusOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A rhombus: `polygon` with 4 sides, sx/sy scaling its diagonals.
*
* Special cases: square rotated 45° (sx = sy).
*
* @param {RhombusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function rhombus({ sx = 1, sy = 1, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = HALF_PI, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	return polygon({
		sides: 4,
		sx,
		sy,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} RhombusPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `rhombus`.
*
* @param {RhombusPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function rhombusPath({ sx = 1, sy = 1, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = HALF_PI, closed = false } = {}) {
	return polygonPath({
		sides: 4,
		sx,
		sy,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LozengeOptions
* @property {number} [sx=0.5]
* @property {number} [sy=sx*2]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A lozenge: `rhombus` with sy = sx * 2.
*
* @param {LozengeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function lozenge({ sx = .5, sy = sx * 2, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mergeSeam, mapping } = {}) {
	return rhombus({
		sx,
		sy,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} LozengePathOptions
* @property {number} [sx=0.5]
* @property {number} [sy=sx*2]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `lozenge`.
*
* @param {LozengePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function lozengePath({ sx = .5, sy = sx * 2, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return rhombusPath({
		sx,
		sy,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT$1 = 4;
function computeTrapezoidCorners(sx, sy, topRatio, topOffset) {
	return centerCorners([
		[-sx, -sy],
		[sx, -sy],
		[topOffset + sx * topRatio, sy],
		[topOffset - sx * topRatio, sy]
	]);
}
/**
* @typedef {object} TrapezoidOptions
* @property {number} [sx=1] Bottom edge half-width.
* @property {number} [sy=1] Half-height.
* @property {number} [topRatio=0.5] Top edge half-width, as a fraction of `sx`.
* @property {number} [topOffset=0] Horizontal shift of the top edge.
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU] Negative values
*   aren't supported.
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A trapezoid with horizontal edges, swept CCW from the bottom-left corner.
*
* Special cases: isosceles (topOffset = 0), parallelogram (topRatio = 1),
* triangle (topRatio = 0).
*
* @param {TrapezoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Trapezoid]{@link https://mathworld.wolfram.com/Trapezoid.html}
*/
function trapezoid({ sx = 1, sy = 1, topRatio = .5, topOffset = 0, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = rectangular } = {}) {
	const { centeredCorners, cx, cy } = computeTrapezoidCorners(sx, sy, topRatio, topOffset);
	const geometry = computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: edgeSegments * CORNER_COUNT$1,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [rx * x, rx * y];
		}
	});
	if (cx !== 0 || cy !== 0) translatePositions(geometry.positions, radius * cx, radius * cy);
	return geometry;
}
/**
* @typedef {object} TrapezoidPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [topRatio=0.5]
* @property {number} [topOffset=0]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `trapezoid`.
*
* @param {TrapezoidPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function trapezoidPath({ sx = 1, sy = 1, topRatio = .5, topOffset = 0, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const { centeredCorners, cx, cy } = computeTrapezoidCorners(sx, sy, topRatio, topOffset);
	const dx = radius * cx;
	const dy = radius * cy;
	return computePolarPathGeometry({
		segments: edgeSegments * CORNER_COUNT$1,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [radius * x + dx, radius * y + dy];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ParallelogramOptions
* @property {number} [sx=0.5]
* @property {number} [sy=1]
* @property {number} [shear=0.3] Horizontal shift of the top edge.
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A parallelogram: `trapezoid` with `topRatio = 1`.
*
* @param {ParallelogramOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function parallelogram({ sx = .5, sy = 1, shear = .3, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mergeSeam, mapping } = {}) {
	return trapezoid({
		sx,
		sy,
		topRatio: 1,
		topOffset: shear,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} ParallelogramPathOptions
* @property {number} [sx=0.5]
* @property {number} [sy=1]
* @property {number} [shear=0.3]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `parallelogram`.
*
* @param {ParallelogramPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function parallelogramPath({ sx = .5, sy = 1, shear = .3, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return trapezoidPath({
		sx,
		sy,
		topRatio: 1,
		topOffset: shear,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ArbelosOptions
* @property {number} [radius=0.5] Outer semicircle radius.
* @property {number} [innerRadius=radius*0.25] Left inner semicircle radius.
*   The right one fills the rest.
* @property {import("../../../types.js").PositiveInteger} [segments=32]
*   Columns, left to right.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Rows between the bottom and top boundaries.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* An arbelos: a semicircle minus 2 tangent semicircles on its diameter.
*
* @param {ArbelosOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Arbelos]{@link https://mathworld.wolfram.com/Arbelos.html}
*/
function arbelos({ radius = .5, innerRadius = radius * .25, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const r1 = innerRadius;
	const r2 = R - r1;
	const leftCenter = -R + r1;
	const rightCenter = r1;
	const splitX = leftCenter + r1;
	const outer = (x) => Math.sqrt(Math.max(R * R - x * x, 0));
	const leftInner = (x) => x === splitX ? 0 : Math.sqrt(Math.max(r1 * r1 - (x - leftCenter) ** 2, 0));
	const rightInner = (x) => x === splitX ? 0 : Math.sqrt(Math.max(r2 * r2 - (x - rightCenter) ** 2, 0));
	const center = [0, R / 2];
	const sx = R;
	const sy = R / 2;
	const point = (x, y) => [x, y];
	return concatGeometries([computeSweptArc({
		segments,
		innerSegments,
		uMin: -R,
		uMax: splitX,
		mapping,
		center,
		sx,
		sy,
		bounds: (x) => [leftInner(x), outer(x)],
		point
	}), computeSweptArc({
		segments,
		innerSegments,
		uMin: splitX,
		uMax: R,
		mapping,
		center,
		sx,
		sy,
		bounds: (x) => [rightInner(x), outer(x)],
		point
	})]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LensOptions
* @property {number} [radius=0.5] First circle radius.
* @property {number} [radius2=radius] Second circle radius.
* @property {number} [distance=radius] Distance between centers.
* @property {import("../../../types.js").PositiveInteger} [segments=32]
*   Columns, left to right.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Rows between the bottom and top boundaries.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* A lens: the overlap of 2 circles. Defaults to a vesica piscis.
*
* @param {LensOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Lens]{@link https://mathworld.wolfram.com/Lens.html}
* @see [Wolfram MathWorld – Vesica Piscis]{@link https://mathworld.wolfram.com/VesicaPiscis.html}
*/
function lens({ radius = .5, radius2 = radius, distance = radius, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const r1 = radius;
	const r2 = radius2;
	const c1 = -distance / 2;
	const c2 = distance / 2;
	const uMin = Math.max(c1 - r1, c2 - r2);
	const uMax = Math.min(c1 + r1, c2 + r2);
	const height = (x) => Math.min(Math.sqrt(Math.max(r1 * r1 - (x - c1) ** 2, 0)), Math.sqrt(Math.max(r2 * r2 - (x - c2) ** 2, 0)));
	const centerX = (uMin + uMax) / 2;
	return computeSweptArc({
		segments,
		innerSegments,
		uMin,
		uMax,
		mapping,
		center: [centerX, 0],
		sx: (uMax - uMin) / 2,
		sy: height(centerX),
		bounds: (x) => {
			const h = height(x);
			return [-h, h];
		},
		point: (x, y) => [x, y]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LuneOptions
* @property {number} [radius=0.5] Big circle radius.
* @property {number} [innerRadius=radius] Small circle radius.
* @property {number} [distance=radius*0.5] Small circle center offset along +x.
*   `distance + innerRadius > radius` for a crescent.
* @property {import("../../../types.js").PositiveInteger} [segments=32]
*   Columns, left to right.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Rows between each half's boundaries.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* A lune: a big circle minus an offset small one.
*
* @param {LuneOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Lune]{@link https://mathworld.wolfram.com/Lune.html}
*/
function lune({ radius = .5, innerRadius = radius, distance = radius * .5, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const b = radius;
	const a = innerRadius;
	const d = distance;
	const uMin = -b;
	const uMax = (b * b - a * a + d * d) / (2 * d);
	const kink = d - a;
	const outerBound = (x) => Math.sqrt(Math.max(b * b - x * x, 0));
	const innerBound = (x) => Math.sqrt(Math.max(a * a - (x - d) ** 2, 0));
	const center = [(uMin + uMax) / 2, 0];
	const sx = (uMax - uMin) / 2;
	const sy = outerBound(Math.min(Math.max(0, uMin), uMax));
	function sweepBand(mirror) {
		const pieces = [];
		const flat = (x) => mirror ? [-outerBound(x), 0] : [0, outerBound(x)];
		const curved = (x) => mirror ? [-outerBound(x), -innerBound(x)] : [innerBound(x), outerBound(x)];
		const capEnd = Math.min(kink, uMax);
		if (capEnd > uMin) pieces.push(computeSweptArc({
			segments,
			innerSegments,
			uMin,
			uMax: capEnd,
			mapping,
			center,
			sx,
			sy,
			bounds: flat,
			point: (x, y) => [x, y]
		}));
		const hornStart = Math.max(kink, uMin);
		if (hornStart < uMax) pieces.push(computeSweptArc({
			segments,
			innerSegments,
			uMin: hornStart,
			uMax,
			mapping,
			center,
			sx,
			sy,
			bounds: curved,
			point: (x, y) => [x, y]
		}));
		return pieces;
	}
	return concatGeometries([...sweepBand(false), ...sweepBand(true)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SalinonOptions
* @property {number} [radius=0.5] Bottom semicircle radius.
* @property {number} [innerRadius=radius*0.25] Top central semicircle radius.
* @property {import("../../../types.js").PositiveInteger} [segments=32]
*   Columns, left to right.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Rows between the bottom and top boundaries.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* Archimedes' salinon: a shape bounded by 4 semicircles.
*
* @param {SalinonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Salinon]{@link https://mathworld.wolfram.com/Salinon.html}
*/
function salinon({ radius = .5, innerRadius = radius * .25, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const r = innerRadius;
	const earRadius = (R - r) / 2;
	const earCenter = (R + r) / 2;
	return computeSweptArc({
		segments,
		innerSegments,
		uMin: -R,
		uMax: R,
		mapping,
		center: [0, (r - R) / 2],
		sx: R,
		sy: (R + r) / 2,
		bounds: (x) => {
			return [-Math.sqrt(Math.max(R * R - x * x, 0)), Math.abs(x) <= r ? Math.sqrt(Math.max(r * r - x * x, 0)) : -Math.sqrt(Math.max(earRadius * earRadius - (x - Math.sign(x) * earCenter) ** 2, 0))];
		},
		point: (x, y) => [x, y]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TriquetraOptions
* @property {number} [radius=0.5] Radius of each circle, and distance between
*   their centers.
* @property {import("../../../types.js").PositiveInteger} [segments=32]
*   Angular columns per piece.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Rows between the two boundaries.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* A triquetra: 3 interlaced lenses centered on an equilateral triangle.
*
* @param {TriquetraOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Triquetra]{@link https://mathworld.wolfram.com/Triquetra.html}
*/
function triquetra({ radius = .5, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const r = radius;
	const R = radius / Math.sqrt(3);
	const angleC0 = 7 * Math.PI / 6;
	const angleC1 = 11 * Math.PI / 6;
	const angleC2 = Math.PI / 2;
	const vertices = [
		angleC0,
		angleC1,
		angleC2
	].map((angle) => [R * Math.cos(angle), R * Math.sin(angle)]);
	const offsets = [
		0,
		TAU / 3,
		2 * TAU / 3
	];
	const ray = (alpha, theta) => {
		const d = theta - alpha;
		return R * Math.cos(d) + Math.sqrt(Math.max(r * r - R * R * Math.sin(d) ** 2, 0));
	};
	const seam = (theta) => ray(angleC2, theta);
	const outer = (theta) => Math.min(ray(angleC0, theta), ray(angleC1, theta));
	const uMin = angleC0;
	const uMax = angleC1;
	const cols = segments + 1;
	const center = [0, 0];
	const sx = r;
	const sy = 2 * R;
	const petal = (k) => {
		const offset = offsets[k];
		const start = vertices[k];
		const end = vertices[(k + 1) % 3];
		return computeSweptArc({
			segments,
			innerSegments,
			uMin,
			uMax,
			mapping,
			center,
			sx,
			sy,
			flip: true,
			bounds: (theta) => [seam(theta), outer(theta)],
			point: (theta, v) => theta === uMin ? start : theta === uMax ? end : [v * Math.cos(theta + offset), v * Math.sin(theta + offset)]
		});
	};
	const columnAngle = (i) => computeChebyshevColumn(i, segments, uMin, uMax);
	const coreColumn = (k, i, j) => {
		const theta = columnAngle(i);
		const isEnd = i === 0 || i === segments;
		const v = (isEnd ? R : seam(theta)) * (j / innerSegments);
		if (isEnd && j === innerSegments) return [
			theta,
			v,
			vertices[(i === 0 ? k : k + 1) % 3]
		];
		const angle = theta + offsets[k];
		return [
			theta,
			v,
			[v * Math.cos(angle), v * Math.sin(angle)]
		];
	};
	const writeCoreCells = (cells, cellIndex, ringOffset, isFirstRing) => {
		if (isFirstRing) {
			for (let i = 0; i < segments; i++, cellIndex += 3) cells.set([
				0,
				ringOffset + i,
				ringOffset + i + 1
			], cellIndex);
			return cellIndex;
		}
		const prevRingOffset = ringOffset - cols;
		for (let i = 0; i < segments; i++, cellIndex += 6) {
			const a = prevRingOffset + i;
			const b = ringOffset + i;
			const c = ringOffset + i + 1;
			const d = prevRingOffset + i + 1;
			cells.set([
				a,
				b,
				d,
				b,
				c,
				d
			], cellIndex);
		}
		return cellIndex;
	};
	const core = (k) => {
		const size = 1 + innerSegments * cols;
		const positions = new Float32Array(size * 3);
		const normals = new Float32Array(size * 3);
		const uvs = new Float32Array(size * 2);
		const cells = new (getCellsTypedArray(size))(segments * 3 + (innerSegments - 1) * segments * 6);
		normals[2] = 1;
		mapping({
			uvs,
			index: 0,
			x: 0,
			y: 0,
			radius: 1,
			sx,
			sy,
			u: uMin,
			v: 0,
			uRatio: 0,
			vRatio: 0
		});
		let vertexIndex = 1;
		let cellIndex = 0;
		for (let j = 1; j <= innerSegments; j++) {
			const ringOffset = vertexIndex;
			for (let i = 0; i <= segments; i++, vertexIndex++) {
				const [theta, v, [x, y]] = coreColumn(k, i, j);
				positions[vertexIndex * 3] = x;
				positions[vertexIndex * 3 + 1] = y;
				normals[vertexIndex * 3 + 2] = 1;
				mapping({
					uvs,
					index: vertexIndex * 2,
					x,
					y,
					radius: 1,
					sx,
					sy,
					u: theta,
					v,
					uRatio: i / segments,
					vRatio: j / innerSegments
				});
			}
			cellIndex = writeCoreCells(cells, cellIndex, ringOffset, j === 1);
		}
		return {
			positions,
			normals,
			uvs,
			cells
		};
	};
	return concatGeometries([
		core(0),
		core(1),
		core(2),
		petal(0),
		petal(1),
		petal(2)
	]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} YinYangOptions
* @property {number} [radius=0.5] Radius of the enclosing circle.
* @property {number} [dotRadius=radius/6] Dot hole radius. `0` omits it.
* @property {"yin" | "yang" | "yin-yang"} [part="yin-yang"] One half, or both
*   merged in one mesh.
* @property {import("../../../types.js").PositiveInteger} [segments=32] Rows
*   along the outer circle and S-curve.
* @property {import("../../../types.js").PositiveInteger} [holeSegments=16]
*   Rows along a dot hole.
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
*   Columns on each side of a dot hole.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Use `uRatio`/`vRatio` to follow the arcs.
*/
/**
* A yin-yang (taijitu): a circle split by an S-curve, each half holed at the
* other's bulge.
*
* @param {YinYangOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Yin-Yang]{@link https://mathworld.wolfram.com/Yin-Yang.html}
*/
function yinYang({ radius = .5, dotRadius = radius / 6, part = "yin-yang", segments = 32, holeSegments = 16, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const curve = (y) => y >= 0 ? Math.sqrt(Math.max((R / 2) ** 2 - (y - R / 2) ** 2, 0)) : -Math.sqrt(Math.max((R / 2) ** 2 - (y + R / 2) ** 2, 0));
	const diskEdge = (y) => Math.sqrt(Math.max(R * R - y * y, 0));
	const yangDotBottom = -R / 2 - dotRadius;
	const yangDotTop = -R / 2 + dotRadius;
	const yinDotBottom = R / 2 - dotRadius;
	const yinDotTop = R / 2 + dotRadius;
	const schedule = dotRadius <= 0 ? [[
		-R,
		R,
		segments
	]] : [
		[
			-R,
			yangDotBottom,
			segments
		],
		[
			yangDotBottom,
			yangDotTop,
			holeSegments
		],
		[
			yangDotTop,
			yinDotBottom,
			segments
		],
		[
			yinDotBottom,
			yinDotTop,
			holeSegments
		],
		[
			yinDotTop,
			R,
			segments
		]
	];
	function buildHalf(isYin, center, sx, sy) {
		const outerMin = (y) => isYin ? -diskEdge(y) : curve(y);
		const outerMax = (y) => isYin ? curve(y) : diskEdge(y);
		const dotCenterY = (isYin ? R : -R) / 2;
		const dotBottom = isYin ? yinDotBottom : yangDotBottom;
		const dotTop = isYin ? yinDotTop : yangDotTop;
		const holeHalfWidth = (y) => y <= dotBottom || y >= dotTop ? 0 : Math.sqrt(Math.max(dotRadius * dotRadius - (y - dotCenterY) ** 2, 0));
		const leftBounds = (y) => {
			const lo = outerMin(y);
			const hi = outerMax(y);
			return [lo, clamp(-holeHalfWidth(y), lo, hi)];
		};
		const rightBounds = (y) => {
			const lo = outerMin(y);
			const hi = outerMax(y);
			return [clamp(holeHalfWidth(y), lo, hi), hi];
		};
		const sweep = (uMin, uMax, rows, bounds) => computeSweptArc({
			segments: rows,
			innerSegments,
			uMin,
			uMax,
			mapping,
			center,
			sx,
			sy,
			bounds,
			point: (y, x) => [x, y],
			flip: true
		});
		return concatGeometries([...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, leftBounds)), ...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, rightBounds))]);
	}
	if (part !== "yin-yang") {
		const isYin = part === "yin";
		return buildHalf(isYin, [(isYin ? -R : R) / 4, 0], 3 * R / 4, R);
	}
	const wholeCenter = [0, 0];
	return concatGeometries([buildHalf(false, wholeCenter, R, R), buildHalf(true, wholeCenter, R, R)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} EllipseOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {number} [innerRadius=0] Hole radius. `0` fills to the center.
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.elliptical]
* @property {EllipseEquationFn} [equation] Sample to [x, y] position. Defaults
*   to the ellipse's arc.
*/
/**
* @callback EllipseEquationFn
* @param {object} sample
* @param {number} sample.rx Scaled ring radius along x
* @param {number} sample.ry Scaled ring radius along y
* @param {number} sample.cosTheta
* @param {number} sample.sinTheta
* @param {number} sample.s Radius ratio (0..1, innerRadius to radius)
* @param {number} sample.t Angle
* @returns {[x, y]}
*/
/**
* An ellipse (or circle when `sx = sy`).
*
* @param {EllipseOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function ellipse({ sx = 1, sy = .5, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = elliptical, equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta] } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		theta,
		thetaOffset,
		innerRadius,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation
	});
}
/**
* @typedef {object} EllipsePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `ellipse`.
*
* @param {EllipsePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function ellipsePath({ sx = 1, sy = .5, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => [sx * radius * Math.cos(t), sy * radius * Math.sin(t)]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DiscOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A disc: `ellipse` with sx = sy = 1.
*
* @param {DiscOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function disc({ radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	return ellipse({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} CirclePathOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `disc`.
*
* @param {CirclePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function circlePath({ radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return ellipsePath({
		sx: 1,
		sy: 1,
		radius,
		segments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n) {
	return [rx * Math.abs(cosTheta) ** (2 / m) * Math.sign(cosTheta), ry * Math.abs(sinTheta) ** (2 / n) * Math.sign(sinTheta)];
}
/**
* @typedef {object} SuperellipseOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
* @property {number} [m=2]
* @property {number} [n=m]
*/
/**
* A superellipse (Lamé curve).
*
* Special cases: squircle (m = 4), rectellipse (m = 4, sx != sy), astroid (m =
* 2/3), diamond (m = 1), Piet Hein's superellipse (m = 5/2).
*
* @param {SuperellipseOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superellipse]{@link https://mathworld.wolfram.com/Superellipse.html}
* @see [Wikipedia – Superellipse]{@link https://en.wikipedia.org/wiki/Superellipse}
*/
function superellipse({ sx = 1, sy = .5, radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = lamé, m = 2, n = m } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, ry, cosTheta, sinTheta }) => computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n)
	});
}
/**
* @typedef {object} SuperellipsePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {number} [m=2]
* @property {number} [n=m]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `superellipse`.
*
* @param {SuperellipsePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function superellipsePath({ sx = 1, sy = .5, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, m = 2, n = m, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeSuperellipseEdge(sx * radius, sy * radius, Math.cos(t), Math.sin(t), m, n)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness) {
	switch (t) {
		case 0:
		case TAU: return [rx, 0];
		case HALF_PI: return [0, ry];
		case Math.PI: return [-rx, 0];
		case TAU - HALF_PI: return [0, -ry];
		default: {
			const sqrt = Math.sqrt(1 - Math.sqrt(1 - squareness ** 2 * Math.sin(2 * t) ** 2));
			return [rx * Math.sign(cosTheta) / (squareness * SQRT2 * Math.abs(sinTheta)) * sqrt, ry * Math.sign(sinTheta) / (squareness * SQRT2 * Math.abs(cosTheta)) * sqrt];
		}
	}
}
/**
* @typedef {object} SquircleOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=128]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.fgSquircular]
* @property {number} [squareness=0.95] In (0, 1]
*/
/**
* A Fernández-Guasti squircle.
*
* Special cases: circle (squareness → 0), square (squareness = 1).
*
* @param {SquircleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Squircular Calculations – Chamberlain Fong]{@link https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf}
*/
function squircle({ sx = 1, sy = 1, radius = .5, segments = 128, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = fgSquircular, squareness = .95 } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, ry, cosTheta, sinTheta, t }) => computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness)
	});
}
/**
* @typedef {object} SquirclePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=128]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {number} [squareness=0.95]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `squircle`.
*
* @param {SquirclePathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function squirclePath({ sx = 1, sy = 1, radius = .5, segments = 128, theta = TAU, thetaOffset = 0, squareness = .95, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeSquircleEdge(sx * radius, sy * radius, Math.cos(t), Math.sin(t), t, squareness)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AstroidOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
*/
/**
* A 4-cusped hypocycloid: `superellipse` with m = n = 2/3.
*
* @param {AstroidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Astroid]{@link https://mathworld.wolfram.com/Astroid.html}
*/
function astroid({ radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = lamé } = {}) {
	return superellipse({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		m: 2 / 3,
		n: 2 / 3
	});
}
/**
* @typedef {object} AstroidPathOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `astroid`.
*
* @param {AstroidPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function astroidPath({ radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return superellipsePath({
		sx: 1,
		sy: 1,
		radius,
		segments,
		theta,
		thetaOffset,
		closed,
		m: 2 / 3,
		n: 2 / 3
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AnnulusOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {number} [innerRadius=radius * 0.5]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* An annulus (ring): the region between two concentric circles.
*
* @param {AnnulusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function annulus({ sx = 1, sy = 1, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = radius * .5, mergeSeam = true, mapping = concentric } = {}) {
	return ellipse({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		theta,
		thetaOffset,
		innerRadius,
		mergeCentroid: false,
		mergeSeam,
		mapping
	});
}
/**
* @typedef {object} AnnulusPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [segments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {number} [innerRadius=radius * 0.5]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `annulus`: 2 path cells, outer loop first.
*
* @param {AnnulusPathOptions} [options={}]
* @returns {import("../../../types.js").PolylineComplex}
*/
function annulusPath({ sx = 1, sy = 1, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, innerRadius = radius * .5, closed = false } = {}) {
	const outer = ellipsePath({
		sx,
		sy,
		radius,
		segments,
		theta,
		thetaOffset,
		closed
	});
	const inner = ellipsePath({
		sx,
		sy,
		radius: innerRadius,
		segments,
		theta,
		thetaOffset,
		closed
	});
	const outerCount = outer.positions.length / 3;
	const positions = new Float32Array(outer.positions.length + inner.positions.length);
	positions.set(outer.positions, 0);
	positions.set(inner.positions, outer.positions.length);
	const innerCell = inner.cells[0].map((i) => i + outerCount);
	return {
		positions,
		cells: [outer.cells[0], innerCell]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ReuleauxOptions
* @property {import("../../types.js").PositiveInteger} [sides=3]
* @property {number} [radius=0.5]
* @property {import("../../types.js").PositiveInteger} [segments=32]
* @property {import("../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
function computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t) {
	const s = t - thetaOffset;
	const phi = PIoverSides * (2 * Math.floor(sides * s / TAU) + 1);
	const px = cosSides * Math.cos(.5 * (s + phi)) - Math.cos(phi);
	const py = cosSides * Math.sin(.5 * (s + phi)) - Math.sin(phi);
	return [px * cosOffset - py * sinOffset, px * sinOffset + py * cosOffset];
}
/**
* A Reuleaux polygon: a constant-width curve built from `sides` circular arcs,
* each centered on the opposite vertex. Defaults to a Reuleaux triangle.
*
* @param {ReuleauxOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Parametric equations for regular and Reuleaux polygons]{@link https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/}
*/
function reuleaux({ sides = 3, radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
	const PIoverSides = Math.PI / sides;
	const cosOffset = Math.cos(thetaOffset);
	const sinOffset = Math.sin(thetaOffset);
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t);
			return [rx * x, rx * y];
		}
	});
}
/**
* @typedef {object} ReuleauxPathOptions
* @property {import("../../types.js").PositiveInteger} [sides=3]
* @property {number} [radius=0.5]
* @property {import("../../types.js").PositiveInteger} [segments=32]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `reuleaux`.
*
* @param {ReuleauxPathOptions} [options={}]
* @returns {import("../../types.js").PolylineComplex}
*/
function reuleauxPath({ sides = 3, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
	const PIoverSides = Math.PI / sides;
	const cosOffset = Math.cos(thetaOffset);
	const sinOffset = Math.sin(thetaOffset);
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t);
			return [radius * x, radius * y];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t) {
	const cornerCount = points * 2;
	const local = (t - thetaOffset) / theta * cornerCount;
	const corner = Math.floor(local);
	const frac = local - corner;
	const cornerPoint = (k) => {
		const r = k % 2 === 0 ? radius : notchRadius;
		const angle = thetaOffset + k / cornerCount * theta;
		return [r * Math.cos(angle), r * Math.sin(angle)];
	};
	const [x0, y0] = cornerPoint(corner);
	const [x1, y1] = cornerPoint(corner + 1);
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
/**
* @typedef {object} StarOptions
* @property {import("../../types.js").PositiveInteger} [points=5]
* @property {import("../../types.js").PositiveInteger} [density=2] Schläfli
*   skip factor: `< points / 2`, coprime with `points` for a non-compound
*   star.
* @property {number} [radius=0.5]
* @property {number} [notchRadius=radius*computeStarRatio(points,density)]
*   Radius of the concave vertices between tips.
* @property {number} [innerRadius=0] Hole radius. `0` fills to the center.
* @property {boolean} [circularHole=false] Trace the hole as a circle instead
*   of a scaled star.
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../types.js").PositiveInteger} [innerSegments=16]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A regular {points/density} star polygon: the default is a pentagram.
*
* @param {StarOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
*/
function star({ points = 5, density = 2, radius = .5, notchRadius = radius * computeStarRatio(points, density), innerRadius = 0, circularHole = false, edgeSegments = 1, innerSegments = 16, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = concentric } = {}) {
	const holeScale = radius === 0 ? 0 : innerRadius / radius;
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: points * 2 * edgeSegments,
		innerSegments,
		theta,
		thetaOffset,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ cosTheta, sinTheta, s, t }) => {
			const [x, y] = computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t);
			const [hx, hy] = circularHole ? [innerRadius * cosTheta, innerRadius * sinTheta] : [x * holeScale, y * holeScale];
			return [hx + (x - hx) * s, hy + (y - hy) * s];
		}
	});
}
/**
* @typedef {object} StarPathOptions
* @property {import("../../types.js").PositiveInteger} [points=5]
* @property {import("../../types.js").PositiveInteger} [density=2]
* @property {number} [radius=0.5]
* @property {number} [notchRadius=radius*computeStarRatio(points,density)]
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../types.js").Angle} [theta=TAU]
* @property {import("../../types.js").Angle} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `star`.
*
* @param {StarPathOptions} [options={}]
* @returns {import("../../types.js").PolylineComplex}
*/
function starPath({ points = 5, density = 2, radius = .5, notchRadius = radius * computeStarRatio(points, density), edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: points * 2 * edgeSegments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT = 12;
function computeCrossOutline(r, w) {
	return [
		[r, -w],
		[r, w],
		[w, w],
		[w, r],
		[-w, r],
		[-w, w],
		[-r, w],
		[-r, -w],
		[-w, -w],
		[-w, -r],
		[w, -r],
		[w, -w]
	];
}
/**
* @typedef {object} CrossOptions
* @property {number} [radius=0.5] Distance from the center to each arm's tip.
* @property {number} [armWidth=radius/3] Half-width of each arm. The default
*   makes 5 equal squares.
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {import("../../types.js").PositiveInteger} [innerSegments=16]
* @property {number} [innerRadius=0] Hole radius, traced as a scaled cross. `0`
*   fills to the center.
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
*   for mappings wrapping there (eg. `mappings.polar`).
* @property {import("../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A Greek cross: 4 equal arms around a square center.
*
* @param {CrossOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Greek Cross]{@link https://mathworld.wolfram.com/GreekCross.html}
*/
function cross({ radius = .5, armWidth = radius / 3, edgeSegments = 1, innerSegments = 16, innerRadius = 0, mergeCentroid = innerRadius === 0, mergeSeam = true, mapping = rectangular } = {}) {
	const r = radius;
	const outline = computeCrossOutline(r, armWidth);
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius: r,
		segments: CORNER_COUNT * edgeSegments,
		innerSegments,
		innerRadius,
		mergeCentroid,
		mergeSeam,
		mapping,
		equation: ({ rx, t }) => {
			const scale = rx / r;
			const [x, y] = computeOutlineEdge(outline, 0, t);
			return [scale * x, scale * y];
		}
	});
}
/**
* @typedef {object} CrossPathOptions
* @property {number} [radius=0.5]
* @property {number} [armWidth=radius/3]
* @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `cross`.
*
* @param {CrossPathOptions} [options={}]
* @returns {import("../../types.js").PolylineComplex}
*/
function crossPath({ radius = .5, armWidth = radius / 3, edgeSegments = 1, closed = false } = {}) {
	const outline = computeCrossOutline(radius, armWidth);
	return computePolarPathGeometry({
		segments: CORNER_COUNT * edgeSegments,
		theta: TAU,
		thetaOffset: 0,
		closed,
		equation: (t) => computeOutlineEdge(outline, 0, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CubePolygonsOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
*/
/**
* Cuboid faces: 8 positions and 6 quads, ordered +x, -x, +y, -y, +z, -z.
*
* @param {CubePolygonsOptions} [options={}]
* @returns {import("../../../types.js").PolygonalComplex}
*/
function cubePolygons({ sx = 1, sy = sx, sz = sx } = {}) {
	const x = sx / 2;
	const y = sy / 2;
	const z = sz / 2;
	return {
		positions: Float32Array.of(-x, y, z, -x, -y, z, x, -y, z, x, y, z, x, y, -z, x, -y, -z, -x, -y, -z, -x, y, -z),
		cells: [
			[
				3,
				2,
				5,
				4
			],
			[
				7,
				6,
				1,
				0
			],
			[
				7,
				0,
				3,
				4
			],
			[
				1,
				6,
				5,
				2
			],
			[
				0,
				1,
				2,
				3
			],
			[
				4,
				5,
				6,
				7
			]
		]
	};
}
/**
* @typedef {object} CubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {import("../../../types.js").PositiveInteger} [nx=1]
* @property {import("../../../types.js").PositiveInteger} [ny=nx]
* @property {import("../../../types.js").PositiveInteger} [nz=nx]
*/
/**
* A cuboid (rectangular box).
*
* @param {CubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cube({ sx = 1, sy = sx, sz = sx, nx = 1, ny = nx, nz = nx } = {}) {
	const size = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))((nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6)
	};
	const halfSX = sx * .5;
	const halfSY = sy * .5;
	const halfSZ = sz * .5;
	const indices = {
		vertex: 0,
		cell: 0
	};
	computePlane(geometry, indices, sz, sy, nz, ny, "x", halfSX);
	computePlane(geometry, indices, sz, sy, nz, ny, "-x", -halfSX);
	computePlane(geometry, indices, sx, sz, nx, nz, "y", halfSY);
	computePlane(geometry, indices, sx, sz, nx, nz, "-y", -halfSY);
	computePlane(geometry, indices, sx, sy, nx, ny, "z", halfSZ);
	computePlane(geometry, indices, sx, sy, nx, ny, "-z", -halfSZ);
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
const DIRECTIONS = [
	"x",
	"-x",
	"y",
	"-y",
	"z",
	"-z"
];
/**
* One off-center box's 6 faces, uvs remapped so outer faces tile one continuous
* 0-1 square per direction, like `cube`'s.
*
* @private
*/
function computeBox(geometry, indices, dims, center, fullSize) {
	for (const direction of DIRECTIONS) {
		const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];
		const su = dims[u];
		const sv = dims[v];
		const pw = (direction[0] === "-" ? -.5 : .5) * dims[w];
		const uvScale = [su / fullSize[u], sv / fullSize[v]];
		const uvOffset = [(1 - uvScale[0]) / 2 + center[u] * flipU / fullSize[u], (1 - uvScale[1]) / 2 - center[v] * flipV / fullSize[v]];
		computePlane(geometry, indices, su, sv, 1, 1, direction, pw, uvScale, uvOffset, center);
	}
}
/**
* @typedef {object} HollowCubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {number} [thickness=sx*0.2] Beam size, below half the smallest of
*   sx/sy/sz.
*/
/**
* A cube with a square hole through each face, like a Menger sponge cell.
*
* @param {HollowCubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowCube({ sx = 1, sy = sx, sz = sx, thickness = sx * .2 } = {}) {
	const fullSize = [
		sx,
		sy,
		sz
	];
	const half = [
		sx * .5,
		sy * .5,
		sz * .5
	];
	const t = thickness;
	const boxes = [];
	for (const su of [-1, 1]) for (const sv of [-1, 1]) for (const sw of [-1, 1]) boxes.push({
		dims: [
			t,
			t,
			t
		],
		center: [
			su * (half[0] - t / 2),
			sv * (half[1] - t / 2),
			sw * (half[2] - t / 2)
		]
	});
	for (let axis = 0; axis < 3; axis++) {
		const [u, v] = [
			0,
			1,
			2
		].filter((i) => i !== axis);
		for (const su of [-1, 1]) for (const sv of [-1, 1]) {
			const dims = [
				t,
				t,
				t
			];
			dims[axis] = fullSize[axis] - 2 * t;
			const center = [
				0,
				0,
				0
			];
			center[u] = su * (half[u] - t / 2);
			center[v] = sv * (half[v] - t / 2);
			boxes.push({
				dims,
				center
			});
		}
	}
	const size = boxes.length * 6 * 4;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(boxes.length * 6 * 2 * 3)
	};
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (const { dims, center } of boxes) computeBox(geometry, indices, dims, center, fullSize);
	return geometry;
}

/**
* @module utils
* @ignore
*/
/**
* @callback DistributionFn
* @param {number} t
* @returns {number}
*/
/**
* Uniform spacing, the default `vDistribution`.
*
* `vDistribution` remaps rows along meridians not swept at constant speed:
* `ellipsoid`, `superellipsoid`, `superegg`, `paraboloid`, `barrel`, `funnel`
* and `hyperboloid`.
*
* @type {DistributionFn}
*/
function linear(t) {
	return t;
}
/**
* Chebyshev spacing: clusters rows toward both ends, eg. a prolate
* `ellipsoid`'s poles.
*
* @type {DistributionFn}
*/
function chebyshev(t) {
	return (1 - Math.cos(Math.PI * t)) / 2;
}
/**
* Smoothstep spacing: clusters rows toward both ends, like `chebyshev`.
*
* @type {DistributionFn}
*/
function smoothstep(t) {
	return t * t * (3 - 2 * t);
}
/**
* Power spacing: clusters rows toward t = 1. `2` evens out `paraboloid`'s apex.
*
* @param {number} [exponent=2]
* @returns {function(number): number}
*/
function power(exponent = 2) {
	return (t) => 1 - (1 - t) ** exponent;
}

/**
* @module utils
* @ignore
*/
/** @private */
const TMP = [
	0,
	0,
	0
];
/**
* Flat disk cap fanning from a collapsed center. `point(x, y)` embeds the local
* disk (x along cos, y along sin) in 3D, `normal` is its outward normal with
* `flip` folded in, and `flip` picks the winding.
*
* @private
*/
function computeCap(geometry, indices, { ringSegments, capSegments, capRadius, sx = 1, sy = 1, flip, angleAt, point, normal, mapping, cols = ringSegments + 1, mergeSeam = false }) {
	const { positions, normals, uvs, cells } = geometry;
	const start = indices.vertex;
	const centerCount = mergeSeam ? 1 : cols;
	const at = (r, j) => r === 0 ? start + (mergeSeam ? 0 : j % cols) : start + centerCount + (r - 1) * cols + j % cols;
	let perimeter = 0;
	for (let j = 0; j < ringSegments; j++) {
		const a = angleAt(j);
		const b = angleAt(j + 1);
		perimeter += Math.hypot(capRadius * sx * (b.cos - a.cos), capRadius * sy * (b.sin - a.sin));
	}
	const writeVertex = (radiusRatio, cos, sin, t, thetaRatio) => {
		const x = capRadius * sx * radiusRatio * cos;
		const y = capRadius * sy * radiusRatio * sin;
		const [px, py, pz] = point(x, y);
		const i = indices.vertex;
		positions[i * 3] = px;
		positions[i * 3 + 1] = py;
		positions[i * 3 + 2] = pz;
		normals[i * 3] = normal[0];
		normals[i * 3 + 1] = normal[1];
		normals[i * 3 + 2] = normal[2];
		mapping({
			uvs,
			index: i * 2,
			u: radiusRatio * cos,
			v: radiusRatio * sin,
			radius: capRadius,
			sx,
			sy,
			radiusRatio,
			thetaRatio,
			t,
			x,
			y,
			perimeter
		});
		indices.vertex++;
	};
	for (let r = 0; r <= capSegments; r++) for (let j = 0; j < (r === 0 ? centerCount : cols); j++) {
		const { cos, sin, t } = angleAt(j);
		writeVertex(r / capSegments, cos, sin, t, j / ringSegments);
	}
	const [second, third] = flip === 1 ? [1, 2] : [2, 1];
	const writeTriangle = (a, b, c) => {
		cells[indices.cell] = a;
		cells[indices.cell + second] = b;
		cells[indices.cell + third] = c;
		indices.cell += 3;
	};
	for (let r = 0; r < capSegments; r++) for (let j = 0; j < ringSegments; j++) {
		const a = at(r, j);
		const b = at(r + 1, j);
		const c = at(r, j + 1);
		const d = at(r + 1, j + 1);
		if (r > 0) writeTriangle(a, c, d);
		writeTriangle(a, d, b);
	}
}
/**
* Vertex count of a `computeCap` with the same `cols`, `capSegments` and
* `mergeSeam`.
*
* @private
*/
function computeCapVertexCount(cols, capSegments, mergeSeam = false) {
	return (mergeSeam ? 1 : cols) + capSegments * cols;
}
/**
* Triangulate one grid quad: a/b on the previous row, c/d on the current, b/d
* one column after. `flip` picks the winding.
*
* @private
*/
function computeGridQuad(cells, indices, [a, b, c, d], flip) {
	if (flip === 1) {
		cells[indices.cell] = a;
		cells[indices.cell + 1] = c;
		cells[indices.cell + 2] = b;
		cells[indices.cell + 3] = b;
		cells[indices.cell + 4] = c;
		cells[indices.cell + 5] = d;
	} else {
		cells[indices.cell] = a;
		cells[indices.cell + 1] = b;
		cells[indices.cell + 2] = c;
		cells[indices.cell + 3] = b;
		cells[indices.cell + 4] = d;
		cells[indices.cell + 5] = c;
	}
	indices.cell += 6;
}
/**
* Meridian rows by angular columns, revolved around y.
*
* - `equation({ v, cosPhi, sinPhi })` returns a vertex's `position`, `normal`,
*   `collapsed` for rows pinched to the axis (only at v = 0 or 1), and
*   optionally its uv `v`.
* - `vDistribution` remaps rows along the meridian. Uv v follows it, so the
*   texture stays put.
* - `mergeSeam` shares the wrap column and smooth poles.
* - `capBase`/`capApex` add flat disks at uncollapsed ends.
*
* @private
*/
function computeRevolutionGeometry({ nx = 32, ny = 16, phi = TAU, phiOffset = 0, capBase = false, capApex = false, capSegments = 1, capBaseSegments = capSegments, capApexSegments = capSegments, capMapping, vDistribution = linear, mergeSeam = false, equation } = {}) {
	const wrap = phi % TAU === 0;
	const cols = mergeSeam && wrap ? nx : nx + 1;
	const collapsedAt = Array.from({ length: ny + 1 }, (_, y) => equation({
		v: vDistribution(y / ny),
		cosPhi: 1,
		sinPhi: 0
	}).collapsed);
	const fans = collapsedAt.reduce((sum, collapsed, y) => sum + (collapsed ? y === 0 || y === ny ? 1 : 2 : 0), 0);
	const caps = [capBase && !collapsedAt[0] && {
		v: 0,
		capSegments: capBaseSegments,
		flip: 1,
		normalY: -1
	}, capApex && !collapsedAt[ny] && {
		v: 1,
		capSegments: capApexSegments,
		flip: -1,
		normalY: 1
	}].filter(Boolean);
	const normalAt = (v, cosPhi, sinPhi) => normalize([...equation({
		v,
		cosPhi,
		sinPhi
	}).normal]).map(Math.fround);
	const mergedAt = collapsedAt.map((collapsed, y) => {
		if (!mergeSeam || !collapsed) return false;
		const v = vDistribution(y / ny);
		const n0 = normalAt(v, 1, 0);
		const n1 = normalAt(v, 0, 1);
		return n0.every((n, k) => n === n1[k]);
	});
	const rowOffsets = Array.from({ length: ny + 1 });
	let bodySize = 0;
	for (let y = 0; y <= ny; y++) {
		rowOffsets[y] = bodySize;
		bodySize += mergedAt[y] ? 1 : cols;
	}
	const at = (x, y) => rowOffsets[y] + (mergedAt[y] ? 0 : x % cols);
	const capSize = caps.reduce((sum, { capSegments }) => sum + (capSegments > 0 ? computeCapVertexCount(cols, capSegments, mergeSeam) : 0), 0);
	const capCellCount = caps.reduce((sum, { capSegments }) => sum + (capSegments > 0 ? (capSegments * 6 - 3) * nx : 0), 0);
	const size = bodySize + capSize;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(ny * nx * 6 - fans * nx * 3 + capCellCount);
	let vertexIndex = 0;
	let cellIndex = 0;
	const phiAt = (x) => (wrap && x === nx ? 0 : x / nx) * phi + phiOffset;
	const writeVertex = (x, v, uOffset) => {
		const p = phiAt(x);
		const { position, normal, v: uvV = v } = equation({
			v,
			cosPhi: Math.cos(p),
			sinPhi: Math.sin(p)
		});
		positions[vertexIndex * 3] = position[0];
		positions[vertexIndex * 3 + 1] = position[1];
		positions[vertexIndex * 3 + 2] = position[2];
		TMP[0] = normal[0];
		TMP[1] = normal[1];
		TMP[2] = normal[2];
		normalize(TMP);
		normals[vertexIndex * 3] = TMP[0];
		normals[vertexIndex * 3 + 1] = TMP[1];
		normals[vertexIndex * 3 + 2] = TMP[2];
		uvs[vertexIndex * 2] = (x + uOffset) / nx;
		uvs[vertexIndex * 2 + 1] = uvV;
	};
	const writeRowQuads = (y) => {
		for (let x = 0; x < nx; x++) {
			const a = at(x, y - 1);
			const b = at(x + 1, y - 1);
			const c = at(x, y);
			const d = at(x + 1, y);
			if (!collapsedAt[y - 1]) {
				cells[cellIndex] = a;
				cells[cellIndex + 1] = b;
				cells[cellIndex + 2] = c;
				cellIndex += 3;
			}
			if (!collapsedAt[y]) {
				cells[cellIndex] = c;
				cells[cellIndex + 1] = collapsedAt[y - 1] ? a : b;
				cells[cellIndex + 2] = d;
				cellIndex += 3;
			}
		}
	};
	const writeRow = (y) => {
		const v = vDistribution(y / ny);
		const centered = collapsedAt[y] && !mergedAt[y];
		const count = mergedAt[y] ? 1 : cols;
		for (let x = 0; x < count; x++, vertexIndex++) writeVertex(x, v, centered && x < nx ? .5 : 0);
	};
	for (let y = 0; y <= ny; y++) {
		writeRow(y);
		if (y > 0) writeRowQuads(y);
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	const indices = {
		vertex: vertexIndex,
		cell: cellIndex
	};
	const addCap = ({ v, capSegments, flip, normalY }) => {
		const atCos = equation({
			v,
			cosPhi: 1,
			sinPhi: 0
		});
		const atSin = equation({
			v,
			cosPhi: 0,
			sinPhi: 1
		});
		const xSign = atCos.position[0] < 0 ? -1 : 1;
		const zSign = atSin.position[2] < 0 ? -1 : 1;
		computeCap(geometry, indices, {
			ringSegments: nx,
			capSegments,
			capRadius: 1,
			sx: xSign * atCos.position[0],
			sy: zSign * atSin.position[2],
			flip,
			angleAt: (i) => {
				const p = phiAt(i);
				return {
					cos: xSign * Math.cos(p),
					sin: zSign * Math.sin(p),
					t: p
				};
			},
			point: (x, y) => [
				x,
				atCos.position[1],
				y
			],
			normal: [
				0,
				normalY,
				0
			],
			mapping: capMapping,
			cols,
			mergeSeam
		});
	};
	for (const cap of caps) addCap(cap);
	return {
		positions,
		normals,
		uvs,
		cells,
		indices
	};
}
/**
* Polygon ring corner, with `cylinder`'s sign convention. Shared by prism walls
* and caps so they weld bit-identically.
*
* @private
*/
function computePolygonCorner(angle, radius, y) {
	return [
		-radius * Math.cos(angle),
		y,
		radius * Math.sin(angle)
	];
}
/**
* A prism's flat polygon cap: `computeCap` sampled at its corners only.
*
* @private
*/
function computePolygonCap(geometry, indices, { sides, radius, y, flip, normalY, angleAt, mapping, mergeSeam = false }) {
	computeCap(geometry, indices, {
		ringSegments: sides,
		capSegments: 1,
		capRadius: radius,
		flip,
		angleAt: (i) => {
			const p = angleAt(i);
			return {
				cos: -Math.cos(p),
				sin: Math.sin(p),
				t: p
			};
		},
		point: (x, z) => [
			x,
			y,
			z
		],
		normal: [
			0,
			normalY,
			0
		],
		mapping,
		cols: mergeSeam ? sides : sides + 1,
		mergeSeam
	});
}
/**
* Revolution of a circular arc crossing the axis at both ends, with cusped
* poles: `apple` and `lemon`. `poleCosTheta` is passed separately, as deriving
* it from `radiusAt` misses r = 0.
*
* @private
*/
function computeSpindleArcRevolution({ a, halfHeight, thetaCross, poleCosTheta, radiusAt, nx, ny, phi, phiOffset, mergeSeam }) {
	function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
		const cosPhi = snapToZero(rawCosPhi);
		const sinPhi = snapToZero(rawSinPhi);
		let cosTheta, sinTheta, r, y;
		if (v === 0 || v === 1) {
			cosTheta = poleCosTheta;
			sinTheta = (v === 0 ? -halfHeight : halfHeight) / a;
			r = 0;
			y = v === 0 ? -halfHeight : halfHeight;
		} else {
			const theta = -thetaCross + v * 2 * thetaCross;
			cosTheta = snapToZero(Math.cos(theta));
			sinTheta = snapToZero(Math.sin(theta));
			r = radiusAt(cosTheta);
			y = a * sinTheta;
		}
		return {
			position: [
				-cosPhi * r,
				y,
				sinPhi * r
			],
			normal: [
				-cosPhi * cosTheta,
				sinTheta,
				sinPhi * cosTheta
			],
			collapsed: r === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		mergeSeam,
		equation
	});
}
/**
* Flat-ended surface of revolution, cappable like `cylinder`: `barrel`,
* `funnel`, `hyperboloid`. `profile(y, v)` returns the radius and the
* gradient's y component. Both y and v are passed so a radius law needn't
* round-trip between them.
*
* @private
*/
function computeFlatRevolutionGeometry({ height, nx, ny, phi, phiOffset, capApex, capBase, capApexSegments, capBaseSegments, capMapping, vDistribution, mergeSeam, profile }) {
	const halfHeight = height / 2;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const y = height * v - halfHeight;
		const [r, normalY] = profile(y, v);
		const x = r * cosPhi;
		const z = r * sinPhi;
		return {
			position: [
				x,
				y,
				z
			],
			normal: [
				x,
				normalY,
				z
			],
			collapsed: false
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		capApex,
		capBase,
		capApexSegments,
		capBaseSegments,
		capMapping,
		vDistribution,
		mergeSeam,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/** @typedef {"all" | "x" | "y" | "z"} RoundedCubeDirection */
/**
* @typedef {object} RoundedCubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {number} [radius=sx * 0.25]
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
* @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along
*   the straight x sections.
* @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments
*   along the straight y sections.
* @property {import("../../../types.js").PositiveInteger} [nz=nx] Segments
*   along the straight z sections.
* @property {RoundedCubeDirection} [roundDirection="all"]
*/
/**
* A cuboid with rounded edges and corners.
*
* @param {RoundedCubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedCube({ sx = 1, sy = sx, sz = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, nz = nx, roundDirection = "all" } = {}) {
	const r2 = radius * 2;
	const widthX = sx - r2;
	const widthY = sy - r2;
	const widthZ = sz - r2;
	if (widthX === 0) nx = 0;
	if (widthY === 0) ny = 0;
	if (widthZ === 0) nz = 0;
	const colsX = 2 * roundSegments + nx;
	const colsY = 2 * roundSegments + ny;
	const colsZ = 2 * roundSegments + nz;
	const size = ((colsX + 1) * (colsY + 1) + (colsZ + 1) * (colsY + 1) + (colsX + 1) * (colsZ + 1)) * 2;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))((colsX * colsY + colsZ * colsY + colsX * colsZ) * 2 * 6)
	};
	const halfSX = sx * .5;
	const halfSY = sy * .5;
	const halfSZ = sz * .5;
	const indices = {
		vertex: 0,
		cell: 0
	};
	const excludedAxis = roundDirection === "all" ? -1 : "xyz".indexOf(roundDirection);
	const bounds = [
		widthX * .5,
		widthY * .5,
		widthZ * .5
	];
	const PLANES = [
		[
			widthZ,
			widthY,
			nz,
			ny,
			"x",
			halfSX
		],
		[
			widthZ,
			widthY,
			nz,
			ny,
			"-x",
			-halfSX
		],
		[
			widthX,
			widthZ,
			nx,
			nz,
			"y",
			halfSY
		],
		[
			widthX,
			widthZ,
			nx,
			nz,
			"-y",
			-halfSY
		],
		[
			widthX,
			widthY,
			nx,
			ny,
			"z",
			halfSZ
		],
		[
			widthX,
			widthY,
			nx,
			ny,
			"-z",
			-halfSZ
		]
	];
	const roundVertex = (vertexIndex, position) => {
		TMP[0] = position[0];
		TMP[1] = position[1];
		TMP[2] = position[2];
		for (let k = 0; k < 3; k++) {
			if (k === excludedAxis) continue;
			const bound = bounds[k];
			if (position[k] < -bound) position[k] = -bound;
			else if (position[k] > bound) position[k] = bound;
		}
		for (let k = 0; k < 3; k++) TMP[k] = k === excludedAxis ? 0 : TMP[k] - position[k];
		normalize(TMP);
		geometry.normals[vertexIndex] = TMP[0];
		geometry.normals[vertexIndex + 1] = TMP[1];
		geometry.normals[vertexIndex + 2] = TMP[2];
		geometry.positions[vertexIndex] = position[0] + radius * TMP[0];
		geometry.positions[vertexIndex + 1] = position[1] + radius * TMP[1];
		geometry.positions[vertexIndex + 2] = position[2] + radius * TMP[2];
	};
	const roundFace = (plane, startVertex) => {
		const [su, sv, nu, nv, direction, pw] = plane;
		const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];
		const cols = 2 * roundSegments + nu;
		const rows = 2 * roundSegments + nv;
		for (let j = 0; j <= rows; j++) {
			const y0 = getPlaneCoordinate(j, nv, sv, radius, roundSegments);
			for (let x = 0; x <= cols; x++) {
				const x0 = getPlaneCoordinate(x, nu, su, radius, roundSegments);
				const position = [
					0,
					0,
					0
				];
				position[u] = x0 * flipU;
				position[v] = y0 * flipV;
				position[w] = pw;
				roundVertex((startVertex + j * (cols + 1) + x) * 3, position);
			}
		}
	};
	for (const plane of PLANES) {
		const [su, sv, nu, nv, direction, pw] = plane;
		const outOfPlaneAxis = PLANE_DIRECTIONS[direction][2];
		const startVertex = indices.vertex;
		const axisActive = outOfPlaneAxis !== excludedAxis;
		computePlane(geometry, indices, su, sv, nu, nv, direction, pw, [1, 1], [0, 0], [
			0,
			0,
			0
		], true, radius, roundSegments, !axisActive);
		if (axisActive) roundFace(plane, startVertex);
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} EllipsoidOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI] Meridian
*   sweep length, clamped so poles stay at its ends.
* @property {import("../../../types.js").PolarAngle} [thetaOffset=0] Meridian
*   sweep start from the north pole, clamped to [0, π].
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* Unit-sphere direction at meridian angle t, shared so surfaces welding to an
* ellipsoid (eg. `hollowSphere`'s cut caps) get bit-identical positions.
*
* @private
* @param {number} t Meridian angle, 0 at the north pole
* @param {number} cosPhi
* @param {number} sinPhi
* @returns {[number, number, number]}
*/
function sphereDirection(t, cosPhi, sinPhi) {
	const cosTheta = snapToZero(Math.cos(t));
	const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
	cosPhi = snapToZero(cosPhi);
	sinPhi = snapToZero(sinPhi);
	return [
		-cosPhi * sinTheta,
		-cosTheta,
		sinPhi * sinTheta
	];
}
/**
* An ellipsoid, oblate by default.
*
* Special cases: sphere (sx = sy = sz), prolate spheroid (sy > sx = sz).
*
* @param {EllipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function ellipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear, mergeSeam = false } = {}) {
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);
		return {
			position: [
				radius * sx * dx,
				radius * sy * dy,
				radius * sz * dz
			],
			normal: [
				dx / sx,
				dy / sy,
				dz / sz
			],
			collapsed: t % Math.PI === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI]
* @property {import("../../../types.js").PolarAngle} [thetaOffset=0]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A sphere: `ellipsoid` with sx = sy = 1.
*
* @param {SphereOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function sphere({ radius = .5, nx = 32, ny = 16, theta, thetaOffset, phi, phiOffset, mergeSeam } = {}) {
	return ellipsoid({
		radius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		mergeSeam,
		phiOffset,
		sx: 1,
		sy: 1
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* Flat wall closing a theta cut, on the bands' nx grid so its rims weld. flip
* picks the start or end cap.
*
* @private
*/
function thetaCap({ t, phi, phiOffset, nx, capSegments, radius, innerRadius, flip, mergeSeam }) {
	const wrap = phi % TAU === 0;
	const cols = mergeSeam && wrap ? nx : nx + 1;
	const size = (capSegments + 1) * cols;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(capSegments * nx * 6);
	const cosT = Math.cos(t);
	const sinT = Math.sin(t);
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (let j = 0; j <= capSegments; j++) {
		const r = innerRadius + (radius - innerRadius) * (j / capSegments);
		for (let i = 0; i < cols; i++, indices.vertex++) {
			const u = i / nx;
			const p = (wrap && i === nx ? 0 : u) * phi + phiOffset;
			const cosPhi = Math.cos(p);
			const sinPhi = Math.sin(p);
			const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);
			positions[indices.vertex * 3] = r * dx;
			positions[indices.vertex * 3 + 1] = r * dy;
			positions[indices.vertex * 3 + 2] = r * dz;
			TMP[0] = flip * -cosPhi * cosT;
			TMP[1] = flip * sinT;
			TMP[2] = flip * sinPhi * cosT;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = j / capSegments;
		}
	}
	const at = (i, j) => j * cols + i % cols;
	for (let j = 1; j <= capSegments; j++) for (let i = 1; i <= nx; i++) computeGridQuad(cells, indices, [
		at(i - 1, j - 1),
		at(i, j - 1),
		at(i - 1, j),
		at(i, j)
	], flip);
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* Flat wall closing a phi cut, on the bands' ny grid so its rims weld. flip
* picks the start or end cap.
*
* @private
*/
function phiCap({ p, theta, thetaOffset, ny, capSegments, radius, innerRadius, flip }) {
	const rows = ny + 1;
	const size = (capSegments + 1) * rows;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(capSegments * ny * 6);
	const cosP = Math.cos(p);
	const sinP = Math.sin(p);
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (let j = 0; j <= capSegments; j++) {
		const r = innerRadius + (radius - innerRadius) * (j / capSegments);
		for (let i = 0; i <= ny; i++, indices.vertex++) {
			const v = i / ny;
			const t = thetaOffset + theta * v;
			const sinT = Math.sin(t);
			const [dx, dy, dz] = sphereDirection(t, cosP, sinP);
			positions[indices.vertex * 3] = r * dx;
			positions[indices.vertex * 3 + 1] = r * dy;
			positions[indices.vertex * 3 + 2] = r * dz;
			TMP[0] = flip * sinP * sinT;
			TMP[1] = 0;
			TMP[2] = flip * cosP * sinT;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = v;
			uvs[indices.vertex * 2 + 1] = j / capSegments;
		}
	}
	const at = (i, j) => j * rows + i;
	for (let j = 1; j <= capSegments; j++) for (let i = 1; i <= ny; i++) computeGridQuad(cells, indices, [
		at(i - 1, j - 1),
		at(i, j - 1),
		at(i - 1, j),
		at(i, j)
	], -flip);
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* @typedef {object} HollowSphereOptions
* @property {number} [radius=0.5]
* @property {number} [innerRadius=radius*0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
*   Radial segments per cut cap.
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI / 2]
*   Meridian sweep length, clamped like `ellipsoid`'s.
* @property {import("../../../types.js").PolarAngle} [thetaOffset=Math.PI / 4]
*   Meridian sweep start, clamped like `ellipsoid`'s.
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A spherical shell. Defaults to a band, exposing the cavity.
*
* @param {HollowSphereOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowSphere({ radius = .5, innerRadius = radius * .5, nx = 32, ny = 16, capSegments = 1, theta = Math.PI / 2, thetaOffset = Math.PI / 4, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	const thetaStart = clampedThetaOffset;
	const thetaEnd = clampedThetaOffset + clampedTheta;
	const pieces = [sphere({
		radius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		phiOffset,
		mergeSeam
	}), invert(sphere({
		radius: innerRadius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		mergeSeam,
		phiOffset
	}))];
	if (thetaStart % Math.PI !== 0) pieces.push(thetaCap({
		t: thetaStart,
		phi,
		mergeSeam,
		phiOffset,
		nx,
		capSegments,
		radius,
		innerRadius,
		flip: -1
	}));
	if (thetaEnd % Math.PI !== 0) pieces.push(thetaCap({
		t: thetaEnd,
		phi,
		mergeSeam,
		phiOffset,
		nx,
		capSegments,
		radius,
		innerRadius,
		flip: 1
	}));
	if (phi % TAU !== 0) pieces.push(phiCap({
		p: phiOffset,
		theta: clampedTheta,
		thetaOffset: clampedThetaOffset,
		ny,
		capSegments,
		radius,
		innerRadius,
		flip: -1
	}), phiCap({
		p: phiOffset + phi,
		theta: clampedTheta,
		thetaOffset: clampedThetaOffset,
		ny,
		capSegments,
		radius,
		innerRadius,
		flip: 1
	}));
	return concatGeometries(pieces);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SuperellipsoidOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {number} [n1=3] Meridian roundness exponent.
* @property {number} [n2=n1] Cross-section roundness exponent.
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI] Meridian
*   sweep length, clamped so poles stay at its ends.
* @property {import("../../../types.js").PolarAngle} [thetaOffset=0] Meridian
*   sweep start from the north pole, clamped to [0, π].
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A superellipsoid: n > 2 rounds toward a box, n < 2 pinches.
*
* Special cases: ellipsoid (n1 = n2 = 2), octahedron (n1 = n2 = 1), astroidal
* ellipsoid (n1 = n2 = 2/3), superegg-like (n2 = 2, sx = sz).
*
* @param {SuperellipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superellipsoid]{@link https://mathworld.wolfram.com/Superellipsoid.html}
* @see [Wikipedia – Superellipsoid]{@link https://en.wikipedia.org/wiki/Superellipsoid}
*/
function superellipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, n1 = 3, n2 = n1, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear, mergeSeam = false } = {}) {
	const e1 = 2 / n1;
	const e2 = 2 / n2;
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const dx = -signedPow(cosPhi, e2) * signedPow(sinTheta, e1);
		const dy = -signedPow(cosTheta, e1);
		const dz = signedPow(sinPhi, e2) * signedPow(sinTheta, e1);
		return {
			position: [
				radius * sx * dx,
				radius * sy * dy,
				radius * sz * dz
			],
			normal: [
				-signedPow(cosPhi, 2 - e2) * signedPow(sinTheta, 2 - e1) / sx,
				-signedPow(cosTheta, 2 - e1) / sy,
				signedPow(sinPhi, 2 - e2) * signedPow(sinTheta, 2 - e1) / sz
			],
			collapsed: sinTheta === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		vDistribution,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AstroidalEllipsoidOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI] Meridian
*   sweep length, clamped so poles stay at its ends.
* @property {import("../../../types.js").PolarAngle} [thetaOffset=0] Meridian
*   sweep start from the north pole, clamped to [0, π].
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* An astroidal ellipsoid: `superellipsoid` with n1 = n2 = 2/3, pinched to 6
* cusps.
*
* @param {AstroidalEllipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Astroidal Ellipsoid]{@link https://mathworld.wolfram.com/AstroidalEllipsoid.html}
*/
function astroidalEllipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	return superellipsoid({
		radius,
		nx,
		ny,
		sx,
		sy,
		sz,
		n1: 2 / 3,
		n2: 2 / 3,
		theta,
		thetaOffset,
		phi,
		mergeSeam,
		phiOffset
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SupereggOptions
* @property {number} [radius=0.5] Equatorial radius
* @property {number} [sy=5/6] Vertical (polar) scale
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {number} [n=2.5] Roundness exponent.
* @property {import("../../../types.js").PolarAngle} [theta=Math.PI] Meridian
*   sweep length, clamped so poles stay at its ends.
* @property {import("../../../types.js").PolarAngle} [thetaOffset=0] Meridian
*   sweep start from the north pole, clamped to [0, π].
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* Piet Hein's superegg: a superellipsoid of revolution.
*
* Special cases: spheroid (n = 2).
*
* @param {SupereggOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superegg]{@link https://mathworld.wolfram.com/Superegg.html}
* @see [Wikipedia – Superegg]{@link https://en.wikipedia.org/wiki/Superegg}
*/
function superegg({ radius = .5, sy = 5 / 6, nx = 32, ny = 16, n = 2.5, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear, mergeSeam = false } = {}) {
	const e = 2 / n;
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const s = signedPow(sinTheta, e);
		return {
			position: [
				radius * -cosPhi * s,
				radius * sy * -signedPow(cosTheta, e),
				radius * sinPhi * s
			],
			normal: [
				-cosPhi * signedPow(sinTheta, 2 - e) / radius,
				-signedPow(cosTheta, 2 - e) / (radius * sy),
				sinPhi * signedPow(sinTheta, 2 - e) / radius
			],
			collapsed: sinTheta === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		vDistribution,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CylinderOptions
* @property {number} [height=1]
* @property {number} [radiusBase=0.25]
* @property {number} [radiusApex=0.25]
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1]
* @property {boolean} [capBase=true]
* @property {boolean} [capApex=true]
* @property {import("../../../types.js").PositiveInteger} [capBaseSegments=1]
* @property {import("../../../types.js").PositiveInteger} [capApexSegments=1]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sxBase=1] Base ring x scale.
* @property {number} [szBase=1] Base ring z scale.
* @property {number} [sxApex=1] Apex ring x scale.
* @property {number} [szApex=1] Apex ring z scale.
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A right circular cylinder.
*
* Special cases: tube (no caps), frustum (radiusApex != radiusBase), cone
* (radiusApex = 0), elliptical cylinder (sxBase != szBase, sxApex != szApex).
*
* @param {CylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cylinder({ height = 1, radiusBase = .25, radiusApex = .25, nx = 16, ny = 1, capBase = true, capApex = true, capBaseSegments = 1, capApexSegments = 1, phi = TAU, phiOffset = 0, capMapping = rectangular, sxBase = 1, szBase = 1, sxApex = 1, szApex = 1, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const rPrime = radiusApex - radiusBase;
	const sxPrime = sxApex - sxBase;
	const szPrime = szApex - szBase;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = lerp(radiusBase, radiusApex, v);
		const sxV = lerp(sxBase, sxApex, v);
		const szV = lerp(szBase, szApex, v);
		return {
			position: [
				r * sxV * cosPhi,
				height * v - halfHeight,
				r * szV * sinPhi
			],
			normal: [
				height * szV * cosPhi,
				-(rPrime * sxV * szV + r * (sxPrime * szV * cosPhi * cosPhi + sxV * szPrime * sinPhi * sinPhi)),
				height * sxV * sinPhi
			],
			collapsed: r === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capBase,
		capApex,
		capBaseSegments,
		capApexSegments,
		capMapping,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* A frustum segment between yFrom and yTo, with constant sx/sz.
*
* @private
*/
function computeConeSegment({ yFrom, yTo, rFrom, rTo, nx, ny, phi, phiOffset, sx = 1, sz = 1, mergeSeam, capOptions }) {
	const rPrime = rTo - rFrom;
	const yPrime = yTo - yFrom;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = rFrom + rPrime * v;
		return {
			position: [
				r * sx * cosPhi,
				yFrom + yPrime * v,
				r * sz * sinPhi
			],
			normal: [
				yPrime * sz * cosPhi,
				-(rPrime * sx * sz),
				yPrime * sx * sinPhi
			],
			collapsed: r === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		equation,
		...capOptions
	});
}
/**
* @typedef {object} ConeOptions
* @property {number} [height=1]
* @property {number} [radius=0.25]
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
* @property {boolean} [capBase=true]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] Base ring x scale.
* @property {number} [sz=1] Base ring z scale.
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A right circular cone.
*
* Special cases: open cone (capBase = false), elliptical cone (sx != sz).
*
* @param {ConeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cone({ height = 1, radius = .25, nx = 16, ny = 1, capSegments = 1, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, sx = 1, sz = 1, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const { positions, normals, uvs, cells } = computeConeSegment({
		yFrom: -halfHeight,
		yTo: halfHeight,
		rFrom: radius,
		rTo: 0,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		sx,
		sz,
		capOptions: {
			capBase,
			capBaseSegments: capSegments,
			capMapping
		}
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HollowCylinderOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {number} [innerRadius=radius*0.5] Bore radius.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=1]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
*   Radial segments per cap.
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A cylinder with a concentric bore. A `phi < TAU` cut is left open.
*
* @param {HollowCylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowCylinder({ height = 1, radius = .5, innerRadius = radius * .5, nx = 32, ny = 1, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const annularCap = (y, rFrom, rTo) => computeConeSegment({
		yFrom: y,
		yTo: y,
		rFrom,
		rTo,
		nx,
		ny: capSegments,
		phi,
		mergeSeam,
		phiOffset
	});
	const pieces = [cylinder({
		height,
		radiusBase: radius,
		radiusApex: radius,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capBase: false,
		capApex: false
	}), invert(cylinder({
		height,
		radiusBase: innerRadius,
		radiusApex: innerRadius,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capBase: false,
		capApex: false
	}))];
	if (capApex) pieces.push(annularCap(halfHeight, radius, innerRadius));
	if (capBase) pieces.push(annularCap(-halfHeight, innerRadius, radius));
	return concatGeometries(pieces);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RoundedCylinderOptions
* @property {number} [height=1]
* @property {number} [radius=0.25]
* @property {number} [roundRadius=radius*0.3] Rim fillet radius, clamped to [0,
*   min(radius, height / 2)].
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1] Straight side
*   segments.
* @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
*   Fillet segments per end.
* @property {import("../../../types.js").PositiveInteger} [capSegments=1] Flat
*   cap segments per end.
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A cylinder with filleted rims.
*
* Special cases: cylinder (roundRadius = 0), capsule (roundRadius = radius).
*
* @param {RoundedCylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedCylinder({ height = 1, radius = .25, roundRadius = radius * .3, nx = 16, ny = 1, roundSegments = 8, capSegments = 1, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const clampedRoundRadius = clamp(roundRadius, 0, Math.min(radius, halfHeight));
	const hasFillet = clampedRoundRadius > 0;
	const activeRoundSegments = hasFillet ? roundSegments : 0;
	const flatRadius = radius - clampedRoundRadius;
	const activeCapSegments = flatRadius > 0 ? capSegments : 0;
	const sideHalfHeight = halfHeight - clampedRoundRadius;
	const activeNy = sideHalfHeight > 0 ? ny : 0;
	const halfPi = Math.PI / 2;
	const nyTotal = 2 * activeCapSegments + 2 * activeRoundSegments + activeNy;
	const v1 = activeCapSegments / nyTotal;
	const v2 = (activeCapSegments + activeRoundSegments) / nyTotal;
	const v3 = (activeCapSegments + activeRoundSegments + activeNy) / nyTotal;
	const v4 = (activeCapSegments + 2 * activeRoundSegments + activeNy) / nyTotal;
	const capLength = flatRadius;
	const filletLength = halfPi * clampedRoundRadius;
	const sideLength = 2 * sideHalfHeight;
	const totalLength = 2 * capLength + 2 * filletLength + sideLength;
	const cap1End = capLength;
	const fillet1End = cap1End + filletLength;
	const sideEnd = fillet1End + sideLength;
	const fillet2End = sideEnd + filletLength;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		let r, y, normalRadial, normalY, uvV;
		if (v <= v1) {
			const localFraction = v1 === 0 ? 0 : v / v1;
			r = flatRadius * localFraction;
			y = -halfHeight;
			normalRadial = 0;
			normalY = -1;
			uvV = localFraction * capLength / totalLength;
		} else if (hasFillet && v <= v2) {
			const localFraction = (v - v1) / (v2 - v1);
			const a = localFraction * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = flatRadius + clampedRoundRadius * sinA;
			y = -sideHalfHeight - clampedRoundRadius * cosA;
			normalRadial = sinA;
			normalY = -cosA;
			uvV = (cap1End + localFraction * filletLength) / totalLength;
		} else if (v <= v3) {
			const localFraction = v3 > v2 ? (v - v2) / (v3 - v2) : 0;
			r = radius;
			y = -sideHalfHeight + 2 * sideHalfHeight * localFraction;
			normalRadial = 1;
			normalY = 0;
			uvV = (fillet1End + localFraction * sideLength) / totalLength;
		} else if (hasFillet && v <= v4) {
			const localFraction = (v - v3) / (v4 - v3);
			const a = localFraction * halfPi;
			const sinA = snapToZero(Math.sin(halfPi - a));
			const cosA = snapToZero(Math.cos(halfPi - a));
			r = flatRadius + clampedRoundRadius * sinA;
			y = sideHalfHeight + clampedRoundRadius * cosA;
			normalRadial = sinA;
			normalY = cosA;
			uvV = (sideEnd + localFraction * filletLength) / totalLength;
		} else {
			const localFraction = v4 === 1 ? 0 : (v - v4) / (1 - v4);
			r = flatRadius * (1 - localFraction);
			y = halfHeight;
			normalRadial = 0;
			normalY = 1;
			uvV = (fillet2End + localFraction * capLength) / totalLength;
		}
		return {
			position: [
				r * cosPhi,
				y,
				r * sinPhi
			],
			normal: [
				normalRadial * cosPhi,
				normalY,
				normalRadial * sinPhi
			],
			collapsed: r === 0,
			v: uvV
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny: nyTotal,
		phi,
		mergeSeam,
		phiOffset,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} BiconeOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1] Meridian
*   segments per cone.
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {number} [sx=1] Equator x scale.
* @property {number} [sz=1] Equator z scale.
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* Two cones joined base to base.
*
* @param {BiconeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function bicone({ height = 1, radius = .5, nx = 16, ny = 1, phi = TAU, phiOffset = 0, sx = 1, sz = 1, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const segment = (yFrom, yTo, rFrom, rTo) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		sx,
		sz
	});
	return concatGeometries([segment(-halfHeight, 0, 0, radius), segment(0, halfHeight, radius, 0)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* Math.sin(PI) isn't exactly 0, and `twist` moves that residual where an apex
* is: snapping keeps both copies bit-identical.
*
* @private
*/
function snapZeros(array) {
	for (let i = 0; i < array.length; i++) array[i] = snapToZero(array[i]);
}
/**
* Rotate by (x, y, z) -> (-y, -x, -z), the sphericon's 90° twist. A proper
* rotation, so normals and winding carry over.
*
* @private
*/
function twist({ positions, normals, uvs, cells }) {
	const twistedPositions = new Float32Array(positions.length);
	const twistedNormals = new Float32Array(normals.length);
	for (let i = 0; i < positions.length; i += 3) {
		twistedPositions[i] = -positions[i + 1];
		twistedPositions[i + 1] = -positions[i];
		twistedPositions[i + 2] = -positions[i + 2];
		twistedNormals[i] = -normals[i + 1];
		twistedNormals[i + 1] = -normals[i];
		twistedNormals[i + 2] = -normals[i + 2];
	}
	return {
		positions: twistedPositions,
		normals: twistedNormals,
		uvs,
		cells
	};
}
/**
* @typedef {object} SphericonOptions
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=16] Segments per
*   quarter-cone half-turn.
* @property {import("../../../types.js").PositiveInteger} [ny=1] Meridian
*   segments per quarter-cone.
*/
/**
* A sphericon: a bicone split through its apexes, one half turned 90°.
*
* @param {SphericonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Sphericon]{@link https://mathworld.wolfram.com/Sphericon.html}
*/
function sphericon({ radius = .5, nx = 16, ny = 1 } = {}) {
	const segment = (yFrom, yTo, rFrom, rTo) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi: Math.PI,
		phiOffset: 0
	});
	const half = concatGeometries([segment(-radius, 0, 0, radius), segment(0, radius, radius, 0)]);
	snapZeros(half.positions);
	snapZeros(half.normals);
	return concatGeometries([half, twist(half)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DoubleConeOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1] Meridian
*   segments per cone.
* @property {boolean} [capBase=true]
* @property {boolean} [capApex=true]
* @property {import("../../../types.js").PositiveInteger} [capBaseSegments=1]
* @property {import("../../../types.js").PositiveInteger} [capApexSegments=1]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] End ring x scale.
* @property {number} [sz=1] End ring z scale.
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* Two cones joined apex to apex.
*
* @param {DoubleConeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function doubleCone({ height = 1, radius = .5, nx = 16, ny = 1, capBase = true, capApex = true, capBaseSegments = 1, capApexSegments = 1, phi = TAU, phiOffset = 0, capMapping = rectangular, sx = 1, sz = 1, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const segment = (yFrom, yTo, rFrom, rTo, capOptions) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		sx,
		sz,
		capOptions
	});
	return concatGeometries([segment(-halfHeight, 0, radius, 0, {
		capBase,
		capBaseSegments,
		capMapping
	}), segment(0, halfHeight, 0, radius, {
		capApex,
		capApexSegments,
		capMapping
	})]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CapsuleOptions
* @property {number} [height=0.5]
* @property {number} [radius=0.25]
* @property {import("../../../types.js").PositiveInteger} [nx=16]
* @property {import("../../../types.js").PositiveInteger} [ny=1]
* @property {import("../../../types.js").NonNegativeInteger} [roundSegments=16]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A capsule: a cylinder capped with 2 hemispheres.
*
* Special cases: open tube (roundSegments = 0).
*
* @param {CapsuleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function capsule({ height = .5, radius = .25, nx = 16, ny = 1, roundSegments = 16, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const halfPi = Math.PI / 2;
	const nyTotal = 2 * roundSegments + ny;
	const bodyStart = roundSegments / nyTotal;
	const bodyEnd = (roundSegments + ny) / nyTotal;
	const quarterArc = radius * halfPi;
	const meridianLength = 2 * quarterArc + height;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		let r, y, normalRadial, normalY, arcLength;
		if (roundSegments > 0 && v <= bodyStart) {
			const a = v / bodyStart * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = radius * sinA;
			y = -halfHeight - radius * cosA;
			normalRadial = sinA;
			normalY = -cosA;
			arcLength = radius * a;
		} else if (roundSegments > 0 && v >= bodyEnd) {
			const a = (1 - (v - bodyEnd) / (1 - bodyEnd)) * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = radius * sinA;
			y = halfHeight + radius * cosA;
			normalRadial = sinA;
			normalY = cosA;
			arcLength = meridianLength - radius * a;
		} else {
			const s = (v - bodyStart) / (bodyEnd - bodyStart);
			r = radius;
			y = -halfHeight + height * s;
			normalRadial = 1;
			normalY = 0;
			arcLength = quarterArc + height * s;
		}
		return {
			position: [
				r * cosPhi,
				y,
				r * sinPhi
			],
			normal: [
				normalRadial * cosPhi,
				normalY,
				normalRadial * sinPhi
			],
			collapsed: r === 0,
			v: arcLength / meridianLength
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny: nyTotal,
		phi,
		mergeSeam,
		phiOffset,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TorusOptions
* @property {number} [radius=0.4]
* @property {import("../../../types.js").PositiveInteger} [segments=64]
* @property {number} [minorRadius=0.1]
* @property {import("../../../types.js").PositiveInteger} [minorSegments=32]
* @property {import("../../../types.js").Angle} [theta=TAU]
* @property {import("../../../types.js").Angle} [thetaOffset=0]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [capStart=true]
* @property {boolean} [capEnd=true]
* @property {import("../../../types.js").PositiveInteger} [capStartSegments=1]
* @property {import("../../../types.js").PositiveInteger} [capEndSegments=1]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] Footprint x scale.
* @property {number} [sy=1] Footprint y scale.
* @property {number} [minorSx=1] Tube radial scale.
* @property {number} [minorSy=1] Tube z scale.
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A ring torus.
*
* Special cases: open torus (phi < TAU), elliptical torus (sx != sy),
* elliptical tube (minorSx != minorSy).
*
* @param {TorusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function torus({ radius = .4, segments = 64, minorRadius = .1, minorSegments = 32, theta = TAU, thetaOffset = 0, phi = TAU, phiOffset = 0, capStart = true, capEnd = true, capStartSegments = 1, capEndSegments = 1, capMapping = rectangular, sx = 1, sy = 1, minorSx = 1, minorSy = 1, mergeSeam = false } = {}) {
	const wrapPhi = phi % TAU === 0;
	const wrapTheta = theta % TAU === 0;
	const caps = wrapPhi ? [] : [capStart && {
		pAngle: phiOffset,
		capSegments: capStartSegments,
		flip: -1
	}, capEnd && {
		pAngle: phiOffset + phi,
		capSegments: capEndSegments,
		flip: 1
	}].filter((cap) => cap && cap.capSegments > 0);
	const cols = mergeSeam && wrapPhi ? segments : segments + 1;
	const rows = mergeSeam && wrapTheta ? minorSegments : minorSegments + 1;
	const at = (i, j) => j % rows * cols + i % cols;
	const size = caps.reduce((sum, { capSegments }) => sum + computeCapVertexCount(rows, capSegments, mergeSeam), rows * cols);
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(caps.reduce((sum, { capSegments }) => sum + minorSegments * (capSegments * 6 - 3), minorSegments * segments * 6));
	const indices = {
		vertex: 0,
		cell: 0
	};
	const angleAt = (j) => {
		const v = j / minorSegments;
		const t = (wrapTheta && j === minorSegments ? 0 : v) * theta + thetaOffset;
		return {
			cos: -Math.cos(t),
			sin: Math.sin(t),
			t
		};
	};
	const phiAngleAt = (i) => (wrapPhi && i === segments ? 0 : i / segments) * phi + phiOffset;
	for (let j = 0; j < rows; j++) {
		const v = j / minorSegments;
		const { cos: cosTheta, sin: sinTheta } = angleAt(j);
		for (let i = 0; i < cols; i++, indices.vertex++) {
			const u = i / segments;
			const p = phiAngleAt(i);
			const cosPhi = -Math.cos(p);
			const sinPhi = Math.sin(p);
			const radial = radius + minorRadius * minorSx * cosTheta;
			positions[indices.vertex * 3] = sx * radial * cosPhi;
			positions[indices.vertex * 3 + 1] = sy * radial * sinPhi;
			positions[indices.vertex * 3 + 2] = minorRadius * minorSy * sinTheta;
			TMP[0] = sy * minorSy * cosTheta * cosPhi;
			TMP[1] = sx * minorSy * cosTheta * sinPhi;
			TMP[2] = sx * sy * minorSx * sinTheta;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
		}
	}
	for (let j = 1; j <= minorSegments; j++) for (let i = 1; i <= segments; i++) computeGridQuad(cells, indices, [
		at(i - 1, j - 1),
		at(i, j - 1),
		at(i - 1, j),
		at(i, j)
	], -1);
	const capPoint = (pAngle) => {
		const cosPhi = -Math.cos(pAngle);
		const sinPhi = Math.sin(pAngle);
		return {
			point: (x, y) => [
				sx * (radius + x) * cosPhi,
				sy * (radius + x) * sinPhi,
				y
			],
			normalFor: (flip) => [
				sy * sinPhi * flip,
				-sx * cosPhi * flip,
				0
			]
		};
	};
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	for (const { pAngle, capSegments, flip } of caps) {
		const { point, normalFor } = capPoint(pAngle);
		computeCap(geometry, indices, {
			ringSegments: minorSegments,
			capSegments,
			capRadius: minorRadius,
			sx: minorSx,
			sy: minorSy,
			flip,
			angleAt,
			point,
			normal: normalFor(flip),
			mapping: capMapping,
			cols: rows,
			mergeSeam
		});
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AppleOptions
* @property {number} [radius=0.5] Equatorial radius.
* @property {number} [height=radius] Height between the dimples, clamped to (0,
*   radius * 2].
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* An apple surface: the outer lobe of a spindle torus, dimpled at the poles.
*
* @param {AppleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Apple Surface]{@link https://mathworld.wolfram.com/AppleSurface.html}
*/
function apple({ radius = .5, height = radius, nx = 32, ny = 16, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const halfHeight = clamp(height, 0, radius * 2) / 2;
	const a = (radius + halfHeight * halfHeight / radius) / 2;
	const d = radius - a;
	const thetaCross = Math.acos(-d / a);
	const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
		a,
		halfHeight,
		thetaCross,
		poleCosTheta: -d / a,
		radiusAt: (cosTheta) => d + a * cosTheta,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LemonOptions
* @property {number} [radius=0.3] Equatorial radius.
* @property {number} [height=1] Height between the tips, raised to at least
*   radius * 2.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A lemon: a minor circular arc revolved about its chord, `apple`'s complement.
*
* Special cases: sphere (height = radius * 2).
*
* @param {LemonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wikipedia – Lemon (geometry)]{@link https://en.wikipedia.org/wiki/Lemon_(geometry)}
*/
function lemon({ radius = .3, height = 1, nx = 32, ny = 16, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const halfHeight = Math.max(height, radius * 2) / 2;
	const aPlusD = halfHeight * halfHeight / radius;
	const a = (radius + aPlusD) / 2;
	const d = aPlusD - a;
	const thetaLemon = Math.acos(d / a);
	const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
		a,
		halfHeight,
		thetaCross: thetaLemon,
		poleCosTheta: d / a,
		radiusAt: (cosTheta) => a * cosTheta - d,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SphericalRingOptions
* @property {number} [radius=0.5] Sphere radius.
* @property {number} [innerRadius=radius*0.5] Bore radius, clamped to [0,
*   radius].
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16] Outer band
*   meridian segments.
* @property {import("../../../types.js").PositiveInteger} [holeSegments=1]
*   Bore wall segments.
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A spherical ring (napkin ring): a sphere with a cylindrical bore.
*
* @param {SphericalRingOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Spherical Ring]{@link https://mathworld.wolfram.com/SphericalRing.html}
*/
function sphericalRing({ radius = .5, innerRadius = radius * .5, nx = 32, ny = 16, holeSegments = 1, phi = TAU, phiOffset = 0, mergeSeam = false } = {}) {
	const clampedInnerRadius = clamp(innerRadius, 0, radius);
	const thetaRim = Math.asin(clampedInnerRadius / radius);
	const theta = Math.PI - 2 * thetaRim;
	function outerEquation({ v, cosPhi, sinPhi }) {
		const t = v * theta + thetaRim;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const dx = -cosPhi * sinTheta;
		const dy = -cosTheta;
		const dz = sinPhi * sinTheta;
		return {
			position: [
				radius * dx,
				radius * dy,
				radius * dz
			],
			normal: [
				dx,
				dy,
				dz
			],
			collapsed: false
		};
	}
	const outer = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		equation: outerEquation
	});
	const bottomRim = outerEquation({
		v: 0,
		cosPhi: 1,
		sinPhi: 0
	}).position;
	const topRim = outerEquation({
		v: 1,
		cosPhi: 1,
		sinPhi: 0
	}).position;
	const yBottom = bottomRim[1];
	const yTop = topRim[1];
	function innerEquation({ v, cosPhi, sinPhi }) {
		const { position: rim } = outerEquation({
			v: 0,
			cosPhi,
			sinPhi
		});
		return {
			position: [
				rim[0],
				yBottom + (yTop - yBottom) * v,
				rim[2]
			],
			normal: [
				rim[0],
				0,
				rim[2]
			],
			collapsed: false
		};
	}
	const inner = invert(computeRevolutionGeometry({
		nx,
		ny: holeSegments,
		phi,
		mergeSeam,
		phiOffset,
		equation: innerEquation
	}));
	return concatGeometries([outer, inner]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PrismOptions
* @property {number} [radius=0.25]
* @property {number} [height=1]
* @property {import("../../../types.js").PositiveInteger} [sides=6]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {boolean} [mergeSeam=false] `true` shares the caps' wrap column and
*   center vertices, wrapping uvs back to 0 there.
*/
/**
* A right prism: a regular polygon extruded with flat-shaded sides.
*
* @param {PrismOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function prism({ radius = .25, height = 1, sides = 6, phiOffset = 0, capMapping = rectangular, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const angleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;
	const size = sides * 4 + computeCapVertexCount(mergeSeam ? sides : sides + 1, 1, mergeSeam) * 2;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(sides * 4 * 3);
	const indices = {
		vertex: 0,
		cell: 0
	};
	const sector = TAU / sides;
	for (let i = 0; i < sides; i++) {
		const angle0 = angleAt(i);
		const angle1 = angleAt(i + 1);
		const midAngle = angle0 + sector / 2;
		const [x0, , z0] = computePolygonCorner(angle0, radius, 0);
		const [x1, , z1] = computePolygonCorner(angle1, radius, 0);
		const nx = -Math.cos(midAngle);
		const nz = Math.sin(midAngle);
		const base = indices.vertex;
		const u0 = i / sides;
		const u1 = (i + 1) / sides;
		for (const [px, py, pz, u, v] of [
			[
				x0,
				-halfHeight,
				z0,
				u0,
				0
			],
			[
				x1,
				-halfHeight,
				z1,
				u1,
				0
			],
			[
				x1,
				halfHeight,
				z1,
				u1,
				1
			],
			[
				x0,
				halfHeight,
				z0,
				u0,
				1
			]
		]) {
			positions[indices.vertex * 3] = px;
			positions[indices.vertex * 3 + 1] = py;
			positions[indices.vertex * 3 + 2] = pz;
			normals[indices.vertex * 3] = nx;
			normals[indices.vertex * 3 + 2] = nz;
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
			indices.vertex++;
		}
		cells[indices.cell] = base + 3;
		cells[indices.cell + 1] = base;
		cells[indices.cell + 2] = base + 1;
		cells[indices.cell + 3] = base + 3;
		cells[indices.cell + 4] = base + 1;
		cells[indices.cell + 5] = base + 2;
		indices.cell += 6;
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: -halfHeight,
		flip: 1,
		normalY: -1,
		angleAt,
		mapping: capMapping,
		mergeSeam
	});
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: halfHeight,
		flip: -1,
		normalY: 1,
		angleAt,
		mapping: capMapping,
		mergeSeam
	});
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AntiprismOptions
* @property {number} [radius=0.25]
* @property {number} [height=1]
* @property {import("../../../types.js").PositiveInteger} [sides=6]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {boolean} [mergeSeam=false] `true` shares the caps' wrap column and
*   center vertices, wrapping uvs back to 0 there.
*/
/**
* An antiprism: a `prism` with its top rotated half a sector, joined by a band
* of triangles.
*
* @param {AntiprismOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function antiprism({ radius = .25, height = 1, sides = 6, phiOffset = 0, capMapping = rectangular, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const topOffset = phiOffset + TAU / sides / 2;
	const bottomAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;
	const topAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + topOffset;
	const size = sides * 2 * 3 + computeCapVertexCount(mergeSeam ? sides : sides + 1, 1, mergeSeam) * 2;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(sides * 4 * 3);
	const indices = {
		vertex: 0,
		cell: 0
	};
	const writeTriangle = (a, b, c, uvA, uvB, uvC) => {
		const ux = b[0] - a[0];
		const uy = b[1] - a[1];
		const uz = b[2] - a[2];
		const vx = c[0] - a[0];
		const vy = c[1] - a[1];
		const vz = c[2] - a[2];
		const nx = uy * vz - uz * vy;
		const ny = uz * vx - ux * vz;
		const nz = ux * vy - uy * vx;
		const length = Math.hypot(nx, ny, nz);
		const base = indices.vertex;
		for (const [[px, py, pz], [u, v]] of [
			[a, uvA],
			[b, uvB],
			[c, uvC]
		]) {
			positions[indices.vertex * 3] = px;
			positions[indices.vertex * 3 + 1] = py;
			positions[indices.vertex * 3 + 2] = pz;
			normals[indices.vertex * 3] = nx / length;
			normals[indices.vertex * 3 + 1] = ny / length;
			normals[indices.vertex * 3 + 2] = nz / length;
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
			indices.vertex++;
		}
		cells[indices.cell] = base;
		cells[indices.cell + 1] = base + 1;
		cells[indices.cell + 2] = base + 2;
		indices.cell += 3;
	};
	for (let i = 0; i < sides; i++) {
		const bottomA = computePolygonCorner(bottomAngleAt(i), radius, -halfHeight);
		const bottomB = computePolygonCorner(bottomAngleAt(i + 1), radius, -halfHeight);
		const topA = computePolygonCorner(topAngleAt(i), radius, halfHeight);
		const topB = computePolygonCorner(topAngleAt(i + 1), radius, halfHeight);
		const u0 = i / sides;
		const u1 = (i + 1) / sides;
		const uMid = (u0 + u1) / 2;
		writeTriangle(bottomA, bottomB, topA, [u0, 0], [u1, 0], [uMid, 1]);
		writeTriangle(topB, topA, bottomB, [u1, 1], [u0, 1], [u1, 0]);
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: -halfHeight,
		flip: 1,
		normalY: -1,
		angleAt: bottomAngleAt,
		mapping: capMapping,
		mergeSeam
	});
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: halfHeight,
		flip: -1,
		normalY: 1,
		angleAt: topAngleAt,
		mapping: capMapping,
		mergeSeam
	});
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ParaboloidOptions
* @property {number} [height=1]
* @property {number} [radius=0.5] Rim radius.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
* @property {boolean} [capBase=true]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A circular paraboloid, apex up.
*
* @param {ParaboloidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Paraboloid]{@link https://mathworld.wolfram.com/Paraboloid.html}
*/
function paraboloid({ height = 1, radius = .5, nx = 32, ny = 16, capSegments = 1, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const k = radius * radius / height;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = radius * Math.sqrt(1 - v);
		const x = r * cosPhi;
		const z = r * sinPhi;
		return {
			position: [
				x,
				-halfHeight + height * v,
				z
			],
			normal: [
				x,
				k / 2,
				z
			],
			collapsed: r === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capBase,
		capBaseSegments: capSegments,
		capMapping,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HyperboloidOptions
* @property {number} [height=1]
* @property {number} [radius=0.25] Waist radius.
* @property {number} [endRadius=radius*2] Rim radius.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A hyperboloid of one sheet.
*
* Special cases: cylinder (endRadius = radius).
*
* @param {HyperboloidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – One-Sheeted Hyperboloid]{@link https://mathworld.wolfram.com/One-SheetedHyperboloid.html}
*/
function hyperboloid({ height = 1, radius = .25, endRadius = radius * 2, nx = 32, ny = 16, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const k = (endRadius * endRadius - radius * radius) / (halfHeight * halfHeight);
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capApex,
		capBase,
		capApexSegments: capSegments,
		capBaseSegments: capSegments,
		capMapping,
		vDistribution,
		profile: (y) => [Math.sqrt(radius * radius + k * y * y), -k * y]
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} BarrelOptions
* @property {number} [height=1]
* @property {number} [radius=0.5] Belly radius.
* @property {number} [endRadius=radius*0.7] Rim radius.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {import("../../../types.js").PositiveInteger} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A barrel: a cylinder bulging at the equator.
*
* Special cases: cylinder (endRadius = radius), pinched (endRadius > radius).
*
* @param {BarrelOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function barrel({ height = 1, radius = .5, endRadius = radius * .7, nx = 32, ny = 16, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear, mergeSeam = false } = {}) {
	const halfHeight = height / 2;
	const k = (radius - endRadius) / (halfHeight * halfHeight);
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capApex,
		capBase,
		capApexSegments: capSegments,
		capBaseSegments: capSegments,
		capMapping,
		vDistribution,
		profile: (y) => [radius - k * y * y, k * y]
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} FunnelOptions
* @property {number} [height=1]
* @property {number} [radiusBase=0.1] Spout radius.
* @property {number} [radiusApex=0.5] Mouth radius.
* @property {import("../../../types.js").PositiveInteger} [nx=32]
* @property {import("../../../types.js").PositiveInteger} [ny=16]
* @property {boolean} [capBase=true]
* @property {boolean} [capApex=true]
* @property {import("../../../types.js").PositiveInteger} [capBaseSegments=1]
* @property {import("../../../types.js").PositiveInteger} [capApexSegments=1]
* @property {import("../../../types.js").Angle} [phi=TAU]
* @property {import("../../../types.js").Angle} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
* @property {boolean} [mergeSeam=false] `true` shares the full turn's wrap
*   column and smooth poles' vertices, wrapping uvs back to 0 there.
*/
/**
* A funnel: a logarithmic profile from spout to mouth.
*
* Special cases: cylinder (radiusApex = radiusBase).
*
* @param {FunnelOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Funnel]{@link https://mathworld.wolfram.com/Funnel.html}
*/
function funnel({ height = 1, radiusBase = .1, radiusApex = .5, nx = 32, ny = 16, capBase = true, capApex = true, capBaseSegments = 1, capApexSegments = 1, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear, mergeSeam = false } = {}) {
	const k = Math.log(radiusApex / radiusBase) / height;
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		mergeSeam,
		phiOffset,
		capBase,
		capApex,
		capBaseSegments,
		capApexSegments,
		capMapping,
		vDistribution,
		profile: (_, v) => {
			const r = radiusBase * (radiusApex / radiusBase) ** v;
			return [r, -k * (r * r)];
		}
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module utils
* @ignore
*/
const SEAM_WRAP_THRESHOLD = .5;
const POLE_KEY_SCALE = 1e6;
const POLE_KEY_CORNER_STRIDE = 3 * POLE_KEY_SCALE;
/**
* Shift one triangle's corners onto a single local window, in place: cut the
* circle at its widest empty gap and shift every corner before the cut up by
* +1, which minimizes the maximum pairwise difference. A pole corner has no
* value of its own, so it lands midway between the other two.
*
* @private
*/
function unwrapTriangle(w, pole) {
	const order = [
		0,
		1,
		2
	].filter((k) => !pole[k]).toSorted((a, b) => w[a] - w[b]);
	const count = order.length;
	let widestGap = -1;
	let cutAt = -1;
	for (let m = 0; m < count; m++) {
		const gap = m < count - 1 ? w[order[m + 1]] - w[order[m]] : w[order[0]] + 1 - w[order[count - 1]];
		if (gap > widestGap) {
			widestGap = gap;
			cutAt = m;
		}
	}
	if (cutAt < count - 1) for (let m = 0; m <= cutAt; m++) w[order[m]] += 1;
	for (let k = 0; k < 3; k++) {
		if (!pole[k]) continue;
		const [m, n] = [
			0,
			1,
			2
		].filter((o) => o !== k);
		w[k] = (w[m] + w[n]) / 2;
	}
}
/**
* Split vertices along a periodic uv seam (eg. `polar`'s v or `spherical`'s u
* wrapping from 1 back to 0) so each triangle interpolates a continuous range.
*
* Can't fix a triangle spanning half the wrap or more on its own (eg. a
* 3-segment disc): only splitting the triangle would.
*
* @param {import("../../types.js").SimplicialComplex} geometry
* @param {object} [options={}]
* @param {number} [options.component=0] The uv component wrapping at 0/1: `0`
*   for u, `1` for v.
* @param {function(number): boolean} [options.isPole] Vertices with no value of
*   their own in that component (eg. a sphere's poles, a fan's centroid):
*   duplicated per triangle, midway between the two other corners.
* @returns {import("../../types.js").SimplicialComplex} A new geometry, or the
*   input one when no seam is found.
*/
function splitSeam(geometry, { component = 0, isPole = () => false } = {}) {
	const { positions, normals, uvs, cells } = geometry;
	const vertexCount = positions.length / 3;
	const extraPositions = [];
	const extraNormals = [];
	const extraUvs = [];
	const duplicateCache = /* @__PURE__ */ new Map();
	let nextIndex = vertexCount;
	const duplicate = (key, index, value) => {
		let dup = duplicateCache.get(key);
		if (dup === void 0) {
			extraPositions.push(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
			extraNormals.push(normals[index * 3], normals[index * 3 + 1], normals[index * 3 + 2]);
			extraUvs.push(uvs[index * 2], uvs[index * 2 + 1]);
			extraUvs[extraUvs.length - 2 + component] = value;
			dup = nextIndex++;
			duplicateCache.set(key, dup);
		}
		return dup;
	};
	const patchAt = [];
	const patchTo = [];
	const patchTriangle = (i, corners, w, pole) => {
		for (let k = 0; k < 3; k++) {
			if (w[k] === uvs[corners[k] * 2 + component]) continue;
			const key = pole[k] ? vertexCount + corners[k] * POLE_KEY_CORNER_STRIDE + Math.round(w[k] * POLE_KEY_SCALE) : corners[k];
			patchAt.push(i + k);
			patchTo.push(duplicate(key, corners[k], w[k]));
		}
	};
	for (let i = 0; i < cells.length; i += 3) {
		const corners = [
			cells[i],
			cells[i + 1],
			cells[i + 2]
		];
		const pole = corners.map((c) => isPole(c));
		if (pole[0] + pole[1] + pole[2] > 1) continue;
		const w = corners.map((c) => uvs[c * 2 + component]);
		if (!pole[0] && !pole[1] && !pole[2]) {
			const lo = Math.min(w[0], w[1], w[2]);
			if (Math.max(w[0], w[1], w[2]) - lo <= SEAM_WRAP_THRESHOLD) continue;
		}
		unwrapTriangle(w, pole);
		patchTriangle(i, corners, w, pole);
	}
	if (!extraPositions.length) return geometry;
	const finalPositions = new Float32Array(nextIndex * 3);
	finalPositions.set(positions);
	finalPositions.set(extraPositions, positions.length);
	const finalNormals = new Float32Array(nextIndex * 3);
	finalNormals.set(normals);
	finalNormals.set(extraNormals, normals.length);
	const finalUvs = new Float32Array(nextIndex * 2);
	finalUvs.set(uvs);
	finalUvs.set(extraUvs, uvs.length);
	const finalCells = new (getCellsTypedArray(nextIndex))(cells.length);
	finalCells.set(cells);
	for (let p = 0; p < patchAt.length; p++) finalCells[patchAt[p]] = patchTo[p];
	return {
		positions: finalPositions,
		normals: finalNormals,
		uvs: finalUvs,
		cells: finalCells
	};
}

/**
* @module utils
* @ignore
*/
const MAX_VERTICES = 1e7;
const POLE_EPSILON = 1e-5;
/**
* Undirected seed edge key.
*
* @private
*/
const edgeKey = (a, b, numSeedVertices) => a < b ? a * numSeedVertices + b : b * numSeedVertices + a;
const isPole = (v) => v < POLE_EPSILON || v > .99999;
/**
* Vertex and triangle counts from face lengths only. Projecting welds corners
* and edge points, so those are counted once.
*
* @private
*/
function computePolyhedronSize(seedCells, numSeedVertices, S, project) {
	let numTriangles = 0;
	let unsharedTerm = 0;
	const edgeKeys = project ? /* @__PURE__ */ new Set() : null;
	for (const face of seedCells) {
		const n = face.length;
		const fanTriangles = n - 2;
		const diagonals = Math.max(0, n - 3);
		numTriangles += fanTriangles * S * S;
		unsharedTerm += diagonals * (S - 1) + fanTriangles * (S - 1) * (S - 2) / 2;
		if (project) for (let i = 0; i < n; i++) edgeKeys.add(edgeKey(face[i], face[(i + 1) % n], numSeedVertices));
	}
	let numVertices = unsharedTerm;
	if (project) numVertices += numSeedVertices + edgeKeys.size * (S - 1);
	else for (const face of seedCells) numVertices += face.length * S;
	return {
		numTriangles,
		numVertices
	};
}
/**
* Flat barycentric grid point of a seed triangle: weights i toward b, j toward
* c, and the remaining S - i - j toward a.
*
* @private
*/
function barycentricPoint(seedPositions, a, b, c, i, j, S) {
	const k = S - i - j;
	return [
		(k * seedPositions[a * 3] + i * seedPositions[b * 3] + j * seedPositions[c * 3]) / S,
		(k * seedPositions[a * 3 + 1] + i * seedPositions[b * 3 + 1] + j * seedPositions[c * 3 + 1]) / S,
		(k * seedPositions[a * 3 + 2] + i * seedPositions[b * 3 + 2] + j * seedPositions[c * 3 + 2]) / S
	];
}
/**
* Flat-shaded mesh from a seed polyhedron, optionally subdivided. `project`
* welds it onto a sphere instead.
*
* @private
* @param {import("../../types.js").PolygonalComplex} seed Positions with radius
*   baked in, and CCW faces
* @param {object} [options={}]
* @param {number} [options.radius=0.5] Sphere radius when projecting
* @param {number} [options.subdivisions=0] Barycentric subdivisions per
*   triangle
* @param {boolean} [options.project=false]
* @param {"gnomonic" | "spherical"} [options.projection="gnomonic"] Subdivide
*   flat then project, or along great circles
* @param {import("../mappings.js").MappingFn} [options.mapping] `spherical`
*   when projecting, `rectangular` otherwise
* @returns {import("../../types.js").SimplicialComplex}
* @throws {Error} If subdivisions would produce more than 1e7 vertices
*/
function computePolyhedron({ positions: seedPositions, cells: seedCells }, { radius = .5, subdivisions = 0, project = false, projection = "gnomonic", mapping = project ? spherical : rectangular } = {}) {
	const S = subdivisions + 1;
	const slerped = project && projection === "spherical";
	const numSeedVertices = seedPositions.length / 3;
	const { numTriangles, numVertices } = computePolyhedronSize(seedCells, numSeedVertices, S, project);
	if (numVertices > MAX_VERTICES) throw new Error(`subdivisions ${subdivisions} would produce ${numVertices} vertices; reduce subdivisions.`);
	const positions = new Float32Array(numVertices * 3);
	const normals = new Float32Array(numVertices * 3);
	const uvs = new Float32Array(numVertices * 2);
	const cells = new (getCellsTypedArray(numVertices))(numTriangles * 3);
	let vertexIndex = 0;
	let cellIndex = 0;
	const cornerCache = project ? /* @__PURE__ */ new Map() : null;
	const edgeCache = project ? /* @__PURE__ */ new Map() : null;
	function addVertex(px, py, pz, context) {
		const i3 = vertexIndex * 3;
		const i2 = vertexIndex * 2;
		const l = Math.hypot(px, py, pz) || 1;
		const dx = px / l;
		const dy = py / l;
		const dz = pz / l;
		if (project) {
			positions[i3] = dx * radius;
			positions[i3 + 1] = dy * radius;
			positions[i3 + 2] = dz * radius;
			normals[i3] = dx;
			normals[i3 + 1] = dy;
			normals[i3 + 2] = dz;
		} else {
			positions[i3] = px;
			positions[i3 + 1] = py;
			positions[i3 + 2] = pz;
			normals[i3] = context.normal[0];
			normals[i3 + 1] = context.normal[1];
			normals[i3 + 2] = context.normal[2];
		}
		const rx = px - context.centroid[0];
		const ry = py - context.centroid[1];
		const rz = pz - context.centroid[2];
		mapping({
			uvs,
			index: i2,
			x: rx * context.u[0] + ry * context.u[1] + rz * context.u[2],
			y: rx * context.v[0] + ry * context.v[1] + rz * context.v[2],
			radius: context.extent,
			nx: dx,
			ny: dy,
			nz: dz
		});
		return vertexIndex++;
	}
	const unitPoint = (index) => slerped ? normalize(point(seedPositions, index)) : null;
	const emitGrid = (idx) => {
		for (let i = 0; i < S; i++) for (let j = 0; j <= S - 1 - i; j++) {
			cells[cellIndex] = idx(i, j);
			cells[cellIndex + 1] = idx(i + 1, j);
			cells[cellIndex + 2] = idx(i, j + 1);
			cellIndex += 3;
			if (i + j < S - 1) {
				cells[cellIndex] = idx(i + 1, j);
				cells[cellIndex + 1] = idx(i + 1, j + 1);
				cells[cellIndex + 2] = idx(i, j + 1);
				cellIndex += 3;
			}
		}
	};
	const buildFace = (face) => {
		const n = face.length;
		const context = computeFaceContext(seedPositions, face);
		const cornerIndex = Array.from({ length: n });
		for (let k = 0; k < n; k++) {
			const seed = face[k];
			if (project && cornerCache.has(seed)) cornerIndex[k] = cornerCache.get(seed);
			else {
				const index = addVertex(seedPositions[seed * 3], seedPositions[seed * 3 + 1], seedPositions[seed * 3 + 2], context);
				cornerIndex[k] = index;
				if (project) cornerCache.set(seed, index);
			}
		}
		function boundaryEdge(k) {
			const a = face[k];
			const b = face[(k + 1) % n];
			const points = Array.from({ length: S - 1 });
			for (let i = 1; i < S; i++) if (project) {
				const m = a < b ? i : S - i;
				const key = edgeKey(a, b, numSeedVertices) * S + m;
				const cached = edgeCache.get(key);
				if (cached !== void 0) {
					points[i - 1] = cached;
					continue;
				}
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				const index = addVertex(px, py, pz, context);
				edgeCache.set(key, index);
				points[i - 1] = index;
			} else {
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				points[i - 1] = addVertex(px, py, pz, context);
			}
			return points;
		}
		const diagonalCache = Array.from({ length: n });
		function diagonal(k) {
			if (diagonalCache[k]) return diagonalCache[k];
			const a = face[0];
			const b = face[k];
			const points = Array.from({ length: S - 1 });
			for (let i = 1; i < S; i++) {
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				points[i - 1] = addVertex(px, py, pz, context);
			}
			diagonalCache[k] = points;
			return points;
		}
		for (let t = 0; t < n - 2; t++) {
			const kB = t + 1;
			const kC = t + 2;
			const sideAB = t === 0 ? boundaryEdge(0) : diagonal(kB);
			const sideAC = t === n - 3 ? boundaryEdge(n - 1).toReversed() : diagonal(kC);
			const sideBC = boundaryEdge(kB);
			const a = face[0];
			const b = face[kB];
			const c = face[kC];
			const uA = unitPoint(a);
			const uB = unitPoint(b);
			const uC = unitPoint(c);
			const interiorCache = /* @__PURE__ */ new Map();
			function idx(i, j) {
				if (i === 0 && j === 0) return cornerIndex[0];
				if (i === S && j === 0) return cornerIndex[kB];
				if (i === 0 && j === S) return cornerIndex[kC];
				if (j === 0) return sideAB[i - 1];
				if (i === 0) return sideAC[j - 1];
				if (i + j === S) return sideBC[S - i - 1];
				const key = i * (S + 1) + j;
				const cached = interiorCache.get(key);
				if (cached !== void 0) return cached;
				const [px, py, pz] = slerped ? slerpTriangle(uA, uB, uC, i / S, j / S) : barycentricPoint(seedPositions, a, b, c, i, j, S);
				const index = addVertex(px, py, pz, context);
				interiorCache.set(key, index);
				return index;
			}
			emitGrid(idx);
		}
	};
	for (const face of seedCells) buildFace(face);
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	return project && mapping === spherical ? splitSeam(geometry, { isPole: (index) => isPole(uvs[index * 2 + 1]) }) : geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TetrahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
* @property {boolean} [center=true] Center the bounding box. `false` centers
*   the centroid, keeping vertices on the circumsphere.
*/
/**
* Regular tetrahedron, apex-up, bounding box centered at the origin.
*
* @param {TetrahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function tetrahedronPolygons({ radius = .5, center = true } = {}) {
	const r0 = radius * 2 * SQRT2 / 3;
	const positions = Float32Array.of(0, radius, 0, r0, -radius / 3, 0, -r0 / 2, -radius / 3, r0 * SQRT3 / 2, -r0 / 2, -radius / 3, -(r0 * SQRT3) / 2);
	if (center) {
		const shiftX = r0 / 4;
		const shiftY = radius / 3;
		for (let i = 0; i < positions.length; i += 3) {
			positions[i] -= shiftX;
			positions[i + 1] -= shiftY;
		}
	}
	return {
		positions,
		cells: [
			[
				0,
				2,
				1
			],
			[
				0,
				3,
				2
			],
			[
				0,
				1,
				3
			],
			[
				1,
				2,
				3
			]
		]
	};
}
/**
* @typedef {object} TetrahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular tetrahedron.
*
* @param {TetrahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function tetrahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(tetrahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HexahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Regular hexahedron (cube) faces, ordered +x, -x, +y, -y, +z, -z.
*
* @param {HexahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function hexahedronPolygons({ radius = .5 } = {}) {
	return cubePolygons({ sx: radius * 2 / SQRT3 });
}
/**
* @typedef {object} HexahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular hexahedron (cube).
*
* @param {HexahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function hexahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(hexahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} OctahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Regular octahedron.
*
* @param {OctahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function octahedronPolygons({ radius = .5 } = {}) {
	return {
		positions: Float32Array.of(radius, 0, 0, -radius, 0, 0, 0, radius, 0, 0, -radius, 0, 0, 0, radius, 0, 0, -radius),
		cells: [
			[
				0,
				2,
				4
			],
			[
				2,
				1,
				4
			],
			[
				1,
				3,
				4
			],
			[
				3,
				0,
				4
			],
			[
				2,
				0,
				5
			],
			[
				1,
				2,
				5
			],
			[
				3,
				1,
				5
			],
			[
				0,
				3,
				5
			]
		]
	};
}
/**
* @typedef {object} OctahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular octahedron.
*
* @param {OctahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function octahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(octahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DodecahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Regular dodecahedron.
*
* @param {DodecahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function dodecahedronPolygons({ radius = .5 } = {}) {
	const b = radius / SQRT3;
	const a = b * PHI;
	const c = b / PHI;
	return {
		positions: Float32Array.of(c, 0, a, -c, 0, a, -b, b, b, 0, a, c, b, b, b, b, -b, b, 0, -a, c, -b, -b, b, c, 0, -a, -c, 0, -a, -b, -b, -b, 0, -a, -c, b, -b, -b, b, b, -b, 0, a, -c, -b, b, -b, a, c, 0, -a, c, 0, -a, -c, 0, a, -c, 0),
		cells: [
			[
				4,
				3,
				2,
				1,
				0
			],
			[
				7,
				6,
				5,
				0,
				1
			],
			[
				12,
				11,
				10,
				9,
				8
			],
			[
				15,
				14,
				13,
				8,
				9
			],
			[
				14,
				3,
				4,
				16,
				13
			],
			[
				3,
				14,
				15,
				17,
				2
			],
			[
				11,
				6,
				7,
				18,
				10
			],
			[
				6,
				11,
				12,
				19,
				5
			],
			[
				4,
				0,
				5,
				19,
				16
			],
			[
				12,
				8,
				13,
				16,
				19
			],
			[
				15,
				9,
				10,
				18,
				17
			],
			[
				7,
				1,
				2,
				17,
				18
			]
		]
	};
}
/**
* @typedef {object} DodecahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular dodecahedron.
*
* @param {DodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function dodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(dodecahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} IcosahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Regular icosahedron.
*
* @param {IcosahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function icosahedronPolygons({ radius = .5 } = {}) {
	const s = radius / Math.hypot(1, PHI);
	const f = PHI * s;
	return {
		positions: Float32Array.of(-s, f, 0, s, f, 0, -s, -f, 0, s, -f, 0, 0, -s, f, 0, s, f, 0, -s, -f, 0, s, -f, f, 0, -s, f, 0, s, -f, 0, -s, -f, 0, s),
		cells: [
			[
				0,
				11,
				5
			],
			[
				0,
				5,
				1
			],
			[
				0,
				1,
				7
			],
			[
				0,
				7,
				10
			],
			[
				0,
				10,
				11
			],
			[
				11,
				10,
				2
			],
			[
				5,
				11,
				4
			],
			[
				1,
				5,
				9
			],
			[
				7,
				1,
				8
			],
			[
				10,
				7,
				6
			],
			[
				3,
				9,
				4
			],
			[
				3,
				4,
				2
			],
			[
				3,
				2,
				6
			],
			[
				3,
				6,
				8
			],
			[
				3,
				8,
				9
			],
			[
				9,
				8,
				1
			],
			[
				4,
				9,
				5
			],
			[
				2,
				4,
				11
			],
			[
				6,
				2,
				10
			],
			[
				8,
				6,
				7
			]
		]
	};
}
/**
* @typedef {object} IcosahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular icosahedron.
*
* @param {IcosahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function icosahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(icosahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatDodecahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Great dodecahedron faces: on the icosahedron's vertices, one pentagon per
* vertex's 5 neighbors.
*
* @param {GreatDodecahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function greatDodecahedronPolygons({ radius = .5 } = {}) {
	const { positions } = icosahedronPolygons({ radius });
	return {
		positions,
		cells: [
			[
				11,
				5,
				1,
				7,
				10
			],
			[
				0,
				5,
				9,
				8,
				7
			],
			[
				11,
				10,
				6,
				3,
				4
			],
			[
				9,
				4,
				2,
				6,
				8
			],
			[
				5,
				11,
				2,
				3,
				9
			],
			[
				0,
				11,
				4,
				9,
				1
			],
			[
				10,
				7,
				8,
				3,
				2
			],
			[
				0,
				1,
				8,
				6,
				10
			],
			[
				7,
				1,
				9,
				3,
				6
			],
			[
				1,
				5,
				4,
				3,
				8
			],
			[
				0,
				7,
				6,
				2,
				11
			],
			[
				5,
				0,
				10,
				2,
				4
			]
		]
	};
}
/**
* @typedef {object} GreatDodecahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great dodecahedron.
*
* @param {GreatDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatDodecahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatIcosahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Great icosahedron faces: on the icosahedron's vertices, each triangle joining
* second-nearest neighbors.
*
* @param {GreatIcosahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function greatIcosahedronPolygons({ radius = .5 } = {}) {
	const { positions } = icosahedronPolygons({ radius });
	return {
		positions,
		cells: [
			[
				5,
				4,
				9
			],
			[
				5,
				11,
				4
			],
			[
				5,
				0,
				11
			],
			[
				5,
				1,
				0
			],
			[
				5,
				9,
				1
			],
			[
				4,
				3,
				9
			],
			[
				4,
				2,
				3
			],
			[
				4,
				11,
				2
			],
			[
				6,
				7,
				8
			],
			[
				6,
				10,
				7
			],
			[
				6,
				2,
				10
			],
			[
				6,
				3,
				2
			],
			[
				6,
				8,
				3
			],
			[
				7,
				1,
				8
			],
			[
				7,
				0,
				1
			],
			[
				7,
				10,
				0
			],
			[
				1,
				9,
				8
			],
			[
				0,
				10,
				11
			],
			[
				2,
				11,
				10
			],
			[
				3,
				8,
				9
			]
		]
	};
}
/**
* @typedef {object} GreatIcosahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great icosahedron.
*
* @param {GreatIcosahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatIcosahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatIcosahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* Regular pentagram inner to outer radius ratio, `1 / PHI ** 2`.
*
* @private
*/
const PENTAGRAM_RATIO = computeStarRatio(5, 2);
/**
* A pentagon's other star layer: point i on the bisector of points i and i + 1,
* at `ratio` times their radius. `PENTAGRAM_RATIO` gives a pentagram's inner
* pentagon, its reciprocal the stellated tips.
*
* @private
* @param {number[][]} points 5 coplanar points, equidistant from their
*   centroid, in cyclic order
* @param {number} ratio
* @returns {number[][]}
*/
function computeStarLayer(points, ratio) {
	const centroid = [
		0,
		0,
		0
	];
	for (const p of points) {
		centroid[0] += p[0];
		centroid[1] += p[1];
		centroid[2] += p[2];
	}
	centroid[0] /= 5;
	centroid[1] /= 5;
	centroid[2] /= 5;
	const vectors = points.map((p) => [
		p[0] - centroid[0],
		p[1] - centroid[1],
		p[2] - centroid[2]
	]);
	const radius = Math.hypot(...vectors[0]) * ratio;
	return vectors.map((v, i) => {
		const w = vectors[(i + 1) % 5];
		const bx = v[0] + w[0];
		const by = v[1] + w[1];
		const bz = v[2] + w[2];
		const scale = radius / (Math.hypot(bx, by, bz) || 1);
		return [
			centroid[0] + bx * scale,
			centroid[1] + by * scale,
			centroid[2] + bz * scale
		];
	});
}
/**
* Split a pentagram face into 8 triangles: 5 points and a 3-triangle fan across
* the inner pentagon. Computed vertices aren't shared with other faces.
*
* @private
* @param {number[][]} points 5 coplanar points, equidistant from their
*   centroid, in cyclic order
* @param {object} [options={}]
* @param {boolean} [options.stellate=false] `points` are the inner pentagon,
*   tips are computed, rather than the reverse
* @returns {import("../../../../types.js").PolygonalComplex} 10 positions, tips
*   first, and 8 triangles
*/
function computePentagram(points, { stellate = false } = {}) {
	const other = computeStarLayer(points, stellate ? 1 / PENTAGRAM_RATIO : PENTAGRAM_RATIO);
	const cells = [];
	for (let i = 0; i < 5; i++) cells.push(stellate ? [
		i,
		5 + (i + 1) % 5,
		5 + i
	] : [
		i,
		5 + i,
		5 + (i + 4) % 5
	]);
	cells.push([
		5,
		6,
		7
	], [
		5,
		7,
		8
	], [
		5,
		8,
		9
	]);
	return {
		positions: stellate ? [...other, ...points] : [...points, ...other],
		cells
	};
}
/**
* Snap near-duplicate positions onto one representative so seams weld exactly.
* Mutates in place.
*
* @private
* @param {number[][]} positions
* @param {number} [epsilon=1e-5] Relative tolerance
*/
function weldNearDuplicates(positions, epsilon = 1e-5) {
	let scale = 0;
	for (const p of positions) scale = Math.max(scale, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
	const tolerance = (scale || 1) * epsilon;
	const canonical = [];
	for (const p of positions) {
		const match = canonical.find((q) => Math.abs(p[0] - q[0]) <= tolerance && Math.abs(p[1] - q[1]) <= tolerance && Math.abs(p[2] - q[2]) <= tolerance);
		if (match === void 0) canonical.push(p);
		else {
			p[0] = match[0];
			p[1] = match[1];
			p[2] = match[2];
		}
	}
}
/**
* @private
* @callback ComputeFaceFn
* @param {number[][]} points The face's xyz vertices
* @returns {import("../../../../types.js").PolygonalComplex}
*/
/**
* Assemble per-face fragments into one welded seed.
*
* @private
* @param {Float32Array | number[]} vertexPositions Flat xyz positions
* @param {number[][]} faces Vertex index groups
* @param {ComputeFaceFn} computeFace
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function assembleFaces(vertexPositions, faces, computeFace) {
	const point = (i) => [
		vertexPositions[i * 3],
		vertexPositions[i * 3 + 1],
		vertexPositions[i * 3 + 2]
	];
	const positions = [];
	const cells = [];
	for (const face of faces) {
		const fragment = computeFace(face.map(point));
		const offset = positions.length;
		positions.push(...fragment.positions);
		for (const cell of fragment.cells) cells.push(cell.map((i) => i + offset));
	}
	weldNearDuplicates(positions);
	return {
		positions: Float32Array.of(...positions.flat()),
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SmallStellatedDodecahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Small stellated dodecahedron faces: the great dodecahedron's, as pentagrams.
*
* @param {SmallStellatedDodecahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function smallStellatedDodecahedronPolygons({ radius = .5 } = {}) {
	const { positions, cells: pentagons } = greatDodecahedronPolygons({ radius });
	return assembleFaces(positions, pentagons, (points) => computePentagram(points));
}
/**
* @typedef {object} SmallStellatedDodecahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Small stellated dodecahedron.
*
* @param {SmallStellatedDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function smallStellatedDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(smallStellatedDodecahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatStellatedDodecahedronPolygonsOptions
* @property {number} [radius=0.5] Circumradius.
*/
/**
* Great stellated dodecahedron faces: the dodecahedron's outermost stellation.
*
* @param {GreatStellatedDodecahedronPolygonsOptions} [options={}]
* @returns {import("../../../../types.js").PolygonalComplex}
*/
function greatStellatedDodecahedronPolygons({ radius = .5 } = {}) {
	const { positions, cells: pentagons } = dodecahedronPolygons({ radius: radius / PHI ** 3 });
	return assembleFaces(positions, pentagons, (vertices) => {
		const tips = vertices.map((v) => v.map((x) => x * PHI ** 3));
		const notches = computeStarLayer(vertices, 1 / PENTAGRAM_RATIO);
		const cells = [];
		for (let i = 0; i < 5; i++) cells.push([
			i,
			5 + (i + 4) % 5,
			5 + i
		]);
		cells.push([
			5,
			6,
			7
		], [
			5,
			7,
			8
		], [
			5,
			8,
			9
		]);
		return {
			positions: [...tips, ...notches],
			cells
		};
	});
}
/**
* @typedef {object} GreatStellatedDodecahedronOptions
* @property {number} [radius=0.5] Circumradius.
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great stellated dodecahedron.
*
* @param {GreatStellatedDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatStellatedDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatStellatedDodecahedronPolygons({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TetrasphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere from a subdivided tetrahedron.
*
* @param {TetrasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function tetrasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(tetrahedronPolygons({
		radius,
		center: false
	}), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HexasphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere from a subdivided cube.
*
* @param {HexasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function hexasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(hexahedronPolygons({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} OctasphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere from a subdivided octahedron.
*
* @param {OctasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function octasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(octahedronPolygons({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DodecasphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere from a subdivided dodecahedron.
*
* @param {DodecasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function dodecasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(dodecahedronPolygons({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} IcosphereOptions
* @property {number} [radius=0.5]
* @property {import("../../../../types.js").NonNegativeInteger} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere from a subdivided icosahedron.
*
* @param {IcosphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function icosphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(icosahedronPolygons({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

var utils_exports = /* @__PURE__ */ __exportAll({
	HALF_PI: () => HALF_PI,
	PHI: () => PHI,
	PLANE_DIRECTIONS: () => PLANE_DIRECTIONS,
	SQRT2: () => SQRT2,
	SQRT3: () => SQRT3,
	SQRT6: () => SQRT6,
	TAU: () => TAU,
	TMP: () => TMP,
	centerCorners: () => centerCorners,
	chebyshev: () => chebyshev,
	clamp: () => clamp,
	clampMeridianSweep: () => clampMeridianSweep,
	computeCap: () => computeCap,
	computeCapVertexCount: () => computeCapVertexCount,
	computeChebyshevColumn: () => computeChebyshevColumn,
	computeFaceContext: () => computeFaceContext,
	computeFlatRevolutionGeometry: () => computeFlatRevolutionGeometry,
	computeGridQuad: () => computeGridQuad,
	computeOutlineEdge: () => computeOutlineEdge,
	computePlane: () => computePlane,
	computePolarGeometry: () => computePolarGeometry,
	computePolarPathGeometry: () => computePolarPathGeometry,
	computePolygonCap: () => computePolygonCap,
	computePolygonCorner: () => computePolygonCorner,
	computePolygonEdge: () => computePolygonEdge,
	computePolyhedron: () => computePolyhedron,
	computeRevolutionGeometry: () => computeRevolutionGeometry,
	computeSpindleArcRevolution: () => computeSpindleArcRevolution,
	computeStarRatio: () => computeStarRatio,
	computeSweptArc: () => computeSweptArc,
	concatGeometries: () => concatGeometries,
	cross: () => cross$1,
	dot: () => dot,
	edgePoint: () => edgePoint,
	fullscreenTriangle: () => fullscreenTriangle,
	getCellsTypedArray: () => getCellsTypedArray,
	getPlaneCoordinate: () => getPlaneCoordinate,
	getPlaneCornerReference: () => getPlaneCornerReference,
	invert: () => invert,
	isPlaneCorner: () => isPlaneCorner,
	isPlaneCornerRounded: () => isPlaneCornerRounded,
	lerp: () => lerp,
	linear: () => linear,
	normalize: () => normalize,
	point: () => point,
	power: () => power,
	remapCornerOffset: () => remapCornerOffset,
	setTypedArrayType: () => setTypedArrayType,
	signedPow: () => signedPow,
	slerp: () => slerp,
	slerpTriangle: () => slerpTriangle,
	smoothstep: () => smoothstep,
	snapToZero: () => snapToZero,
	splitSeam: () => splitSeam,
	subtract: () => subtract,
	translatePositions: () => translatePositions,
	triangulateFaces: () => triangulateFaces
});

export { annulus, annulusPath, antiprism, apple, arbelos, astroid, astroidPath, astroidalEllipsoid, barrel, bicone, capsule, circlePath, cone, cross, crossPath, cube, cubePolygons, cylinder, disc, dodecahedron, dodecahedronPolygons, dodecasphere, doubleCone, ellipse, ellipsePath, ellipsoid, funnel, greatDodecahedron, greatDodecahedronPolygons, greatIcosahedron, greatIcosahedronPolygons, greatStellatedDodecahedron, greatStellatedDodecahedronPolygons, hexagonalGrid, hexahedron, hexahedronPolygons, hexasphere, hollowCube, hollowCylinder, hollowSphere, hyperboloid, icosahedron, icosahedronPolygons, icosphere, kite, kitePath, lemon, lens, lozenge, lozengePath, lune, mappings_exports as mappings, octahedron, octahedronPolygons, octasphere, paraboloid, parallelogram, parallelogramPath, plane, polygon, polygonPath, prism, quad, quadGrid, rectanglePath, reuleaux, reuleauxPath, rhombus, rhombusPath, rightTriangle, rightTrianglePath, roundedCube, roundedCylinder, roundedRectangle, roundedRectanglePath, salinon, smallStellatedDodecahedron, smallStellatedDodecahedronPolygons, sphere, sphericalRing, sphericon, squarePath, squircle, squirclePath, stadium, stadiumPath, star, starPath, superegg, superellipse, superellipsePath, superellipsoid, tetrahedron, tetrahedronPolygons, tetrasphere, torus, trapezoid, trapezoidPath, triangle, trianglePath, triangularGrid, triquetra, utils_exports as utils, yinYang };