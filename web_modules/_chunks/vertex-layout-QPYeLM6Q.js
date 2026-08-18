const RESOURCE_COUNTS_KEYS = ["buffers", "textures"];
const CACHE_COUNTS_KEYS = [
	"shaderModules",
	"renderPipelines",
	"computePipelines",
	"bindGroupLayouts",
	"pipelineLayouts",
	"bindGroups"
];
const createResourceCounts = () => ({
	alive: 0,
	created: 0,
	disposed: 0,
	bytes: 0
});
const createCacheCounts = () => ({
	created: 0,
	hits: 0
});
const createResourceCountsRecord = () => Object.fromEntries(RESOURCE_COUNTS_KEYS.map((key) => [key, createResourceCounts()]));
const createCacheCountsRecord = () => Object.fromEntries(CACHE_COUNTS_KEYS.map((key) => [key, createCacheCounts()]));
const states$1 = /* @__PURE__ */ new WeakMap();
const state = (device) => states$1.getOrInsertComputed(device, () => ({
	stats: {
		lifetime: {
			...createResourceCountsRecord(),
			...createCacheCountsRecord()
		},
		frame: {
			renderPasses: 0,
			computePasses: 0,
			draws: 0,
			dispatches: 0,
			bundles: 0,
			uniformBytes: 0,
			...createCacheCountsRecord()
		}
	},
	log: false,
	groups: false
}));
/**
* Live mutable counters for a device — incremented by the instrumented
* internals.
*/
const debugCounters = (device) => state(device).stats;
/**
* Record a get-or-create cache lookup against both the lifetime and per-frame
* counters.
*/
function recordCacheAccess(device, key, hit) {
	const stats = debugCounters(device);
	const lifetime = stats.lifetime[key];
	const frame = stats.frame[key];
	if (hit) {
		lifetime.hits++;
		frame.hits++;
	} else {
		lifetime.created++;
		frame.created++;
	}
}
const resetCacheCounts = (cache) => {
	cache.created = 0;
	cache.hits = 0;
};
/** Reset the per-frame counters; called by frame() at the start of each tick. */
function resetFrameCounters(device) {
	const frame = state(device).stats.frame;
	frame.renderPasses = 0;
	frame.computePasses = 0;
	frame.draws = 0;
	frame.dispatches = 0;
	frame.bundles = 0;
	frame.uniformBytes = 0;
	for (const key of CACHE_COUNTS_KEYS) resetCacheCounts(frame[key]);
}
/** Whether GPU debug groups should be emitted, per {@link debug}. */
const debugGroupsEnabled = (device) => states$1.get(device)?.groups ?? false;
/**
* Log a debug message when the level is enabled. The message is built lazily so
* disabled logging costs a WeakMap lookup.
*/
function debugLog(device, level, message) {
	const log = states$1.get(device)?.log;
	if (log === "commands" || log === level) console.debug(`pex-gpu: ${message()}`);
}
/**
* Toggle debug logging and GPU debug groups. Counters ({@link debugStats}) are
* always on — this only controls reporting.
*
* ```js
* gpu.debug(ctx); // log: "resources", groups: true
* gpu.debug(ctx, { log: "commands" }); // full submit stream, no groups
* gpu.debug(ctx, false); // all reporting off
* ```
*/
function debug(ctx, options = true) {
	const value = state(ctx.device);
	if (typeof options === "boolean") {
		value.log = options && "resources";
		value.groups = options;
	} else {
		value.log = options.log ?? false;
		value.groups = options.groups ?? false;
	}
}
/**
* Snapshot of the context's resource/rendering pressure counters.
*
* ```js
* const { lifetime, frame } = gpu.debugStats(ctx);
* console.log(`${lifetime.buffers.alive} buffers, ${frame.draws} draws`);
* ```
*/
function debugStats(ctx) {
	return structuredClone(state(ctx.device).stats);
}

/** Round `value` up to the next multiple of `alignment`. */
const alignTo = (value, alignment) => Math.ceil(value / alignment) * alignment;
const isTypedArray = (data) => ArrayBuffer.isView(data) && !(data instanceof DataView);
/**
* Coerce buffer factory input into a typed array. Nested number arrays are
* flattened; plain arrays default to Float32Array (Uint16Array/Uint32Array for
* index data, based on the max value). Raw ArrayBuffers pass through as a byte
* view (Uint8Array) — the data is trusted to already be in the right format.
*/
function toTypedArray(data, { index = false } = {}) {
	if (isTypedArray(data)) return data;
	if (data instanceof ArrayBuffer) return new Uint8Array(data);
	const flat = Array.isArray(data[0]) ? data.flat() : data;
	if (index) return flat.some((value) => value > 65535) ? new Uint32Array(flat) : new Uint16Array(flat);
	return new Float32Array(flat);
}
const FLOAT16_FORMATS = /* @__PURE__ */ new Set([
	"r16float",
	"rg16float",
	"rgba16float"
]);
/**
* Coerce texture upload data to a typed array. Typed arrays pass through as
* trusted bytes — the required path for integer/unorm/snorm/packed formats. A
* plain number array is treated as float data and packed at the format's float
* precision: Float16Array for half-float formats, Float32Array otherwise.
*/
function toTextureData(data, format) {
	if (Array.isArray(data) && FLOAT16_FORMATS.has(format)) return new Float16Array(Array.isArray(data[0]) ? data.flat() : data);
	return toTypedArray(data);
}
/** Bytes per texel for formats supported by updateTexture/readTexture. */
const BYTES_PER_TEXEL = {
	r8unorm: 1,
	r8snorm: 1,
	r8uint: 1,
	r8sint: 1,
	rg8unorm: 2,
	rg8snorm: 2,
	rg8uint: 2,
	rg8sint: 2,
	r16float: 2,
	r16uint: 2,
	r16sint: 2,
	rg16float: 4,
	rg16uint: 4,
	rg16sint: 4,
	r32float: 4,
	r32uint: 4,
	r32sint: 4,
	rgba8unorm: 4,
	"rgba8unorm-srgb": 4,
	rgba8snorm: 4,
	rgba8uint: 4,
	rgba8sint: 4,
	bgra8unorm: 4,
	"bgra8unorm-srgb": 4,
	rgb9e5ufloat: 4,
	rgb10a2uint: 4,
	rgb10a2unorm: 4,
	rg11b10ufloat: 4,
	rg32float: 8,
	rg32uint: 8,
	rg32sint: 8,
	rgba16float: 8,
	rgba16uint: 8,
	rgba16sint: 8,
	rgba32float: 16,
	rgba32uint: 16,
	rgba32sint: 16
};
/**
* Bytes per texel for a supported texture format. Throws for
* unsupported/compressed formats.
*/
function bytesPerTexel(format) {
	const bytes = BYTES_PER_TEXEL[format];
	if (!bytes) throw new Error(`pex-gpu: unsupported texture data format "${format}"`);
	return bytes;
}

