function GUIControl(o) {
  for (var i in o) {
    this[i] = o[i];
  }
}

GUIControl.prototype.setPosition = function(x, y) {
  this.px = x;
  this.py = y;
};

GUIControl.prototype.getNormalizedValue = function(idx) {
  if (!this.contextObject) {
    return 0;
  }

  var val = this.contextObject[this.attributeName];
  var options = this.options;
  if (options && options.min !== undefined && options.max !== undefined) {
    if (this.type == 'multislider') {
      val = (val[idx] - options.min) / (options.max - options.min);
    }
    else if (this.type == 'color') {
      var hsla = val.getHSL();
      if (idx == 0) val = hsla.h;
      if (idx == 1) val = hsla.s;
      if (idx == 2) val = hsla.l;
      if (idx == 3) val = hsla.a;
      console.log(idx, val);
    }
    else {
      val = (val - options.min) / (options.max - options.min);
    }
  }
  return val;
};

GUIControl.prototype.setNormalizedValue = function(val, idx) {
  if (!this.contextObject) {
    return;
  }

  var options = this.options;
  if (options && options.min !== undefined && options.max !== undefined) {
    if (this.type == 'multislider') {
      var a = this.contextObject[this.attributeName];
      if (idx >= a.length) {
        return;
      }
      a[idx] = options.min + val * (options.max - options.min);
      val = a;
    }
    if (this.type == 'color') {
      var c = this.contextObject[this.attributeName];
      var hsla = c.getHSL();
      if (idx == 0) hsla.h = val;
      if (idx == 1) hsla.s = val;
      if (idx == 2) hsla.l = val;
      if (idx == 3) hsla.a = val;
      c.setHSL(hsla.h, hsla.s, hsla.l, hsla.a);
      val = c;
    }
    else {
      val = options.min + val * (options.max - options.min);
    }
    if (options && options.step) {
      val = val - val % options.step;
    }
  }
  this.contextObject[this.attributeName] = val;
};

GUIControl.prototype.getValue = function() {
  if (this.type == 'slider') {
    return this.contextObject[this.attributeName];
  }
  else if (this.type == 'multislider') {
    return this.contextObject[this.attributeName];
  }
  else if (this.type == 'color') {
    return this.contextObject[this.attributeName];
  }
  else if (this.type == 'toggle') {
    return this.contextObject[this.attributeName];
  }
  else {
    return 0;
  }
};

GUIControl.prototype.getStrValue = function() {
  if (this.type == 'slider') {
    var str = '' + this.contextObject[this.attributeName];
    var dotPos = str.indexOf('.') + 1;
    if (dotPos === 0) {
      return str + '.0';
    }
    while (str.charAt(dotPos) == '0') {
      dotPos++;
    }
    return str.substr(0, dotPos + 2);
  }
  else if (this.type == 'color') {
    return 'HSLA';
  }
  else if (this.type == 'toggle') {
    return this.contextObject[this.attributeName];
  }
  else {
    return '';
  }
};

module.exports = GUIControl;
GUIControl;