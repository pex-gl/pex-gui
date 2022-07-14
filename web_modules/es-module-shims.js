import './common/esnext.iterator.filter-b8839f58.js';
import { t as internalState, X as defineIterator, w as wellKnownSymbol, n as fails, d as functionUncurryThis, y as toObject, S as indexedObject, Y as objectKeys, F as descriptors, f as functionCall, Z as objectGetOwnPropertySymbols, $ as objectPropertyIsEnumerable, a as global_1, I as lengthOfArrayLike, a0 as createIteratorConstructor, u as redefine, s as setToStringTag, _ as _export, i as isCallable, D as isObject, h as objectCreate, j as createPropertyDescriptor, b as anObject, E as hasOwnProperty_1, a1 as objectDefineProperties, q as commonjsGlobal } from './common/web.dom-collections.iterator-e8ac2628.js';
import { s as stringMultibyte } from './common/es.string.replace-794ee76c.js';
import { t as toString_1, f as functionBindContext, c as getIteratorMethod, i as isArrayIteratorMethod, g as getIterator, h as callWithSafeIterationClosing, r as redefineAll, b as anInstance, e as classof } from './common/esnext.iterator.map-5c21472a.js';
import { i as isConstructor, c as createProperty, a as arraySort, b as arraySliceSimple } from './common/es.typed-array.uint16-array-9fc0c3ad.js';
import './common/es.error.cause-e924eb93.js';
import './common/iterate-f07d9ec5.js';

var isPure = false;

var charAt = stringMultibyte.charAt;




