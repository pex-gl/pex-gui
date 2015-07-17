var isBrowser = require('is-browser');
var GUIControl = require('./GUIControl');
var SkiaRenderer = require('./SkiaRenderer');
var HTMLCanvasRenderer = require('./HTMLCanvasRenderer');
var Rect = require('pex-geom/Rect');

var VERT = '\
attribute vec4 aPosition; \
attribute vec2 aTexCoord0; \
uniform vec2 uWindowSize; \
uniform vec4 uRect; \
varying vec2 vTexCoord0; \
void main() { \
    vTexCoord0 = aTexCoord0; \
    vec2 pos = aPosition.xy * 0.5 + 0.5; \
    pos.y = 1.0 - pos.y; \
    pos.x = uRect.x + pos.x * (uRect.z - uRect.x); \
    pos.y = uRect.y + pos.y * (uRect.w - uRect.y); \
    pos.x /= uWindowSize.x; \
    pos.y /= uWindowSize.y; \
    pos.y = 1.0 - pos.y; \
    pos = (pos - 0.5) * 2.0; \
    gl_Position = vec4(pos, 0.0, 1.0); \
}';

var FRAG = '\
varying vec2 vTexCoord0; \
uniform sampler2D uTexture; \
void main() { \
    gl_FragColor = texture2D(uTexture, vTexCoord0); \
}';

if (isBrowser) {
    FRAG = 'precision highp float;\n' + FRAG;
}

function GUI(ctx, windowWidth, windowHeight) {
    this._ctx = ctx;
    this._windowWidth = windowWidth;
    this._windowHeight = windowHeight;
    this._windowSize = [windowWidth, windowHeight];
    this._textureRect = [0, 0, windowWidth, windowHeight];
    this._textureTmpRect = [0, 0, 0, 0];
    this.x = 0;
    this.y = 0;
    this.highdpi = 1;
    this.mousePos = [0, 0];
    this.scale = 1;

    this.rectProgram = ctx.createProgram(VERT, FRAG);
    this.rectMesh = ctx.createMesh([
        { data: [[-1,-1], [1,-1], [1, 1], [-1, 1]], location: ctx.ATTRIB_POSITION },
        { data: [[ 0, 1], [1, 1], [1, 0], [ 0, 0]], location: ctx.ATTRIB_TEX_COORD_0 }
    ],  { data: [[0, 1, 2], [0, 2, 3]] }
    );

    if (isBrowser) {
        this.renderer = new HTMLCanvasRenderer(ctx,windowWidth, windowHeight);
    }
    else {
        this.renderer = new SkiaRenderer(ctx, windowWidth, windowHeight);
    }

    this.screenBounds = [0, 0, windowWidth, windowHeight];

    this.items = [];
    this.enabled = true;
}

