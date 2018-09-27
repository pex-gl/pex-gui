const isPlask = require('is-plask')
const GUIControl = require('./GUIControl')
const Renderer = isPlask ? require('./SkiaRenderer') : require('./HTMLCanvasRenderer')
const Rect = require('pex-geom/Rect')
const Time = require('pex-sys/Time')

const keyboardPolyfill = require('keyboardevent-key-polyfill')
// const Signal = require('signals')

const VERT = `
attribute vec2 aPosition;
attribute vec2 aTexCoord0;
uniform vec4 uViewport;
uniform vec4 uRect;
varying vec2 vTexCoord0;
void main() {
  vTexCoord0 = vec2(aTexCoord0.x, 1.0 - aTexCoord0.y);
  vec2 vertexPos = aPosition * 0.5 + 0.5;

  vec2 pos = vec2(0.0, 0.0); // window pos
  vec2 windowSize = vec2(uViewport.z - uViewport.x, uViewport.w - uViewport.y);
  pos.x = uRect.x / windowSize.x + vertexPos.x * (uRect.z - uRect.x) / windowSize.x;
  pos.y = uRect.y / windowSize.y + vertexPos.y * (uRect.w - uRect.y) / windowSize.y;
  pos.y = 1.0 - pos.y;
  pos = pos * 2.0 - 1.0;

  gl_Position = vec4(pos, 0.0, 1.0);
}`

const DECODE_ENCODE = `
#define LINEAR 1
#define GAMMA 2
#define SRGB 3
#define RGBM 4

vec3 decodeRGBM (vec4 rgbm) {
  vec3 r = rgbm.rgb * (7.0 * rgbm.a);
  return r * r;
}

vec4 encodeRGBM (vec3 rgb) {
  vec4 r;
  r.xyz = (1.0 / 7.0) * sqrt(rgb);
  r.a = max(max(r.x, r.y), r.z);
  r.a = clamp(r.a, 1.0 / 255.0, 1.0);
  r.a = ceil(r.a * 255.0) / 255.0;
  r.xyz /= r.a;
  return r;
}

const float gamma = 2.2;

vec4 toLinear(vec4 v) {
  return vec4(pow(v.rgb, vec3(gamma)), v.a);
}

vec4 toGamma(vec4 v) {
  return vec4(pow(v.rgb, vec3(1.0 / gamma)), v.a);
}

vec4 decode(vec4 pixel, int encoding) {
  if (encoding == LINEAR) return pixel;
  if (encoding == GAMMA) return toLinear(pixel);
  if (encoding == SRGB) return toLinear(pixel);
  if (encoding == RGBM) return vec4(decodeRGBM(pixel), 1.0);
  return pixel;
}

vec4 encode(vec4 pixel, int encoding) {
  if (encoding == LINEAR) return pixel;
  if (encoding == GAMMA) return toGamma(pixel);
  if (encoding == SRGB) return toGamma(pixel);
  if (encoding == RGBM) return encodeRGBM(pixel.rgb);
  return pixel;
}
`

let TEXTURE_2D_FRAG = DECODE_ENCODE + `
uniform sampler2D uTexture;
uniform int uTextureEncoding;
varying vec2 vTexCoord0;
void main() {
  vec4 color = texture2D(uTexture, vTexCoord0);
  color = decode(color, uTextureEncoding);
  // if LINEAR || RGBM then tonemap
  if (uTextureEncoding == LINEAR || uTextureEncoding == RGBM) {
    color.rgb = color.rgb / (color.rgb + 1.0);
  }
  gl_FragColor = encode(color, 2); // to gamma
}`