var STRING_ITERATOR = 'String Iterator';
var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString_1(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var ITERATOR = wellKnownSymbol('iterator');

var nativeUrl = !fails(function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (isPure && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('http://x', undefined).host !== 'x';
});

// eslint-disable-next-line es-x/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
var defineProperty = Object.defineProperty;
var concat = functionUncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (descriptors && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es-x/no-symbol -- safe
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] != 7 || objectKeys($assign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
  while (argumentsLength > index) {
    var S = indexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!descriptors || functionCall(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

var Array$1 = global_1.Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this == Array$1 && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = functionCall(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = lengthOfArrayLike(O);
    result = IS_CONSTRUCTOR ? new this(length) : Array$1(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js



var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;

var RangeError = global_1.RangeError;
var exec = functionUncurryThis(regexSeparators.exec);
var floor = Math.floor;
var fromCharCode = String.fromCharCode;
var charCodeAt = functionUncurryThis(''.charCodeAt);
var join = functionUncurryThis([].join);
var push = functionUncurryThis([].push);
var replace = functionUncurryThis(''.replace);
var split = functionUncurryThis(''.split);
var toLowerCase = functionUncurryThis(''.toLowerCase);

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = charCodeAt(string, counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = charCodeAt(string, counter++);
      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
        push(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        push(output, value);
        counter--;
      }
    } else {
      push(output, value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor(delta / baseMinusTMin);
    k += base;
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      push(output, fromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    push(output, delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      throw RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        var k = base;
        while (true) {
          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          push(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor(qMinusT / baseMinusT);
          k += base;
        }

        push(output, fromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        handledCPCount++;
      }
    }

    delta++;
    n++;
  }
  return join(output, '');
};

var stringPunycodeToAscii = function (input) {
  var encoded = [];
  var labels = split(replace(toLowerCase(input), regexSeparators, '\u002E'), '.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    push(encoded, exec(regexNonASCII, label) ? 'xn--' + encode(label) : label);
  }
  return join(encoded, '.');
};

var TypeError = global_1.TypeError;

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError('Not enough arguments');
  return passed;
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`




























var ITERATOR$1 = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$1 = internalState.set;
var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);
// eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
var safeGetBuiltIn = function (name) {
  if (!descriptors) return global_1[name];
  var descriptor = getOwnPropertyDescriptor(global_1, name);
  return descriptor && descriptor.value;
};

var nativeFetch = safeGetBuiltIn('fetch');
var NativeRequest = safeGetBuiltIn('Request');
var Headers = safeGetBuiltIn('Headers');
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var HeadersPrototype = Headers && Headers.prototype;
var RegExp$1 = global_1.RegExp;
var TypeError$1 = global_1.TypeError;
var decodeURIComponent = global_1.decodeURIComponent;
var encodeURIComponent$1 = global_1.encodeURIComponent;
var charAt$1 = functionUncurryThis(''.charAt);
var join$1 = functionUncurryThis([].join);
var push$1 = functionUncurryThis([].push);
var replace$1 = functionUncurryThis(''.replace);
var shift = functionUncurryThis([].shift);
var splice = functionUncurryThis([].splice);
var split$1 = functionUncurryThis(''.split);
var stringSlice = functionUncurryThis(''.slice);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp$1('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = replace$1(it, plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = replace$1(result, percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replacements = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replacements[match];
};

var serialize = function (it) {
  return replace$1(encodeURIComponent$1(it), find, replacer);
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState$1(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind: kind
  });
}, 'Iterator', function next() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
  } return step;
}, true);

var URLSearchParamsState = function (init) {
  this.entries = [];
  this.url = null;

  if (init !== undefined) {
    if (isObject(init)) this.parseObject(init);
    else this.parseQuery(typeof init == 'string' ? charAt$1(init, 0) === '?' ? stringSlice(init, 1) : init : toString_1(init));
  }
};

URLSearchParamsState.prototype = {
  type: URL_SEARCH_PARAMS,
  bindURL: function (url) {
    this.url = url;
    this.update();
  },
  parseObject: function (object) {
    var iteratorMethod = getIteratorMethod(object);
    var iterator, next, step, entryIterator, entryNext, first, second;

    if (iteratorMethod) {
      iterator = getIterator(object, iteratorMethod);
      next = iterator.next;
      while (!(step = functionCall(next, iterator)).done) {
        entryIterator = getIterator(anObject(step.value));
        entryNext = entryIterator.next;
        if (
          (first = functionCall(entryNext, entryIterator)).done ||
          (second = functionCall(entryNext, entryIterator)).done ||
          !functionCall(entryNext, entryIterator).done
        ) throw TypeError$1('Expected sequence with length 2');
        push$1(this.entries, { key: toString_1(first.value), value: toString_1(second.value) });
      }
    } else for (var key in object) if (hasOwnProperty_1(object, key)) {
      push$1(this.entries, { key: key, value: toString_1(object[key]) });
    }
  },
  parseQuery: function (query) {
    if (query) {
      var attributes = split$1(query, '&');
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split$1(attribute, '=');
          push$1(this.entries, {
            key: deserialize(shift(entry)),
            value: deserialize(join$1(entry, '='))
          });
        }
      }
    }
  },
  serialize: function () {
    var entries = this.entries;
    var result = [];
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      push$1(result, serialize(entry.key) + '=' + serialize(entry.value));
    } return join$1(result, '&');
  },
  update: function () {
    this.entries.length = 0;
    this.parseQuery(this.url.query);
  },
  updateURL: function () {
    if (this.url) this.url.update();
  }
};

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance(this, URLSearchParamsPrototype);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  setInternalState$1(this, new URLSearchParamsState(init));
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    push$1(state.entries, { key: toString_1(name), value: toString_1(value) });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = toString_1(name);
    var index = 0;
    while (index < entries.length) {
      if (entries[index].key === key) splice(entries, index, 1);
      else index++;
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = toString_1(name);
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = toString_1(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) push$1(result, entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = toString_1(name);
    var index = 0;
    while (index < entries.length) {
      if (entries[index++].key === key) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var found = false;
    var key = toString_1(name);
    var val = toString_1(value);
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) splice(entries, index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) push$1(entries, { key: key, value: val });
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    arraySort(state.entries, function (a, b) {
      return a.key > b.key ? 1 : -1;
    });
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
redefine(URLSearchParamsPrototype, ITERATOR$1, URLSearchParamsPrototype.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine(URLSearchParamsPrototype, 'toString', function toString() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

_export({ global: true, forced: !nativeUrl }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
if (!nativeUrl && isCallable(Headers)) {
  var headersHas = functionUncurryThis(HeadersPrototype.has);
  var headersSet = functionUncurryThis(HeadersPrototype.set);

  var wrapRequestOptions = function (init) {
    if (isObject(init)) {
      var body = init.body;
      var headers;
      if (classof(body) === URL_SEARCH_PARAMS) {
        headers = init.headers ? new Headers(init.headers) : new Headers();
        if (!headersHas(headers, 'content-type')) {
          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
        return objectCreate(init, {
          body: createPropertyDescriptor(0, toString_1(body)),
          headers: createPropertyDescriptor(0, headers)
        });
      }
    } return init;
  };

  if (isCallable(nativeFetch)) {
    _export({ global: true, enumerable: true, noTargetGet: true, forced: true }, {
      fetch: function fetch(input /* , init */) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }

  if (isCallable(NativeRequest)) {
    var RequestConstructor = function Request(input /* , init */) {
      anInstance(this, RequestPrototype);
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };

    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;

    _export({ global: true, forced: true, noTargetGet: true }, {
      Request: RequestConstructor
    });
  }
}

var web_urlSearchParams_constructor = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`







var defineProperties = objectDefineProperties.f;






var codeAt = stringMultibyte.codeAt;







var setInternalState$2 = internalState.set;
var getInternalURLState = internalState.getterFor('URL');
var URLSearchParams$1 = web_urlSearchParams_constructor.URLSearchParams;
var getInternalSearchParamsState = web_urlSearchParams_constructor.getState;

var NativeURL = global_1.URL;
var TypeError$2 = global_1.TypeError;
var parseInt$1 = global_1.parseInt;
var floor$1 = Math.floor;
var pow = Math.pow;
var charAt$2 = functionUncurryThis(''.charAt);
var exec$1 = functionUncurryThis(/./.exec);
var join$2 = functionUncurryThis([].join);
var numberToString = functionUncurryThis(1.0.toString);
var pop = functionUncurryThis([].pop);
var push$2 = functionUncurryThis([].push);
var replace$2 = functionUncurryThis(''.replace);
var shift$1 = functionUncurryThis([].shift);
var split$2 = functionUncurryThis(''.split);
var stringSlice$1 = functionUncurryThis(''.slice);
var toLowerCase$1 = functionUncurryThis(''.toLowerCase);
var unshift = functionUncurryThis([].unshift);

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[a-z]/i;
// eslint-disable-next-line regexp/no-obscure-range -- safe
var ALPHANUMERIC = /[\d+-.a-z]/i;
var DIGIT = /\d/;
var HEX_START = /^0x/i;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\da-f]+$/i;
/* eslint-disable regexp/no-control-character -- safe */
var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g;
var TAB_AND_NEW_LINE = /[\t\n\r]/g;
/* eslint-enable regexp/no-control-character -- safe */
var EOF;

// https://url.spec.whatwg.org/#ipv4-number-parser
var parseIPv4 = function (input) {
  var parts = split$2(input, '.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == '') {
    parts.length--;
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == '') return input;
    radix = 10;
    if (part.length > 1 && charAt$2(part, 0) == '0') {
      radix = exec$1(HEX_START, part) ? 16 : 8;
      part = stringSlice$1(part, radix == 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!exec$1(radix == 10 ? DEC : radix == 8 ? OCT : HEX, part)) return input;
      number = parseInt$1(part, radix);
    }
    push$2(numbers, number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = pop(numbers);
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// https://url.spec.whatwg.org/#concept-ipv6-parser
// eslint-disable-next-line max-statements -- TODO
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var chr = function () {
    return charAt$2(input, pointer);
  };

  if (chr() == ':') {
    if (charAt$2(input, 1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (chr()) {
    if (pieceIndex == 8) return;
    if (chr() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && exec$1(HEX, chr())) {
      value = value * 16 + parseInt$1(chr(), 16);
      pointer++;
      length++;
    }
    if (chr() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (chr()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (chr() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!exec$1(DIGIT, chr())) return;
        while (exec$1(DIGIT, chr())) {
          number = parseInt$1(chr(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (chr() == ':') {
      pointer++;
      if (!chr()) return;
    } else if (chr()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

// https://url.spec.whatwg.org/#host-serializing
var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      unshift(result, host % 256);
      host = floor$1(host / 256);
    } return join$2(result, '.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += numberToString(host[index], 16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (chr, set) {
  var code = codeAt(chr, 0);
  return code > 0x20 && code < 0x7F && !hasOwnProperty_1(set, chr) ? chr : encodeURIComponent(chr);
};

// https://url.spec.whatwg.org/#special-scheme
var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

// https://url.spec.whatwg.org/#windows-drive-letter
var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length == 2 && exec$1(ALPHA, charAt$2(string, 0))
    && ((second = charAt$2(string, 1)) == ':' || (!normalized && second == '|'));
};

// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(stringSlice$1(string, 0, 2)) && (
    string.length == 2 ||
    ((third = charAt$2(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

// https://url.spec.whatwg.org/#single-dot-path-segment
var isSingleDot = function (segment) {
  return segment === '.' || toLowerCase$1(segment) === '%2e';
};

// https://url.spec.whatwg.org/#double-dot-path-segment
var isDoubleDot = function (segment) {
  segment = toLowerCase$1(segment);
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

var URLState = function (url, isBase, base) {
  var urlString = toString_1(url);
  var baseState, failure, searchParams;
  if (isBase) {
    failure = this.parse(urlString);
    if (failure) throw TypeError$2(failure);
    this.searchParams = null;
  } else {
    if (base !== undefined) baseState = new URLState(base, true);
    failure = this.parse(urlString, null, baseState);
    if (failure) throw TypeError$2(failure);
    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
    searchParams.bindURL(this);
    this.searchParams = searchParams;
  }
};

URLState.prototype = {
  type: 'URL',
  // https://url.spec.whatwg.org/#url-parsing
  // eslint-disable-next-line max-statements -- TODO
  parse: function (input, stateOverride, base) {
    var url = this;
    var state = stateOverride || SCHEME_START;
    var pointer = 0;
    var buffer = '';
    var seenAt = false;
    var seenBracket = false;
    var seenPasswordToken = false;
    var codePoints, chr, bufferCodePoints, failure;

    input = toString_1(input);

    if (!stateOverride) {
      url.scheme = '';
      url.username = '';
      url.password = '';
      url.host = null;
      url.port = null;
      url.path = [];
      url.query = null;
      url.fragment = null;
      url.cannotBeABaseURL = false;
      input = replace$2(input, LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
    }

    input = replace$2(input, TAB_AND_NEW_LINE, '');

    codePoints = arrayFrom(input);

    while (pointer <= codePoints.length) {
      chr = codePoints[pointer];
      switch (state) {
        case SCHEME_START:
          if (chr && exec$1(ALPHA, chr)) {
            buffer += toLowerCase$1(chr);
            state = SCHEME;
          } else if (!stateOverride) {
            state = NO_SCHEME;
            continue;
          } else return INVALID_SCHEME;
          break;

        case SCHEME:
          if (chr && (exec$1(ALPHANUMERIC, chr) || chr == '+' || chr == '-' || chr == '.')) {
            buffer += toLowerCase$1(chr);
          } else if (chr == ':') {
            if (stateOverride && (
              (url.isSpecial() != hasOwnProperty_1(specialSchemes, buffer)) ||
              (buffer == 'file' && (url.includesCredentials() || url.port !== null)) ||
              (url.scheme == 'file' && !url.host)
            )) return;
            url.scheme = buffer;
            if (stateOverride) {
              if (url.isSpecial() && specialSchemes[url.scheme] == url.port) url.port = null;
              return;
            }
            buffer = '';
            if (url.scheme == 'file') {
              state = FILE;
            } else if (url.isSpecial() && base && base.scheme == url.scheme) {
              state = SPECIAL_RELATIVE_OR_AUTHORITY;
            } else if (url.isSpecial()) {
              state = SPECIAL_AUTHORITY_SLASHES;
            } else if (codePoints[pointer + 1] == '/') {
              state = PATH_OR_AUTHORITY;
              pointer++;
            } else {
              url.cannotBeABaseURL = true;
              push$2(url.path, '');
              state = CANNOT_BE_A_BASE_URL_PATH;
            }
          } else if (!stateOverride) {
            buffer = '';
            state = NO_SCHEME;
            pointer = 0;
            continue;
          } else return INVALID_SCHEME;
          break;

        case NO_SCHEME:
          if (!base || (base.cannotBeABaseURL && chr != '#')) return INVALID_SCHEME;
          if (base.cannotBeABaseURL && chr == '#') {
            url.scheme = base.scheme;
            url.path = arraySliceSimple(base.path);
            url.query = base.query;
            url.fragment = '';
            url.cannotBeABaseURL = true;
            state = FRAGMENT;
            break;
          }
          state = base.scheme == 'file' ? FILE : RELATIVE;
          continue;

        case SPECIAL_RELATIVE_OR_AUTHORITY:
          if (chr == '/' && codePoints[pointer + 1] == '/') {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
            pointer++;
          } else {
            state = RELATIVE;
            continue;
          } break;

        case PATH_OR_AUTHORITY:
          if (chr == '/') {
            state = AUTHORITY;
            break;
          } else {
            state = PATH;
            continue;
          }

        case RELATIVE:
          url.scheme = base.scheme;
          if (chr == EOF) {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySliceSimple(base.path);
            url.query = base.query;
          } else if (chr == '/' || (chr == '\\' && url.isSpecial())) {
            state = RELATIVE_SLASH;
          } else if (chr == '?') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySliceSimple(base.path);
            url.query = '';
            state = QUERY;
          } else if (chr == '#') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySliceSimple(base.path);
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySliceSimple(base.path);
            url.path.length--;
            state = PATH;
            continue;
          } break;

        case RELATIVE_SLASH:
          if (url.isSpecial() && (chr == '/' || chr == '\\')) {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          } else if (chr == '/') {
            state = AUTHORITY;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            state = PATH;
            continue;
          } break;

        case SPECIAL_AUTHORITY_SLASHES:
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          if (chr != '/' || charAt$2(buffer, pointer + 1) != '/') continue;
          pointer++;
          break;

        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
          if (chr != '/' && chr != '\\') {
            state = AUTHORITY;
            continue;
          } break;

        case AUTHORITY:
          if (chr == '@') {
            if (seenAt) buffer = '%40' + buffer;
            seenAt = true;
            bufferCodePoints = arrayFrom(buffer);
            for (var i = 0; i < bufferCodePoints.length; i++) {
              var codePoint = bufferCodePoints[i];
              if (codePoint == ':' && !seenPasswordToken) {
                seenPasswordToken = true;
                continue;
              }
              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
              if (seenPasswordToken) url.password += encodedCodePoints;
              else url.username += encodedCodePoints;
            }
            buffer = '';
          } else if (
            chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
            (chr == '\\' && url.isSpecial())
          ) {
            if (seenAt && buffer == '') return INVALID_AUTHORITY;
            pointer -= arrayFrom(buffer).length + 1;
            buffer = '';
            state = HOST;
          } else buffer += chr;
          break;

        case HOST:
        case HOSTNAME:
          if (stateOverride && url.scheme == 'file') {
            state = FILE_HOST;
            continue;
          } else if (chr == ':' && !seenBracket) {
            if (buffer == '') return INVALID_HOST;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PORT;
            if (stateOverride == HOSTNAME) return;
          } else if (
            chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
            (chr == '\\' && url.isSpecial())
          ) {
            if (url.isSpecial() && buffer == '') return INVALID_HOST;
            if (stateOverride && buffer == '' && (url.includesCredentials() || url.port !== null)) return;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PATH_START;
            if (stateOverride) return;
            continue;
          } else {
            if (chr == '[') seenBracket = true;
            else if (chr == ']') seenBracket = false;
            buffer += chr;
          } break;

        case PORT:
          if (exec$1(DIGIT, chr)) {
            buffer += chr;
          } else if (
            chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
            (chr == '\\' && url.isSpecial()) ||
            stateOverride
          ) {
            if (buffer != '') {
              var port = parseInt$1(buffer, 10);
              if (port > 0xFFFF) return INVALID_PORT;
              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
              buffer = '';
            }
            if (stateOverride) return;
            state = PATH_START;
            continue;
          } else return INVALID_PORT;
          break;

        case FILE:
          url.scheme = 'file';
          if (chr == '/' || chr == '\\') state = FILE_SLASH;
          else if (base && base.scheme == 'file') {
            if (chr == EOF) {
              url.host = base.host;
              url.path = arraySliceSimple(base.path);
              url.query = base.query;
            } else if (chr == '?') {
              url.host = base.host;
              url.path = arraySliceSimple(base.path);
              url.query = '';
              state = QUERY;
            } else if (chr == '#') {
              url.host = base.host;
              url.path = arraySliceSimple(base.path);
              url.query = base.query;
              url.fragment = '';
              state = FRAGMENT;
            } else {
              if (!startsWithWindowsDriveLetter(join$2(arraySliceSimple(codePoints, pointer), ''))) {
                url.host = base.host;
                url.path = arraySliceSimple(base.path);
                url.shortenPath();
              }
              state = PATH;
              continue;
            }
          } else {
            state = PATH;
            continue;
          } break;

        case FILE_SLASH:
          if (chr == '/' || chr == '\\') {
            state = FILE_HOST;
            break;
          }
          if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(join$2(arraySliceSimple(codePoints, pointer), ''))) {
            if (isWindowsDriveLetter(base.path[0], true)) push$2(url.path, base.path[0]);
            else url.host = base.host;
          }
          state = PATH;
          continue;

        case FILE_HOST:
          if (chr == EOF || chr == '/' || chr == '\\' || chr == '?' || chr == '#') {
            if (!stateOverride && isWindowsDriveLetter(buffer)) {
              state = PATH;
            } else if (buffer == '') {
              url.host = '';
              if (stateOverride) return;
              state = PATH_START;
            } else {
              failure = url.parseHost(buffer);
              if (failure) return failure;
              if (url.host == 'localhost') url.host = '';
              if (stateOverride) return;
              buffer = '';
              state = PATH_START;
            } continue;
          } else buffer += chr;
          break;

        case PATH_START:
          if (url.isSpecial()) {
            state = PATH;
            if (chr != '/' && chr != '\\') continue;
          } else if (!stateOverride && chr == '?') {
            url.query = '';
            state = QUERY;
          } else if (!stateOverride && chr == '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr != EOF) {
            state = PATH;
            if (chr != '/') continue;
          } break;

        case PATH:
          if (
            chr == EOF || chr == '/' ||
            (chr == '\\' && url.isSpecial()) ||
            (!stateOverride && (chr == '?' || chr == '#'))
          ) {
            if (isDoubleDot(buffer)) {
              url.shortenPath();
              if (chr != '/' && !(chr == '\\' && url.isSpecial())) {
                push$2(url.path, '');
              }
            } else if (isSingleDot(buffer)) {
              if (chr != '/' && !(chr == '\\' && url.isSpecial())) {
                push$2(url.path, '');
              }
            } else {
              if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
                if (url.host) url.host = '';
                buffer = charAt$2(buffer, 0) + ':'; // normalize windows drive letter
              }
              push$2(url.path, buffer);
            }
            buffer = '';
            if (url.scheme == 'file' && (chr == EOF || chr == '?' || chr == '#')) {
              while (url.path.length > 1 && url.path[0] === '') {
                shift$1(url.path);
              }
            }
            if (chr == '?') {
              url.query = '';
              state = QUERY;
            } else if (chr == '#') {
              url.fragment = '';
              state = FRAGMENT;
            }
          } else {
            buffer += percentEncode(chr, pathPercentEncodeSet);
          } break;

        case CANNOT_BE_A_BASE_URL_PATH:
          if (chr == '?') {
            url.query = '';
            state = QUERY;
          } else if (chr == '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr != EOF) {
            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case QUERY:
          if (!stateOverride && chr == '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr != EOF) {
            if (chr == "'" && url.isSpecial()) url.query += '%27';
            else if (chr == '#') url.query += '%23';
            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case FRAGMENT:
          if (chr != EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
          break;
      }

      pointer++;
    }
  },
  // https://url.spec.whatwg.org/#host-parsing
  parseHost: function (input) {
    var result, codePoints, index;
    if (charAt$2(input, 0) == '[') {
      if (charAt$2(input, input.length - 1) != ']') return INVALID_HOST;
      result = parseIPv6(stringSlice$1(input, 1, -1));
      if (!result) return INVALID_HOST;
      this.host = result;
    // opaque host
    } else if (!this.isSpecial()) {
      if (exec$1(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
      result = '';
      codePoints = arrayFrom(input);
      for (index = 0; index < codePoints.length; index++) {
        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
      }
      this.host = result;
    } else {
      input = stringPunycodeToAscii(input);
      if (exec$1(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
      result = parseIPv4(input);
      if (result === null) return INVALID_HOST;
      this.host = result;
    }
  },
  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
  cannotHaveUsernamePasswordPort: function () {
    return !this.host || this.cannotBeABaseURL || this.scheme == 'file';
  },
  // https://url.spec.whatwg.org/#include-credentials
  includesCredentials: function () {
    return this.username != '' || this.password != '';
  },
  // https://url.spec.whatwg.org/#is-special
  isSpecial: function () {
    return hasOwnProperty_1(specialSchemes, this.scheme);
  },
  // https://url.spec.whatwg.org/#shorten-a-urls-path
  shortenPath: function () {
    var path = this.path;
    var pathSize = path.length;
    if (pathSize && (this.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
      path.length--;
    }
  },
  // https://url.spec.whatwg.org/#concept-url-serializer
  serialize: function () {
    var url = this;
    var scheme = url.scheme;
    var username = url.username;
    var password = url.password;
    var host = url.host;
    var port = url.port;
    var path = url.path;
    var query = url.query;
    var fragment = url.fragment;
    var output = scheme + ':';
    if (host !== null) {
      output += '//';
      if (url.includesCredentials()) {
        output += username + (password ? ':' + password : '') + '@';
      }
      output += serializeHost(host);
      if (port !== null) output += ':' + port;
    } else if (scheme == 'file') output += '//';
    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join$2(path, '/') : '';
    if (query !== null) output += '?' + query;
    if (fragment !== null) output += '#' + fragment;
    return output;
  },
  // https://url.spec.whatwg.org/#dom-url-href
  setHref: function (href) {
    var failure = this.parse(href);
    if (failure) throw TypeError$2(failure);
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-origin
  getOrigin: function () {
    var scheme = this.scheme;
    var port = this.port;
    if (scheme == 'blob') try {
      return new URLConstructor(scheme.path[0]).origin;
    } catch (error) {
      return 'null';
    }
    if (scheme == 'file' || !this.isSpecial()) return 'null';
    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
  },
  // https://url.spec.whatwg.org/#dom-url-protocol
  getProtocol: function () {
    return this.scheme + ':';
  },
  setProtocol: function (protocol) {
    this.parse(toString_1(protocol) + ':', SCHEME_START);
  },
  // https://url.spec.whatwg.org/#dom-url-username
  getUsername: function () {
    return this.username;
  },
  setUsername: function (username) {
    var codePoints = arrayFrom(toString_1(username));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.username = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-password
  getPassword: function () {
    return this.password;
  },
  setPassword: function (password) {
    var codePoints = arrayFrom(toString_1(password));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.password = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-host
  getHost: function () {
    var host = this.host;
    var port = this.port;
    return host === null ? ''
      : port === null ? serializeHost(host)
      : serializeHost(host) + ':' + port;
  },
  setHost: function (host) {
    if (this.cannotBeABaseURL) return;
    this.parse(host, HOST);
  },
  // https://url.spec.whatwg.org/#dom-url-hostname
  getHostname: function () {
    var host = this.host;
    return host === null ? '' : serializeHost(host);
  },
  setHostname: function (hostname) {
    if (this.cannotBeABaseURL) return;
    this.parse(hostname, HOSTNAME);
  },
  // https://url.spec.whatwg.org/#dom-url-port
  getPort: function () {
    var port = this.port;
    return port === null ? '' : toString_1(port);
  },
  setPort: function (port) {
    if (this.cannotHaveUsernamePasswordPort()) return;
    port = toString_1(port);
    if (port == '') this.port = null;
    else this.parse(port, PORT);
  },
  // https://url.spec.whatwg.org/#dom-url-pathname
  getPathname: function () {
    var path = this.path;
    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join$2(path, '/') : '';
  },
  setPathname: function (pathname) {
    if (this.cannotBeABaseURL) return;
    this.path = [];
    this.parse(pathname, PATH_START);
  },
  // https://url.spec.whatwg.org/#dom-url-search
  getSearch: function () {
    var query = this.query;
    return query ? '?' + query : '';
  },
  setSearch: function (search) {
    search = toString_1(search);
    if (search == '') {
      this.query = null;
    } else {
      if ('?' == charAt$2(search, 0)) search = stringSlice$1(search, 1);
      this.query = '';
      this.parse(search, QUERY);
    }
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-searchparams
  getSearchParams: function () {
    return this.searchParams.facade;
  },
  // https://url.spec.whatwg.org/#dom-url-hash
  getHash: function () {
    var fragment = this.fragment;
    return fragment ? '#' + fragment : '';
  },
  setHash: function (hash) {
    hash = toString_1(hash);
    if (hash == '') {
      this.fragment = null;
      return;
    }
    if ('#' == charAt$2(hash, 0)) hash = stringSlice$1(hash, 1);
    this.fragment = '';
    this.parse(hash, FRAGMENT);
  },
  update: function () {
    this.query = this.searchParams.serialize() || null;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLPrototype);
  var base = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : undefined;
  var state = setInternalState$2(that, new URLState(url, false, base));
  if (!descriptors) {
    that.href = state.serialize();
    that.origin = state.getOrigin();
    that.protocol = state.getProtocol();
    that.username = state.getUsername();
    that.password = state.getPassword();
    that.host = state.getHost();
    that.hostname = state.getHostname();
    that.port = state.getPort();
    that.pathname = state.getPathname();
    that.search = state.getSearch();
    that.searchParams = state.getSearchParams();
    that.hash = state.getHash();
  }
};

var URLPrototype = URLConstructor.prototype;

var accessorDescriptor = function (getter, setter) {
  return {
    get: function () {
      return getInternalURLState(this)[getter]();
    },
    set: setter && function (value) {
      return getInternalURLState(this)[setter](value);
    },
    configurable: true,
    enumerable: true
  };
};

if (descriptors) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor('serialize', 'setHref'),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor('getOrigin'),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor('getProtocol', 'setProtocol'),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor('getUsername', 'setUsername'),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor('getPassword', 'setPassword'),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor('getHost', 'setHost'),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor('getHostname', 'setHostname'),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor('getPort', 'setPort'),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor('getPathname', 'setPathname'),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor('getSearch', 'setSearch'),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor('getSearchParams'),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor('getHash', 'setHash')
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', functionBindContext(nativeCreateObjectURL, NativeURL));
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', functionBindContext(nativeRevokeObjectURL, NativeURL));
}

setToStringTag(URLConstructor, 'URL');

_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
  URL: URLConstructor
});

/* ES Module Shims 1.5.9 */

(function () {
  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';

  const noop = () => {};

  const optionsScript = hasDocument ? document.querySelector('script[type=esms-options]') : undefined;
  const esmsInitOptions = optionsScript ? JSON.parse(optionsScript.innerHTML) : {};
  Object.assign(esmsInitOptions, self.esmsInitOptions || {});
  let shimMode = hasDocument ? !!esmsInitOptions.shimMode : true;
  const importHook = globalHook(shimMode && esmsInitOptions.onimport);
  const resolveHook = globalHook(shimMode && esmsInitOptions.resolve);
  let fetchHook = esmsInitOptions.fetch ? globalHook(esmsInitOptions.fetch) : fetch;
  const metaHook = esmsInitOptions.meta ? globalHook(shimMode && esmsInitOptions.meta) : noop;
  const skip = esmsInitOptions.skip ? new RegExp(esmsInitOptions.skip) : null;
  const mapOverrides = esmsInitOptions.mapOverrides;
  let nonce = esmsInitOptions.nonce;

  if (!nonce && hasDocument) {
    const nonceElement = document.querySelector('script[nonce]');
    if (nonceElement) nonce = nonceElement.nonce || nonceElement.getAttribute('nonce');
  }

  const onerror = globalHook(esmsInitOptions.onerror || noop);
  const onpolyfill = esmsInitOptions.onpolyfill ? globalHook(esmsInitOptions.onpolyfill) : () => {
    console.log('%c^^ Module TypeError above is polyfilled and can be ignored ^^', 'font-weight:900;color:#391');
  };
  const {
    revokeBlobURLs,
    noLoadEventRetriggers,
    enforceIntegrity
  } = esmsInitOptions;

  function globalHook(name) {
    return typeof name === 'string' ? self[name] : name;
  }

  const enable = Array.isArray(esmsInitOptions.polyfillEnable) ? esmsInitOptions.polyfillEnable : [];
  const cssModulesEnabled = enable.includes('css-modules');
  const jsonModulesEnabled = enable.includes('json-modules');
  const edge = !navigator.userAgentData && !!navigator.userAgent.match(/Edge\/\d+\.\d+/);
  const baseUrl = hasDocument ? document.baseURI : `${location.protocol}//${location.host}${location.pathname.includes('/') ? location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) : location.pathname}`;

  function createBlob(source, type = 'text/javascript') {
    return URL.createObjectURL(new Blob([source], {
      type
    }));
  }

  const eoop = err => setTimeout(() => {
    throw err;
  });

  const throwError = err => {
    (self.reportError || hasWindow && window.safari && console.error || eoop)(err), void onerror(err);
  };

  function fromParent(parent) {
    return parent ? ` imported from ${parent}` : '';
  }

  let importMapSrcOrLazy = false;

  function setImportMapSrcOrLazy() {
    importMapSrcOrLazy = true;
  } // shim mode is determined on initialization, no late shim mode


  if (!shimMode) {
    if (document.querySelectorAll('script[type=module-shim],script[type=importmap-shim],link[rel=modulepreload-shim]').length) {
      shimMode = true;
    } else {
      let seenScript = false;

      for (const script of document.querySelectorAll('script[type=module],script[type=importmap]')) {
        if (!seenScript) {
          if (script.type === 'module' && !script.ep) seenScript = true;
        } else if (script.type === 'importmap' && seenScript) {
          importMapSrcOrLazy = true;
          break;
        }
      }
    }
  }

  const backslashRegEx = /\\/g;

  function isURL(url) {
    if (url.indexOf(':') === -1) return false;

    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }
  /*
   * Import maps implementation
   *
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   *
   */


  function resolveUrl(relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (isURL(relUrl) ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
    // strip off any trailing query params or hashes
    const queryHashIndex = parentUrl.indexOf('?', parentUrl.indexOf('#') === -1 ? parentUrl.indexOf('#') : parentUrl.length);
    if (queryHashIndex !== -1) parentUrl = parentUrl.slice(0, queryHashIndex);
    if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/'); // protocol-relative

    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    } // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1); // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"

      let pathname;

      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        } else {
          pathname = parentUrl.slice(8);
        }
      } else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/') return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl; // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'

      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;
      const output = [];
      let segmentIndex = -1;

      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }

          continue;
        } // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
            continue;
          } // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
            continue;
          }
        } // it is the start of a new segment


        while (segmented[i] === '/') i++;

        segmentIndex = i;
      } // finish reading out the last segment


      if (segmentIndex !== -1) output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  function resolveAndComposeImportMap(json, baseUrl, parentMap) {
    const outMap = {
      imports: Object.assign({}, parentMap.imports),
      scopes: Object.assign({}, parentMap.scopes)
    };
    if (json.imports) resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);
    if (json.scopes) for (let s in json.scopes) {
      const resolvedScope = resolveUrl(s, baseUrl);
      resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap);
    }
    return outMap;
  }

  function getMatch(path, matchObj) {
    if (matchObj[path]) return path;
    let sepIndex = path.length;

    do {
      const segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj) return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);
  }

  function applyPackages(id, packages) {
    const pkgName = getMatch(id, packages);

    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null) return;
      return pkg + id.slice(pkgName.length);
    }
  }

  function resolveImportMap(importMap, resolvedOrPlain, parentUrl) {
    let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);

    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
      if (packageResolution) return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
    }

    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
  }

  function resolveAndComposePackages(packages, outPackages, baseUrl, parentMap) {
    for (let p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;

      if ((!shimMode || !mapOverrides) && outPackages[resolvedLhs] && outPackages[resolvedLhs] !== packages[resolvedLhs]) {
        throw Error(`Rejected map override "${resolvedLhs}" from ${outPackages[resolvedLhs]} to ${packages[resolvedLhs]}.`);
      }

      let target = packages[p];
      if (typeof target !== 'string') continue;
      const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(target, baseUrl) || target, baseUrl);

      if (mapped) {
        outPackages[resolvedLhs] = mapped;
        continue;
      }

      console.warn(`Mapping "${p}" -> "${packages[p]}" does not resolve`);
    }
  }

  let err;
  window.addEventListener('error', _err => err = _err);

  function dynamicImportScript(url, {
    errUrl = url
  } = {}) {
    err = undefined;
    const src = createBlob(`import*as m from'${url}';self._esmsi=m`);
    const s = Object.assign(document.createElement('script'), {
      type: 'module',
      src,
      ep: true
    });
    s.setAttribute('nonce', nonce);
    s.setAttribute('noshim', '');
    const p = new Promise((resolve, reject) => {
      // Safari is unique in supporting module script error events
      s.addEventListener('error', cb);
      s.addEventListener('load', cb);

      function cb(_err) {
        document.head.removeChild(s);

        if (self._esmsi) {
          resolve(self._esmsi, baseUrl);
          self._esmsi = undefined;
        } else {
          reject(!(_err instanceof Event) && _err || err && err.error || new Error(`Error loading or executing the graph of ${errUrl} (check the console for ${src}).`));
          err = undefined;
        }
      }
    });
    document.head.appendChild(s);
    return p;
  }

  let dynamicImport = dynamicImportScript;
  const supportsDynamicImportCheck = dynamicImportScript(createBlob('export default u=>import(u)')).then(_dynamicImport => {
    if (_dynamicImport) dynamicImport = _dynamicImport.default;
    return !!_dynamicImport;
  }, noop); // support browsers without dynamic import support (eg Firefox 6x)

  let supportsJsonAssertions = false;
  let supportsCssAssertions = false;
  let supportsImportMaps = hasDocument && HTMLScriptElement.supports ? HTMLScriptElement.supports('importmap') : false;
  let supportsImportMeta = supportsImportMaps;
  let supportsDynamicImport = false;
  const featureDetectionPromise = Promise.resolve(supportsImportMaps || supportsDynamicImportCheck).then(_supportsDynamicImport => {
    if (!_supportsDynamicImport) return;
    supportsDynamicImport = true;
    return Promise.all([supportsImportMaps || dynamicImport(createBlob('import.meta')).then(() => supportsImportMeta = true, noop), cssModulesEnabled && dynamicImport(createBlob(`import"${createBlob('', 'text/css')}"assert{type:"css"}`)).then(() => supportsCssAssertions = true, noop), jsonModulesEnabled && dynamicImport(createBlob(`import"${createBlob('{}', 'text/json')}"assert{type:"json"}`)).then(() => supportsJsonAssertions = true, noop), supportsImportMaps || hasDocument && (HTMLScriptElement.supports || new Promise(resolve => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('nonce', nonce); // setting src to a blob URL results in a navigation event in webviews
      // setting srcdoc is not supported in React native webviews on iOS
      // therefore, we need to first feature detect srcdoc support

      iframe.srcdoc = `<!doctype html><script nonce="${nonce}"><${''}/script>`;
      document.head.appendChild(iframe);

      iframe.onload = () => {
        self._$s = v => {
          document.head.removeChild(iframe);
          supportsImportMaps = v;
          delete self._$s;
          resolve();
        };

        const supportsSrcDoc = iframe.contentDocument.head.childNodes.length > 0;
        const importMapTest = `<!doctype html><script type=importmap nonce="${nonce}">{"imports":{"x":"${createBlob('')}"}<${''}/script><script nonce="${nonce}">import('x').catch(() => {}).then(v=>parent._$s(!!v))<${''}/script>`;
        if (supportsSrcDoc) iframe.srcdoc = importMapTest;else iframe.contentDocument.write(importMapTest);
      };
    }))]);
  });
  /* es-module-lexer 0.10.5 */

  let e,
      a,
      r,
      s = 2 << 19;
  const i = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0] ? function (e, a) {
    const r = e.length;
    let s = 0;

    for (; s < r;) a[s] = e.charCodeAt(s++);
  } : function (e, a) {
    const r = e.length;
    let s = 0;

    for (; s < r;) {
      const r = e.charCodeAt(s);
      a[s++] = (255 & r) << 8 | r >>> 8;
    }
  },
        t = "xportmportlassetafromssertvoyiedeleinstantyreturdebuggeawaithrwhileforifcatcfinallels";
  let c$1, f, n;

  function parse(k, l = "@") {
    c$1 = k, f = l;
    const u = 2 * c$1.length + (2 << 18);

    if (u > s || !e) {
      for (; u > s;) s *= 2;

      a = new ArrayBuffer(s), i(t, new Uint16Array(a, 16, 85)), e = function (e, a, r) {
        "use asm";

        var s = new e.Int8Array(r),
            i = new e.Int16Array(r),
            t = new e.Int32Array(r),
            c = new e.Uint8Array(r),
            f = new e.Uint16Array(r),
            n = 992;

        function b(e) {
          e = e | 0;
          var a = 0,
              r = 0,
              c = 0,
              b = 0,
              u = 0,
              w = 0,
              v = 0;
          v = n;
          n = n + 11520 | 0;
          u = v + 2048 | 0;
          s[763] = 1;
          i[377] = 0;
          i[378] = 0;
          i[379] = 0;
          i[380] = -1;
          t[57] = t[2];
          s[764] = 0;
          t[56] = 0;
          s[762] = 0;
          t[58] = v + 10496;
          t[59] = v + 2304;
          t[60] = v;
          s[765] = 0;
          e = (t[3] | 0) + -2 | 0;
          t[61] = e;
          a = e + (t[54] << 1) | 0;
          t[62] = a;

          e: while (1) {
            r = e + 2 | 0;
            t[61] = r;

            if (e >>> 0 >= a >>> 0) {
              b = 18;
              break;
            }

            a: do {
              switch (i[r >> 1] | 0) {
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 32:
                  break;

                case 101:
                  {
                    if ((((i[379] | 0) == 0 ? D(r) | 0 : 0) ? (m(e + 4 | 0, 16, 10) | 0) == 0 : 0) ? (k(), (s[763] | 0) == 0) : 0) {
                      b = 9;
                      break e;
                    } else b = 17;

                    break;
                  }

                case 105:
                  {
                    if (D(r) | 0 ? (m(e + 4 | 0, 26, 10) | 0) == 0 : 0) {
                      l();
                      b = 17;
                    } else b = 17;

                    break;
                  }

                case 59:
                  {
                    b = 17;
                    break;
                  }

                case 47:
                  switch (i[e + 4 >> 1] | 0) {
                    case 47:
                      {
                        j();
                        break a;
                      }

                    case 42:
                      {
                        y(1);
                        break a;
                      }

                    default:
                      {
                        b = 16;
                        break e;
                      }
                  }

                default:
                  {
                    b = 16;
                    break e;
                  }
              }
            } while (0);

            if ((b | 0) == 17) {
              b = 0;
              t[57] = t[61];
            }

            e = t[61] | 0;
            a = t[62] | 0;
          }

          if ((b | 0) == 9) {
            e = t[61] | 0;
            t[57] = e;
            b = 19;
          } else if ((b | 0) == 16) {
            s[763] = 0;
            t[61] = e;
            b = 19;
          } else if ((b | 0) == 18) if (!(s[762] | 0)) {
            e = r;
            b = 19;
          } else e = 0;

          do {
            if ((b | 0) == 19) {
              e: while (1) {
                a = e + 2 | 0;
                t[61] = a;
                c = a;

                if (e >>> 0 >= (t[62] | 0) >>> 0) {
                  b = 75;
                  break;
                }

                a: do {
                  switch (i[a >> 1] | 0) {
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 32:
                      break;

                    case 101:
                      {
                        if (((i[379] | 0) == 0 ? D(a) | 0 : 0) ? (m(e + 4 | 0, 16, 10) | 0) == 0 : 0) {
                          k();
                          b = 74;
                        } else b = 74;

                        break;
                      }

                    case 105:
                      {
                        if (D(a) | 0 ? (m(e + 4 | 0, 26, 10) | 0) == 0 : 0) {
                          l();
                          b = 74;
                        } else b = 74;

                        break;
                      }

                    case 99:
                      {
                        if ((D(a) | 0 ? (m(e + 4 | 0, 36, 8) | 0) == 0 : 0) ? M(i[e + 12 >> 1] | 0) | 0 : 0) {
                          s[765] = 1;
                          b = 74;
                        } else b = 74;

                        break;
                      }

                    case 40:
                      {
                        r = t[57] | 0;
                        c = t[59] | 0;
                        b = i[379] | 0;
                        i[379] = b + 1 << 16 >> 16;
                        t[c + ((b & 65535) << 2) >> 2] = r;
                        b = 74;
                        break;
                      }

                    case 41:
                      {
                        a = i[379] | 0;

                        if (!(a << 16 >> 16)) {
                          b = 36;
                          break e;
                        }

                        a = a + -1 << 16 >> 16;
                        i[379] = a;
                        r = i[378] | 0;

                        if (r << 16 >> 16 != 0 ? (w = t[(t[60] | 0) + ((r & 65535) + -1 << 2) >> 2] | 0, (t[w + 20 >> 2] | 0) == (t[(t[59] | 0) + ((a & 65535) << 2) >> 2] | 0)) : 0) {
                          a = w + 4 | 0;
                          if (!(t[a >> 2] | 0)) t[a >> 2] = c;
                          t[w + 12 >> 2] = e + 4;
                          i[378] = r + -1 << 16 >> 16;
                          b = 74;
                        } else b = 74;

                        break;
                      }

                    case 123:
                      {
                        b = t[57] | 0;
                        c = t[51] | 0;
                        e = b;

                        do {
                          if ((i[b >> 1] | 0) == 41 & (c | 0) != 0 ? (t[c + 4 >> 2] | 0) == (b | 0) : 0) {
                            a = t[52] | 0;
                            t[51] = a;

                            if (!a) {
                              t[47] = 0;
                              break;
                            } else {
                              t[a + 28 >> 2] = 0;
                              break;
                            }
                          }
                        } while (0);

                        r = i[379] | 0;
                        b = r & 65535;
                        s[u + b >> 0] = s[765] | 0;
                        s[765] = 0;
                        c = t[59] | 0;
                        i[379] = r + 1 << 16 >> 16;
                        t[c + (b << 2) >> 2] = e;
                        b = 74;
                        break;
                      }

                    case 125:
                      {
                        e = i[379] | 0;

                        if (!(e << 16 >> 16)) {
                          b = 49;
                          break e;
                        }

                        r = e + -1 << 16 >> 16;
                        i[379] = r;
                        a = i[380] | 0;
                        if (e << 16 >> 16 != a << 16 >> 16) {
                          if (a << 16 >> 16 != -1 & (r & 65535) < (a & 65535)) {
                            b = 53;
                            break e;
                          } else {
                            b = 74;
                            break a;
                          }
                        } else {
                          c = t[58] | 0;
                          b = (i[377] | 0) + -1 << 16 >> 16;
                          i[377] = b;
                          i[380] = i[c + ((b & 65535) << 1) >> 1] | 0;
                          h();
                          b = 74;
                          break a;
                        }
                      }

                    case 39:
                      {
                        d(39);
                        b = 74;
                        break;
                      }

                    case 34:
                      {
                        d(34);
                        b = 74;
                        break;
                      }

                    case 47:
                      switch (i[e + 4 >> 1] | 0) {
                        case 47:
                          {
                            j();
                            break a;
                          }

                        case 42:
                          {
                            y(1);
                            break a;
                          }

                        default:
                          {
                            a = t[57] | 0;
                            r = i[a >> 1] | 0;

                            r: do {
                              if (!(U(r) | 0)) {
                                switch (r << 16 >> 16) {
                                  case 41:
                                    if (q(t[(t[59] | 0) + (f[379] << 2) >> 2] | 0) | 0) {
                                      b = 71;
                                      break r;
                                    } else {
                                      b = 68;
                                      break r;
                                    }

                                  case 125:
                                    break;

                                  default:
                                    {
                                      b = 68;
                                      break r;
                                    }
                                }

                                e = f[379] | 0;
                                if (!(p(t[(t[59] | 0) + (e << 2) >> 2] | 0) | 0) ? (s[u + e >> 0] | 0) == 0 : 0) b = 68;else b = 71;
                              } else switch (r << 16 >> 16) {
                                case 46:
                                  if (((i[a + -2 >> 1] | 0) + -48 & 65535) < 10) {
                                    b = 68;
                                    break r;
                                  } else {
                                    b = 71;
                                    break r;
                                  }

                                case 43:
                                  if ((i[a + -2 >> 1] | 0) == 43) {
                                    b = 68;
                                    break r;
                                  } else {
                                    b = 71;
                                    break r;
                                  }

                                case 45:
                                  if ((i[a + -2 >> 1] | 0) == 45) {
                                    b = 68;
                                    break r;
                                  } else {
                                    b = 71;
                                    break r;
                                  }

                                default:
                                  {
                                    b = 71;
                                    break r;
                                  }
                              }
                            } while (0);

                            r: do {
                              if ((b | 0) == 68) {
                                b = 0;

                                if (!(o(a) | 0)) {
                                  switch (r << 16 >> 16) {
                                    case 0:
                                      {
                                        b = 71;
                                        break r;
                                      }

                                    case 47:
                                      break;

                                    default:
                                      {
                                        e = 1;
                                        break r;
                                      }
                                  }

                                  if (!(s[764] | 0)) e = 1;else b = 71;
                                } else b = 71;
                              }
                            } while (0);

                            if ((b | 0) == 71) {
                              g();
                              e = 0;
                            }

                            s[764] = e;
                            b = 74;
                            break a;
                          }
                      }

                    case 96:
                      {
                        h();
                        b = 74;
                        break;
                      }

                    default:
                      b = 74;
                  }
                } while (0);

                if ((b | 0) == 74) {
                  b = 0;
                  t[57] = t[61];
                }

                e = t[61] | 0;
              }

              if ((b | 0) == 36) {
                L();
                e = 0;
                break;
              } else if ((b | 0) == 49) {
                L();
                e = 0;
                break;
              } else if ((b | 0) == 53) {
                L();
                e = 0;
                break;
              } else if ((b | 0) == 75) {
                e = (i[380] | 0) == -1 & (i[379] | 0) == 0 & (s[762] | 0) == 0 & (i[378] | 0) == 0;
                break;
              }
            }
          } while (0);

          n = v;
          return e | 0;
        }

        function k() {
          var e = 0,
              a = 0,
              r = 0,
              c = 0,
              f = 0,
              n = 0;
          f = t[61] | 0;
          n = f + 12 | 0;
          t[61] = n;
          a = w(1) | 0;
          e = t[61] | 0;
          if (!((e | 0) == (n | 0) ? !(I(a) | 0) : 0)) c = 3;

          e: do {
            if ((c | 0) == 3) {
              a: do {
                switch (a << 16 >> 16) {
                  case 100:
                    {
                      B(e, e + 14 | 0);
                      break e;
                    }

                  case 97:
                    {
                      t[61] = e + 10;
                      w(1) | 0;
                      e = t[61] | 0;
                      c = 6;
                      break;
                    }

                  case 102:
                    {
                      c = 6;
                      break;
                    }

                  case 99:
                    {
                      if ((m(e + 2 | 0, 36, 8) | 0) == 0 ? (r = e + 10 | 0, $(i[r >> 1] | 0) | 0) : 0) {
                        t[61] = r;
                        f = w(1) | 0;
                        n = t[61] | 0;
                        E(f) | 0;
                        B(n, t[61] | 0);
                        t[61] = (t[61] | 0) + -2;
                        break e;
                      }

                      e = e + 4 | 0;
                      t[61] = e;
                      c = 13;
                      break;
                    }

                  case 108:
                  case 118:
                    {
                      c = 13;
                      break;
                    }

                  case 123:
                    {
                      t[61] = e + 2;
                      e = w(1) | 0;
                      r = t[61] | 0;

                      while (1) {
                        if (N(e) | 0) {
                          d(e);
                          e = (t[61] | 0) + 2 | 0;
                          t[61] = e;
                        } else {
                          E(e) | 0;
                          e = t[61] | 0;
                        }

                        w(1) | 0;
                        e = C(r, e) | 0;

                        if (e << 16 >> 16 == 44) {
                          t[61] = (t[61] | 0) + 2;
                          e = w(1) | 0;
                        }

                        a = r;
                        r = t[61] | 0;

                        if (e << 16 >> 16 == 125) {
                          c = 32;
                          break;
                        }

                        if ((r | 0) == (a | 0)) {
                          c = 29;
                          break;
                        }

                        if (r >>> 0 > (t[62] | 0) >>> 0) {
                          c = 31;
                          break;
                        }
                      }

                      if ((c | 0) == 29) {
                        L();
                        break e;
                      } else if ((c | 0) == 31) {
                        L();
                        break e;
                      } else if ((c | 0) == 32) {
                        t[61] = r + 2;
                        c = 34;
                        break a;
                      }

                      break;
                    }

                  case 42:
                    {
                      t[61] = e + 2;
                      w(1) | 0;
                      c = t[61] | 0;
                      C(c, c) | 0;
                      c = 34;
                      break;
                    }

                  default:
                    {}
                }
              } while (0);

              if ((c | 0) == 6) {
                t[61] = e + 16;
                e = w(1) | 0;

                if (e << 16 >> 16 == 42) {
                  t[61] = (t[61] | 0) + 2;
                  e = w(1) | 0;
                }

                n = t[61] | 0;
                E(e) | 0;
                B(n, t[61] | 0);
                t[61] = (t[61] | 0) + -2;
                break;
              } else if ((c | 0) == 13) {
                e = e + 4 | 0;
                t[61] = e;
                s[763] = 0;

                a: while (1) {
                  t[61] = e + 2;
                  n = w(1) | 0;
                  e = t[61] | 0;

                  switch ((E(n) | 0) << 16 >> 16) {
                    case 91:
                    case 123:
                      {
                        c = 15;
                        break a;
                      }

                    default:
                      {}
                  }

                  a = t[61] | 0;
                  if ((a | 0) == (e | 0)) break e;
                  B(e, a);

                  switch ((w(1) | 0) << 16 >> 16) {
                    case 61:
                      {
                        c = 19;
                        break a;
                      }

                    case 44:
                      break;

                    default:
                      {
                        c = 20;
                        break a;
                      }
                  }

                  e = t[61] | 0;
                }

                if ((c | 0) == 15) {
                  t[61] = (t[61] | 0) + -2;
                  break;
                } else if ((c | 0) == 19) {
                  t[61] = (t[61] | 0) + -2;
                  break;
                } else if ((c | 0) == 20) {
                  t[61] = (t[61] | 0) + -2;
                  break;
                }
              } else if ((c | 0) == 34) a = w(1) | 0;

              e = t[61] | 0;

              if (a << 16 >> 16 == 102 ? (m(e + 2 | 0, 52, 6) | 0) == 0 : 0) {
                t[61] = e + 8;
                u(f, w(1) | 0);
                break;
              }

              t[61] = e + -2;
            }
          } while (0);

          return;
        }

        function l() {
          var e = 0,
              a = 0,
              r = 0,
              c = 0,
              f = 0;
          f = t[61] | 0;
          a = f + 12 | 0;
          t[61] = a;

          e: do {
            switch ((w(1) | 0) << 16 >> 16) {
              case 40:
                {
                  e = t[61] | 0;
                  a = t[59] | 0;
                  r = i[379] | 0;
                  i[379] = r + 1 << 16 >> 16;
                  t[a + ((r & 65535) << 2) >> 2] = e;

                  if ((i[t[57] >> 1] | 0) != 46) {
                    e = t[61] | 0;
                    t[61] = e + 2;
                    r = w(1) | 0;
                    v(f, t[61] | 0, 0, e);
                    e = t[51] | 0;
                    a = t[60] | 0;
                    f = i[378] | 0;
                    i[378] = f + 1 << 16 >> 16;
                    t[a + ((f & 65535) << 2) >> 2] = e;

                    switch (r << 16 >> 16) {
                      case 39:
                        {
                          d(39);
                          break;
                        }

                      case 34:
                        {
                          d(34);
                          break;
                        }

                      default:
                        {
                          t[61] = (t[61] | 0) + -2;
                          break e;
                        }
                    }

                    e = (t[61] | 0) + 2 | 0;
                    t[61] = e;

                    switch ((w(1) | 0) << 16 >> 16) {
                      case 44:
                        {
                          t[61] = (t[61] | 0) + 2;
                          w(1) | 0;
                          r = t[51] | 0;
                          t[r + 4 >> 2] = e;
                          f = t[61] | 0;
                          t[r + 16 >> 2] = f;
                          s[r + 24 >> 0] = 1;
                          t[61] = f + -2;
                          break e;
                        }

                      case 41:
                        {
                          i[379] = (i[379] | 0) + -1 << 16 >> 16;
                          f = t[51] | 0;
                          t[f + 4 >> 2] = e;
                          t[f + 12 >> 2] = (t[61] | 0) + 2;
                          s[f + 24 >> 0] = 1;
                          i[378] = (i[378] | 0) + -1 << 16 >> 16;
                          break e;
                        }

                      default:
                        {
                          t[61] = (t[61] | 0) + -2;
                          break e;
                        }
                    }
                  }

                  break;
                }

              case 46:
                {
                  t[61] = (t[61] | 0) + 2;
                  if (((w(1) | 0) << 16 >> 16 == 109 ? (e = t[61] | 0, (m(e + 2 | 0, 44, 6) | 0) == 0) : 0) ? (i[t[57] >> 1] | 0) != 46 : 0) v(f, f, e + 8 | 0, 2);
                  break;
                }

              case 42:
              case 39:
              case 34:
                {
                  c = 16;
                  break;
                }

              case 123:
                {
                  e = t[61] | 0;

                  if (i[379] | 0) {
                    t[61] = e + -2;
                    break e;
                  }

                  while (1) {
                    if (e >>> 0 >= (t[62] | 0) >>> 0) break;
                    e = w(1) | 0;

                    if (!(N(e) | 0)) {
                      if (e << 16 >> 16 == 125) {
                        c = 31;
                        break;
                      }
                    } else d(e);

                    e = (t[61] | 0) + 2 | 0;
                    t[61] = e;
                  }

                  if ((c | 0) == 31) t[61] = (t[61] | 0) + 2;
                  w(1) | 0;
                  e = t[61] | 0;

                  if (m(e, 50, 8) | 0) {
                    L();
                    break e;
                  }

                  t[61] = e + 8;
                  e = w(1) | 0;

                  if (N(e) | 0) {
                    u(f, e);
                    break e;
                  } else {
                    L();
                    break e;
                  }
                }

              default:
                if ((t[61] | 0) != (a | 0)) c = 16;
            }
          } while (0);

          do {
            if ((c | 0) == 16) {
              if (i[379] | 0) {
                t[61] = (t[61] | 0) + -2;
                break;
              }

              e = t[62] | 0;
              a = t[61] | 0;

              while (1) {
                if (a >>> 0 >= e >>> 0) {
                  c = 23;
                  break;
                }

                r = i[a >> 1] | 0;

                if (N(r) | 0) {
                  c = 21;
                  break;
                }

                c = a + 2 | 0;
                t[61] = c;
                a = c;
              }

              if ((c | 0) == 21) {
                u(f, r);
                break;
              } else if ((c | 0) == 23) {
                L();
                break;
              }
            }
          } while (0);

          return;
        }

        function u(e, a) {
          e = e | 0;
          a = a | 0;
          var r = 0,
              s = 0;
          r = (t[61] | 0) + 2 | 0;

          switch (a << 16 >> 16) {
            case 39:
              {
                d(39);
                s = 5;
                break;
              }

            case 34:
              {
                d(34);
                s = 5;
                break;
              }

            default:
              L();
          }

          do {
            if ((s | 0) == 5) {
              v(e, r, t[61] | 0, 1);
              t[61] = (t[61] | 0) + 2;
              s = (w(0) | 0) << 16 >> 16 == 97;
              a = t[61] | 0;

              if (s ? (m(a + 2 | 0, 58, 10) | 0) == 0 : 0) {
                t[61] = a + 12;

                if ((w(1) | 0) << 16 >> 16 != 123) {
                  t[61] = a;
                  break;
                }

                e = t[61] | 0;
                r = e;

                e: while (1) {
                  t[61] = r + 2;
                  r = w(1) | 0;

                  switch (r << 16 >> 16) {
                    case 39:
                      {
                        d(39);
                        t[61] = (t[61] | 0) + 2;
                        r = w(1) | 0;
                        break;
                      }

                    case 34:
                      {
                        d(34);
                        t[61] = (t[61] | 0) + 2;
                        r = w(1) | 0;
                        break;
                      }

                    default:
                      r = E(r) | 0;
                  }

                  if (r << 16 >> 16 != 58) {
                    s = 16;
                    break;
                  }

                  t[61] = (t[61] | 0) + 2;

                  switch ((w(1) | 0) << 16 >> 16) {
                    case 39:
                      {
                        d(39);
                        break;
                      }

                    case 34:
                      {
                        d(34);
                        break;
                      }

                    default:
                      {
                        s = 20;
                        break e;
                      }
                  }

                  t[61] = (t[61] | 0) + 2;

                  switch ((w(1) | 0) << 16 >> 16) {
                    case 125:
                      {
                        s = 25;
                        break e;
                      }

                    case 44:
                      break;

                    default:
                      {
                        s = 24;
                        break e;
                      }
                  }

                  t[61] = (t[61] | 0) + 2;

                  if ((w(1) | 0) << 16 >> 16 == 125) {
                    s = 25;
                    break;
                  }

                  r = t[61] | 0;
                }

                if ((s | 0) == 16) {
                  t[61] = a;
                  break;
                } else if ((s | 0) == 20) {
                  t[61] = a;
                  break;
                } else if ((s | 0) == 24) {
                  t[61] = a;
                  break;
                } else if ((s | 0) == 25) {
                  s = t[51] | 0;
                  t[s + 16 >> 2] = e;
                  t[s + 12 >> 2] = (t[61] | 0) + 2;
                  break;
                }
              }

              t[61] = a + -2;
            }
          } while (0);

          return;
        }

        function o(e) {
          e = e | 0;

          e: do {
            switch (i[e >> 1] | 0) {
              case 100:
                switch (i[e + -2 >> 1] | 0) {
                  case 105:
                    {
                      e = S(e + -4 | 0, 68, 2) | 0;
                      break e;
                    }

                  case 108:
                    {
                      e = S(e + -4 | 0, 72, 3) | 0;
                      break e;
                    }

                  default:
                    {
                      e = 0;
                      break e;
                    }
                }

              case 101:
                {
                  switch (i[e + -2 >> 1] | 0) {
                    case 115:
                      break;

                    case 116:
                      {
                        e = S(e + -4 | 0, 78, 4) | 0;
                        break e;
                      }

                    default:
                      {
                        e = 0;
                        break e;
                      }
                  }

                  switch (i[e + -4 >> 1] | 0) {
                    case 108:
                      {
                        e = O(e + -6 | 0, 101) | 0;
                        break e;
                      }

                    case 97:
                      {
                        e = O(e + -6 | 0, 99) | 0;
                        break e;
                      }

                    default:
                      {
                        e = 0;
                        break e;
                      }
                  }
                }

              case 102:
                {
                  if ((i[e + -2 >> 1] | 0) == 111 ? (i[e + -4 >> 1] | 0) == 101 : 0) switch (i[e + -6 >> 1] | 0) {
                    case 99:
                      {
                        e = S(e + -8 | 0, 86, 6) | 0;
                        break e;
                      }

                    case 112:
                      {
                        e = S(e + -8 | 0, 98, 2) | 0;
                        break e;
                      }

                    default:
                      {
                        e = 0;
                        break e;
                      }
                  } else e = 0;
                  break;
                }

              case 110:
                {
                  e = e + -2 | 0;
                  if (O(e, 105) | 0) e = 1;else e = S(e, 102, 5) | 0;
                  break;
                }

              case 111:
                {
                  e = O(e + -2 | 0, 100) | 0;
                  break;
                }

              case 114:
                {
                  e = S(e + -2 | 0, 112, 7) | 0;
                  break;
                }

              case 116:
                {
                  e = S(e + -2 | 0, 126, 4) | 0;
                  break;
                }

              case 119:
                switch (i[e + -2 >> 1] | 0) {
                  case 101:
                    {
                      e = O(e + -4 | 0, 110) | 0;
                      break e;
                    }

                  case 111:
                    {
                      e = S(e + -4 | 0, 134, 3) | 0;
                      break e;
                    }

                  default:
                    {
                      e = 0;
                      break e;
                    }
                }

              default:
                e = 0;
            }
          } while (0);

          return e | 0;
        }

        function h() {
          var e = 0,
              a = 0,
              r = 0;
          a = t[62] | 0;
          r = t[61] | 0;

          e: while (1) {
            e = r + 2 | 0;

            if (r >>> 0 >= a >>> 0) {
              a = 8;
              break;
            }

            switch (i[e >> 1] | 0) {
              case 96:
                {
                  a = 9;
                  break e;
                }

              case 36:
                {
                  if ((i[r + 4 >> 1] | 0) == 123) {
                    a = 6;
                    break e;
                  }

                  break;
                }

              case 92:
                {
                  e = r + 4 | 0;
                  break;
                }

              default:
                {}
            }

            r = e;
          }

          if ((a | 0) == 6) {
            t[61] = r + 4;
            e = i[380] | 0;
            a = t[58] | 0;
            r = i[377] | 0;
            i[377] = r + 1 << 16 >> 16;
            i[a + ((r & 65535) << 1) >> 1] = e;
            r = (i[379] | 0) + 1 << 16 >> 16;
            i[379] = r;
            i[380] = r;
          } else if ((a | 0) == 8) {
            t[61] = e;
            L();
          } else if ((a | 0) == 9) t[61] = e;

          return;
        }

        function w(e) {
          e = e | 0;
          var a = 0,
              r = 0,
              s = 0;
          r = t[61] | 0;

          e: do {
            a = i[r >> 1] | 0;

            a: do {
              if (a << 16 >> 16 != 47) {
                if (e) {
                  if (M(a) | 0) break;else break e;
                } else if (z(a) | 0) break;else break e;
              } else switch (i[r + 2 >> 1] | 0) {
                case 47:
                  {
                    j();
                    break a;
                  }

                case 42:
                  {
                    y(e);
                    break a;
                  }

                default:
                  {
                    a = 47;
                    break e;
                  }
              }
            } while (0);

            s = t[61] | 0;
            r = s + 2 | 0;
            t[61] = r;
          } while (s >>> 0 < (t[62] | 0) >>> 0);

          return a | 0;
        }

        function d(e) {
          e = e | 0;
          var a = 0,
              r = 0,
              s = 0,
              c = 0;
          c = t[62] | 0;
          a = t[61] | 0;

          while (1) {
            s = a + 2 | 0;

            if (a >>> 0 >= c >>> 0) {
              a = 9;
              break;
            }

            r = i[s >> 1] | 0;

            if (r << 16 >> 16 == e << 16 >> 16) {
              a = 10;
              break;
            }

            if (r << 16 >> 16 == 92) {
              r = a + 4 | 0;

              if ((i[r >> 1] | 0) == 13) {
                a = a + 6 | 0;
                a = (i[a >> 1] | 0) == 10 ? a : r;
              } else a = r;
            } else if (T(r) | 0) {
              a = 9;
              break;
            } else a = s;
          }

          if ((a | 0) == 9) {
            t[61] = s;
            L();
          } else if ((a | 0) == 10) t[61] = s;

          return;
        }

        function v(e, a, r, i) {
          e = e | 0;
          a = a | 0;
          r = r | 0;
          i = i | 0;
          var c = 0,
              f = 0;
          c = t[55] | 0;
          t[55] = c + 32;
          f = t[51] | 0;
          t[((f | 0) == 0 ? 188 : f + 28 | 0) >> 2] = c;
          t[52] = f;
          t[51] = c;
          t[c + 8 >> 2] = e;
          if (2 == (i | 0)) e = r;else e = 1 == (i | 0) ? r + 2 | 0 : 0;
          t[c + 12 >> 2] = e;
          t[c >> 2] = a;
          t[c + 4 >> 2] = r;
          t[c + 16 >> 2] = 0;
          t[c + 20 >> 2] = i;
          s[c + 24 >> 0] = 1 == (i | 0) & 1;
          t[c + 28 >> 2] = 0;
          return;
        }

        function A() {
          var e = 0,
              a = 0,
              r = 0;
          r = t[62] | 0;
          a = t[61] | 0;

          e: while (1) {
            e = a + 2 | 0;

            if (a >>> 0 >= r >>> 0) {
              a = 6;
              break;
            }

            switch (i[e >> 1] | 0) {
              case 13:
              case 10:
                {
                  a = 6;
                  break e;
                }

              case 93:
                {
                  a = 7;
                  break e;
                }

              case 92:
                {
                  e = a + 4 | 0;
                  break;
                }

              default:
                {}
            }

            a = e;
          }

          if ((a | 0) == 6) {
            t[61] = e;
            L();
            e = 0;
          } else if ((a | 0) == 7) {
            t[61] = e;
            e = 93;
          }

          return e | 0;
        }

        function C(e, a) {
          e = e | 0;
          a = a | 0;
          var r = 0,
              s = 0;
          r = t[61] | 0;
          s = i[r >> 1] | 0;

          if (s << 16 >> 16 == 97) {
            t[61] = r + 4;
            r = w(1) | 0;
            e = t[61] | 0;

            if (N(r) | 0) {
              d(r);
              a = (t[61] | 0) + 2 | 0;
              t[61] = a;
            } else {
              E(r) | 0;
              a = t[61] | 0;
            }

            s = w(1) | 0;
            r = t[61] | 0;
          }

          if ((r | 0) != (e | 0)) B(e, a);
          return s | 0;
        }

        function g() {
          var e = 0,
              a = 0,
              r = 0;

          e: while (1) {
            e = t[61] | 0;
            a = e + 2 | 0;
            t[61] = a;

            if (e >>> 0 >= (t[62] | 0) >>> 0) {
              r = 7;
              break;
            }

            switch (i[a >> 1] | 0) {
              case 13:
              case 10:
                {
                  r = 7;
                  break e;
                }

              case 47:
                break e;

              case 91:
                {
                  A() | 0;
                  break;
                }

              case 92:
                {
                  t[61] = e + 4;
                  break;
                }

              default:
                {}
            }
          }

          if ((r | 0) == 7) L();
          return;
        }

        function p(e) {
          e = e | 0;

          switch (i[e >> 1] | 0) {
            case 62:
              {
                e = (i[e + -2 >> 1] | 0) == 61;
                break;
              }

            case 41:
            case 59:
              {
                e = 1;
                break;
              }

            case 104:
              {
                e = S(e + -2 | 0, 160, 4) | 0;
                break;
              }

            case 121:
              {
                e = S(e + -2 | 0, 168, 6) | 0;
                break;
              }

            case 101:
              {
                e = S(e + -2 | 0, 180, 3) | 0;
                break;
              }

            default:
              e = 0;
          }

          return e | 0;
        }

        function y(e) {
          e = e | 0;
          var a = 0,
              r = 0,
              s = 0,
              c = 0,
              f = 0;
          c = (t[61] | 0) + 2 | 0;
          t[61] = c;
          r = t[62] | 0;

          while (1) {
            a = c + 2 | 0;
            if (c >>> 0 >= r >>> 0) break;
            s = i[a >> 1] | 0;
            if (!e ? T(s) | 0 : 0) break;

            if (s << 16 >> 16 == 42 ? (i[c + 4 >> 1] | 0) == 47 : 0) {
              f = 8;
              break;
            }

            c = a;
          }

          if ((f | 0) == 8) {
            t[61] = a;
            a = c + 4 | 0;
          }

          t[61] = a;
          return;
        }

        function m(e, a, r) {
          e = e | 0;
          a = a | 0;
          r = r | 0;
          var i = 0,
              t = 0;

          e: do {
            if (!r) e = 0;else {
              while (1) {
                i = s[e >> 0] | 0;
                t = s[a >> 0] | 0;
                if (i << 24 >> 24 != t << 24 >> 24) break;
                r = r + -1 | 0;

                if (!r) {
                  e = 0;
                  break e;
                } else {
                  e = e + 1 | 0;
                  a = a + 1 | 0;
                }
              }

              e = (i & 255) - (t & 255) | 0;
            }
          } while (0);

          return e | 0;
        }

        function I(e) {
          e = e | 0;

          e: do {
            switch (e << 16 >> 16) {
              case 38:
              case 37:
              case 33:
                {
                  e = 1;
                  break;
                }

              default:
                if ((e & -8) << 16 >> 16 == 40 | (e + -58 & 65535) < 6) e = 1;else {
                  switch (e << 16 >> 16) {
                    case 91:
                    case 93:
                    case 94:
                      {
                        e = 1;
                        break e;
                      }

                    default:
                      {}
                  }

                  e = (e + -123 & 65535) < 4;
                }
            }
          } while (0);

          return e | 0;
        }

        function U(e) {
          e = e | 0;

          e: do {
            switch (e << 16 >> 16) {
              case 38:
              case 37:
              case 33:
                break;

              default:
                if (!((e + -58 & 65535) < 6 | (e + -40 & 65535) < 7 & e << 16 >> 16 != 41)) {
                  switch (e << 16 >> 16) {
                    case 91:
                    case 94:
                      break e;

                    default:
                      {}
                  }

                  return e << 16 >> 16 != 125 & (e + -123 & 65535) < 4 | 0;
                }

            }
          } while (0);

          return 1;
        }

        function x(e) {
          e = e | 0;
          var a = 0,
              r = 0,
              s = 0,
              c = 0;
          r = n;
          n = n + 16 | 0;
          s = r;
          t[s >> 2] = 0;
          t[54] = e;
          a = t[3] | 0;
          c = a + (e << 1) | 0;
          e = c + 2 | 0;
          i[c >> 1] = 0;
          t[s >> 2] = e;
          t[55] = e;
          t[47] = 0;
          t[51] = 0;
          t[49] = 0;
          t[48] = 0;
          t[53] = 0;
          t[50] = 0;
          n = r;
          return a | 0;
        }

        function S(e, a, r) {
          e = e | 0;
          a = a | 0;
          r = r | 0;
          var s = 0,
              c = 0;
          s = e + (0 - r << 1) | 0;
          c = s + 2 | 0;
          e = t[3] | 0;
          if (c >>> 0 >= e >>> 0 ? (m(c, a, r << 1) | 0) == 0 : 0) {
            if ((c | 0) == (e | 0)) e = 1;else e = $(i[s >> 1] | 0) | 0;
          } else e = 0;
          return e | 0;
        }

        function O(e, a) {
          e = e | 0;
          a = a | 0;
          var r = 0;
          r = t[3] | 0;
          if (r >>> 0 <= e >>> 0 ? (i[e >> 1] | 0) == a << 16 >> 16 : 0) {
            if ((r | 0) == (e | 0)) r = 1;else r = $(i[e + -2 >> 1] | 0) | 0;
          } else r = 0;
          return r | 0;
        }

        function $(e) {
          e = e | 0;

          e: do {
            if ((e + -9 & 65535) < 5) e = 1;else {
              switch (e << 16 >> 16) {
                case 32:
                case 160:
                  {
                    e = 1;
                    break e;
                  }

                default:
                  {}
              }

              e = e << 16 >> 16 != 46 & (I(e) | 0);
            }
          } while (0);

          return e | 0;
        }

        function j() {
          var e = 0,
              a = 0,
              r = 0;
          e = t[62] | 0;
          r = t[61] | 0;

          e: while (1) {
            a = r + 2 | 0;
            if (r >>> 0 >= e >>> 0) break;

            switch (i[a >> 1] | 0) {
              case 13:
              case 10:
                break e;

              default:
                r = a;
            }
          }

          t[61] = a;
          return;
        }

        function B(e, a) {
          e = e | 0;
          a = a | 0;
          var r = 0,
              s = 0;
          r = t[55] | 0;
          t[55] = r + 12;
          s = t[53] | 0;
          t[((s | 0) == 0 ? 192 : s + 8 | 0) >> 2] = r;
          t[53] = r;
          t[r >> 2] = e;
          t[r + 4 >> 2] = a;
          t[r + 8 >> 2] = 0;
          return;
        }

        function E(e) {
          e = e | 0;

          while (1) {
            if (M(e) | 0) break;
            if (I(e) | 0) break;
            e = (t[61] | 0) + 2 | 0;
            t[61] = e;
            e = i[e >> 1] | 0;

            if (!(e << 16 >> 16)) {
              e = 0;
              break;
            }
          }

          return e | 0;
        }

        function P() {
          var e = 0;
          e = t[(t[49] | 0) + 20 >> 2] | 0;

          switch (e | 0) {
            case 1:
              {
                e = -1;
                break;
              }

            case 2:
              {
                e = -2;
                break;
              }

            default:
              e = e - (t[3] | 0) >> 1;
          }

          return e | 0;
        }

        function q(e) {
          e = e | 0;
          if (!(S(e, 140, 5) | 0) ? !(S(e, 150, 3) | 0) : 0) e = S(e, 156, 2) | 0;else e = 1;
          return e | 0;
        }

        function z(e) {
          e = e | 0;

          switch (e << 16 >> 16) {
            case 160:
            case 32:
            case 12:
            case 11:
            case 9:
              {
                e = 1;
                break;
              }

            default:
              e = 0;
          }

          return e | 0;
        }

        function D(e) {
          e = e | 0;
          if ((t[3] | 0) == (e | 0)) e = 1;else e = $(i[e + -2 >> 1] | 0) | 0;
          return e | 0;
        }

        function F() {
          var e = 0;
          e = t[(t[49] | 0) + 12 >> 2] | 0;
          if (!e) e = -1;else e = e - (t[3] | 0) >> 1;
          return e | 0;
        }

        function G() {
          var e = 0;
          e = t[(t[49] | 0) + 16 >> 2] | 0;
          if (!e) e = -1;else e = e - (t[3] | 0) >> 1;
          return e | 0;
        }

        function H() {
          var e = 0;
          e = t[(t[49] | 0) + 4 >> 2] | 0;
          if (!e) e = -1;else e = e - (t[3] | 0) >> 1;
          return e | 0;
        }

        function J() {
          var e = 0;
          e = t[49] | 0;
          e = t[((e | 0) == 0 ? 188 : e + 28 | 0) >> 2] | 0;
          t[49] = e;
          return (e | 0) != 0 | 0;
        }

        function K() {
          var e = 0;
          e = t[50] | 0;
          e = t[((e | 0) == 0 ? 192 : e + 8 | 0) >> 2] | 0;
          t[50] = e;
          return (e | 0) != 0 | 0;
        }

        function L() {
          s[762] = 1;
          t[56] = (t[61] | 0) - (t[3] | 0) >> 1;
          t[61] = (t[62] | 0) + 2;
          return;
        }

        function M(e) {
          e = e | 0;
          return (e | 128) << 16 >> 16 == 160 | (e + -9 & 65535) < 5 | 0;
        }

        function N(e) {
          e = e | 0;
          return e << 16 >> 16 == 39 | e << 16 >> 16 == 34 | 0;
        }

        function Q() {
          return (t[(t[49] | 0) + 8 >> 2] | 0) - (t[3] | 0) >> 1 | 0;
        }

        function R() {
          return (t[(t[50] | 0) + 4 >> 2] | 0) - (t[3] | 0) >> 1 | 0;
        }

        function T(e) {
          e = e | 0;
          return e << 16 >> 16 == 13 | e << 16 >> 16 == 10 | 0;
        }

        function V() {
          return (t[t[49] >> 2] | 0) - (t[3] | 0) >> 1 | 0;
        }

        function W() {
          return (t[t[50] >> 2] | 0) - (t[3] | 0) >> 1 | 0;
        }

        function X() {
          return c[(t[49] | 0) + 24 >> 0] | 0 | 0;
        }

        function Y(e) {
          e = e | 0;
          t[3] = e;
          return;
        }

        function Z() {
          return (s[763] | 0) != 0 | 0;
        }

        function _() {
          return t[56] | 0;
        }

        function ee(e) {
          e = e | 0;
          n = e + 992 + 15 & -16;
          return 992;
        }

        return {
          su: ee,
          ai: G,
          e: _,
          ee: R,
          es: W,
          f: Z,
          id: P,
          ie: H,
          ip: X,
          is: V,
          p: b,
          re: K,
          ri: J,
          sa: x,
          se: F,
          ses: Y,
          ss: Q
        };
      }("undefined" != typeof self ? self : commonjsGlobal, {}, a), r = e.su(s - (2 << 17));
    }

    const h = c$1.length + 1;
    e.ses(r), e.sa(h - 1), i(c$1, new Uint16Array(a, r, h)), e.p() || (n = e.e(), o());
    const w = [],
          d = [];

    for (; e.ri();) {
      const a = e.is(),
            r = e.ie(),
            s = e.ai(),
            i = e.id(),
            t = e.ss(),
            f = e.se();
      let n;
      e.ip() && (n = b(-1 === i ? a : a + 1, c$1.charCodeAt(-1 === i ? a - 1 : a))), w.push({
        n: n,
        s: a,
        e: r,
        ss: t,
        se: f,
        d: i,
        a: s
      });
    }

    for (; e.re();) {
      const a = e.es(),
            r = c$1.charCodeAt(a);
      d.push(34 === r || 39 === r ? b(a + 1, r) : c$1.slice(e.es(), e.ee()));
    }

    return [w, d, !!e.f()];
  }

  function b(e, a) {
    n = e;
    let r = "",
        s = n;

    for (;;) {
      n >= c$1.length && o();
      const e = c$1.charCodeAt(n);
      if (e === a) break;
      92 === e ? (r += c$1.slice(s, n), r += k(), s = n) : (8232 === e || 8233 === e || u(e) && o(), ++n);
    }

    return r += c$1.slice(s, n++), r;
  }

  function k() {
    let e = c$1.charCodeAt(++n);

    switch (++n, e) {
      case 110:
        return "\n";

      case 114:
        return "\r";

      case 120:
        return String.fromCharCode(l(2));

      case 117:
        return function () {
          let e;
          123 === c$1.charCodeAt(n) ? (++n, e = l(c$1.indexOf("}", n) - n), ++n, e > 1114111 && o()) : e = l(4);
          return e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode(55296 + (e >> 10), 56320 + (1023 & e)));
        }();

      case 116:
        return "\t";

      case 98:
        return "\b";

      case 118:
        return "\v";

      case 102:
        return "\f";

      case 13:
        10 === c$1.charCodeAt(n) && ++n;

      case 10:
        return "";

      case 56:
      case 57:
        o();

      default:
        if (e >= 48 && e <= 55) {
          let a = c$1.substr(n - 1, 3).match(/^[0-7]+/)[0],
              r = parseInt(a, 8);
          return r > 255 && (a = a.slice(0, -1), r = parseInt(a, 8)), n += a.length - 1, e = c$1.charCodeAt(n), "0" === a && 56 !== e && 57 !== e || o(), String.fromCharCode(r);
        }

        return u(e) ? "" : String.fromCharCode(e);
    }
  }

  function l(e) {
    const a = n;
    let r = 0,
        s = 0;

    for (let a = 0; a < e; ++a, ++n) {
      let e,
          i = c$1.charCodeAt(n);

      if (95 !== i) {
        if (i >= 97) e = i - 97 + 10;else if (i >= 65) e = i - 65 + 10;else {
          if (!(i >= 48 && i <= 57)) break;
          e = i - 48;
        }
        if (e >= 16) break;
        s = i, r = 16 * r + e;
      } else 95 !== s && 0 !== a || o(), s = i;
    }

    return 95 !== s && n - a === e || o(), r;
  }

  function u(e) {
    return 13 === e || 10 === e;
  }

  function o() {
    throw Object.assign(Error(`Parse error ${f}:${c$1.slice(0, n).split("\n").length}:${n - c$1.lastIndexOf("\n", n - 1)}`), {
      idx: n
    });
  }

  async function _resolve(id, parentUrl) {
    const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
    return {
      r: resolveImportMap(importMap, urlResolved || id, parentUrl) || throwUnresolved(id, parentUrl),
      // b = bare specifier
      b: !urlResolved && !isURL(id)
    };
  }

  const resolve = resolveHook ? async (id, parentUrl) => {
    let result = resolveHook(id, parentUrl, defaultResolve); // will be deprecated in next major

    if (result && result.then) result = await result;
    return result ? {
      r: result,
      b: !resolveIfNotPlainOrUrl(id, parentUrl) && !isURL(id)
    } : _resolve(id, parentUrl);
  } : _resolve; // importShim('mod');
  // importShim('mod', { opts });
  // importShim('mod', { opts }, parentUrl);
  // importShim('mod', parentUrl);

  async function importShim(id, ...args) {
    // parentUrl if present will be the last argument
    let parentUrl = args[args.length - 1];
    if (typeof parentUrl !== 'string') parentUrl = baseUrl; // needed for shim check

    await initPromise;
    if (importHook) await importHook(id, typeof args[1] !== 'string' ? args[1] : {}, parentUrl);

    if (acceptingImportMaps || shimMode || !baselinePassthrough) {
      if (hasDocument) processImportMaps();
      if (!shimMode) acceptingImportMaps = false;
    }

    await importMapPromise;
    return topLevelLoad((await resolve(id, parentUrl)).r, {
      credentials: 'same-origin'
    });
  }

  self.importShim = importShim;

  function defaultResolve(id, parentUrl) {
    return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  }

  function throwUnresolved(id, parentUrl) {
    throw Error(`Unable to resolve specifier '${id}'${fromParent(parentUrl)}`);
  }

  const resolveSync = (id, parentUrl = baseUrl) => {
    parentUrl = `${parentUrl}`;
    const result = resolveHook && resolveHook(id, parentUrl, defaultResolve);
    return result && !result.then ? result : defaultResolve(id, parentUrl);
  };

  function metaResolve(id, parentUrl = this.url) {
    return resolveSync(id, parentUrl);
  }

  importShim.resolve = resolveSync;

  importShim.getImportMap = () => JSON.parse(JSON.stringify(importMap));

  importShim.addImportMap = importMapIn => {
    if (!shimMode) throw new Error('Unsupported in polyfill mode.');
    importMap = resolveAndComposeImportMap(importMapIn, baseUrl, importMap);
  };

  const registry = importShim._r = {};

  async function loadAll(load, seen) {
    if (load.b || seen[load.u]) return;
    seen[load.u] = 1;
    await load.L;
    await Promise.all(load.d.map(dep => loadAll(dep, seen)));
    if (!load.n) load.n = load.d.some(dep => dep.n);
  }

  let importMap = {
    imports: {},
    scopes: {}
  };
  let baselinePassthrough;
  const initPromise = featureDetectionPromise.then(() => {
    baselinePassthrough = esmsInitOptions.polyfillEnable !== true && supportsDynamicImport && supportsImportMeta && supportsImportMaps && (!jsonModulesEnabled || supportsJsonAssertions) && (!cssModulesEnabled || supportsCssAssertions) && !importMapSrcOrLazy && !false;

    if (hasDocument) {
      if (!supportsImportMaps) {
        const supports = HTMLScriptElement.supports || (type => type === 'classic' || type === 'module');

        HTMLScriptElement.supports = type => type === 'importmap' || supports(type);
      }

      if (shimMode || !baselinePassthrough) {
        new MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;

            for (const node of mutation.addedNodes) {
              if (node.tagName === 'SCRIPT') {
                if (node.type === (shimMode ? 'module-shim' : 'module')) processScript(node);
                if (node.type === (shimMode ? 'importmap-shim' : 'importmap')) processImportMap(node);
              } else if (node.tagName === 'LINK' && node.rel === (shimMode ? 'modulepreload-shim' : 'modulepreload')) processPreload(node);
            }
          }
        }).observe(document, {
          childList: true,
          subtree: true
        });
        processImportMaps();
        processScriptsAndPreloads();

        if (document.readyState === 'complete') {
          readyStateCompleteCheck();
        } else {
          async function readyListener() {
            await initPromise;
            processImportMaps();

            if (document.readyState === 'complete') {
              readyStateCompleteCheck();
              document.removeEventListener('readystatechange', readyListener);
            }
          }

          document.addEventListener('readystatechange', readyListener);
        }
      }
    }

    return undefined;
  });
  let importMapPromise = initPromise;
  let firstPolyfillLoad = true;
  let acceptingImportMaps = true;

  async function topLevelLoad(url, fetchOpts, source, nativelyLoaded, lastStaticLoadPromise) {
    if (!shimMode) acceptingImportMaps = false;
    await importMapPromise;
    if (importHook) await importHook(url, typeof fetchOpts !== 'string' ? fetchOpts : {}, ''); // early analysis opt-out - no need to even fetch if we have feature support

    if (!shimMode && baselinePassthrough) {
      // for polyfill case, only dynamic import needs a return value here, and dynamic import will never pass nativelyLoaded
      if (nativelyLoaded) return null;
      await lastStaticLoadPromise;
      return dynamicImport(source ? createBlob(source) : url, {
        errUrl: url || source
      });
    }

    const load = getOrCreateLoad(url, fetchOpts, null, source);
    const seen = {};
    await loadAll(load, seen);
    lastLoad = undefined;
    resolveDeps(load, seen);
    await lastStaticLoadPromise;

    if (source && !shimMode && !load.n && !false) {
      const module = await dynamicImport(createBlob(source), {
        errUrl: source
      });
      if (revokeBlobURLs) revokeObjectURLs(Object.keys(seen));
      return module;
    }

    if (firstPolyfillLoad && !shimMode && load.n && nativelyLoaded) {
      onpolyfill();
      firstPolyfillLoad = false;
    }

    const module = await dynamicImport(!shimMode && !load.n && nativelyLoaded ? load.u : load.b, {
      errUrl: load.u
    }); // if the top-level load is a shell, run its update function

    if (load.s) (await dynamicImport(load.s)).u$_(module);
    if (revokeBlobURLs) revokeObjectURLs(Object.keys(seen)); // when tla is supported, this should return the tla promise as an actual handle
    // so readystate can still correspond to the sync subgraph exec completions

    return module;
  }

  function revokeObjectURLs(registryKeys) {
    let batch = 0;
    const keysLength = registryKeys.length;
    const schedule = self.requestIdleCallback ? self.requestIdleCallback : self.requestAnimationFrame;
    schedule(cleanup);

    function cleanup() {
      const batchStartIndex = batch * 100;
      if (batchStartIndex > keysLength) return;

      for (const key of registryKeys.slice(batchStartIndex, batchStartIndex + 100)) {
        const load = registry[key];
        if (load) URL.revokeObjectURL(load.b);
      }

      batch++;
      schedule(cleanup);
    }
  }

  function urlJsString(url) {
    return `'${url.replace(/'/g, "\\'")}'`;
  }

  let lastLoad;

  function resolveDeps(load, seen) {
    if (load.b || !seen[load.u]) return;
    seen[load.u] = 0;

    for (const dep of load.d) resolveDeps(dep, seen);

    const [imports] = load.a; // "execution"

    const source = load.S; // edge doesnt execute sibling in order, so we fix this up by ensuring all previous executions are explicit dependencies

    let resolvedSource = edge && lastLoad ? `import '${lastLoad}';` : '';

    if (!imports.length) {
      resolvedSource += source;
    } else {
      // once all deps have loaded we can inline the dependency resolution blobs
      // and define this blob
      let lastIndex = 0,
          depIndex = 0,
          dynamicImportEndStack = [];

      function pushStringTo(originalIndex) {
        while (dynamicImportEndStack[dynamicImportEndStack.length - 1] < originalIndex) {
          const dynamicImportEnd = dynamicImportEndStack.pop();
          resolvedSource += `${source.slice(lastIndex, dynamicImportEnd)}, ${urlJsString(load.r)}`;
          lastIndex = dynamicImportEnd;
        }

        resolvedSource += source.slice(lastIndex, originalIndex);
        lastIndex = originalIndex;
      }

      for (const {
        s: start,
        ss: statementStart,
        se: statementEnd,
        d: dynamicImportIndex
      } of imports) {
        // dependency source replacements
        if (dynamicImportIndex === -1) {
          let depLoad = load.d[depIndex++],
              blobUrl = depLoad.b,
              cycleShell = !blobUrl;

          if (cycleShell) {
            // circular shell creation
            if (!(blobUrl = depLoad.s)) {
              blobUrl = depLoad.s = createBlob(`export function u$_(m){${depLoad.a[1].map(name => name === 'default' ? `d$_=m.default` : `${name}=m.${name}`).join(',')}}${depLoad.a[1].map(name => name === 'default' ? `let d$_;export{d$_ as default}` : `export let ${name}`).join(';')}\n//# sourceURL=${depLoad.r}?cycle`);
            }
          }

          pushStringTo(start - 1);
          resolvedSource += `/*${source.slice(start - 1, statementEnd)}*/${urlJsString(blobUrl)}`; // circular shell execution

          if (!cycleShell && depLoad.s) {
            resolvedSource += `;import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${depLoad.s}';u$_${depIndex}(m$_${depIndex})`;
            depLoad.s = undefined;
          }

          lastIndex = statementEnd;
        } // import.meta
        else if (dynamicImportIndex === -2) {
          load.m = {
            url: load.r,
            resolve: metaResolve
          };
          metaHook(load.m, load.u);
          pushStringTo(start);
          resolvedSource += `importShim._r[${urlJsString(load.u)}].m`;
          lastIndex = statementEnd;
        } // dynamic import
        else {
          pushStringTo(statementStart + 6);
          resolvedSource += `Shim(`;
          dynamicImportEndStack.push(statementEnd - 1);
          lastIndex = start;
        }
      }

      pushStringTo(source.length);
    }

    let hasSourceURL = false;
    resolvedSource = resolvedSource.replace(sourceMapURLRegEx, (match, isMapping, url) => (hasSourceURL = !isMapping, match.replace(url, () => new URL(url, load.r))));
    if (!hasSourceURL) resolvedSource += '\n//# sourceURL=' + load.r;
    load.b = lastLoad = createBlob(resolvedSource);
    load.S = undefined;
  } // ; and // trailer support added for Ruby on Rails 7 source maps compatibility
  // https://github.com/guybedford/es-module-shims/issues/228


  const sourceMapURLRegEx = /\n\/\/# source(Mapping)?URL=([^\n]+)\s*((;|\/\/[^#][^\n]*)\s*)*$/;
  const jsContentType = /^(text|application)\/(x-)?javascript(;|$)/;
  const jsonContentType = /^(text|application)\/json(;|$)/;
  const cssContentType = /^(text|application)\/css(;|$)/;
  const cssUrlRegEx = /url\(\s*(?:(["'])((?:\\.|[^\n\\"'])+)\1|((?:\\.|[^\s,"'()\\])+))\s*\)/g; // restrict in-flight fetches to a pool of 100

  let p = [];
  let c = 0;

  function pushFetchPool() {
    if (++c > 100) return new Promise(r => p.push(r));
  }

  function popFetchPool() {
    c--;
    if (p.length) p.shift()();
  }

  async function doFetch(url, fetchOpts, parent) {
    if (enforceIntegrity && !fetchOpts.integrity) throw Error(`No integrity for ${url}${fromParent(parent)}.`);
    const poolQueue = pushFetchPool();
    if (poolQueue) await poolQueue;

    try {
      var res = await fetchHook(url, fetchOpts);
    } catch (e) {
      e.message = `Unable to fetch ${url}${fromParent(parent)} - see network log for details.\n` + e.message;
      throw e;
    } finally {
      popFetchPool();
    }

    if (!res.ok) throw Error(`${res.status} ${res.statusText} ${res.url}${fromParent(parent)}`);
    return res;
  }

  async function fetchModule(url, fetchOpts, parent) {
    const res = await doFetch(url, fetchOpts, parent);
    const contentType = res.headers.get('content-type');
    if (jsContentType.test(contentType)) return {
      r: res.url,
      s: await res.text(),
      t: 'js'
    };else if (jsonContentType.test(contentType)) return {
      r: res.url,
      s: `export default ${await res.text()}`,
      t: 'json'
    };else if (cssContentType.test(contentType)) {
      return {
        r: res.url,
        s: `var s=new CSSStyleSheet();s.replaceSync(${JSON.stringify((await res.text()).replace(cssUrlRegEx, (_match, quotes = '', relUrl1, relUrl2) => `url(${quotes}${resolveUrl(relUrl1 || relUrl2, url)}${quotes})`))});export default s;`,
        t: 'css'
      };
    } else throw Error(`Unsupported Content-Type "${contentType}" loading ${url}${fromParent(parent)}. Modules must be served with a valid MIME type like application/javascript.`);
  }

  function getOrCreateLoad(url, fetchOpts, parent, source) {
    let load = registry[url];
    if (load && !source) return load;
    load = {
      // url
      u: url,
      // response url
      r: source ? url : undefined,
      // fetchPromise
      f: undefined,
      // source
      S: undefined,
      // linkPromise
      L: undefined,
      // analysis
      a: undefined,
      // deps
      d: undefined,
      // blobUrl
      b: undefined,
      // shellUrl
      s: undefined,
      // needsShim
      n: false,
      // type
      t: null,
      // meta
      m: null
    };

    if (registry[url]) {
      let i = 0;

      while (registry[load.u + ++i]);

      load.u += i;
    }

    registry[load.u] = load;

    load.f = (async () => {
      if (!source) {
        // preload fetch options override fetch options (race)
        let t;
        ({
          r: load.r,
          s: source,
          t
        } = await (fetchCache[url] || fetchModule(url, fetchOpts, parent)));

        if (t && !shimMode) {
          if (t === 'css' && !cssModulesEnabled || t === 'json' && !jsonModulesEnabled) throw Error(`${t}-modules require <script type="esms-options">{ "polyfillEnable": ["${t}-modules"] }<${''}/script>`);
          if (t === 'css' && !supportsCssAssertions || t === 'json' && !supportsJsonAssertions) load.n = true;
        }
      }

      try {
        load.a = parse(source, load.u);
      } catch (e) {
        throwError(e);
        load.a = [[], [], false];
      }

      load.S = source;
      return load;
    })();

    load.L = load.f.then(async () => {
      let childFetchOpts = fetchOpts;
      load.d = (await Promise.all(load.a[0].map(async ({
        n,
        d
      }) => {
        if (d >= 0 && !supportsDynamicImport || d === -2 && !supportsImportMeta) load.n = true;
        if (d !== -1 || !n) return;
        const {
          r,
          b
        } = await resolve(n, load.r || load.u);
        if (b && (!supportsImportMaps || importMapSrcOrLazy)) load.n = true;
        if (skip && skip.test(r)) return {
          b: r
        };
        if (childFetchOpts.integrity) childFetchOpts = Object.assign({}, childFetchOpts, {
          integrity: undefined
        });
        return getOrCreateLoad(r, childFetchOpts, load.r).f;
      }))).filter(l => l);
    });
    return load;
  }

  function processScriptsAndPreloads() {
    for (const script of document.querySelectorAll(shimMode ? 'script[type=module-shim]' : 'script[type=module]')) processScript(script);

    for (const link of document.querySelectorAll(shimMode ? 'link[rel=modulepreload-shim]' : 'link[rel=modulepreload]')) processPreload(link);
  }

  function processImportMaps() {
    for (const script of document.querySelectorAll(shimMode ? 'script[type="importmap-shim"]' : 'script[type="importmap"]')) processImportMap(script);
  }

  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity) fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy) fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === 'use-credentials') fetchOpts.credentials = 'include';else if (script.crossorigin === 'anonymous') fetchOpts.credentials = 'omit';else fetchOpts.credentials = 'same-origin';
    return fetchOpts;
  }

  let lastStaticLoadPromise = Promise.resolve();
  let domContentLoadedCnt = 1;

  function domContentLoadedCheck() {
    if (--domContentLoadedCnt === 0 && !noLoadEventRetriggers) document.dispatchEvent(new Event('DOMContentLoaded'));
  } // this should always trigger because we assume es-module-shims is itself a domcontentloaded requirement


  if (hasDocument) {
    document.addEventListener('DOMContentLoaded', async () => {
      await initPromise;
      domContentLoadedCheck();

      if (shimMode || !baselinePassthrough) {
        processImportMaps();
        processScriptsAndPreloads();
      }
    });
  }

  let readyStateCompleteCnt = 1;

  function readyStateCompleteCheck() {
    if (--readyStateCompleteCnt === 0 && !noLoadEventRetriggers) document.dispatchEvent(new Event('readystatechange'));
  }

  function processImportMap(script) {
    if (script.ep) // ep marker = script processed
      return; // empty inline scripts sometimes show before domready

    if (!script.src && !script.innerHTML) return;
    script.ep = true; // we dont currently support multiple, external or dynamic imports maps in polyfill mode to match native

    if (script.src) {
      if (!shimMode) return;
      setImportMapSrcOrLazy();
    }

    if (acceptingImportMaps) {
      importMapPromise = importMapPromise.then(async () => {
        importMap = resolveAndComposeImportMap(script.src ? await (await doFetch(script.src, getFetchOpts(script))).json() : JSON.parse(script.innerHTML), script.src || baseUrl, importMap);
      }).catch(throwError);
      if (!shimMode) acceptingImportMaps = false;
    }
  }

  function processScript(script) {
    if (script.ep) // ep marker = script processed
      return;
    if (script.getAttribute('noshim') !== null) return; // empty inline scripts sometimes show before domready

    if (!script.src && !script.innerHTML) return;
    script.ep = true; // does this load block readystate complete

    const isBlockingReadyScript = script.getAttribute('async') === null && readyStateCompleteCnt > 0; // does this load block DOMContentLoaded

    const isDomContentLoadedScript = domContentLoadedCnt > 0;
    if (isBlockingReadyScript) readyStateCompleteCnt++;
    if (isDomContentLoadedScript) domContentLoadedCnt++;
    const loadPromise = topLevelLoad(script.src || baseUrl, getFetchOpts(script), !script.src && script.innerHTML, !shimMode, isBlockingReadyScript && lastStaticLoadPromise).catch(throwError);
    if (isBlockingReadyScript) lastStaticLoadPromise = loadPromise.then(readyStateCompleteCheck);
    if (isDomContentLoadedScript) loadPromise.then(domContentLoadedCheck);
  }

  const fetchCache = {};

  function processPreload(link) {
    if (link.ep) // ep marker = processed
      return;
    link.ep = true;
    if (fetchCache[link.href]) return;
    fetchCache[link.href] = fetchModule(link.href, getFetchOpts(link));
  }
})();

var esModuleShims = {};

export default esModuleShims;