const SCALARS = {
	f32: {
		size: 4,
		align: 4,
		suffix: "float32",
		vertexFormat: "float32"
	},
	i32: {
		size: 4,
		align: 4,
		suffix: "sint32",
		vertexFormat: "sint32"
	},
	u32: {
		size: 4,
		align: 4,
		suffix: "uint32",
		vertexFormat: "uint32"
	},
	f16: {
		size: 2,
		align: 2,
		suffix: "float16"
	}
};
/** Normalize predeclared aliases: vec3f → vec3<f32>, mat4x4f → mat4x4<f32>, … */
function normalizeType(type) {
	return type.trim().replaceAll(/\s+/g, "").replaceAll(/\b(vec[234]|mat[234]x[234])([fiuh])\b/g, (_, base, suffix) => `${base}<${{
		f: "f32",
		i: "i32",
		u: "u32",
		h: "f16"
	}[suffix]}>`);
}
function typeInfo(type, structs) {
	const scalar = SCALARS[type];
	if (scalar) return scalar;
	let match = /^vec([234])<(\w+)>$/.exec(type);
	if (match) {
		const n = Number(match[1]);
		const component = SCALARS[match[2]];
		if (!component) throw reflectionError(`unknown vector component in "${type}"`);
		const vertexFormat = component.suffix === "float16" && n === 3 ? void 0 : `${component.suffix}x${n}`;
		return {
			size: n * component.size,
			align: (n === 3 ? 4 : n) * component.align,
			...vertexFormat && { vertexFormat }
		};
	}
	match = /^mat([234])x([234])<(\w+)>$/.exec(type);
	if (match) {
		const [cols, rows] = [Number(match[1]), Number(match[2])];
		const column = typeInfo(`vec${rows}<${match[3]}>`, structs);
		return {
			size: cols * alignTo(column.size, column.align),
			align: column.align
		};
	}
	const struct = structs.get(type);
	if (struct) return {
		size: struct.size,
		align: struct.align,
		structLayout: struct
	};
	throw reflectionError(`unsupported type "${type}" in buffer layout`);
}
/** Element stride of an array<T, N> in the uniform address space. */
function arrayInfo(elementType, structs) {
	const element = typeInfo(elementType, structs);
	return {
		stride: alignTo(alignTo(element.size, element.align), 16),
		align: alignTo(element.align, 16)
	};
}
const reflectionError = (message) => /* @__PURE__ */ new Error(`pex-gpu: WGSL reflection: ${message}`);
function stripComments(source) {
	let out = "";
	let i = 0;
	while (i < source.length) if (source.startsWith("//", i)) {
		const end = source.indexOf("\n", i);
		i = end === -1 ? source.length : end;
	} else if (source.startsWith("/*", i)) {
		let depth = 1;
		i += 2;
		while (i < source.length && depth > 0) if (source.startsWith("/*", i)) depth++, i += 2;
		else if (source.startsWith("*/", i)) depth--, i += 2;
		else i++;
	} else out += source[i++];
	return out;
}
/**
* Split on commas at nesting depth 0. Defaults suit type expressions; argument
* lists pass `"(["`/`")]"` instead, where `<` and `>` are comparisons.
*/
function splitTopLevel(input, open = "<(", close = ">)") {
	const parts = [];
	let depth = 0;
	let current = "";
	for (const char of input) {
		if (open.includes(char)) depth++;
		else if (close.includes(char)) depth--;
		if (char === "," && depth === 0) {
			parts.push(current);
			current = "";
		} else current += char;
	}
	if (current.trim()) parts.push(current);
	return parts;
}
function parseAttributes(input) {
	const attributes = {};
	for (const [, name, value] of input.matchAll(/@(\w+)\s*\(\s*([^)]*?)\s*\)/g)) if (name === "builtin") attributes.builtin = value;
	else if (name === "location" || name === "align" || name === "size" || name === "group" || name === "binding") attributes[name] = Number(value);
	return attributes;
}
function parseStructs(source) {
	const structs = /* @__PURE__ */ new Map();
	for (const [, name, body] of source.matchAll(/struct\s+(\w+)\s*\{([^}]*)\}/g)) {
		const members = [];
		for (const entry of splitTopLevel(body)) {
			const match = /^((?:\s*@\w+\s*\([^)]*\)\s*)*)\s*(\w+)\s*:\s*(.+)$/s.exec(entry);
			if (!match) continue;
			members.push({
				name: match[2],
				type: normalizeType(match[3]),
				attributes: parseAttributes(match[1])
			});
		}
		structs.set(name, members);
	}
	return structs;
}
/**
* Compute (and cache) the uniform-address-space byte layout of a struct,
* recursing into nested struct and array element types.
*/
function computeLayout(name, rawStructs, layouts) {
	const cached = layouts.get(name);
	if (cached) return cached;
	const raw = rawStructs.get(name);
	if (!raw) throw reflectionError(`unknown struct "${name}"`);
	let offset = 0;
	let structAlign = 0;
	const members = [];
	for (const { name: memberName, type, attributes } of raw) {
		if (attributes.builtin !== void 0 || attributes.location !== void 0) continue;
		let info;
		let arrayCount;
		let arrayStride;
		const array = /^array<(.+?)(?:,\s*(\d+)\s*)?>$/.exec(type);
		if (array) {
			const elementType = array[1];
			if (rawStructs.has(elementType)) computeLayout(elementType, rawStructs, layouts);
			const element = arrayInfo(elementType, layouts);
			arrayCount = array[2] ? Number(array[2]) : void 0;
			arrayStride = element.stride;
			if (arrayCount === void 0) throw reflectionError(`runtime-sized array "${memberName}" is only allowed as the last member of a storage buffer struct; bind it as a whole buffer instead`);
			info = {
				size: arrayCount * element.stride,
				align: element.align
			};
		} else {
			if (rawStructs.has(type)) computeLayout(type, rawStructs, layouts);
			info = typeInfo(type, layouts);
			if (layouts.has(type)) info = {
				...info,
				align: alignTo(info.align, 16)
			};
		}
		const align = attributes.align ?? info.align;
		offset = alignTo(offset, align);
		members.push({
			name: memberName,
			type,
			offset,
			size: attributes.size ?? info.size,
			align,
			...arrayCount !== void 0 && { arrayCount },
			...arrayStride !== void 0 && { arrayStride }
		});
		offset += attributes.size ?? info.size;
		structAlign = Math.max(structAlign, align);
	}
	const layout = {
		name,
		align: structAlign || 4,
		size: alignTo(offset, structAlign || 4),
		members
	};
	layouts.set(name, layout);
	return layout;
}
const TEXTURE_TYPES = {
	texture_1d: { viewDimension: "1d" },
	texture_2d: { viewDimension: "2d" },
	texture_2d_array: { viewDimension: "2d-array" },
	texture_3d: { viewDimension: "3d" },
	texture_cube: { viewDimension: "cube" },
	texture_cube_array: { viewDimension: "cube-array" },
	texture_multisampled_2d: {
		viewDimension: "2d",
		multisampled: true
	},
	texture_depth_2d: {
		viewDimension: "2d",
		depth: true
	},
	texture_depth_2d_array: {
		viewDimension: "2d-array",
		depth: true
	},
	texture_depth_cube: {
		viewDimension: "cube",
		depth: true
	},
	texture_depth_multisampled_2d: {
		viewDimension: "2d",
		depth: true,
		multisampled: true
	}
};
const SAMPLE_TYPES = {
	f32: "float",
	u32: "uint",
	i32: "sint"
};
const STORAGE_TEXTURE_ACCESS = {
	read: "read-only",
	write: "write-only",
	read_write: "read-write"
};
function parseBindings(source, structs, rawStructs, visibility) {
	const bindings = [];
	const declarations = source.matchAll(/((?:@\w+\s*\([^)]*\)\s*)+)var\s*(?:<([^>]*)>)?\s+(\w+)\s*:\s*([^;=]+)/g);
	for (const [, attributeText, addressSpace, name, rawType] of declarations) {
		const { group, binding } = parseAttributes(attributeText);
		if (group === void 0 || binding === void 0) continue;
		const type = normalizeType(rawType);
		const base = {
			name,
			group,
			binding
		};
		if (addressSpace?.startsWith("uniform")) {
			const layout = resolveBufferLayout(type, structs, rawStructs);
			bindings.push({
				...base,
				kind: "uniform",
				visibility,
				structLayout: layout,
				minBindingSize: layout.size
			});
		} else if (addressSpace?.startsWith("storage")) {
			const readOnly = !addressSpace.includes("read_write");
			const kind = readOnly ? "read-only-storage" : "storage";
			bindings.push({
				...base,
				kind,
				visibility: readOnly ? visibility : visibility & ~GPUShaderStage.VERTEX
			});
		} else if (type === "sampler" || type === "sampler_comparison") bindings.push({
			...base,
			kind: type === "sampler" ? "sampler" : "comparison-sampler",
			visibility
		});
		else if (type === "texture_external") bindings.push({
			...base,
			kind: "external-texture",
			visibility
		});
		else {
			const textureMatch = /^(\w+?)(?:<(.+)>)?$/.exec(type);
			const textureType = textureMatch && TEXTURE_TYPES[textureMatch[1]];
			if (textureType) bindings.push({
				...base,
				kind: "texture",
				visibility,
				viewDimension: textureType.viewDimension,
				sampleType: textureType.depth ? "depth" : SAMPLE_TYPES[textureMatch[2] ?? "f32"] ?? "float",
				...textureType.multisampled && { multisampled: true }
			});
			else if (textureMatch && textureMatch[1].startsWith("texture_storage_")) {
				const [format, access = "write"] = (textureMatch[2] ?? "").split(",", 2);
				bindings.push({
					...base,
					kind: "storage-texture",
					visibility: access.trim() === "read" ? visibility : visibility & ~GPUShaderStage.VERTEX,
					viewDimension: TEXTURE_TYPES[textureMatch[1].replace("_storage", "")]?.viewDimension ?? "2d",
					storageTextureFormat: format.trim(),
					storageTextureAccess: STORAGE_TEXTURE_ACCESS[access.trim()] ?? "write-only"
				});
			} else throw reflectionError(`unsupported binding type "${type}" for "${name}"`);
		}
	}
	return bindings;
}
/** Layout for a buffer binding: struct type, or a single-value synthetic layout. */
function resolveBufferLayout(type, structs, rawStructs) {
	if (rawStructs.has(type)) return computeLayout(type, rawStructs, structs);
	const array = /^array<(.+?)(?:,\s*(\d+)\s*)?>$/.exec(type);
	if (array && array[2]) {
		const elementType = array[1];
		const count = Number(array[2]);
		const isStructElement = rawStructs.has(elementType);
		if (isStructElement) computeLayout(elementType, rawStructs, structs);
		const { stride, align } = arrayInfo(elementType, structs);
		const size = stride * count;
		return {
			name: "",
			size,
			align,
			members: [{
				name: "",
				type,
				offset: 0,
				size,
				align,
				arrayCount: count,
				arrayStride: stride,
				...isStructElement && { elementLayout: structs.get(elementType) }
			}]
		};
	}
	const info = typeInfo(type, structs);
	return {
		name: "",
		size: alignTo(info.size, info.align),
		align: info.align,
		members: [{
			name: "",
			type,
			offset: 0,
			size: info.size,
			align: info.align
		}]
	};
}
function parseEntryPoints(source) {
	const entryPoints = {};
	const vertexParams = [];
	for (const match of source.matchAll(/@(vertex|fragment|compute)\s*(?:@\w+\s*\([^)]*\)\s*)*fn\s+(\w+)\s*\(/g)) {
		const stage = match[1];
		entryPoints[stage] ??= match[2];
		if (stage === "vertex" && entryPoints.vertex === match[2]) {
			let depth = 1;
			let i = match.index + match[0].length;
			const start = i;
			while (i < source.length && depth > 0) {
				if (source[i] === "(") depth++;
				else if (source[i] === ")") depth--;
				i++;
			}
			vertexParams.push(source.slice(start, i - 1));
		}
	}
	return {
		entryPoints,
		vertexParams
	};
}
function parseVertexInputs(paramsText, rawStructs) {
	const inputs = [];
	const addInput = (name, type, location) => {
		const info = typeInfo(type, /* @__PURE__ */ new Map());
		if (!info.vertexFormat) throw reflectionError(`type "${type}" of vertex input "${name}" has no vertex format`);
		inputs.push({
			name,
			location,
			type,
			format: info.vertexFormat,
			stride: info.size
		});
	};
	for (const param of splitTopLevel(paramsText)) {
		const match = /^((?:\s*@\w+\s*\([^)]*\)\s*)*)\s*(\w+)\s*:\s*(.+)$/s.exec(param);
		if (!match) continue;
		const attributes = parseAttributes(match[1]);
		if (attributes.builtin !== void 0) continue;
		const type = normalizeType(match[3]);
		if (attributes.location === void 0) for (const member of rawStructs.get(type) ?? []) {
			if (member.attributes.location === void 0) continue;
			addInput(member.name, member.type, member.attributes.location);
		}
		else addInput(match[2], type, attributes.location);
	}
	return inputs.sort((a, b) => a.location - b.location);
}
function analyzeOverrides(code) {
	const names = new Set([...code.matchAll(/\boverride\s+([A-Za-z_]\w*)/g)].map((match) => match[1]));
	if (!names.size) return {
		names,
		graph: /* @__PURE__ */ new Map(),
		moduleScopeUsed: /* @__PURE__ */ new Set()
	};
	const bodies = /* @__PURE__ */ new Map();
	const spans = [];
	const fnRe = /\bfn\s+([A-Za-z_]\w*)\s*\(/g;
	let fn;
	while (fn = fnRe.exec(code)) {
		const open = code.indexOf("{", fnRe.lastIndex);
		if (open === -1) continue;
		let depth = 0;
		let i = open;
		for (; i < code.length; i++) if (code[i] === "{") depth++;
		else if (code[i] === "}" && --depth === 0) break;
		bodies.set(fn[1], code.slice(open + 1, i).match(/[A-Za-z_]\w*/g) ?? []);
		spans.push([open, i]);
		fnRe.lastIndex = i;
	}
	const graph = /* @__PURE__ */ new Map();
	for (const [name, identifiers] of bodies) {
		const uses = /* @__PURE__ */ new Set();
		const calls = /* @__PURE__ */ new Set();
		for (const id of identifiers) if (names.has(id)) uses.add(id);
		else if (bodies.has(id)) calls.add(id);
		graph.set(name, {
			uses,
			calls
		});
	}
	let moduleScope = "";
	let cursor = 0;
	for (const [open, close] of spans) {
		moduleScope += code.slice(cursor, open);
		cursor = close + 1;
	}
	moduleScope += code.slice(cursor);
	moduleScope = moduleScope.replace(/\boverride\s+[A-Za-z_]\w*[^;]*;/g, "");
	return {
		names,
		graph,
		moduleScopeUsed: new Set((moduleScope.match(/[A-Za-z_]\w*/g) ?? []).filter((id) => names.has(id)))
	};
}
function reachableOverrides({ graph, moduleScopeUsed }, entryPoint) {
	const used = new Set(moduleScopeUsed);
	const visited = /* @__PURE__ */ new Set();
	const stack = [entryPoint];
	while (stack.length) {
		const name = stack.pop();
		if (visited.has(name)) continue;
		visited.add(name);
		const node = graph.get(name);
		if (!node) continue;
		for (const override of node.uses) used.add(override);
		for (const callee of node.calls) if (!visited.has(callee)) stack.push(callee);
	}
	return used;
}
/**
* Per-entry-point overrides for a (comment-stripped) source. WebKit fails Metal
* library creation when a stage is handed a constant for an override its entry
* point never uses — and a combined vertex+fragment source declares both
* stages' overrides — so per-stage constants are narrowed to these sets (Chrome
* ignores the extras). Only the small result sets are retained on the
* reflection; the intermediate call graph is discarded.
*/
function overridesByEntryPoint(code, entryPoints) {
	const analysis = analyzeOverrides(code);
	const overrides = /* @__PURE__ */ new Map();
	for (const entryPoint of Object.values(entryPoints)) if (entryPoint) overrides.set(entryPoint, reachableOverrides(analysis, entryPoint));
	return overrides;
}
/** Contents of every balanced parenthesis group, innermost first. */
function* parenGroups(source) {
	const stack = [];
	for (let i = 0; i < source.length; i++) {
		const char = source[i];
		if (char === "(") stack.push(i);
		else if (char === ")") {
			const start = stack.pop();
			if (start !== void 0) yield source.slice(start + 1, i);
		}
	}
}
function markNonFilteringSamplers(source, bindings) {
	const depthTextures = new Set(bindings.filter((b) => b.kind === "texture" && b.sampleType === "depth").map((b) => b.name));
	const samplers = new Set(bindings.filter((b) => b.kind === "sampler").map((b) => b.name));
	if (!depthTextures.size || !samplers.size) return bindings;
	const nonFiltering = /* @__PURE__ */ new Set();
	for (const args of parenGroups(source)) {
		const idents = splitTopLevel(args, "([", ")]").map((arg) => /[A-Za-z_]\w*/.exec(arg)?.[0]);
		for (let i = 1; i < idents.length; i++) if (samplers.has(idents[i]) && depthTextures.has(idents[i - 1])) nonFiltering.add(idents[i]);
	}
	if (!nonFiltering.size) return bindings;
	return bindings.map((b) => b.kind === "sampler" && nonFiltering.has(b.name) ? {
		...b,
		nonFiltering: true
	} : b);
}
/** Group bindings by @group index, sorted by binding number within each group. */
function bindingsToGroups(bindings) {
	const groups = /* @__PURE__ */ new Map();
	for (const binding of bindings) groups.getOrInsertComputed(binding.group, () => []).push(binding);
	for (const group of groups.values()) group.sort((a, b) => a.binding - b.binding);
	return groups;
}
const reflectionCache = /* @__PURE__ */ new Map();
/**
* Parse a WGSL source string into a {@link ShaderReflection}. Results are cached
* by source identity: parsing the same string twice is free.
*/
function parseWGSL(source) {
	const cached = reflectionCache.get(source);
	if (cached) return cached;
	const stripped = stripComments(source);
	const rawStructs = parseStructs(stripped);
	const structs = /* @__PURE__ */ new Map();
	const { entryPoints, vertexParams } = parseEntryPoints(stripped);
	let visibility = 0;
	if (entryPoints.vertex) visibility |= GPUShaderStage.VERTEX;
	if (entryPoints.fragment) visibility |= GPUShaderStage.FRAGMENT;
	if (entryPoints.compute) visibility |= GPUShaderStage.COMPUTE;
	const bindings = markNonFilteringSamplers(stripped, parseBindings(stripped, structs, rawStructs, visibility));
	const vertexInputs = vertexParams.length ? parseVertexInputs(vertexParams[0], rawStructs) : [];
	const reflection = {
		bindings,
		groups: bindingsToGroups(bindings),
		vertexInputs,
		structs,
		entryPoints,
		overrides: overridesByEntryPoint(stripped, entryPoints)
	};
	reflectionCache.set(source, reflection);
	return reflection;
}
/**
* Merge reflections of separate vertex/fragment sources: bindings sharing a
* group/binding slot are unified with combined stage visibility.
*/
function mergeReflections(a, b) {
	if (a === b) return a;
	const bindings = [...a.bindings];
	for (const binding of b.bindings) {
		const index = bindings.findIndex((existing) => existing.group === binding.group && existing.binding === binding.binding);
		if (index === -1) bindings.push(binding);
		else {
			const existing = bindings[index];
			if (existing.kind !== binding.kind) throw reflectionError(`binding "${binding.name}" (@group(${binding.group}) @binding(${binding.binding})) has conflicting types across shader stages`);
			bindings[index] = {
				...existing,
				visibility: existing.visibility | binding.visibility
			};
		}
	}
	return {
		bindings,
		groups: bindingsToGroups(bindings),
		vertexInputs: a.vertexInputs.length ? a.vertexInputs : b.vertexInputs,
		structs: new Map([...a.structs, ...b.structs]),
		entryPoints: {
			...b.entryPoints,
			...a.entryPoints
		},
		overrides: new Map([...a.overrides, ...b.overrides])
	};
}

/**
* Narrow a stage's constants to `referenced` — the overrides its entry point
* actually uses (from reflection) — so a stage never receives a value for an
* override it doesn't use: fatal on WebKit (a combined vertex+fragment source
* declares both stages' overrides), ignored by Chrome. `referenced` is
* undefined only when the entry point couldn't be resolved, in which case
* constants pass through unscoped. Undefined result when nothing remains, so
* `constants` is omitted entirely.
*/
function scopeConstants(constants, referenced) {
	if (!constants) return void 0;
	if (!referenced) return constants;
	const scoped = {};
	for (const [key, value] of Object.entries(constants)) if (referenced.has(key)) scoped[key] = value;
	return Object.keys(scoped).length ? scoped : void 0;
}
const formatCompilationMessage = (code, message) => {
	const location = message.lineNum ? ` at ${message.lineNum}:${message.linePos}` : "";
	let out = `${message.type}${location}: ${message.message}`;
	const line = message.lineNum && code.split("\n")[message.lineNum - 1];
	if (line) out += `\n  ${line}\n  ${" ".repeat(Math.max(0, message.linePos - 1))}^`;
	return out;
};
async function reportShaderDiagnostics(code, module, scopeError, label) {
	let error = null;
	try {
		error = await scopeError;
	} catch {}
	let messages = [];
	try {
		({messages} = await module.getCompilationInfo());
	} catch {}
	if (!messages.length && !error) return;
	const name = label ? ` in "${label}"` : "";
	const warnings = messages.filter((message) => message.type !== "error");
	if (warnings.length) console.warn(`pex-gpu: WGSL warnings${name}\n${warnings.map((message) => formatCompilationMessage(code, message)).join("\n")}`);
	const errors = messages.filter((message) => message.type === "error");
	if (errors.length || error) {
		const details = errors.length ? errors.map((message) => formatCompilationMessage(code, message)).join("\n") : error.message;
		console.error(`pex-gpu: WGSL compilation failed${name}\n${details}`);
	}
}
async function reportPipelineError(scopeError, label, stages) {
	let error = null;
	try {
		error = await scopeError;
	} catch {
		return;
	}
	if (!error) return;
	const details = [];
	for (const { stage, code, module } of stages) {
		let messages = [];
		try {
			({messages} = await module.getCompilationInfo());
		} catch {
			continue;
		}
		for (const message of messages) details.push(`[${stage}] ${formatCompilationMessage(code, message)}`);
	}
	console.error(`pex-gpu: pipeline creation failed in "${label}"\n${error.message}${details.length ? `\n\n${details.join("\n")}` : ""}`);
}
/**
* Caches shader modules by source and pipelines by their full descriptor, so
* lazily-created pipelines are compiled once per unique state/format
* combination. One cache per context; no global registry.
*
* Pipelines are keyed by nested maps on the source strings themselves rather
* than content hashes: lookups never walk the (potentially large) WGSL source
* and keys cannot collide.
*/
var PipelineCache = class {
	#device;
	#modules = /* @__PURE__ */ new Map();
	/** Vertex source → fragment source → serialized state */
	#renderPipelines = /* @__PURE__ */ new Map();
	/** Compute source → serialized state */
	#computePipelines = /* @__PURE__ */ new Map();
	constructor(device) {
		this.#device = device;
	}
	get size() {
		let size = 0;
		for (const byFragment of this.#renderPipelines.values()) for (const byState of byFragment.values()) size += byState.size;
		for (const byState of this.#computePipelines.values()) size += byState.size;
		return size;
	}
	/**
	* Get (or create and cache) a shader module. Compilation diagnostics are
	* reported asynchronously and identically across browsers: the validation
	* error is captured in an error scope (Chrome logs uncaptured ones with its
	* own formatting, Safari not at all) and getCompilationInfo() messages are
	* formatted with the offending source line and a caret. Reporting never
	* blocks module creation, and runs once per unique source.
	*/
	getShaderModule(code, label) {
		let created = false;
		const module = this.#modules.getOrInsertComputed(code, (code) => {
			created = true;
			debugLog(this.#device, "resources", () => `createShaderModule ${label ? `"${label}" ` : ""}(${code.length} chars)`);
			this.#device.pushErrorScope("validation");
			const module = this.#device.createShaderModule({
				code,
				...label && { label }
			});
			reportShaderDiagnostics(code, module, this.#device.popErrorScope(), label);
			return module;
		});
		recordCacheAccess(this.#device, "shaderModules", !created);
		return module;
	}
	/**
	* Browsers differ in when WGSL errors surface: Chrome reports at module
	* creation, WebKit defers compilation so the validation error can fire at
	* pipeline creation instead — capture that too, or Safari stays silent.
	*/
	#captureValidation(label, create, stages) {
		this.#device.pushErrorScope("validation");
		const result = create();
		reportPipelineError(this.#device.popErrorScope(), label, stages);
		return result;
	}
	getRenderPipeline(source) {
		const byState = this.#renderPipelines.getOrInsertComputed(source.vertex, () => /* @__PURE__ */ new Map()).getOrInsertComputed(source.fragment ?? "", () => /* @__PURE__ */ new Map());
		const state = JSON.stringify([
			source.buffers,
			source.targets,
			source.primitive,
			source.depthStencil,
			source.multisample,
			source.vertexEntryPoint,
			source.fragmentEntryPoint,
			source.constants,
			source.layoutKey ?? "auto"
		]);
		let created = false;
		const pipeline = byState.getOrInsertComputed(state, () => {
			created = true;
			const label = source.label ?? "pex-gpu pipeline";
			debugLog(this.#device, "resources", () => `createRenderPipeline "${label}" ${state}`);
			const vertexModule = this.getShaderModule(source.vertex, source.label);
			const fragmentModule = source.fragment ? this.getShaderModule(source.fragment, source.label) : void 0;
			const vertexReflection = parseWGSL(source.vertex);
			const fragmentReflection = source.fragment ? parseWGSL(source.fragment) : void 0;
			const vertexEntryPoint = source.vertexEntryPoint ?? vertexReflection.entryPoints.vertex;
			const fragmentEntryPoint = source.fragmentEntryPoint ?? fragmentReflection?.entryPoints.fragment;
			const vertexConstants = scopeConstants(source.constants, vertexEntryPoint ? vertexReflection.overrides.get(vertexEntryPoint) : void 0);
			const fragmentConstants = fragmentReflection && fragmentEntryPoint ? scopeConstants(source.constants, fragmentReflection.overrides.get(fragmentEntryPoint)) : void 0;
			const stages = [{
				stage: "vertex",
				code: source.vertex,
				module: vertexModule
			}];
			if (fragmentModule && source.fragment) stages.push({
				stage: "fragment",
				code: source.fragment,
				module: fragmentModule
			});
			return this.#captureValidation(label, () => this.#device.createRenderPipeline({
				label,
				layout: source.layout ?? "auto",
				vertex: {
					module: vertexModule,
					...vertexEntryPoint && { entryPoint: vertexEntryPoint },
					...vertexConstants && { constants: vertexConstants },
					buffers: source.buffers ?? []
				},
				...fragmentModule && { fragment: {
					module: fragmentModule,
					...fragmentEntryPoint && { entryPoint: fragmentEntryPoint },
					...fragmentConstants && { constants: fragmentConstants },
					targets: source.targets ?? []
				} },
				...source.primitive && { primitive: source.primitive },
				...source.depthStencil && { depthStencil: source.depthStencil },
				...source.multisample && { multisample: source.multisample }
			}), stages);
		});
		recordCacheAccess(this.#device, "renderPipelines", !created);
		return pipeline;
	}
	getComputePipeline(source) {
		const byState = this.#computePipelines.getOrInsertComputed(source.compute, () => /* @__PURE__ */ new Map());
		const state = JSON.stringify([
			source.entryPoint,
			source.constants,
			source.layoutKey ?? "auto"
		]);
		let created = false;
		const pipeline = byState.getOrInsertComputed(state, () => {
			created = true;
			const label = source.label ?? "pex-gpu compute pipeline";
			debugLog(this.#device, "resources", () => `createComputePipeline "${label}" ${state}`);
			const reflection = parseWGSL(source.compute);
			const entryPoint = source.entryPoint ?? reflection.entryPoints.compute;
			const module = this.getShaderModule(source.compute, source.label);
			const constants = scopeConstants(source.constants, entryPoint ? reflection.overrides.get(entryPoint) : void 0);
			return this.#captureValidation(label, () => this.#device.createComputePipeline({
				label,
				layout: source.layout ?? "auto",
				compute: {
					module,
					...entryPoint && { entryPoint },
					...constants && { constants }
				}
			}), [{
				stage: "compute",
				code: source.compute,
				module
			}]);
		});
		recordCacheAccess(this.#device, "computePipelines", !created);
		return pipeline;
	}
	clear() {
		this.#modules.clear();
		this.#renderPipelines.clear();
		this.#computePipelines.clear();
	}
};

