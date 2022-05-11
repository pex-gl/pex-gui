import { C as functionBindNative, w as wellKnownSymbol, b as global_1, x as classofRaw, i as isCallable, a as anObject, y as getMethod, f as functionCall, r as redefine, H as sharedStore, l as objectGetPrototypeOf, g as getBuiltIn, q as internalState, c as aCallable, h as objectCreate, m as createNonEnumerableProperty, _ as _export, F as iteratorsCore } from './set-to-string-tag-75893d8e.js';

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var Object$1 = global_1.Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object$1(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

var String$1 = global_1.String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String$1(argument);
};

var iteratorClose = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = functionCall(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

var redefineAll = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');
var AsyncIterator = global_1.AsyncIterator;
var PassedAsyncIteratorPrototype = sharedStore.AsyncIteratorPrototype;
var AsyncIteratorPrototype, prototype;

if (PassedAsyncIteratorPrototype) {
  AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
} else if (isCallable(AsyncIterator)) {
  AsyncIteratorPrototype = AsyncIterator.prototype;
} else if (sharedStore[USE_FUNCTION_CONSTRUCTOR] || global_1[USE_FUNCTION_CONSTRUCTOR]) {
  try {
    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
    prototype = objectGetPrototypeOf(objectGetPrototypeOf(objectGetPrototypeOf(Function('return async function*(){}()')())));
    if (objectGetPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
  } catch (error) { /* empty */ }
}

if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};

if (!isCallable(AsyncIteratorPrototype[ASYNC_ITERATOR])) {
  redefine(AsyncIteratorPrototype, ASYNC_ITERATOR, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype;

var Promise = getBuiltIn('Promise');

var ASYNC_ITERATOR_PROXY = 'AsyncIteratorProxy';
var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(ASYNC_ITERATOR_PROXY);

var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(state) {
    state.type = ASYNC_ITERATOR_PROXY;
    state.next = aCallable(state.iterator.next);
    state.done = false;
    state.ignoreArgument = !IS_ITERATOR;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = redefineAll(objectCreate(asyncIteratorPrototype), {
    next: function next(arg) {
      var that = this;
      var hasArgument = !!arguments.length;
      return new Promise(function (resolve) {
        var state = getInternalState(that);
        var args = hasArgument ? [state.ignoreArgument ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
        state.ignoreArgument = false;
        resolve(state.done ? { done: true, value: undefined } : anObject(functionCall(nextHandler, state, Promise, args)));
      });
    },
    'return': function (value) {
      var that = this;
      return new Promise(function (resolve, reject) {
        var state = getInternalState(that);
        var iterator = state.iterator;
        state.done = true;
        var $$return = getMethod(iterator, 'return');
        if ($$return === undefined) return resolve({ done: true, value: value });
        Promise.resolve(functionCall($$return, iterator, value)).then(function (result) {
          anObject(result);
          resolve({ done: true, value: value });
        }, reject);
      });
    },
    'throw': function (value) {
      var that = this;
      return new Promise(function (resolve, reject) {
        var state = getInternalState(that);
        var iterator = state.iterator;
        state.done = true;
        var $$throw = getMethod(iterator, 'throw');
        if ($$throw === undefined) return reject(value);
        resolve(functionCall($$throw, iterator, value));
      });
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(AsyncIteratorProxy.prototype, TO_STRING_TAG$2, 'Generator');
  }

  return AsyncIteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers






var AsyncIteratorProxy = asyncIteratorCreateProxy(function (Promise, args) {
  var state = this;
  var mapper = state.mapper;

  return Promise.resolve(anObject(functionApply(state.next, state.iterator, args))).then(function (step) {
    if (anObject(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(mapper(step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      mapper: aCallable(mapper)
    });
  }
});

var IteratorPrototype = iteratorsCore.IteratorPrototype;

var ITERATOR_PROXY = 'IteratorProxy';
var setInternalState$1 = internalState.set;
var getInternalState$1 = internalState.getterFor(ITERATOR_PROXY);

var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(state) {
    state.type = ITERATOR_PROXY;
    state.next = aCallable(state.iterator.next);
    state.done = false;
    state.ignoreArg = !IS_ITERATOR;
    setInternalState$1(this, state);
  };

  IteratorProxy.prototype = redefineAll(objectCreate(IteratorPrototype), {
    next: function next(arg) {
      var state = getInternalState$1(this);
      var args = arguments.length ? [state.ignoreArg ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
      state.ignoreArg = false;
      var result = state.done ? undefined : functionCall(nextHandler, state, args);
      return { done: state.done, value: result };
    },
    'return': function (value) {
      var state = getInternalState$1(this);
      var iterator = state.iterator;
      state.done = true;
      var $$return = getMethod(iterator, 'return');
      return { done: true, value: $$return ? anObject(functionCall($$return, iterator, value)).value : value };
    },
    'throw': function (value) {
      var state = getInternalState$1(this);
      var iterator = state.iterator;
      state.done = true;
      var $$throw = getMethod(iterator, 'throw');
      if ($$throw) return functionCall($$throw, iterator, value);
      throw value;
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(IteratorProxy.prototype, TO_STRING_TAG$3, 'Generator');
  }

  return IteratorProxy;
};

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

// https://github.com/tc39/proposal-iterator-helpers







var IteratorProxy = iteratorCreateProxy(function (args) {
  var iterator = this.iterator;
  var result = anObject(functionApply(this.next, iterator, args));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, result.value);
});

_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  map: function map(mapper) {
    return new IteratorProxy({
      iterator: anObject(this),
      mapper: aCallable(mapper)
    });
  }
});

export { asyncIteratorCreateProxy as a, iteratorCreateProxy as b, classof as c, callWithSafeIterationClosing as d, functionApply as f, iteratorClose as i, redefineAll as r, toString_1 as t };
