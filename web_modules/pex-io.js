import { c as aCallable, _ as _export, f as functionCall } from './common/web.dom-collections.iterator-e8ac2628.js';
import { i as iterate } from './common/iterate-f07d9ec5.js';
import './common/esnext.iterator.map-5c21472a.js';
import './common/esnext.iterator.find-066cac9b.js';
import './common/es.error.cause-e924eb93.js';

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable(resolve);
  this.reject = aCallable(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
var f = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
	f: f
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
_export({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var promiseResolve = aCallable(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        functionCall(promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'fulfilled', value: value };
          --remaining || resolve(values);
        }, function (error) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'rejected', reason: error };
          --remaining || resolve(values);
        });
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

function xhrGet(url, type = "", done) {
  const request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = type;

  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE) done(request);
  };

  request.send(null);
}

function promisify(fn) {
  return function (file, cb) {
    if (cb) {
      return fn(file, cb);
    } else {
      return new Promise((resolve, reject) => {
        fn(file, (err, data) => {
          if (err) return reject(err);else resolve(data);
        });
      });
    }
  };
}

/**
 * @callback textCallback
 * @param {Error} err
 * @param {string} text
 */

/**
 * Loads a text file
 * @param {string} url
 * @param {textCallback} [callback]
 */

function loadText(url, callback) {
  xhrGet(url, "", request => {
    if (request.status === 200) {
      if (callback) callback(null, request.responseText);
    } else {
      callback(new Error(`io.loadText: ${request.statusText} "${url}"`), null);
    }
  });
}

var loadText$1 = promisify(loadText);

/**
 * @callback jsonCallback
 * @param {Error} err
 * @param {string} json
 */

/**
 * Loads JSON data
 * @param {string} url
 * @param {jsonCallback} [callback]
 */

function loadJSON(url, callback) {
  xhrGet(url, "json", request => {
    if (request.status === 200) {
      if (callback) callback(null, request.response);
    } else {
      callback(new Error(`io.loadJSON: ${request.statusText} "${url}"`), null);
    }
  });
}

var loadJSON$1 = promisify(loadJSON);

/**
 * @callback imageCallback
 * @param {Error} err
 * @param {HTMLImageElement} image
 */

/**
 * @typedef {Object} ImageOptions
 * @param {string} url
 * @param {...*} rest {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement#properties|HTMLImageElement#properties}
 */

/**
 * Loads a HTML Image
 * @param {string | ImageOptions} urlOrOpts
 * @param {imageCallback} [callback]
 */

function loadImage(urlOrOpts, callback) {
  const img = new Image();
  let src = urlOrOpts;

  if (urlOrOpts.url) {
    const {
      url,
      ...rest
    } = urlOrOpts;
    src = url;

    try {
      Object.assign(img, rest);
    } catch (error) {
      return callback(new Error(error), null);
    }
  }

  img.onerror = () => {
    callback(new Error(`io.loadImage: Load Error "${src}"`), null);
  };

  img.onload = () => {
    callback(null, img);
  };

  img.src = src;
}

var loadImage$1 = promisify(loadImage);

/**
 * @callback binaryCallback
 * @param {Error} err
 * @param {ArrayBuffer} data
 */

/**
 * Loads binary data
 * @param {string} file
 * @param {binaryCallback} [callback]
 */

function loadBinary(url, callback) {
  xhrGet(url, "arraybuffer", request => {
    if (request.status === 200) {
      if (callback) callback(null, request.response);
    } else {
      callback(new Error(`io.loadBinary: ${request.statusText} "${url}"`), null);
    }
  });
}

var loadBinary$1 = promisify(loadBinary);

/**
 * @private
 */

const LOADERS_MAP = {
  text: loadText$1,
  json: loadJSON$1,
  image: loadImage$1,
  binary: loadBinary$1
};
const LOADERS_MAP_KEYS = Object.keys(LOADERS_MAP);
/**
 * @typedef {Object} Resource
 * @property {string} [text]
 * @property {string} [json]
 * @property {string} [image]
 * @property {string} [binary]
 */

/**
 * @callback resourceCallback
 * @param {Error} err
 * @param {Object.<string, string | Object | HTMLImageElement | ArrayBuffer>} res
 */

/**
 * Loads resources from a named map
 * @param {Object.<string, Resource>} resources
 * @param {resourceCallback} callback
 *
 * @example
 * const resources = {
 *   hello: { text: "assets/hello.txt" },
 *   data: { json: "assets/data.json" },
 *   img: { image: "assets/tex.jpg" },
 *   hdrImg: { binary: "assets/tex.hdr" },
 * };
 *
 * io.load(resources, (err, res) => {
 *   res.hello; // => String
 *   res.data; // => Object
 *   res.img; // => HTMLImageElement
 *   res.hdrImg; // => ArrayBuffer
 *   if (err) return console.log(err);
 * });
 */

function load(resources, callback) {
  const names = Object.keys(resources);
  Promise.allSettled(names.map(async name => {
    const res = resources[name];
    const loader = LOADERS_MAP_KEYS.find(loader => res[loader]);
    if (loader) return await LOADERS_MAP[loader](res[loader]);
    return Promise.reject(new Error(`io.load: unknown resource type "${Object.keys(res)}".
Resource needs one of ${LOADERS_MAP_KEYS.join("|")} set to an url.`));
  })).then(values => {
    const results = Object.fromEntries(Array.from(values.map(v => v.value || v.reason), (v, i) => [names[i], v]));
    callback(values.find(v => v.status === "rejected") ? results : null, results);
  });
}

var load$1 = promisify(load);

export { load$1 as load, loadBinary$1 as loadBinary, loadImage$1 as loadImage, loadJSON$1 as loadJSON, loadText$1 as loadText };