// we want normal (not fliped) cubemaps maps to be represented same way as
// latlong panoramas so we flip by -1.0 by default
// render target dynamic cubemaps should be not flipped
let TEXTURE_CUBE_FRAG = DECODE_ENCODE + `
const float PI = 3.1415926;
varying vec2 vTexCoord0;
uniform samplerCube uTexture;
uniform int uTextureEncoding;
uniform float uLevel;
uniform float uFlipEnvMap;
void main() {
  float theta = PI * (vTexCoord0.x * 2.0);
  float phi = PI * (1.0 - vTexCoord0.y);

  float x = sin(phi) * sin(theta);
  float y = -cos(phi);
  float z = -sin(phi) * cos(theta);

  vec3 N = normalize(vec3(uFlipEnvMap * x, y, z));
  vec4 color = textureCube(uTexture, N, uLevel);
  color = decode(color, uTextureEncoding);
  // if LINEAR || RGBM then tonemap
  if (uTextureEncoding == LINEAR || uTextureEncoding == RGBM) {
    color.rgb = color.rgb / (color.rgb + 1.0);
  }
  gl_FragColor = encode(color, 2); // to gamma
}`
if (!isPlask) {
  TEXTURE_2D_FRAG = '#version 100\nprecision highp float;\n\n' + TEXTURE_2D_FRAG
  TEXTURE_CUBE_FRAG = '#version 100\nprecision highp float;\n\n' + TEXTURE_CUBE_FRAG
  // TEXTURE_CUBE_FRAG = '#extension GL_EXT_shader_texture_lod : require\n' + TEXTURE_CUBE_FRAG
  // TEXTURE_CUBE_FRAG = '#define textureCubeLod textureCubeLodEXT\n' + TEXTURE_CUBE_FRAG
} else {
  // TEXTURE_CUBE_FRAG = '#extension GL_ARB_shader_texture_lod : require\n' + TEXTURE_CUBE_FRAG
}

TEXTURE_2D_FRAG = TEXTURE_2D_FRAG.split(';').join(';\n')

/**
 * [GUI description]
 * @param {[type]} ctx          [description]
 * @param {[type]} windowWidth  [description]
 * @param {[type]} windowHeight [description]
 */
function GUI (ctx) {
  const W = ctx.gl.drawingBufferWidth
  const H = ctx.gl.drawingBufferHeight
  this._ctx = ctx
  this._textureRect = [0, 0, W, H]
  this._viewport = [0, 0, W, H]
  this._timeSinceLastUpdate = 0
  this._prev = Date.now() / 1000
  this.x = 0
  this.y = 0
  this.mousePos = [0, 0]
  this.scale = 1

  keyboardPolyfill.polyfill()

  const rectPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  const rectTexCoords = [[0, 0], [1, 0], [1, 1], [0, 1]]
  const rectIndices = [[0, 1, 2], [0, 2, 3]]

  // TODO
  this.drawTexture2dCmd = {
    name: 'gui_drawTexture2d',
    pipeline: ctx.pipeline({
      vert: VERT,
      frag: TEXTURE_2D_FRAG,
      depthTest: false,
      depthWrite: false,
      blend: true,
      blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
      blendSrcAlphaFactor: ctx.BlendFactor.One,
      blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
      blendDstAlphaFactor: ctx.BlendFactor.One
    }),
    attributes: {
      aPosition: { buffer: ctx.vertexBuffer(rectPositions) },
      aTexCoord0: { buffer: ctx.vertexBuffer(rectTexCoords) }
    },
    indices: { buffer: ctx.indexBuffer(rectIndices) },
    uniforms: {
    }
  }

  this.drawTextureCubeCmd = {
    name: 'gui_drawTextureCube',
    pipeline: ctx.pipeline({
      vert: VERT,
      frag: TEXTURE_CUBE_FRAG,
      depthTest: false,
      depthWrite: false,
      blend: true,
      blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
      blendSrcAlphaFactor: ctx.BlendFactor.One,
      blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
      blendDstAlphaFactor: ctx.BlendFactor.One
    }),
    attributes: {
      aPosition: { buffer: ctx.vertexBuffer(rectPositions) },
      aTexCoord0: { buffer: ctx.vertexBuffer(rectTexCoords) }
    },
    indices: { buffer: ctx.indexBuffer(rectIndices) },
    uniforms: {
      uFlipEnvMap: 1
    }
  }

  this.drawTexture2d = (props) => {
    ctx.submit(this.drawTexture2dCmd, {
      viewport: this._viewport,
      uniforms: {
        uTexture: props.texture,
        uTextureEncoding: props.texture.encoding,
        uViewport: this._viewport,
        uRect: props.rect
      }
    })
  }

  this.drawTextureCube = (props) => {
    ctx.submit(this.drawTextureCubeCmd, {
      viewport: this._viewport,
      uniforms: {
        uTexture: props.texture,
        uTextureEncoding: props.texture.encoding,
        uViewport: this._viewport,
        uRect: props.rect,
        uLevel: props.level,
        uFlipEnvMap: props.flipEnvMap || 1
      }
    })
  }

  this.renderer = new Renderer(ctx, W, H)

  this.items = []
  this.enabled = true

  ctx.gl.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
  ctx.gl.canvas.addEventListener('mousemove', this.onMouseDrag.bind(this))
  ctx.gl.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
  window.addEventListener('keydown', this.onKeyDown.bind(this))
}

