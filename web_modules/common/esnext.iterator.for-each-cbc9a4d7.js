import { _ as _export } from './web.dom-collections.iterator-24f03f52.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-92e3ab69.js';
import { g as getIteratorDirect } from './esnext.iterator.map-7321cf9a.js';

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
    iterate(getIteratorDirect(this), fn, { IS_RECORD: true });
  }
});
