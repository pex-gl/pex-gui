/** @module pex-io */
/** @private */
const fetchOk = async (url, fetchOptions) => {
	const response = await fetch(url, fetchOptions);
	if (response.ok) return response;
	throw new Error(`${fetchOptions?.method ?? url.method ?? "GET"} ${response.url} ${response.status}${response.statusText ? ` (${response.statusText})` : ""}`, { cause: response });
};
/**
* Load an item and parse the Response as text.
*
* @function
* @param {RequestInfo | URL} url
* @param {RequestInit} [fetchOptions]
* @returns {Promise<string>}
*/
const loadText = async (url, fetchOptions) => await (await fetchOk(url, fetchOptions)).text();
/**
* Load an item and parse the Response as json.
*
* @function
* @param {RequestInfo | URL} url
* @param {RequestInit} [fetchOptions]
* @returns {Promise<JSON>}
*/
const loadJson = async (url, fetchOptions) => await (await fetchOk(url, fetchOptions)).json();
/**
* Load an item and parse the Response as arrayBuffer.
*
* @function
* @param {RequestInfo | URL} url
* @param {RequestInit} [fetchOptions]
* @returns {Promise<ArrayBuffer>}
*/
const loadArrayBuffer = async (url, fetchOptions) => await (await fetchOk(url, fetchOptions)).arrayBuffer();
/**
* Load an item and parse the Response as bytes.
*
* @function
* @param {RequestInfo | URL} url
* @param {RequestInit} [fetchOptions]
* @returns {Promise<Uint8Array>}
*/
const loadBytes = async (url, fetchOptions) => await (await fetchOk(url, fetchOptions)).bytes();
/**
* Load an item and parse the Response as blob.
*
* @function
* @param {RequestInfo | URL} url
* @param {RequestInit} [fetchOptions]
* @returns {Promise<Blob>}
*/
const loadBlob = async (url, fetchOptions) => await (await fetchOk(url, fetchOptions)).blob();
/** @private */
const loadMediaElement = async (type, element, defaultReadyEvent, urlOrProperties, fetchOptions) => {
	let url = urlOrProperties;
	let readyEvent = defaultReadyEvent;
	if (urlOrProperties.url !== void 0) {
		const { url: propertiesUrl, readyEvent: propertiesReadyEvent, ...rest } = urlOrProperties;
		url = propertiesUrl;
		readyEvent = propertiesReadyEvent ?? defaultReadyEvent;
		Object.assign(element, rest);
	}
	const signal = fetchOptions?.signal;
	let src = url;
	if (fetchOptions) {
		const blob = await loadBlob(url, fetchOptions);
		signal?.throwIfAborted();
		src = URL.createObjectURL(blob);
	}
	return await new Promise((resolve, reject) => {
		const controller = new AbortController();
		const listenerOptions = { signal: controller.signal };
		const revokeSrc = () => {
			if (fetchOptions) URL.revokeObjectURL(src);
		};
		const dispose = () => {
			controller.abort();
			revokeSrc();
		};
		element.addEventListener(readyEvent, () => {
			controller.abort();
			if (fetchOptions && element instanceof HTMLMediaElement) element.addEventListener("emptied", revokeSrc, { once: true });
			else revokeSrc();
			resolve(element);
		}, listenerOptions);
		element.addEventListener("error", (event) => {
			dispose();
			const reason = element.error?.message;
			reject(new Error(`Failed to load ${type}: ${url}${reason ? ` (${reason})` : ""}`, { cause: event }));
		}, listenerOptions);
		signal?.addEventListener("abort", () => {
			dispose();
			element.removeAttribute("src");
			element.load?.();
			reject(signal.reason);
		}, listenerOptions);
		element.src = src;
	});
};
/**
* Create and load a HTML Image. If fetchOptions are specified, load and parse
* the Response as blob to set the "src" property.
*
* @function
* @param {string | URL | import("./types.js").ImageOptions} urlOrImageProperties
* @param {RequestInit} [fetchOptions]
* @returns {Promise<HTMLImageElement>}
*/
const loadImage = async (urlOrImageProperties, fetchOptions) => await loadMediaElement("image", new Image(), "load", urlOrImageProperties, fetchOptions);
/**
* Create and load a HTML Video. If fetchOptions are specified, load and parse
* the Response as blob to set the "src" property.
*
* @function
* @param {string | URL | import("./types.js").VideoOptions} urlOrVideoProperties
* @param {RequestInit} [fetchOptions]
* @returns {Promise<HTMLVideoElement>}
*/
const loadVideo = async (urlOrVideoProperties, fetchOptions) => await loadMediaElement("video", document.createElement("video"), "canplaythrough", urlOrVideoProperties, fetchOptions);
/** @private */
const LOADERS_MAP = {
	text: loadText,
	json: loadJson,
	image: loadImage,
	video: loadVideo,
	blob: loadBlob,
	arrayBuffer: loadArrayBuffer,
	bytes: loadBytes
};
const LOADERS_MAP_KEYS = Object.keys(LOADERS_MAP);
/**
* Loads resources from a named map.
*
* @example
*
* ```js
* const resources = {
*   hello: { text: "assets/hello.txt" },
*   data: { json: "assets/data.json" },
*   img: { image: "assets/tex.jpg" },
*   video: { video: "assets/video.mp4" },
*   blob: { blob: "assets/blob" },
*   hdrImg: {
*     arrayBuffer: "assets/tex.hdr",
*     options: { mode: "no-cors" },
*   },
*   bytes: { bytes: "assets/tex.hdr" },
* };
*
* const res = await io.load(resources);
* res.hello; // => string
* res.data; // => Object
* res.img; // => HTMLImageElement
* res.video; // => HTMLVideoElement
* res.blob; // => Blob
* res.hdrImg; // => ArrayBuffer
* res.bytes; // => Uint8Array
* ```
*
* @function
* @param {Object<string, import("./types.js").Resource>} resources
* @returns {Promise<Object<string, import("./types.js").LoadedResource>>}
*/
const load = async (resources) => {
	const names = Object.keys(resources);
	const results = await Promise.allSettled(names.map(async (name) => {
		const res = resources[name];
		const loader = LOADERS_MAP_KEYS.find((loader) => res[loader]);
		if (loader) return await LOADERS_MAP[loader](res[loader], res.options);
		throw new Error(`io.load: unknown resource type "${Object.keys(res)}".
Resource needs one of ${LOADERS_MAP_KEYS.join("|")} set to an url.`);
	}));
	return Object.fromEntries(results.map((v, i) => [names[i], v.status === "fulfilled" ? v.value : v.reason]));
};

export { load, loadArrayBuffer, loadBlob, loadBytes, loadImage, loadJson, loadText, loadVideo };