/**
 * [onMouseDown description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
GUI.prototype.onMouseDown = function (e) {
  if (!this.enabled) return

  this.items.forEach(function (item) {
    if (item.type === 'text') {
      if (item.focus) {
        item.focus = false
        item.dirty = true
      }
    }
  })

  this.activeControl = null
  let mx = e.offsetX
  let my = e.offsetY
  mx = mx - this.x
  my = my - this.y
  this.mousePos[0] = mx
  this.mousePos[1] = my
  for (let i = 0; i < this.items.length; i++) {
    const prevTabs = this.items.filter((e, index) => {
      return index < i && e.type === 'tab'
    })
    const parentTab = prevTabs[prevTabs.length - 1]
    if (parentTab && !parentTab.current && (this.items[i].type !== 'tab')) {
      continue
    }
    if (Rect.containsPoint(this.items[i].activeArea, this.mousePos)) {
      this.activeControl = this.items[i]
      const aa = this.activeControl.activeArea
      const aaWidth = aa[1][0] - aa[0][0]
      const aaHeight = aa[1][1] - aa[0][1]
      this.activeControl.active = true
      this.activeControl.dirty = true
      if (this.activeControl.type === 'button') {
        if (this.activeControl.onClick) this.activeControl.onClick()
      } else if (this.activeControl.type === 'tab') {
        this.activeControl.setActive(true)
      } else if (this.activeControl.type === 'toggle') {
        this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName]
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
        }
      } else if (this.activeControl.type === 'radiolist') {
        const hitY = this.mousePos[1] - aa[0][1]
        const hitItemIndex = Math.floor(this.activeControl.items.length * hitY / aaHeight)
        if (hitItemIndex < 0) {
          continue
        }
        if (hitItemIndex >= this.activeControl.items.length) {
          continue
        }
        this.activeControl.contextObject[this.activeControl.attributeName] = this.activeControl.items[hitItemIndex].value
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.items[hitItemIndex].value)
        }
      } else if (this.activeControl.type === 'texturelist') {
        let clickedItem = null
        this.activeControl.items.forEach(function (item) {
          if (Rect.containsPoint(item.activeArea, this.mousePos)) {
            clickedItem = item
          }
        }.bind(this))

        if (!clickedItem) {
          continue
        }

        this.activeControl.contextObject[this.activeControl.attributeName] = clickedItem.value
        if (this.activeControl.onchange) {
          this.activeControl.onchange(clickedItem.value)
        }
      } else if (this.activeControl.type === 'color') {
        if (this.activeControl.options.palette) {
          const iw = this.activeControl.options.paletteImage.width
          const ih = this.activeControl.options.paletteImage.height
          let y = mx - aa[0][1]
          const imageDisplayHeight = aaWidth * ih / iw
          const imageStartY = aaHeight - imageDisplayHeight

          if (y > imageStartY) {
            const u = (mx - aa[0][0]) / aaWidth
            const v = (y - imageStartY) / imageDisplayHeight
            const x = Math.floor(iw * u)
            y = Math.floor(ih * v)
            const color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y)
            this.activeControl.dirty = true

            this.activeControl.contextObject[this.activeControl.attributeName][0] = color[0]
            this.activeControl.contextObject[this.activeControl.attributeName][1] = color[1]
            this.activeControl.contextObject[this.activeControl.attributeName][2] = color[2]
            if (this.activeControl.onchange) {
              this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
            }
            continue
          }
        }
      } else if (this.activeControl.type === 'text') {
        this.activeControl.focus = true
      }
      e.stopPropagation()
      this.onMouseDrag(e)
      e.preventDefault() // FIXME: decide on how to mark event as handled
      break
    }
  }
}

/**
 * [onMouseDrag description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
GUI.prototype.onMouseDrag = function (e) {
  if (!this.enabled) return
  let mx = e.offsetX// ? e.offsetX : e.pageX - this._ctx.gl.canvas.offsetLeft
  let my = e.offsetY// ? e.offsetY : e.pageY - this._ctx.gl.canvas.offsetTop
  mx = mx - this.x
  my = my - this.y

  if (this.activeControl) {
    const aa = this.activeControl.activeArea
    const aaWidth = aa[1][0] - aa[0][0]
    const aaHeight = aa[1][1] - aa[0][1]
    let val = 0
    let idx = 0
    if (this.activeControl.type === 'slider') {
      val = (mx - aa[0][0]) / aaWidth
      val = Math.max(0, Math.min(val, 1))
      this.activeControl.setNormalizedValue(val)
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
      }
      this.activeControl.dirty = true
    } else if (this.activeControl.type === 'multislider') {
      val = (mx - aa[0][0]) / aaWidth
      val = Math.max(0, Math.min(val, 1))
      idx = Math.floor(this.activeControl.getValue().length * (my - aa[0][1]) / aaHeight)
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider
      } else {
        this.activeControl.clickedSlider = idx
      }
      this.activeControl.setNormalizedValue(val, idx)
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
      }
      this.activeControl.dirty = true
    } else if (this.activeControl.type === 'color') {
      const numSliders = this.activeControl.options.alpha ? 4 : 3
      let slidersHeight = aaHeight
      if (this.activeControl.options.palette) {
        const iw = this.activeControl.options.paletteImage.width
        const ih = this.activeControl.options.paletteImage.height
        let y = my - aa[0][1]
        slidersHeight = aaHeight - aaWidth * ih / iw
        const imageDisplayHeight = aaWidth * ih / iw
        const imageStartY = aaHeight - imageDisplayHeight
        if (y > imageStartY && isNaN(this.activeControl.clickedSlider)) {
          const u = (mx - aa[0][0]) / aaWidth
          const v = (y - imageStartY) / imageDisplayHeight
          const x = Math.floor(iw * u)
          y = Math.floor(ih * v)
          const color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y)
          this.activeControl.dirty = true
          this.activeControl.contextObject[this.activeControl.attributeName][0] = color[0]
          this.activeControl.contextObject[this.activeControl.attributeName][1] = color[1]
          this.activeControl.contextObject[this.activeControl.attributeName][2] = color[2]
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
          }
          e.stopPropagation()
          return
        }
      }

      val = (mx - aa[0][0]) / aaWidth
      val = Math.max(0, Math.min(val, 1))
      idx = Math.floor(numSliders * (my / this._ctx.pixelRatio - aa[0][1]) / slidersHeight)
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider
      } else {
        this.activeControl.clickedSlider = idx
      }
      this.activeControl.setNormalizedValue(val, idx)
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName])
      }
      this.activeControl.dirty = true
    }
    e.stopPropagation()
  }
}

/**
 * [onMouseUp description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
GUI.prototype.onMouseUp = function (e) {
  if (!this.enabled) return

  if (this.activeControl) {
    this.activeControl.active = false
    this.activeControl.dirty = true
    this.activeControl.clickedSlider = undefined
    this.activeControl = null
  }
}

/**
 * [onKeyDown description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
GUI.prototype.onKeyDown = function (e) {
  const focusedItem = this.items.filter(function (item) { return item.type === 'text' && item.focus })[0]
  if (!focusedItem) {
    return
  }

  switch (e.key) {
    case 'Backspace':
      const str = focusedItem.contextObject[focusedItem.attributeName]
      focusedItem.contextObject[focusedItem.attributeName] = str.substr(0, Math.max(0, str.length - 1))
      focusedItem.dirty = true
      if (focusedItem.onchange) {
        focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName])
      }
      e.stopPropagation()
      e.preventDefault()
      break
  }

  const c = e.key.charCodeAt(0)
  if (e.key.length === 1 && c >= 32 && c <= 126) {
    focusedItem.contextObject[focusedItem.attributeName] += e.key
    focusedItem.dirty = true
    if (focusedItem.onchange) {
      focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName])
    }
    e.stopPropagation()
    e.preventDefault()
  }
}

GUI.prototype.addTab = function (title, contextObject, attributeName, options) {
  const numTabs = this.items.filter((item) => item.type === 'tab').length
  const gui = this
  const tab = new GUIControl({
    type: 'tab',
    title: title,
    current: numTabs === 0,
    activeArea: [[0, 0], [0, 0]],
    contextObject: contextObject,
    attributeName: attributeName,
    value: options ? options.value : null,
    onChange: options ? options.onChange : null,
    setActive: function () {
      const tabs = gui.items.filter((item) => item.type === 'tab')
      tabs.forEach((item) => { item.current = (item === this) })
      let prevValue = null
      if (contextObject) {
        prevValue = contextObject[attributeName]
        contextObject[attributeName] = this.value
      }
      if (this.onChange) {
        this.onChange(prevValue, this.value)
      }
    }
  })
  this.items.push(tab)
  return tab
}
/**
 * [addColumn description]
 * @param {[type]} title [description]
 */
