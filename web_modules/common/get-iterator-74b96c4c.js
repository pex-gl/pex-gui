import { o as objectSetPrototypeOf, i as isCallable, A as isObject, m as createNonEnumerableProperty, d as functionUncurryThis, n as fails, j as createPropertyDescriptor, g as getBuiltIn, B as hasOwnProperty_1, k as objectIsPrototypeOf, e as copyConstructorProperties, b as global_1, _ as _export, C as functionBindNative, c as aCallable, w as wellKnownSymbol, D as iterators, y as getMethod, a as anObject, f as functionCall, E as tryToString } from './set-to-string-tag-75893d8e.js';
import { t as toString_1, f as functionApply, c as classof } from './esnext.iterator.map-f17cc22a.js';

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var normalizeStringArgument = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString_1(argument);
};

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause = function (O, options) {
  if (isObject(options) && 'cause' in options) {
    createNonEnumerableProperty(O, 'cause', options.cause);
  }
};

var replace = functionUncurryThis(''.replace);

var TEST = (function (arg) { return String(Error(arg).stack); })('zxcasd');
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

var clearErrorStack = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string') {
    while (dropEntries--) stack = replace(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};

var errorStackInstallable = !fails(function () {
  var error = Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
  return error.stack !== 7;
});

var wrapErrorConstructorWithCause = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if ( hasOwnProperty_1(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty(result, 'message', message);
    if (errorStackInstallable) createNonEnumerableProperty(result, 'stack', clearErrorStack(result.stack, 2));
    if (this && objectIsPrototypeOf(OriginalErrorPrototype, this)) inheritIfRequired(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (objectSetPrototypeOf) objectSetPrototypeOf(WrappedError, BaseError);
    else copyConstructorProperties(WrappedError, BaseError, { name: true });
  }

  copyConstructorProperties(WrappedError, OriginalError);

  try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};

/* eslint-disable no-unused-vars -- required for functions `.length` */





var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = global_1[WEB_ASSEMBLY];

var FORCED = Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED);
  _export({ global: true, forced: FORCED }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED);
    _export({ target: WEB_ASSEMBLY, stat: true, forced: FORCED }, O);
  }
};

// https://github.com/tc39/proposal-error-cause
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return functionApply(init, this, arguments); };
});

var TypeError = global_1.TypeError;

var anInstance = function (it, Prototype) {
  if (objectIsPrototypeOf(Prototype, it)) return it;
  throw TypeError('Incorrect invocation');
};

var bind = functionUncurryThis(functionUncurryThis.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : functionBindNative ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

var ITERATOR$1 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return getMethod(it, ITERATOR$1)
    || getMethod(it, '@@iterator')
    || iterators[classof(it)];
};

var TypeError$1 = global_1.TypeError;

var getIterator = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(functionCall(iteratorMethod, argument));
  throw TypeError$1(tryToString(argument) + ' is not iterable');
};

export { anInstance as a, getIteratorMethod as b, clearErrorStack as c, isArrayIteratorMethod as d, errorStackInstallable as e, functionBindContext as f, getIterator as g, inheritIfRequired as h, installErrorCause as i, normalizeStringArgument as n, wrapErrorConstructorWithCause as w };