let nextBufferId = 1;
/**
* Type guard for {@link GpuBuffer} resource objects (raw GPUBuffers also have a
* similar shape — discriminate on `id`).
*/
const isGpuBuffer = (value) => typeof value === "object" && value !== null && "id" in value && "buffer" in value;
/**
* Usage presets for {@link createBuffer}: common GPUBufferUsage flag
* combinations by name.
*/
const BUFFER_USAGE_PRESETS = {
	vertex: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	index: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
	indirect: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	uniform: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	storage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
	"read-only-storage": GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	upload: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
	readback: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	"query-resolve": GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
};
/**
* Coerce input to a typed array, additionally converting index data to one of
* the two WebGPU index formats: libraries like primitive-geometry hand out
* Uint8Array cells for small geometries, which uint16/uint32 draws misread. An
* explicit `indexFormat` is authoritative; otherwise it is derived from the
* data (uint32 when any index exceeds 65535). Raw ArrayBuffers are trusted to
* already contain data in the right format.
*/
function toBufferData(data, index, indexFormat) {
	const typed = toTypedArray(data, { index });
	if (!index || data instanceof ArrayBuffer) return typed;
	const values = typed;
	if ((indexFormat ?? (typed instanceof Uint32Array ? "uint32" : typed instanceof Uint16Array ? "uint16" : Array.prototype.some.call(values, (value) => value > 65535) ? "uint32" : "uint16")) === "uint32") return typed instanceof Uint32Array ? typed : new Uint32Array(values);
	return typed instanceof Uint16Array ? typed : new Uint16Array(values);
}
/**
* Create a GPU buffer.
*
* ```js
* const positions = gpu.createBuffer(ctx, {
*   usage: "vertex",
*   data: geometry.positions,
* });
* const indices = gpu.createBuffer(ctx, {
*   usage: "index",
*   data: geometry.cells,
* });
* ```
*/
function createBuffer(ctx, options) {
	const usage = typeof options.usage === "string" ? BUFFER_USAGE_PRESETS[options.usage] : options.usage;
	const index = (usage & GPUBufferUsage.INDEX) !== 0;
	const data = options.data === void 0 ? void 0 : toBufferData(options.data, index, options.indexFormat);
	const size = alignTo(Math.max(options.size ?? 0, data?.byteLength ?? 0), 4);
	if (size === 0) throw new Error("pex-gpu: createBuffer needs data or a size");
	const buffer = ctx.device.createBuffer({
		size,
		usage,
		...data && { mappedAtCreation: true },
		...options.label && { label: options.label }
	});
	if (data) {
		new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
		buffer.unmap();
	}
	const counters = debugCounters(ctx.device).lifetime.buffers;
	counters.created++;
	counters.alive++;
	counters.bytes += size;
	debugLog(ctx.device, "resources", () => `createBuffer ${options.label ? `"${options.label}" ` : ""}${size} bytes`);
	let disposed = false;
	function dispose() {
		if (disposed) return;
		disposed = true;
		counters.alive--;
		counters.disposed++;
		counters.bytes -= size;
		buffer.destroy();
	}
	return {
		buffer,
		size,
		usage: buffer.usage,
		id: nextBufferId++,
		...data && { length: data.length },
		...index && { indexFormat: options.indexFormat ?? (data instanceof Uint32Array ? "uint32" : "uint16") },
		dispose,
		[Symbol.dispose]: dispose
	};
}
/**
* Upload data into an existing buffer.
*
* ```js
* gpu.updateBuffer(ctx, positions, newPositions);
* ```
*/
function updateBuffer(ctx, target, data, byteOffset = 0) {
	const typed = toBufferData(data, (target.usage & GPUBufferUsage.INDEX) !== 0, target.indexFormat);
	let bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
	if (bytes.byteLength % 4 !== 0) {
		const padded = new Uint8Array(alignTo(bytes.byteLength, 4));
		padded.set(bytes);
		bytes = padded;
	}
	ctx.device.queue.writeBuffer(target.buffer, byteOffset, bytes);
}

