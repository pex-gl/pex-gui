import { _ as _export, b as anObject } from './set-to-string-tag-9ca80194.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-82d063b8.js';

// https://github.com/tc39/proposal-iterator-helpers

var $forEach = asyncIteratorIteration.forEach;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers




_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  forEach: function forEach(fn) {
    iterate(anObject(this), fn, { IS_ITERATOR: true });
  }
});
