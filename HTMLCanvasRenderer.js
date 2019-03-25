const Rect = require('pex-geom/Rect')
const rgb2hex = require('rgb-hex')

function floatRgb2Hex(rgb) {
  return rgb2hex(
    Math.floor(rgb[0] * 255),
    Math.floor(rgb[1] * 255),
    Math.floor(rgb[2] * 255)
  )
}

function HTMLCanvasRenderer(ctx) {
  this._ctx = ctx
  this.canvas = document.createElement('canvas')

  const W = (ctx.gl.drawingBufferWidth / 3) | 0
  const H = (ctx.gl.drawingBufferHeight / 3) | 0
  // TODO: move this up
  this.tex = ctx.texture2D({
    width: W,
    height: H,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB
  })
  this.canvas.width = W
  this.canvas.height = H
  this.ctx = this.canvas.getContext('2d')
  this.dirty = true
}

HTMLCanvasRenderer.prototype.draw = function(items) {
  this.dirty = false
  function makePaletteImage(e, img) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = (w * img.height) / img.width
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    e.options.paletteImage = canvas
    e.options.paletteImage.ctx = ctx
    e.options.paletteImage.data = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data
    e.dirty = true
  }

  const scale = 1
  const pixelRatio = this._ctx.pixelRatio
  const ctx = this.ctx
  ctx.save()
  ctx.scale(scale * pixelRatio, scale * pixelRatio)
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  ctx.font = '10px Monaco'
  let dy = 10
  let dx = 10
  let w = 160

  let cellSize = 0
  let numRows = 0
  const margin = 3
  let numColumns = 0
  const tabs = items.filter((item) => item.type === 'tab')
  const defaultDy = tabs.length ? 10 + 26 * scale + 5 : 10

  for (let j = 0; j < tabs.length; j++) {
    const tab = tabs[j]
    let eh = 30 * scale
    ctx.fillStyle = 'rgba(0, 0, 0, 0.56)'
    ctx.fillRect(dx, dy, w, eh - 2)
    ctx.fillStyle = tab.current
      ? 'rgba(46, 204, 113, 1.0)'
      : 'rgba(75, 75, 75, 1.0)'
    ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(dx, dy + eh - 8, w, 4)
    ctx.fillStyle = tab.current
      ? 'rgba(0, 0, 0, 1)'
      : 'rgba(175, 175, 175, 1.0)'
    ctx.fillText(tab.title, dx + 5, dy + 16)
    Rect.set4(tab.activeArea, dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
    dx += w + margin
  }
  dx = 10

  let maxWidth = 0
  let maxHeight = 0
  for (let i = 0; i < items.length; i++) {
    const e = items[i]

    if (e.px && e.px) {
      dx = e.px
      dy = e.py
    }

    let eh = 20 * scale
    if (e.type === 'tab') {
      continue
    }

    if (tabs.length > 0) {
      const prevTabs = items.filter((e, index) => {
        return index < i && e.type === 'tab'
      })
      const parentTab = prevTabs[prevTabs.length - 1]
      if (parentTab && !parentTab.current) {
        continue
      }
    }

    if (e.type === 'column') {
      dx = 10 + numColumns * (w + margin)
      dy = defaultDy
      w = e.width
      numColumns++
      continue
    }
    if (e.type === 'slider') eh = 20 * scale + 14
    if (e.type === 'toggle') eh = 20 * scale
    if (e.type === 'multislider') eh = 20 + e.getValue().length * 14 * scale
    if (e.type === 'color') eh = 20 + (e.options.alpha ? 4 : 3) * 14 * scale
    if (e.type === 'color' && e.options.paletteImage)
      eh +=
        ((w * e.options.paletteImage.height) / e.options.paletteImage.width +
          2) *
        scale
    if (e.type === 'button') eh = 24 * scale
    if (e.type === 'texture2D')
      eh = 24 + (e.texture.height * w) / e.texture.width
    if (e.type === 'textureCube') eh = 24 + w / 2
    if (e.type === 'radiolist') eh = 18 + e.items.length * 20 * scale
    if (e.type === 'texturelist') {
      const aspectRatio = e.items[0].texture.width / e.items[0].texture.height
      cellSize = Math.floor((w - 2 * margin) / e.itemsPerRow)
      numRows = Math.ceil(e.items.length / e.itemsPerRow)
      eh = 18 + 3 + (numRows * cellSize) / aspectRatio
    }
    if (e.type === 'header') eh = 26 * scale
    if (e.type === 'text') eh = 45 * scale
    if (e.type === 'fps') eh = (24 + 40) * scale
    if (e.type === 'stats') eh = (18 + 4 * 19) * scale
    if (e.type === 'label') eh = e.title.split('\n').length * 18 * scale
    if (e.type === 'separator') eh /= 2

    if (e.type !== 'separator') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.56)'
      ctx.fillRect(dx, dy, w, eh - 2)
    }

    if (e.options && e.options.palette && !e.options.paletteImage) {
      if (e.options.palette.width) {
        makePaletteImage(e, e.options.palette)
      } else {
        const img = new window.Image()
        img.src = e.options.palette
        img.onload = function() {
          makePaletteImage(e, img)
        }
      }
    }

    if (e.type === 'slider') {
      ctx.fillStyle = 'rgba(150, 150, 150, 1)'
      ctx.fillRect(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
      ctx.fillStyle = 'rgba(255, 255, 0, 1)'
      ctx.fillRect(
        dx + 3,
        dy + 18,
        (w - 3 - 3) * e.getNormalizedValue(),
        eh - 5 - 18
      )
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13)
    } else if (e.type === 'multislider') {
      for (let j = 0; j < e.getValue().length; j++) {
        ctx.fillStyle = 'rgba(150, 150, 150, 1)'
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, w - 6, 14 * scale - 3)
        ctx.fillStyle = 'rgba(255, 255, 0, 1)'
        ctx.fillRect(
          dx + 3,
          dy + 18 + j * 14 * scale,
          (w - 6) * e.getNormalizedValue(j),
          14 * scale - 3
        )
      }
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13)
    } else if (e.type === 'color') {
      const numSliders = e.options.alpha ? 4 : 3
      for (let j = 0; j < numSliders; j++) {
        ctx.fillStyle = 'rgba(150, 150, 150, 1)'
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, w - 6, 14 * scale - 3)
        ctx.fillStyle = 'rgba(255, 255, 0, 1)'
        ctx.fillRect(
          dx + 3,
          dy + 18 + j * 14 * scale,
          (w - 6) * e.getNormalizedValue(j),
          14 * scale - 3
        )
      }
      ctx.fillStyle = '#' + floatRgb2Hex(e.contextObject[e.attributeName])
      ctx.fillRect(dx + w - 12 - 3, dy + 3, 12, 12)
      if (e.options.paletteImage) {
        ctx.drawImage(
          e.options.paletteImage,
          dx + 3,
          dy + 18 + 14 * numSliders,
          w - 6,
          (w * e.options.paletteImage.height) / e.options.paletteImage.width
        )
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13)
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'button') {
      ctx.fillStyle = e.active
        ? 'rgba(255, 255, 0, 1)'
        : 'rgba(150, 150, 150, 1)'
      ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
      Rect.set4(e.activeArea, dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
      ctx.fillStyle = e.active
        ? 'rgba(100, 100, 100, 1)'
        : 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + 5, dy + 15)
      if (e.options.color) {
        const c = e.options.color
        ctx.fillStyle =
          'rgba(' + c[0] * 255 + ', ' + c[1] * 255 + ', ' + c[2] * 255 + ', 1)'
        ctx.fillRect(dx + w - 8, dy + 3, 5, eh - 5 - 3)
      }
    } else if (e.type === 'toggle') {
      const on = e.contextObject[e.attributeName]
      ctx.fillStyle = on ? 'rgba(255, 255, 0, 1)' : 'rgba(150, 150, 150, 1)'
      ctx.fillRect(dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3)
      Rect.set4(e.activeArea, dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3)
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + eh, dy + 12)
    } else if (e.type === 'radiolist') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(e.title, dx + 4, dy + 13)
      const itemHeight = 20 * scale
      for (let j = 0; j < e.items.length; j++) {
        const item = e.items[j]
        let on = e.contextObject[e.attributeName] === item.value
        ctx.fillStyle = on ? 'rgba(255, 255, 0, 1)' : 'rgba(150, 150, 150, 1)'
        ctx.fillRect(
          dx + 3,
          18 + j * itemHeight + dy + 3,
          itemHeight - 5 - 3,
          itemHeight - 5 - 3
        )
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.fillText(
          item.name,
          dx + 5 + itemHeight - 5,
          18 + j * itemHeight + dy + 13
        )
      }
      Rect.set4(
        e.activeArea,
        dx + 3,
        18 + dy + 3,
        itemHeight - 5,
        e.items.length * itemHeight - 5
      )
    } else if (e.type === 'texturelist') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(e.title, dx + 4, dy + 13)
      for (let j = 0; j < e.items.length; j++) {
        const col = j % e.itemsPerRow
        const row = Math.floor(j / e.itemsPerRow)
        // const itemColor = this.controlBgPaint
        let shrink = 0
        if (e.items[j].value === e.contextObject[e.attributeName]) {
          ctx.fillStyle = 'none'
          ctx.strokeStyle = 'rgba(255, 255, 0, 1)'
          ctx.lineWidth = '2'
          ctx.strokeRect(
            dx + 3 + col * cellSize + 1,
            dy + 18 + row * cellSize + 1,
            cellSize - 1 - 2,
            cellSize - 1 - 2
          )
          ctx.lineWidth = '1'
          shrink = 2
        }
        if (!e.items[j].activeArea) {
          e.items[j].activeArea = [[0, 0], [0, 0]]
        }
        Rect.set4(
          e.items[j].activeArea,
          dx + 3 + col * cellSize + shrink,
          dy + 18 + row * cellSize + shrink,
          cellSize - 1 - 2 * shrink,
          cellSize - 1 - 2 * shrink
        )
      }
      Rect.set4(
        e.activeArea,
        dx + 3,
        18 + dy + 3,
        w - 3 - 3,
        cellSize * numRows - 5
      )
    } else if (e.type === 'texture2D') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + 5, dy + 15)
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'textureCube') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + 5, dy + 15)
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'header') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'
      ctx.fillText(items[i].title, dx + 5, dy + 16)
    } else if (e.type === 'text') {
      Rect.set4(e.activeArea, dx + 3, dy + 20, w - 6, eh - 20 - 5)
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + 3, dy + 13)
      ctx.fillStyle = 'rgba(50, 50, 50, 1)'
      ctx.fillRect(
        dx + 3,
        dy + 20,
        e.activeArea[1][0] - e.activeArea[0][0],
        e.activeArea[1][1] - e.activeArea[0][1]
      )
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(e.contextObject[e.attributeName], dx + 3 + 3, dy + 15 + 20)
      if (e.focus) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 1)'
        ctx.strokeRect(
          e.activeArea[0][0] - 0.5,
          e.activeArea[0][1] - 0.5,
          e.activeArea[1][0] - e.activeArea[0][0],
          e.activeArea[1][1] - e.activeArea[0][1]
        )
      }
    } else if (e.type === 'fps') {
      // FIXME: dirty dependency between FPS history and GUI width
      if (e.values.length > w - 6) e.values.shift()
      ctx.fillStyle = 'rgba(50, 50, 50, 1)'
      const gh = eh - 20 - 5
      ctx.fillRect(dx + 3, dy + 20, w - 6, gh)
      let py = gh - ((e.values[0] || 0) / 60) * gh
      ctx.beginPath()
      ctx.moveTo(dx + 3, dy + 20 + py)
      for (let j = 0; j < e.values.length; j++) {
        py = gh - (e.values[j] / 60) * gh
        ctx.lineTo(dx + 3 + j, dy + 20 + py)
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
      ctx.stroke()
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(e.title + ' : ' + e.currentValue, dx + 5, dy + 13)
    } else if (e.type === 'stats') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(e.title, dx + 5, dy + 13)
      ctx.fillText('Buffers: ' + e.bufferCount, dx + 5, dy + 13 + 18)
      ctx.fillText('Elements: ' + e.elementsCount, dx + 5, dy + 13 + 18 * 2)
      ctx.fillText('FBOs: ' + e.framebufferCount, dx + 5, dy + 13 + 18 * 3)
      ctx.fillText('Texture Mem: ' + e.textureMemSize, dx + 5, dy + 13 + 18 * 4)
    } else if (e.type === 'separator') {
      // do nothing
    } else if (e.type === 'label') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      const lines = items[i].title.split('\n')
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, dx + 5, dy + 13 + 18 * lineIndex + 13)
      })
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fillText(items[i].title, dx + 5, dy + 13)
    }
    dy += eh
    maxWidth = Math.max(maxWidth, dx + w)
    maxHeight = Math.max(maxHeight, dy)
  }
  ctx.restore()
  this.updateTexture()

  if (maxWidth && maxHeight) {
    maxWidth = (maxWidth * this._ctx.pixelRatio) | 0
    maxHeight = (maxHeight * this._ctx.pixelRatio) | 0
    if (this.canvas.width !== maxWidth) {
      this.canvas.width = maxWidth
      this.dirty = true
    }
    if (this.canvas.height !== maxHeight) {
      this.canvas.height = maxHeight
      this.dirty = true
    }
    if (this.dirty) {
      this.draw(items)
    }
  }
}

HTMLCanvasRenderer.prototype.getTexture = function() {
  return this.tex
}

HTMLCanvasRenderer.prototype.getImageColor = function(image, x, y) {
  const r = image.data[(x + y * image.width) * 4 + 0] / 255
  const g = image.data[(x + y * image.width) * 4 + 1] / 255
  const b = image.data[(x + y * image.width) * 4 + 2] / 255
  return [r, g, b]
}

HTMLCanvasRenderer.prototype.updateTexture = function() {
  // const gl = this.gl
  this._ctx.update(this.tex, {
    data: this.canvas,
    width: this.canvas.width,
    height: this.canvas.height,
    flipY: true
  })
}

module.exports = HTMLCanvasRenderer