/**
* Per-frame uniform ring buffer. Each draw's uniform structs are packed into
* CPU staging at 256-byte-aligned offsets, bound through bind groups with
* dynamic offsets, and flushed with a single writeBuffer before submission.
*/
var UniformAllocator = class {
	buffer;
	/** Incremented when the GPU buffer is replaced; part of bind group cache keys. */
	generation = 0;
	#device;
	#staging;
	#cursor = 0;
	#alignment;
	#retired = [];
	constructor(device, initialSize = 256 * 1024) {
		this.#device = device;
		this.#alignment = device.limits.minUniformBufferOffsetAlignment;
		this.#staging = new ArrayBuffer(initialSize);
		this.buffer = this.#createBuffer(initialSize);
	}
	#createBuffer(size) {
		return this.#device.createBuffer({
			label: "pex-gpu uniforms",
			size,
			usage: BUFFER_USAGE_PRESETS.uniform
		});
	}
	get staging() {
		return this.#staging;
	}
	/** Reserve an aligned slice; returns its byte offset. Grows when exhausted. */
	allocate(size) {
		const offset = Math.ceil(this.#cursor / this.#alignment) * this.#alignment;
		if (offset + size > this.#staging.byteLength) {
			this.#grow(Math.max(this.#staging.byteLength * 2, offset + size));
			return this.allocate(size);
		}
		this.#cursor = offset + size;
		return offset;
	}
	#grow(newSize) {
		this.flush();
		this.#retired.push(this.buffer);
		this.buffer = this.#createBuffer(newSize);
		this.generation++;
		debugLog(this.#device, "resources", () => `uniform ring grown to ${newSize} bytes (generation ${this.generation})`);
		this.#staging = new ArrayBuffer(newSize);
		this.#cursor = 0;
	}
	/** Upload the staged range. Called before queue submission. */
	flush() {
		if (this.#cursor === 0) return;
		this.#device.queue.writeBuffer(this.buffer, 0, this.#staging, 0, this.#cursor);
	}
	/** Start a new frame: reclaim the cursor and destroy retired buffers. */
	reset() {
		this.#cursor = 0;
		for (const buffer of this.#retired) buffer.destroy();
		this.#retired.length = 0;
	}
	dispose() {
		this.reset();
		this.buffer.destroy();
	}
};
const states = /* @__PURE__ */ new WeakMap();
function commandsState(ctx) {
	return states.getOrInsertComputed(ctx, () => {
		const bindGroups = /* @__PURE__ */ new Map();
		const bindGroupsByResource = /* @__PURE__ */ new Map();
		const bindGroupFinalizer = new FinalizationRegistry((id) => {
			const keys = bindGroupsByResource.get(id);
			if (!keys) return;
			for (const key of keys) bindGroups.delete(key);
			bindGroupsByResource.delete(id);
		});
		return {
			allocator: null,
			bindGroupLayouts: /* @__PURE__ */ new Map(),
			pipelineLayouts: /* @__PURE__ */ new Map(),
			bindGroups,
			bindGroupsByResource,
			bindGroupFinalizer,
			renderPipelines: /* @__PURE__ */ new WeakMap(),
			computePipelines: /* @__PURE__ */ new WeakMap(),
			canvasDepthStencil: null,
			frame: null
		};
	});
}
/**
* Like {@link commandsState}, but never creates one — for teardown paths that
* must not allocate state for a context that never submitted a declarative
* command.
*/
function peekCommandsState(ctx) {
	return states.get(ctx);
}
/**
* Register a bind-group-cacheable resource wrapper (a GpuBuffer/GpuTexture, not
* the raw GPUBuffer/GPUTextureView the bind group actually retains — a
* FinalizationRegistry watching the retained object would never fire, since the
* very cache entry it's meant to prune keeps it alive) so its cache entries are
* pruned once the wrapper is unreachable. A no-op past the first call for a
* given id.
*/
function trackBindGroupResource(state, id, wrapper, cacheKey) {
	let keys = state.bindGroupsByResource.get(id);
	if (!keys) {
		keys = /* @__PURE__ */ new Set();
		state.bindGroupsByResource.set(id, keys);
		state.bindGroupFinalizer.register(wrapper, id);
	}
	keys.add(cacheKey);
}
function frameState(ctx) {
	const state = commandsState(ctx).frame;
	if (!state) throw new Error("pex-gpu: submit() must be called between beginFrame() and endFrame() eg. frame() callback");
	return state;
}
let nextObjectId = 1;
const objectIds = /* @__PURE__ */ new WeakMap();
function objectId(object) {
	return objectIds.getOrInsertComputed(object, () => nextObjectId++);
}

let nextTextureId = 1;
const DEPTH_STENCIL_TEXEL_BYTES = {
	stencil8: 1,
	depth16unorm: 2,
	depth24plus: 4,
	"depth24plus-stencil8": 5,
	depth32float: 4,
	"depth32float-stencil8": 5
};
/** Size of one texel in bytes, estimating formats absent from the upload table. */
function estimatedBytesPerTexel(format) {
	const depthStencilBytes = DEPTH_STENCIL_TEXEL_BYTES[format];
	if (depthStencilBytes !== void 0) return depthStencilBytes;
	try {
		return bytesPerTexel(format);
	} catch {
		return 4;
	}
}
/**
* Estimated memory footprint of a texture, in bytes — from an existing
* {@link GpuTexture} or from a descriptor, so allocation can be budgeted before
* anything is created.
*
* An estimate, not a guarantee: depth/stencil texel sizes and any driver-side
* padding, alignment or metadata (HTILE, DCC, ...) are implementation-defined.
*/
function textureByteSize(descriptor) {
	const { width = 1, height = 1 } = descriptor;
	const layers = descriptor.depthOrArrayLayers ?? descriptor.depth ?? 1;
	const mipLevelCount = descriptor.mipLevelCount ?? 1;
	const sampleCount = descriptor.sampleCount ?? 1;
	const texelBytes = estimatedBytesPerTexel(descriptor.format ?? "rgba8unorm");
	let bytes = 0;
	for (let level = 0; level < mipLevelCount; level++) bytes += Math.max(1, width >> level) * Math.max(1, height >> level) * layers * sampleCount * texelBytes;
	return bytes;
}
const sourceSize = (source) => source instanceof HTMLVideoElement ? {
	width: source.videoWidth,
	height: source.videoHeight
} : source instanceof VideoFrame ? {
	width: source.codedWidth,
	height: source.codedHeight
} : {
	width: source.width,
	height: source.height
};
/**
* BufferData is raw bytes/numbers; anything else in the data union is an image
* source.
*/
const isImageData = (data) => Array.isArray(data) ? typeof data[0] === "object" && !Array.isArray(data[0]) : !ArrayBuffer.isView(data) && !(data instanceof ArrayBuffer);
/** Number of mip levels in a full chain for the given dimensions. */
const fullMipLevelCount = (width, height = 1) => 1 + Math.floor(Math.log2(Math.max(width, height)));
/** Type guard for {@link GpuTexture} resource objects. */
const isGpuTexture = (value) => typeof value === "object" && value !== null && "id" in value && "texture" in value;
/**
* Create a texture. Initial contents can be raw data or image sources —
* dimensions, layer count and array view dimension are inferred from images.
*
* ```js
* const texture = gpu.createTexture(ctx, {
*   width: 2,
*   height: 1,
*   data: [255, 255, 255, 255, 0, 0, 0, 255],
* });
* const depth = gpu.createTexture(ctx, {
*   width,
*   height,
*   format: "depth24plus",
* });
* const photo = gpu.createTexture(ctx, {
*   data: image,
*   mipmap: true,
*   flipY: true,
* });
* const cubemap = gpu.createTexture(ctx, {
*   data: faces,
*   viewDimension: "cube",
* });
* ```
*/
function createTexture(ctx, options) {
	const images = options.data !== void 0 && isImageData(options.data) ? Array.isArray(options.data) ? options.data : [options.data] : void 0;
	const imageSize = images ? sourceSize(images[0]) : void 0;
	const format = options.format ?? "rgba8unorm";
	const width = options.width ?? imageSize?.width;
	if (width === void 0) throw new Error("pex-gpu: createTexture requires a width or image data to infer it from");
	const height = options.height ?? imageSize?.height ?? 1;
	const depthOrArrayLayers = options.depth ?? options.depthOrArrayLayers ?? (images && images.length > 1 ? images.length : 1);
	const mipLevelCount = options.mipLevelCount ?? (options.mipmap ? fullMipLevelCount(width, height) : 1);
	const dimension = options.dimension ?? "2d";
	const viewDimension = options.viewDimension ?? (images && Array.isArray(options.data) ? "2d-array" : void 0) ?? (dimension === "2d" && depthOrArrayLayers > 1 ? "2d-array" : dimension);
	const texture = ctx.device.createTexture({
		size: {
			width,
			height,
			depthOrArrayLayers
		},
		format,
		mipLevelCount,
		sampleCount: options.sampleCount ?? 1,
		dimension,
		usage: options.usage ?? GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
		...options.label && { label: options.label }
	});
	const counters = debugCounters(ctx.device).lifetime.textures;
	let bytes = 0;
	let disposed = false;
	function dispose() {
		if (disposed) return;
		disposed = true;
		counters.alive--;
		counters.disposed++;
		counters.bytes -= bytes;
		texture.destroy();
	}
	const result = {
		texture,
		view: texture.createView({ dimension: viewDimension }),
		format,
		width,
		height,
		depthOrArrayLayers,
		mipLevelCount,
		sampleCount: options.sampleCount ?? 1,
		dimension,
		viewDimension,
		id: nextTextureId++,
		dispose,
		[Symbol.dispose]: dispose
	};
	bytes = textureByteSize(result);
	counters.created++;
	counters.alive++;
	counters.bytes += bytes;
	debugLog(ctx.device, "resources", () => `createTexture ${options.label ? `"${options.label}" ` : ""}${width}×${height}${depthOrArrayLayers > 1 ? `×${depthOrArrayLayers}` : ""} ${format}, ~${bytes} bytes`);
	if (images) for (const [layer, image] of images.entries()) copyExternalImage(ctx, result, image, {
		origin: [
			0,
			0,
			layer
		],
		...options.flipY !== void 0 && { flipY: options.flipY },
		...options.premultipliedAlpha !== void 0 && { premultipliedAlpha: options.premultipliedAlpha },
		...options.colorSpace && { colorSpace: options.colorSpace }
	});
	else if (options.data) updateTexture(ctx, result, options.data);
	if (options.mipmap) generateMipmaps(ctx, result);
	return result;
}
/**
* Upload raw data into a texture region. Float formats accept a plain number
* array (packed at the format's precision); integer, unorm, snorm and packed
* formats require a matching typed array — its bytes are uploaded as-is.
*
* ```js
* gpu.updateTexture(ctx, texture, pixels);
* gpu.updateTexture(ctx, cubemap, facePixels, {
*   origin: [0, 0, faceIndex],
* });
* ```
*/
function updateTexture(ctx, target, data, options = {}) {
	const mipLevel = options.mipLevel ?? 0;
	const width = options.width ?? Math.max(1, target.width >> mipLevel);
	const height = options.height ?? Math.max(1, target.height >> mipLevel);
	const typed = toTextureData(data, target.format);
	ctx.device.queue.writeTexture({
		texture: target.texture,
		mipLevel,
		origin: options.origin ?? [
			0,
			0,
			0
		]
	}, typed, {
		bytesPerRow: bytesPerTexel(target.format) * width,
		rowsPerImage: height
	}, {
		width,
		height,
		depthOrArrayLayers: options.depthOrArrayLayers ?? 1
	});
}
/** Copy an image, canvas or video frame into a texture. */
function copyExternalImage(ctx, target, source, options = {}) {
	const mipLevel = options.mipLevel ?? 0;
	const { width, height } = sourceSize(source);
	ctx.device.queue.copyExternalImageToTexture({
		source,
		flipY: options.flipY ?? false
	}, {
		texture: target.texture,
		mipLevel,
		origin: options.origin ?? [
			0,
			0,
			0
		],
		premultipliedAlpha: options.premultipliedAlpha ?? false,
		...options.colorSpace && { colorSpace: options.colorSpace }
	}, {
		width: options.width ?? Math.max(1, width >> mipLevel),
		height: options.height ?? Math.max(1, height >> mipLevel)
	});
}
const BLIT_WGSL = `
struct Out {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
  // Fullscreen triangle from vertex_index alone — no vertex/index buffer needed.
  let uv = vec2<f32>(f32((index << 1u) & 2u), f32(index & 2u));
  return Out(vec4<f32>(uv * 2.0 - 1.0, 0.0, 1.0), vec2<f32>(uv.x, 1.0 - uv.y));
}

@group(0) @binding(0) var sourceSampler: sampler;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4<f32> {
  return textureSample(sourceTexture, sourceSampler, input.uv);
}
`;
const mipmapCache = /* @__PURE__ */ new WeakMap();
/**
* Generate the full mip chain of a 2D or 2D-array texture by downsampling each
* level with a linear-filtered blit.
*/
function generateMipmaps(ctx, target) {
	if (target.mipLevelCount < 2) return;
	if (target.dimension === "3d") throw new Error("pex-gpu: generateMipmaps does not support 3D textures");
	const cache = mipmapCache.getOrInsertComputed(ctx.device, () => ({
		sampler: ctx.device.createSampler({
			minFilter: "linear",
			magFilter: "linear"
		}),
		pipelines: /* @__PURE__ */ new Map()
	}));
	const pipeline = cache.pipelines.getOrInsertComputed(target.format, () => {
		const module = ctx.pipelineCache.getShaderModule(BLIT_WGSL);
		return ctx.device.createRenderPipeline({
			label: `pex-gpu mipmap ${target.format}`,
			layout: "auto",
			vertex: {
				module,
				entryPoint: "vertexMain"
			},
			fragment: {
				module,
				entryPoint: "fragmentMain",
				targets: [{ format: target.format }]
			},
			primitive: { topology: "triangle-list" }
		});
	});
	const encoder = ctx.device.createCommandEncoder({ label: "pex-gpu mipmaps" });
	for (let layer = 0; layer < target.depthOrArrayLayers; layer++) for (let level = 1; level < target.mipLevelCount; level++) {
		const bindGroup = ctx.device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [{
				binding: 0,
				resource: cache.sampler
			}, {
				binding: 1,
				resource: target.texture.createView({
					dimension: "2d",
					baseMipLevel: level - 1,
					mipLevelCount: 1,
					baseArrayLayer: layer,
					arrayLayerCount: 1
				})
			}]
		});
		const pass = encoder.beginRenderPass({ colorAttachments: [{
			view: target.texture.createView({
				dimension: "2d",
				baseMipLevel: level,
				mipLevelCount: 1,
				baseArrayLayer: layer,
				arrayLayerCount: 1
			}),
			loadOp: "clear",
			storeOp: "store"
		}] });
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.draw(3);
		pass.end();
	}
	ctx.device.queue.submit([encoder.finish()]);
}
/** Row padding helper shared with readback: bytesPerRow aligned to 256. */
const paddedBytesPerRow = (width, format) => alignTo(width * bytesPerTexel(format), 256);