GUI.prototype.onMouseDown = function (e) {
  if (!this.enabled) return;

  this.items.forEach(function(item) {
    if (item.type == 'text') {
      if (item.focus) {
        item.focus = false;
        item.dirty = true;
      }
    }
  })

  this.activeControl = null;
  this.mousePos[0] = e.x / this.highdpi - this.x;
  this.mousePos[1] = e.y / this.highdpi - this.y;
  for (var i = 0; i < this.items.length; i++) {
    if (Rect.containsPoint(this.items[i].activeArea, this.mousePos)) {
      this.activeControl = this.items[i];
      var aa = this.activeControl.activeArea;
      var aaWidth  = aa[1][0] - aa[0][0];
      var aaHeight = aa[1][1] - aa[0][1];
      this.activeControl.active = true;
      this.activeControl.dirty = true;
      if (this.activeControl.type == 'button') {
        this.activeControl.contextObject[this.activeControl.methodName]();
      }
      else if (this.activeControl.type == 'toggle') {
        this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
      }
      else if (this.activeControl.type == 'radiolist') {
        var hitY = this.mousePos[1] - aa[0][1];
        var hitItemIndex = Math.floor(this.activeControl.items.length * hitY / aaHeight);
        if (hitItemIndex < 0)
          continue;
        if (hitItemIndex >= this.activeControl.items.length)
          continue;
        this.activeControl.contextObject[this.activeControl.attributeName] = this.activeControl.items[hitItemIndex].value;
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.items[hitItemIndex].value);
        }
      }
      else if (this.activeControl.type == 'texturelist') {
        var clickedItem = null;
        this.activeControl.items.forEach(function(item) {
          if (Rect.containsPoint(item.activeArea, this.mousePos)) {
            clickedItem = item;
          }
        }.bind(this))

        if (!clickedItem)
          continue;

        this.activeControl.contextObject[this.activeControl.attributeName] = clickedItem.value;
        if (this.activeControl.onchange) {
          this.activeControl.onchange(clickedItem.value);
        }
      }
      else if (this.activeControl.type == 'color') {
        var numSliders = this.activeControl.options.alpha ? 4 : 3;
        var slidersHeight = aaHeight;
        if (this.activeControl.options.palette) {
          var iw = this.activeControl.options.paletteImage.width;
          var ih = this.activeControl.options.paletteImage.height;
          var y = e.y / this.highdpi - aa[0][1];
          slidersHeight = aaHeight - aaWidth * ih / iw;
          var imageDisplayHeight = aaWidth * ih / iw;
          var imageStartY = aaHeight - imageDisplayHeight;

          if (y > imageStartY) {
            var u = (e.x /this.highdpi - aa[0][0]) / aaWidth;
            var v = (y - imageStartY) / imageDisplayHeight;
            var x = Math.floor(iw * u);
            var y = Math.floor(ih * v);
            var color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y);
            this.activeControl.dirty = true;

            this.activeControl.contextObject[this.activeControl.attributeName][0] = color[0];
            this.activeControl.contextObject[this.activeControl.attributeName][1] = color[1];
            this.activeControl.contextObject[this.activeControl.attributeName][2] = color[2];
            if (this.activeControl.onchange) {
              this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
            }
            continue;
          }
        }
      }
      else if (this.activeControl.type == 'text') {
        this.activeControl.focus = true;
      }
      e.handled = true;
      this.onMouseDrag(e);
      break;
    }
  }
};

GUI.prototype.onMouseDrag = function (e) {
  if (!this.enabled) return;

  if (this.activeControl) {
    var aa = this.activeControl.activeArea;
    var aaWidth  = aa[1][0] - aa[0][0];
    var aaHeight = aa[1][1] - aa[0][1];
    if (this.activeControl.type == 'slider') {
      var val = (e.x / this.highdpi - aa[0][0]) / aaWidth;
      val = Math.max(0, Math.min(val, 1));
      this.activeControl.setNormalizedValue(val);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'multislider') {
      var val = (e.x / this.highdpi - aa[0][0]) / aaWidth;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(this.activeControl.getValue().length * (e.y / this.highdpi - aa[0][1]) / aaHeight);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'color') {
      var numSliders = this.activeControl.options.alpha ? 4 : 3;
      var slidersHeight = aaHeight;
      if (this.activeControl.options.palette) {
        var iw = this.activeControl.options.paletteImage.width;
        var ih = this.activeControl.options.paletteImage.height;
        var y = e.y / this.highdpi - aa[0][1];
        slidersHeight = aaHeight - aaWidth * ih / iw;
        var imageDisplayHeight = aaWidth * ih / iw;
        var imageStartY = aaHeight - imageDisplayHeight;
        if (y > imageStartY && isNaN(this.activeControl.clickedSlider)) {
            var u = (e.x /this.highdpi - aa[0][0]) / aaWidth;
            var v = (y - imageStartY) / imageDisplayHeight;
            var x = Math.floor(iw * u);
            var y = Math.floor(ih * v);
            var color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y);
            this.activeControl.dirty = true;
            this.activeControl.contextObject[this.activeControl.attributeName][0] = color[0];
            this.activeControl.contextObject[this.activeControl.attributeName][1] = color[1];
            this.activeControl.contextObject[this.activeControl.attributeName][2] = color[2];
            if (this.activeControl.onchange) {
              this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
            }
            e.handled = true;
            return;
          }
      }

      var val = (e.x / this.highdpi - aa[0][0]) / aaWidth;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(numSliders * (e.y / this.highdpi - aa[0][1]) / slidersHeight);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    e.handled = true;
  }
};