GUI.prototype.addColumn = function (title, width) {
  const column = new GUIControl({
    width: width || 160,
    type: 'column',
    activeArea: [[0, 0], [0, 0]]
  })
  this.items.push(column)
  const ctrl = new GUIControl({
    type: 'header',
    title: title,
    dirty: true,
    activeArea: [[0, 0], [0, 0]],
    setTitle: function (title) {
      this.title = title
      this.dirty = true
    }
  })
  this.items.push(ctrl)
  return column
}

/**
 * [addHeader description]
 * @param {[type]} title [description]
 */
GUI.prototype.addHeader = function (title) {
  const ctrl = new GUIControl({
    type: 'header',
    title: title,
    dirty: true,
    activeArea: [[0, 0], [0, 0]],
    setTitle: function (title) {
      this.title = title
      this.dirty = true
    }
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addSeparator description]
 * @param {[type]} title [description]
 */
GUI.prototype.addSeparator = function (title) {
  const ctrl = new GUIControl({
    type: 'separator',
    dirty: true,
    activeArea: [[0, 0], [0, 0]]
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addLabel description]
 * @param {[type]} title [description]
 */
GUI.prototype.addLabel = function (title) {
  const ctrl = new GUIControl({
    type: 'label',
    title: title,
    dirty: true,
    activeArea: [[0, 0], [0, 0]],
    setTitle: function (title) {
      this.title = title
      this.dirty = true
    }
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addParam description]
 * @param {[type]} title         [description]
 * @param {[type]} contextObject [description]
 * @param {[type]} attributeName [description]
 * @param {[type]} options       [description]
 * @param {[type]} onchange      [description]
 */
GUI.prototype.addParam = function (title, contextObject, attributeName, options, onchange) {
  options = options || {}
  let ctrl = null
  if (typeof (options.min) === 'undefined') options.min = 0
  if (typeof (options.max) === 'undefined') options.max = 1
  if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
    ctrl = new GUIControl({
      type: 'toggle',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: [[0, 0], [0, 0]],
      options: options,
      onchange: onchange,
      dirty: true
    })
    this.items.push(ctrl)
    return ctrl
  } else if (!isNaN(contextObject[attributeName])) {
    ctrl = new GUIControl({
      type: 'slider',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: [[0, 0], [0, 0]],
      options: options,
      onchange: onchange,
      dirty: true
    })
    this.items.push(ctrl)
    return ctrl
  } else if ((contextObject[attributeName] instanceof Array) && (options && options.type === 'color')) {
    ctrl = new GUIControl({
      type: 'color',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: [[0, 0], [0, 0]],
      options: options,
      onchange: onchange,
      dirty: true
    })
    this.items.push(ctrl)
    return ctrl
  } else if (contextObject[attributeName] instanceof Array) {
    ctrl = new GUIControl({
      type: 'multislider',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: [[0, 0], [0, 0]],
      options: options,
      onchange: onchange,
      dirty: true
    })
    this.items.push(ctrl)
    return ctrl
  } else if (typeof contextObject[attributeName] === 'string') {
    ctrl = new GUIControl({
      type: 'text',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: [[0, 0], [0, 0]],
      options: options,
      onchange: onchange,
      dirty: true
    })
    this.items.push(ctrl)
    return ctrl
  }
}

/**
 * [addButton description]
 * @param {[type]} title   [description]
 * @param {[type]} onclick [description]
 */
GUI.prototype.addButton = function (title, onClick) {
  const ctrl = new GUIControl({
    type: 'button',
    title: title,
    onClick: onClick,
    activeArea: [[0, 0], [0, 0]],
    dirty: true,
    options: {}
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addRadioList description]
 * @param {[type]} title         [description]
 * @param {[type]} contextObject [description]
 * @param {[type]} attributeName [description]
 * @param {[type]} items         [description]
 * @param {[type]} onchange      [description]
 */
GUI.prototype.addRadioList = function (title, contextObject, attributeName, items, onchange) {
  const ctrl = new GUIControl({
    type: 'radiolist',
    title: title,
    contextObject: contextObject,
    attributeName: attributeName,
    activeArea: [[0, 0], [0, 0]],
    items: items,
    onchange: onchange,
    dirty: true
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addTexture2DList description]
 * @param {[type]} title         [description]
 * @param {[type]} contextObject [description]
 * @param {[type]} attributeName [description]
 * @param {[type]} items         [description]
 * @param {[type]} itemsPerRow   [description]
 * @param {[type]} onchange      [description]
 */
GUI.prototype.addTexture2DList = function (title, contextObject, attributeName, items, itemsPerRow, onchange) {
  const ctrl = new GUIControl({
    type: 'texturelist',
    title: title,
    contextObject: contextObject,
    attributeName: attributeName,
    activeArea: [[0, 0], [0, 0]],
    items: items.map((item) => ({ value: item })),
    itemsPerRow: itemsPerRow || 4,
    onchange: onchange,
    dirty: true
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [addTexture2D description]
 * @param {[type]} title   [description]
 * @param {[type]} texture [description]
 * @param {[type]} options [description]
 */
GUI.prototype.addTexture2D = function (title, texture, options) {
  const ctrl = new GUIControl({
    type: 'texture2D',
    title: title,
    texture: texture,
    options: options,
    activeArea: [[0, 0], [0, 0]],
    dirty: true
  })
  this.items.push(ctrl)
  return ctrl
}

GUI.prototype.addTextureCube = function (title, texture, options) {
  const ctrl = new GUIControl({
    type: 'textureCube',
    title: title,
    texture: texture,
    options: options || { flipEnvMap: 1 },
    activeArea: [[0, 0], [0, 0]],
    dirty: true,
    flipZ: 1
  })
  this.items.push(ctrl)
  return ctrl
}

GUI.prototype.addFPSMeeter = function () {
  const ctrl = new GUIControl({
    type: 'fps',
    title: 'FPS',
    activeArea: [[0, 0], [0, 0]],
    dirty: true,
    currentValue: 30,
    values: [],
    time: new Time()
  })
  this.items.push(ctrl)
  return ctrl
}

/**
 * [dispose description]
 * @return {[type]} [description]
 */
GUI.prototype.dispose = function () {
}

/**
 * [function description]
 * @param  {[type]} items [description]
 * @return {[type]}       [description]
 */
GUI.prototype.isAnyItemDirty = function (items) {
  let dirty = false
  items.forEach(function (item) {
    if (item.dirty) {
      item.dirty = false
      dirty = true
    }
  })
  return dirty
}

GUI.prototype.update = function () {
  const now = Date.now() / 1000
  const delta = now - this._prev
  this._timeSinceLastUpdate += delta
  this._prev = now
  let needsRedraw = false
  if (this._timeSinceLastUpdate > 2) {
    this._timeSinceLastUpdate = 0
    needsRedraw = true
  }
  for (let i = 0; i < this.items.length; i++) {
    const e = this.items[i]
    if (e.type === 'fps') {
      e.time._update(Date.now())
      if (needsRedraw) {
        e.currentValue = Math.floor(e.time.getFPS())
        e.values.push(e.currentValue)
      }
      e.dirty = needsRedraw
    } else if (e.type === 'stats') {
      e.update()
      e.dirty = needsRedraw
    }
  }
}

/**
 * [draw description]
 * @return {[type]} [description]
 */
GUI.prototype.draw = function () {
  if (!this.enabled) {
    return
  }

  this.update()

  if (this.items.length === 0) {
    return
  }

  const w = this._ctx.gl.drawingBufferWidth
  const h = this._ctx.gl.drawingBufferHeight
  let resized = false
  if (w !== this._viewport[2] || h !== this._viewport[3]) {
    this._viewport[2] = w
    this._viewport[3] = h
    resized = true
  }

  if (this.isAnyItemDirty(this.items) || resized || this.renderer.dirty) {
    this.renderer.draw(this.items)
  }

  const tex = this.renderer.getTexture()
  this._textureRect[2] = tex.width
  this._textureRect[3] = tex.height

  this.drawTexture2d({
    texture: tex,
    rect: this._textureRect
  })

  this.drawTextures()
}

/**
 * [drawTextures description]
 * @return {[type]} [description]
 */
GUI.prototype.drawTextures = function () {
  const items = this.items
  const tabs = items.filter((item) => item.type === 'tab')
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i]
    if (tabs.length > 0) {
      const prevTabs = items.filter((e, index) => {
        return index < i && e.type === 'tab'
      })
      const parentTab = prevTabs[prevTabs.length - 1]
      if (parentTab && !parentTab.current) {
        continue
      }
    }
    const scale = this.scale * this._ctx.pixelRatio
    let bounds = []
    if (item.type === 'texture2D') {
      // we are trying to match flipped gui texture which 0,0 starts at the top with window coords that have 0,0 at the bottom
      bounds = [item.activeArea[0][0] * scale, item.activeArea[1][1] * scale, item.activeArea[1][0] * scale, item.activeArea[0][1] * scale]
      if (item.texture.flipY) {
        var tmp = bounds[1]
        bounds[1] = bounds[3]
        bounds[3] = tmp
      }
      this.drawTexture2d({
        texture: item.texture,
        rect: bounds
      })
    }
    if (item.type === 'texturelist') {
      item.items.forEach(function (textureItem) {
        // const bounds = [item.activeArea[0][0] * scale, this._windowHeight - item.activeArea[1][1] * scale, item.activeArea[1][0] * scale, this._windowHeight - item.activeArea[0][1] * scale]
        bounds = [textureItem.activeArea[0][0] * scale, textureItem.activeArea[1][1] * scale, textureItem.activeArea[1][0] * scale, textureItem.activeArea[0][1] * scale]
        if (textureItem.value.flipY) {
          var tmp = bounds[1]
          bounds[1] = bounds[3]
          bounds[3] = tmp
        }
        this.drawTexture2d({
          texture: textureItem.value,
          rect: bounds
        })
      }.bind(this))
    }
    if (item.type === 'textureCube') {
      const level = (item.options && item.options.level !== undefined) ? item.options.level : 0
      // we are trying to match flipped gui texture which 0,0 starts at the top with window coords that have 0,0 at the bottom
      bounds = [item.activeArea[0][0] * scale, item.activeArea[1][1] * scale, item.activeArea[1][0] * scale, item.activeArea[0][1] * scale]
      this.drawTextureCube({
        texture: item.texture,
        rect: bounds,
        level: level,
        flipEnvMap: item.options.flipEnvMap
      })
    }
  }
}

/**
 * [serialize description]
 * @return {[type]} [description]
 */
GUI.prototype.serialize = function () {
  const data = {}
  this.items.forEach(function (item, i) {
    data[item.title] = item.getSerializedValue()
  })
  return data
}

/**
 * [deserialize description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
GUI.prototype.deserialize = function (data) {
  this.items.forEach(function (item, i) {
    if (data[item.title] !== undefined) {
      item.setSerializedValue(data[item.title])
      item.dirty = true
    }
  })
}

/**
 * [function description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
GUI.prototype.setEnabled = function (state) {
  this.enabled = state
}

/**
 * [function description]
 * @return {[type]} [description]
 */
GUI.prototype.isEnabled = function () {
  return this.enabled
}

/**
 * [function description]
 * @return {[type]} [description]
 */
GUI.prototype.toggleEnabled = function () {
  this.enabled = !this.enabled
  return this.enabled
}

module.exports = function createGUI (ctx) {
  return new GUI(ctx)
}