const toFlatArray = (value) => Array.isArray(value) && Array.isArray(value[0]) ? value.flat() : value;
const isIntegerType = (type) => /(^|<)[iu]32>?$/.test(type);
function writeScalar(view, offset, type, value) {
	if (type.includes("u32")) view.setUint32(offset, value, true);
	else if (type.includes("i32")) view.setInt32(offset, value, true);
	else view.setFloat32(offset, value, true);
}
/**
* Write one value at a byte offset, honoring WGSL layout rules. Matrices are
* written column by column with the column stride of their vector type —
* mat3x3<f32> columns are 16-byte aligned, not 12.
*/
function writeValue(view, offset, type, value) {
	if (typeof value === "number" || typeof value === "boolean") {
		writeScalar(view, offset, type, Number(value));
		return;
	}
	const data = toFlatArray(value);
	const matrix = /^mat([234])x([234])</.exec(type);
	if (matrix) {
		const [cols, rows] = [Number(matrix[1]), Number(matrix[2])];
		const columnStride = alignTo(rows * 4, rows === 2 ? 8 : 16);
		for (let col = 0; col < cols; col++) for (let row = 0; row < rows; row++) view.setFloat32(offset + col * columnStride + row * 4, data[col * rows + row], true);
		return;
	}
	const integer = isIntegerType(type);
	for (let i = 0; i < data.length; i++) if (integer) writeScalar(view, offset + i * 4, type, data[i]);
	else view.setFloat32(offset + i * 4, data[i], true);
}
function writeMember(view, member, value) {
	if (member.elementLayout && member.arrayCount !== void 0 && member.arrayStride !== void 0) {
		const elements = value;
		for (let i = 0; i < member.arrayCount; i++) {
			if (elements[i] === void 0) continue;
			packStruct(view.buffer, member.elementLayout, elements[i], view.byteOffset + member.offset + i * member.arrayStride);
		}
		return;
	}
	if (member.arrayCount !== void 0 && member.arrayStride !== void 0) {
		const elementType = /^array<(.+?)(?:,\s*\d+\s*)?>$/.exec(member.type)?.[1] ?? "f32";
		const data = toFlatArray(typeof value === "number" || typeof value === "boolean" ? [Number(value)] : value);
		const componentsPerElement = data.length / member.arrayCount;
		for (let i = 0; i < member.arrayCount; i++) {
			const element = Array.prototype.slice.call(data, i * componentsPerElement, (i + 1) * componentsPerElement);
			writeValue(view, member.offset + i * member.arrayStride, elementType, element);
		}
		return;
	}
	writeValue(view, member.offset, member.type, value);
}
/**
* Pack values into a struct layout inside `destination`.
*
* `values` is either an object keyed by member name, or — when the layout is a
* synthetic single-value layout for a non-struct binding — the value itself.
* Throws on unknown member names to surface typos early.
*
* Known limitation: elements of `array<SomeStruct, N>` members are written
* tightly packed — structs with internal padding (eg. two vec3f members) need
* their padding included in the source data.
*/
function packStruct(destination, layout, values, byteOffset = 0) {
	const view = new DataView(destination, byteOffset);
	if (layout.members.length === 1 && layout.members[0].name === "") {
		writeMember(view, layout.members[0], values);
		return;
	}
	for (const [name, value] of Object.entries(values)) {
		const member = layout.members.find((candidate) => candidate.name === name);
		if (!member) throw new Error(`pex-gpu: unknown member "${name}" in struct "${layout.name}" (members: ${layout.members.map((m) => m.name).join(", ")})`);
		writeMember(view, member, value);
	}
}