GUI.prototype.onMouseUp = function (e) {
  if (!this.enabled) return;

  if (this.activeControl) {
    this.activeControl.active = false;
    this.activeControl.dirty = true;
    this.activeControl.clickedSlider = undefined;
    this.activeControl = null;
  }
};

GUI.prototype.onKeyDown = function (e) {
  if (e.handled) return;
  var focusedItem = this.items.filter(function(item) { return item.type == 'text' && item.focus})[0];
  if (focusedItem) {
    e.handled = true;
    var c = e.str.charCodeAt(0);
    if (c >= 32 && c <= 126) {
      focusedItem.contextObject[focusedItem.attributeName] += e.str;
      focusedItem.dirty = true;
      if (focusedItem.onchange) {
        focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName]);
      }
    }
    else {
      switch(e.keyCode) {
        case VK_BACKSPACE:
          var str = focusedItem.contextObject[focusedItem.attributeName];
          focusedItem.contextObject[focusedItem.attributeName] = str.substr(0, Math.max(0, str.length-1));
          focusedItem.dirty = true;
          if (focusedItem.onchange) {
            focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName]);
          }
          break;
      }
    }
    e.handled = true;
  }
}

GUI.prototype.addHeader = function (title) {
  var ctrl = new GUIControl({
    type: 'header',
    title: title,
    dirty: true,
    activeArea: [[0, 0], [0, 0]],
    setTitle: function (title) {
      this.title = title;
      this.dirty = true;
    }
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addSeparator = function (title) {
  var ctrl = new GUIControl({
    type: 'separator',
    dirty: true,
    activeArea: [[0, 0], [0, 0]]
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addLabel = function (title) {
  var ctrl = new GUIControl({
    type: 'label',
    title: title,
    dirty: true,
    activeArea: [[0, 0], [0, 0]],
    setTitle: function (title) {
      this.title = title;
      this.dirty = true;
    }
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addParam = function (title, contextObject, attributeName, options, onchange) {
    options = options || {};
    if (typeof(options.min) == 'undefined') options.min = 0;
    if (typeof(options.max) == 'undefined') options.max = 1;
    if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
        var ctrl = new GUIControl({
            type: 'toggle',
            title: title,
            contextObject: contextObject,
            attributeName: attributeName,
            activeArea: [[0, 0], [0, 0]],
            options: options,
            onchange: onchange,
            dirty: true
        });
        this.items.push(ctrl);
        return ctrl;
    }
    else if (!isNaN(contextObject[attributeName])) {
        var ctrl = new GUIControl({
            type: 'slider',
            title: title,
            contextObject: contextObject,
            attributeName: attributeName,
            activeArea: [[0, 0], [0, 0]],
            options: options,
            onchange: onchange,
            dirty: true
        });
        this.items.push(ctrl);
        return ctrl;
    }
    else if ((contextObject[attributeName] instanceof Array) && (options && options.type == 'color')) {
        var ctrl = new GUIControl({
            type: 'color',
            title: title,
            contextObject: contextObject,
            attributeName: attributeName,
            activeArea: [[0, 0], [0, 0]],
            options: options,
            onchange: onchange,
            dirty: true
        });
        this.items.push(ctrl);
        return ctrl;
    }
    else if (contextObject[attributeName] instanceof Array) {
        var ctrl = new GUIControl({
            type: 'multislider',
            title: title,
            contextObject: contextObject,
            attributeName: attributeName,
            activeArea: [[0, 0], [0, 0]],
            options: options,
            onchange: onchange,
            dirty: true
        });
        this.items.push(ctrl);
        return ctrl;
    }
    else if (typeof contextObject[attributeName] == 'string') {
        var ctrl = new GUIControl({
            type: 'text',
            title: title,
            contextObject: contextObject,
            attributeName: attributeName,
            activeArea: [[0, 0], [0, 0]],
            options: options,
            onchange: onchange,
            dirty: true
        });
        this.items.push(ctrl);
        return ctrl;
    }
};

GUI.prototype.addButton = function (title, contextObject, methodName, options) {
    var ctrl = new GUIControl({
        type: 'button',
        title: title,
        contextObject: contextObject,
        methodName: methodName,
        activeArea: [[0, 0], [0, 0]],
        dirty: true,
        options: options || {}
    });
    this.items.push(ctrl);
    return ctrl;
};

GUI.prototype.addRadioList = function (title, contextObject, attributeName, items, onchange) {
    var ctrl = new GUIControl({
        type: 'radiolist',
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: [[0, 0], [0, 0]],
        items: items,
        onchange: onchange,
        dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
};

GUI.prototype.addTexture2DList = function (title, contextObject, attributeName, items, itemsPerRow, onchange) {
    var ctrl = new GUIControl({
        type: 'texturelist',
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: [[0, 0], [0, 0]],
        items: items,
        itemsPerRow: itemsPerRow || 4,
        onchange: onchange,
        dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
};

GUI.prototype.addTexture2D = function (title, texture) {
    var ctrl = new GUIControl({
        type: 'texture2D',
        title: title,
        texture: texture,
        activeArea: [[0, 0], [0, 0]],
        dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
};

GUI.prototype.dispose = function () {
};

GUI.prototype.draw = function () {
    if (!this.enabled) {
        return;
    }

    if (this.items.length === 0) {
        return;
    }
    this.renderer.draw(this.items, this.scale);

    var ctx = this._ctx;

    ctx.pushState(ctx.DEPTH_BIT | ctx.BLEND_BIT);
    ctx.setDepthTest(false);
    ctx.setBlend(true);
    ctx.setBlendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
    ctx.bindProgram(this.rectProgram);
    this.rectProgram.setUniform('uTexture', 0);
    this.rectProgram.setUniform('uWindowSize', this._windowSize);
    this.rectProgram.setUniform('uRect', this._textureRect);
    ctx.bindMesh(this.rectMesh);
    ctx.bindTexture(this.renderer.getTexture())
    ctx.drawMesh();
    this.drawTextures();
    ctx.popState(ctx.DEPTH_BIT | ctx.BLEND_BIT);
};

GUI.prototype.drawTextures = function () {
    var ctx = this._ctx;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    var scale = this.scale * this.highdpi;
    if (item.type == 'texture2D') {
      var bounds = [item.activeArea[0][0] * scale, item.activeArea[0][1] * scale, item.activeArea[1][0] * scale, item.activeArea[1][1] * scale];
      ctx.bindTexture(item.texture);
      this.rectProgram.setUniform('uRect', bounds);
      ctx.drawMesh();
    }
    if (item.type == 'texturelist') {
      item.items.forEach(function(textureItem) {
        var bounds = [textureItem.activeArea[0][0] * scale, textureItem.activeArea[0][1] * scale, textureItem.activeArea[1][0] * scale, textureItem.activeArea[1][1] * scale];
        this.rectProgram.setUniform('uRect', bounds);
        ctx.bindTexture(textureItem.texture);
        ctx.drawMesh();
      }.bind(this));
    }
  }
  //this.screenImage.setBounds(this.screenBounds);
  //this.screenImage.setImage(this.renderer.getTexture());
};

GUI.prototype.serialize = function () {
  var data = {};
  this.items.forEach(function (item, i) {
    data[item.title] = item.getSerializedValue();
  });
  return data;
};

GUI.prototype.deserialize = function (data) {
  this.items.forEach(function (item, i) {
    if (data[item.title] !== undefined) {
      item.setSerializedValue(data[item.title]);
      item.dirty = true;
    }
  });
};

GUI.prototype.save = function (path) {
  var data = this.serialize();
  IO.saveTextFile(path, JSON.stringify(data));
};

GUI.prototype.load = function (path, callback) {
  var self = this;
  IO.loadTextFile(path, function (dataStr) {
    var data = JSON.parse(dataStr);
    self.deserialize(data);
    if (callback) {
      callback();
    }
  });
};

GUI.prototype.setEnabled = function(state) {
  this.enabled = state;
}

GUI.prototype.isEnabled = function() {
  return this.enabled;
}

GUI.prototype.toggleEnabled = function() {
  return this.enabled = !this.enabled;
}

module.exports = GUI;
