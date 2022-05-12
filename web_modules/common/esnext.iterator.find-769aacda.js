import { _ as _export, b as anObject, c as aCallable } from './set-to-string-tag-9ca80194.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-82d063b8.js';

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