const missingUniform = (binding, detail = "") => /* @__PURE__ */ new Error(`pex-gpu: missing uniform "${binding.name}" (@group(${binding.group}) @binding(${binding.binding}))${detail}`);
function layoutEntry(binding) {
	const base = {
		binding: binding.binding,
		visibility: binding.visibility
	};
	switch (binding.kind) {
		case "uniform": return {
			...base,
			buffer: {
				type: "uniform",
				hasDynamicOffset: true,
				...binding.minBindingSize && { minBindingSize: binding.minBindingSize }
			}
		};
		case "storage":
		case "read-only-storage": return {
			...base,
			buffer: { type: binding.kind }
		};
		case "sampler": return {
			...base,
			sampler: { type: binding.nonFiltering ? "non-filtering" : "filtering" }
		};
		case "comparison-sampler": return {
			...base,
			sampler: { type: "comparison" }
		};
		case "texture": return {
			...base,
			texture: {
				sampleType: binding.sampleType ?? "float",
				viewDimension: binding.viewDimension ?? "2d",
				multisampled: binding.multisampled ?? false
			}
		};
		case "storage-texture": return {
			...base,
			storageTexture: {
				format: binding.storageTextureFormat,
				access: binding.storageTextureAccess ?? "write-only",
				viewDimension: binding.viewDimension ?? "2d"
			}
		};
		case "external-texture": return {
			...base,
			externalTexture: {}
		};
	}
}
const layoutKeyFor = (bindings) => bindings.map((binding) => `${binding.binding}:${binding.kind}:${binding.visibility}:${binding.sampleType ?? ""}:${binding.viewDimension ?? ""}:${binding.multisampled ?? ""}:${binding.storageTextureFormat ?? ""}:${binding.minBindingSize ?? ""}:${binding.nonFiltering ?? ""}`).join("|");
function bindGroupLayout(ctx, bindings) {
	const state = commandsState(ctx);
	const key = layoutKeyFor(bindings);
	let created = false;
	const layout = state.bindGroupLayouts.getOrInsertComputed(key, () => {
		created = true;
		debugLog(ctx.device, "resources", () => `createBindGroupLayout [${key}]`);
		return ctx.device.createBindGroupLayout({
			label: "pex-gpu bind group layout",
			entries: bindings.map(layoutEntry)
		});
	});
	recordCacheAccess(ctx.device, "bindGroupLayouts", !created);
	return {
		layout,
		key
	};
}
/**
* Explicit pipeline layout from reflected bindings. Shared across pipelines
* with matching group layouts, so bind groups are reusable between them (unlike
* `layout: "auto"`).
*/
function pipelineLayout(ctx, reflection) {
	const state = commandsState(ctx);
	const groupCount = Math.max(-1, ...reflection.groups.keys()) + 1;
	const keys = [];
	const layouts = [];
	for (let index = 0; index < groupCount; index++) {
		const { layout, key } = bindGroupLayout(ctx, reflection.groups.get(index) ?? []);
		keys.push(key);
		layouts.push(layout);
	}
	const key = keys.join("||") || "empty";
	let created = false;
	const layout = state.pipelineLayouts.getOrInsertComputed(key, () => {
		created = true;
		debugLog(ctx.device, "resources", () => `createPipelineLayout [${key}]`);
		return ctx.device.createPipelineLayout({
			label: "pex-gpu pipeline layout",
			bindGroupLayouts: layouts
		});
	});
	recordCacheAccess(ctx.device, "pipelineLayouts", !created);
	return {
		layout,
		key
	};
}
function uniformStructValues(binding, uniforms) {
	const direct = uniforms[binding.name];
	if (direct !== void 0) return direct;
	const layout = binding.structLayout;
	const values = {};
	const missing = [];
	for (const member of layout.members) {
		const value = uniforms[member.name];
		if (value === void 0) missing.push(member.name);
		else values[member.name] = value;
	}
	if (missing.length === layout.members.length) throw missingUniform(binding);
	if (missing.length) throw missingUniform(binding, `: missing members ${missing.join(", ")}`);
	return values;
}
/**
* Build (or reuse cached) bind groups for every reflected group. Uniform buffer
* bindings are packed into the per-frame ring allocator and bound with dynamic
* offsets, so bind groups are stable across draws and frames.
*/
function buildBindGroups(ctx, reflection, uniforms, overrides) {
	const state = commandsState(ctx);
	const groupCount = Math.max(-1, ...reflection.groups.keys()) + 1;
	const result = [];
	for (let index = 0; index < groupCount; index++) {
		const override = overrides?.[index];
		if (override) {
			result.push({
				index,
				bindGroup: override,
				dynamicOffsets: []
			});
			continue;
		}
		const bindings = reflection.groups.get(index) ?? [];
		const { layout, key: layoutKey } = bindGroupLayout(ctx, bindings);
		const entries = [];
		const dynamicOffsets = [];
		const keyParts = [layoutKey];
		const trackedResources = [];
		let cacheable = true;
		for (const binding of bindings) {
			const value = uniforms[binding.name];
			switch (binding.kind) {
				case "uniform": {
					const layout = binding.structLayout;
					const values = uniformStructValues(binding, uniforms);
					const allocator = state.allocator ??= new UniformAllocator(ctx.device);
					const offset = allocator.allocate(layout.size);
					debugCounters(ctx.device).frame.uniformBytes += layout.size;
					packStruct(allocator.staging, layout, values, offset);
					entries.push({
						binding: binding.binding,
						resource: {
							buffer: allocator.buffer,
							size: layout.size
						}
					});
					dynamicOffsets.push(offset);
					keyParts.push(objectId(allocator.buffer));
					break;
				}
				case "storage":
				case "read-only-storage":
					if (!isGpuBuffer(value)) throw missingUniform(binding, " — expected a storage GpuBuffer");
					entries.push({
						binding: binding.binding,
						resource: { buffer: value.buffer }
					});
					keyParts.push(value.id);
					trackedResources.push({
						id: value.id,
						wrapper: value
					});
					break;
				case "sampler":
				case "comparison-sampler":
					if (!(value instanceof GPUSampler)) throw missingUniform(binding, " — expected a GPUSampler");
					entries.push({
						binding: binding.binding,
						resource: value
					});
					keyParts.push(objectId(value));
					break;
				case "texture":
				case "storage-texture": {
					const view = isGpuTexture(value) ? value.view : value instanceof GPUTextureView ? value : null;
					if (!view) throw missingUniform(binding, " — expected a GpuTexture or GPUTextureView");
					entries.push({
						binding: binding.binding,
						resource: view
					});
					keyParts.push(objectId(view));
					if (isGpuTexture(value)) trackedResources.push({
						id: value.id,
						wrapper: value
					});
					break;
				}
				case "external-texture":
					if (!(value instanceof HTMLVideoElement)) throw missingUniform(binding, " — expected an HTMLVideoElement");
					entries.push({
						binding: binding.binding,
						resource: ctx.device.importExternalTexture({ source: value })
					});
					cacheable = false;
					break;
			}
		}
		let bindGroup;
		const cacheKey = keyParts.join(",");
		if (cacheable) bindGroup = state.bindGroups.get(cacheKey);
		if (bindGroup) recordCacheAccess(ctx.device, "bindGroups", true);
		else {
			recordCacheAccess(ctx.device, "bindGroups", false);
			if (cacheable) debugLog(ctx.device, "resources", () => `createBindGroup [${cacheKey}]`);
			bindGroup = ctx.device.createBindGroup({
				label: "pex-gpu bind group",
				layout,
				entries
			});
			if (cacheable) state.bindGroups.set(cacheKey, bindGroup);
		}
		if (cacheable) for (const { id, wrapper } of trackedResources) trackBindGroupResource(state, id, wrapper, cacheKey);
		result.push({
			index,
			bindGroup,
			dynamicOffsets
		});
	}
	return result;
}

