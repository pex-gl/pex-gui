import { _ as _export, b as anObject, c as aCallable } from './web.dom-collections.iterator-e8ac2628.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-f07d9ec5.js';

// https://github.com/tc39/proposal-iterator-helpers

var $find = asyncIteratorIteration.find;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    return $find(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers





_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    anObject(this);
    aCallable(fn);
    return iterate(this, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});
