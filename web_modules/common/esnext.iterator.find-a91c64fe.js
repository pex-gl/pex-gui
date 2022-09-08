import { _ as _export, d as aCallable } from './web.dom-collections.iterator-24f03f52.js';
import { a as asyncIteratorIteration, i as iterate } from './iterate-92e3ab69.js';
import { g as getIteratorDirect } from './esnext.iterator.map-7321cf9a.js';

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
    var record = getIteratorDirect(this);
    aCallable(fn);
    return iterate(record, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});