const componentCount = (format) => Number(/x(\d)$/.exec(format)?.[1] ?? 1);
/**
* Derive vertex buffer layouts from the shader's reflected inputs and the
* command's attributes: one buffer slot per attribute, formats and strides
* inferred from WGSL types unless overridden.
*/
function resolveVertexState(vertexInputs, attributes) {
	const layouts = [];
	const bindings = [];
	const keyParts = [];
	let inferredCount;
	for (const input of vertexInputs) {
		const value = attributes[input.name];
		if (!value) throw new Error(`pex-gpu: missing attribute "${input.name}" (@location(${input.location})); provided: ${Object.keys(attributes).join(", ") || "none"}`);
		const attribute = isGpuBuffer(value) ? { buffer: value } : value;
		const format = attribute.format ?? input.format;
		const stride = attribute.stride ?? input.stride;
		const stepMode = attribute.stepMode ?? "vertex";
		layouts.push({
			arrayStride: stride,
			stepMode,
			attributes: [{
				shaderLocation: input.location,
				offset: 0,
				format
			}]
		});
		bindings.push({
			buffer: attribute.buffer,
			offset: attribute.offset ?? 0
		});
		keyParts.push(`${input.location}:${format}:${stride}:${stepMode}`);
		if (inferredCount === void 0 && stepMode === "vertex" && attribute.buffer.length !== void 0 && attribute.stride === void 0) inferredCount = attribute.buffer.length / componentCount(format);
	}
	return {
		layouts,
		bindings,
		key: keyParts.join("|"),
		...inferredCount !== void 0 && { inferredCount }
	};
}

export { debugCounters as A, mergeReflections as C, bytesPerTexel as D, alignTo as E, resetFrameCounters as F, debugLog as M, debugStats as N, toTypedArray as O, recordCacheAccess as P, PipelineCache as S, parseWGSL as T, peekCommandsState as _, copyExternalImage as a, isGpuBuffer as b, generateMipmaps as c, textureByteSize as d, updateTexture as f, objectId as g, frameState as h, packStruct as i, debugGroupsEnabled as j, debug as k, isGpuTexture as l, commandsState as m, buildBindGroups as n, createTexture as o, UniformAllocator as p, pipelineLayout as r, fullMipLevelCount as s, resolveVertexState as t, paddedBytesPerRow as u, BUFFER_USAGE_PRESETS as v, normalizeType as w, updateBuffer as x, createBuffer as y };