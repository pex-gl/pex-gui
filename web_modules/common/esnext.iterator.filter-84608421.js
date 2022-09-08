import { f as fails, _ as _export, a as addToUnscopables, b as arrayIncludes, d as aCallable, e as anObject, g as functionCall } from './web.dom-collections.iterator-24f03f52.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-92e3ab69.js';
import { g as getIteratorDirect, a as asyncIteratorCreateProxy, b as asyncIteratorClose, i as iteratorCreateProxy, c as callWithSafeIterationClosing } from './esnext.iterator.map-7321cf9a.js';

var $includes = arrayIncludes.includes;



// FF99+ bug
var BROKEN_ON_SPARSE = fails(function () {
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
_export({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

// https://github.com/tc39/proposal-iterator-helpers

var $some = asyncIteratorIteration.some;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  some: function some(fn) {
    return $some(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers





_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  some: function some(fn) {
    var record = getIteratorDirect(this);
    aCallable(fn);
    return iterate(record, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers








var AsyncIteratorProxy = asyncIteratorCreateProxy(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var filterer = state.filterer;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      asyncIteratorClose(iterator, doneAndReject, error, doneAndReject);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject(functionCall(state.next, iterator))).then(function (step) {
          try {
            if (anObject(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              var value = step.value;
              try {
                Promise.resolve(filterer(value)).then(function (selected) {
                  selected ? resolve({ done: false, value: value }) : loop();
                }, ifAbruptCloseAsyncIterator);
              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
            }
          } catch (error2) { doneAndReject(error2); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    loop();
  });
});

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  filter: function filter(filterer) {
    return new AsyncIteratorProxy(getIteratorDirect(this), {
      filterer: aCallable(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers








var IteratorProxy = iteratorCreateProxy(function () {
  var iterator = this.iterator;
  var filterer = this.filterer;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject(functionCall(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing(iterator, filterer, value)) return value;
  }
});

_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  filter: function filter(filterer) {
    return new IteratorProxy(getIteratorDirect(this), {
      filterer: aCallable(filterer)
    });
  }
});
