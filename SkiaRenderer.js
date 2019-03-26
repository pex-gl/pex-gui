const plask = require('plask-wrap')
const SkCanvas = plask.SkCanvas
const SkPaint = plask.SkPaint
const SkPath = plask.SkPath
const Rect = require('pex-geom/Rect')

const fromRGBAString = (col) => {
  let matches = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.exec(
    col
  )
  return matches
    ? [+matches[1], +matches[2], +matches[3], Math.floor(+matches[4] * 255)]
    : null
}

function SkiaRenderer(ctx, theme) {
  const width = (ctx.gl.drawingBufferWidth / 3) | 0
  const height = (ctx.gl.drawingBufferHeight / 3) | 0
  this.ctx = ctx
  this.theme = theme
  this.tex = ctx.texture2D({
    width: width,
    height: height,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.SRGB
  })
  this.canvas = SkCanvas.create(width, height)
  this.canvasPaint = new SkPaint()
  this.fontPaint = new SkPaint()
  this.fontPaint.setStyle(SkPaint.kFillStyle)
  this.fontPaint.setColor(...fromRGBAString(this.theme.color))
  this.fontPaint.setTextSize(this.theme.fontSize)
  this.fontPaint.setFontFamily(this.theme.fontFamily)
  this.fontPaint.setStrokeWidth(0)
  this.linePaint = new SkPaint()
  this.linePaint.setColor(...fromRGBAString(this.theme.color))
  this.linePaint.setStroke()
  this.tabPaint = new SkPaint()
  this.headerFontPaint = new SkPaint()
  this.headerFontPaint.setStyle(SkPaint.kFillStyle)
  this.headerFontPaint.setColor(...fromRGBAString(this.theme.headerColor))
  this.headerFontPaint.setTextSize(this.theme.fontSize)
  this.headerFontPaint.setFontFamily(this.theme.fontFamily)
  this.headerFontPaint.setStrokeWidth(0)
  this.fontHighlightPaint = new SkPaint()
  this.fontHighlightPaint.setStyle(SkPaint.kFillStyle)
  this.fontHighlightPaint.setColor(...fromRGBAString(this.theme.colorActive))
  this.fontHighlightPaint.setTextSize(this.theme.fontSize)
  this.fontHighlightPaint.setFontFamily(this.theme.fontFamily)
  this.fontHighlightPaint.setStrokeWidth(0)
  this.panelBgPaint = new SkPaint()
  this.panelBgPaint.setStyle(SkPaint.kFillStyle)
  this.panelBgPaint.setColor(...fromRGBAString(this.theme.background))
  this.headerBgPaint = new SkPaint()
  this.headerBgPaint.setStyle(SkPaint.kFillStyle)
  this.headerBgPaint.setColor(...fromRGBAString(this.theme.color))
  this.textBgPaint = new SkPaint()
  this.textBgPaint.setStyle(SkPaint.kFillStyle)
  this.textBgPaint.setColor(...fromRGBAString(this.theme.input))
  this.textBorderPaint = new SkPaint()
  this.textBorderPaint.setStyle(SkPaint.kStrokeStyle)
  this.textBorderPaint.setColor(...fromRGBAString(this.theme.accent))
  this.controlBgPaint = new SkPaint()
  this.controlBgPaint.setStyle(SkPaint.kFillStyle)
  this.controlBgPaint.setColor(...fromRGBAString(this.theme.input))
  this.controlHighlightPaint = new SkPaint()
  this.controlHighlightPaint.setStyle(SkPaint.kFillStyle)
  this.controlHighlightPaint.setColor(...fromRGBAString(this.theme.accent))
  this.controlHighlightPaint.setAntiAlias(true)
  this.controlStrokeHighlightPaint = new SkPaint()
  this.controlStrokeHighlightPaint.setStyle(SkPaint.kStrokeStyle)
  this.controlStrokeHighlightPaint.setColor(
    ...fromRGBAString(this.theme.accent)
  )
  this.controlStrokeHighlightPaint.setAntiAlias(false)
  this.controlStrokeHighlightPaint.setStrokeWidth(2)
  this.controlFeaturePaint = new SkPaint()
  this.controlFeaturePaint.setStyle(SkPaint.kFillStyle)
  this.controlFeaturePaint.setColor(...fromRGBAString(this.theme.color))
  this.controlFeaturePaint.setAntiAlias(true)
  this.imagePaint = new SkPaint()
  this.imagePaint.setStyle(SkPaint.kFillStyle)
  this.imagePaint.setColor(...fromRGBAString(this.theme.color))
  this.colorPaint = new SkPaint()
  this.colorPaint.setStyle(SkPaint.kFillStyle)
  this.colorPaint.setColor(...fromRGBAString(this.theme.color))
  this.dirty = true
}

SkiaRenderer.prototype.draw = function(items) {
  this.dirty = false
  const scale = 1
  const canvas = this.canvas
  canvas.save()
  canvas.scale(this.ctx.pixelRatio * scale, this.ctx.pixelRatio * scale)
  canvas.drawColor(0, 0, 0, 0, plask.SkPaint.kClearMode)
  // transparent
  let dy = 10
  let dx = 10
  const w = 160
  let cellSize = 0
  let numRows = 0
  const margin = 3
  let numColumns = 0

  const tabs = items.filter((item) => item.type === 'tab')
  const defaultDy = tabs.length ? 10 + 26 * scale + 5 : 10

  for (let j = 0; j < tabs.length; j++) {
    const tab = tabs[j]
    let eh = 30 * scale
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.56)'
    // ctx.fillRect(dx, dy, w, eh - 2)
    canvas.drawRect(this.panelBgPaint, dx, dy, dx + w, dy + eh)
    tab.current
      ? this.tabPaint.setColor(
          ...fromRGBAString(this.theme.tabBackgroundActive)
        )
      : this.tabPaint.setColor(...fromRGBAString(this.theme.tabBackground))
    // ctx.fillStyle = tab.current ? 'rgba(46, 204, 113, 1.0)' : 'rgba(75, 75, 75, 1.0)'
    // ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
    canvas.drawRect(this.tabPaint, dx + 3, dy + 3, dx + w - 3, dy + eh - 3)
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    // ctx.fillRect(dx, dy + eh - 8, w, 4)
    this.tabPaint.setColor(...fromRGBAString(this.theme.tabShadow))
    canvas.drawRect(this.tabPaint, dx + 3, dy + eh - 3, dx + w - 3, dy + eh - 7)
    // ctx.fillStyle = tab.current ? 'rgba(0, 0, 0, 1)' : 'rgba(175, 175, 175, 1.0)'
    // ctx.fillText(tab.title, dx + 5, dy + 16)
    canvas.drawText(
      tab.current ? this.headerFontPaint : this.fontPaint,
      tab.title,
      dx + 4 + 3,
      dy + 3 + 13
    )
    Rect.set4(tab.activeArea, dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3)
    dx += w + margin
  }

  dx = 10
  let maxWidth = 0
  let maxHeight = 0
  let needInitialDy = true
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
      } else {
        if (needInitialDy && e.type !== 'column') {
          needInitialDy = false
          dy += 30 * scale
        }
      }
      needInitialDy = false
    }

    if (e.options && e.options.palette && !e.options.paletteImage) {
      if (e.options.palette.width) {
        e.options.paletteImage = e.options.palette
      } else {
        e.options.paletteImage = plask.SkCanvas.createFromImage(
          e.options.palette
        )
      }
    }

    if (e.type === 'column') {
      dx = 10 + numColumns * (w + margin)
      dy = defaultDy
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
    if (e.type === 'separator') eh /= 2

    if (e.type !== 'separator') {
      canvas.drawRect(this.panelBgPaint, dx, dy, dx + w, dy + eh - 2)
    }

    if (e.type === 'slider') {
      // const value = e.getValue()
      canvas.drawRect(
        this.controlBgPaint,
        dx + 3,
        dy + 18,
        dx + w - 3,
        dy + eh - 5
      )
      canvas.drawRect(
        this.controlHighlightPaint,
        dx + 3,
        dy + 18,
        dx + 3 + (w - 6) * e.getNormalizedValue(),
        dy + eh - 5
      )
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
      canvas.drawText(
        this.fontPaint,
        items[i].title + ' : ' + e.getStrValue(),
        dx + 4,
        dy + 13
      )
    } else if (e.type === 'multislider') {
      for (let j = 0; j < e.getValue().length; j++) {
        canvas.drawRect(
          this.controlBgPaint,
          dx + 3,
          dy + 18 + j * 14 * scale,
          dx + w - 3,
          dy + 18 + (j + 1) * 14 * scale - 3
        )
        canvas.drawRect(
          this.controlHighlightPaint,
          dx + 3,
          dy + 18 + j * 14 * scale,
          dx + 3 + (w - 6) * e.getNormalizedValue(j),
          dy + 18 + (j + 1) * 14 * scale - 3
        )
      }
      canvas.drawText(
        this.fontPaint,
        items[i].title + ' : ' + e.getStrValue(),
        dx + 4,
        dy + 13
      )
      Rect.set4(e.activeArea, dx + 4, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'color') {
      const numSliders = e.options.alpha ? 4 : 3
      for (let j = 0; j < numSliders; j++) {
        canvas.drawRect(
          this.controlBgPaint,
          dx + 3,
          dy + 18 + j * 14 * scale,
          dx + w - 3,
          dy + 18 + (j + 1) * 14 * scale - 3
        )
        canvas.drawRect(
          this.controlHighlightPaint,
          dx + 3,
          dy + 18 + j * 14 * scale,
          dx + 3 + (w - 6) * e.getNormalizedValue(j),
          dy + 18 + (j + 1) * 14 * scale - 3
        )
      }
      const c = e.getValue()
      this.colorPaint.setColor(255 * c[0], 255 * c[1], 255 * c[2], 255)
      canvas.drawRect(
        this.colorPaint,
        dx + w - 12 - 3,
        dy + 3,
        dx + w - 3,
        dy + 3 + 12
      )
      if (e.options.paletteImage) {
        canvas.drawCanvas(
          this.imagePaint,
          e.options.paletteImage,
          dx + 3,
          dy + 18 + 14 * numSliders,
          dx + w - 3,
          dy +
            18 +
            14 * numSliders +
            (w * e.options.paletteImage.height) / e.options.paletteImage.width
        )
      }
      canvas.drawText(
        this.fontPaint,
        items[i].title + ' : ' + e.getStrValue(),
        dx + 3,
        dy + 13
      )
      Rect.set4(e.activeArea, dx + 4, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'button') {
      const btnColor = e.active
        ? this.controlHighlightPaint
        : this.controlBgPaint
      const btnFont = e.active ? this.fontHighlightPaint : this.fontPaint
      canvas.drawRect(btnColor, dx + 3, dy + 3, dx + w - 3, dy + eh - 5)
      Rect.set4(e.activeArea, dx + 3, dy + 3, w - 3 - 3, eh - 5)
      if (e.options.color) {
        let c = e.options.color
        this.controlFeaturePaint.setColor(
          255 * c[0],
          255 * c[1],
          255 * c[2],
          255
        )
        canvas.drawRect(
          this.controlFeaturePaint,
          dx + w - 8,
          dy + 3,
          dx + w - 3,
          dy + eh - 5
        )
      }
      canvas.drawText(btnFont, items[i].title, dx + 5, dy + 15)
    } else if (e.type === 'toggle') {
      const on = e.contextObject[e.attributeName]
      const toggleColor = on ? this.controlHighlightPaint : this.controlBgPaint
      canvas.drawRect(toggleColor, dx + 3, dy + 3, dx + eh - 5, dy + eh - 5)
      Rect.set4(e.activeArea, dx + 3, dy + 3, eh - 5, eh - 5)
      canvas.drawText(this.fontPaint, items[i].title, dx + eh, dy + 13)
    } else if (e.type === 'radiolist') {
      canvas.drawText(this.fontPaint, e.title, dx + 4, dy + 14)
      // const itemColor = this.controlBgPaint
      const itemHeight = 20 * scale
      for (let j = 0; j < e.items.length; j++) {
        const item = e.items[j]
        let on = e.contextObject[e.attributeName] === item.value
        let itemColor = on ? this.controlHighlightPaint : this.controlBgPaint
        canvas.drawRect(
          itemColor,
          dx + 3,
          18 + j * itemHeight + dy + 3,
          dx + itemHeight - 5,
          itemHeight + j * itemHeight + dy + 18 - 5
        )
        canvas.drawText(
          this.fontPaint,
          item.name,
          dx + itemHeight,
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
      canvas.drawText(this.fontPaint, e.title, dx + 4, dy + 14)
      for (let j = 0; j < e.items.length; j++) {
        const col = j % e.itemsPerRow
        const row = Math.floor(j / e.itemsPerRow)
        let itemColor = this.controlBgPaint
        let shrink = 0
        canvas.drawRect(
          itemColor,
          dx + 3 + col * cellSize,
          dy + 18 + row * cellSize,
          dx + 3 + (col + 1) * cellSize - 1,
          dy + 18 + (row + 1) * cellSize - 1
        )
        if (e.items[j].value === e.contextObject[e.attributeName]) {
          const strokeColor = this.controlStrokeHighlightPaint
          canvas.drawRect(
            strokeColor,
            dx + 3 + col * cellSize + 1,
            dy + 18 + row * cellSize + 1,
            dx + 3 + (col + 1) * cellSize - 1 - 1,
            dy + 18 + (row + 1) * cellSize - 1 - 1
          )
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
      canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13)
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'textureCube') {
      canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13)
      Rect.set4(e.activeArea, dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18)
    } else if (e.type === 'header') {
      canvas.drawRect(
        this.headerBgPaint,
        dx + 3,
        dy + 3,
        dx + w - 3,
        dy + eh - 5
      )
      canvas.drawText(this.headerFontPaint, items[i].title, dx + 6, dy + 16)
    } else if (e.type === 'fps') {
      // FIXME: dirty dependency between FPS history and GUI width
      if (e.values.length > w - 6) e.values.shift()
      // ctx.fillStyle = 'rgba(50, 50, 50, 1)'
      const gh = eh - 20 - 5
      // ctx.fillRect(dx + 3, dy + 20, w - 6, gh)
      canvas.drawRect(
        this.textBgPaint,
        dx + 3,
        dy + 20,
        dx + w - 3,
        dy + 20 + gh
      )
      let py = gh - ((e.values[0] || 0) / 60) * gh
      let path = new SkPath()
      path.moveTo(dx + 3, dy + 20 + py)
      for (let j = 0; j < e.values.length; j++) {
        py = gh - (e.values[j] / 60) * gh
        path.lineTo(dx + 3 + j, dy + 20 + py)
      }
      canvas.drawPath(this.linePaint, path)
      canvas.drawText(
        this.fontPaint,
        e.title + ' : ' + e.currentValue,
        dx + 6,
        dy + 16
      )
    } else if (e.type === 'text') {
      canvas.drawText(this.fontPaint, items[i].title, dx + 3, dy + 13)
      canvas.drawRect(
        this.textBgPaint,
        dx + 3,
        dy + 20,
        dx + w - 3,
        dy + eh - 5
      )
      canvas.drawText(
        this.fontPaint,
        e.contextObject[e.attributeName],
        dx + 3 + 3,
        dy + 15 + 20
      )
      Rect.set4(e.activeArea, dx + 3, dy + 20, w - 6, eh - 20 - 5)
      if (e.focus) {
        canvas.drawRect(
          this.textBorderPaint,
          e.activeArea[0][0],
          e.activeArea[0][1],
          e.activeArea[1][0],
          e.activeArea[1][1]
        )
      }
    } else if (e.type === 'separator') {
      // do nothing
    } else {
      canvas.drawText(this.fontPaint, items[i].title, dx + 3, dy + 13)
    }
    dy += eh
    maxWidth = Math.max(maxWidth, dx + w)
    maxHeight = Math.max(maxHeight, dy)
  }
  canvas.restore()
  this.updateTexture()

  maxWidth = Math.max(maxWidth, tabs.length * (w + margin) + 13)

  if (maxWidth && maxHeight) {
    maxWidth = (maxWidth * this.ctx.pixelRatio) | 0
    maxHeight = (maxHeight * this.ctx.pixelRatio) | 0
    if (maxWidth !== this.canvas.width || maxHeight !== this.canvas.height) {
      // console.log('Resize GUI Canvas', maxWidth, maxHeight)
      this.canvas = SkCanvas.create(maxWidth, maxHeight)
      this.dirty = true
      this.draw(items)
    }
  }
}

SkiaRenderer.prototype.getImageColor = function(image, x, y) {
  const pixels = image.pixels || image
  // Skia stores canvas data as BGR
  const r = pixels[(x + y * image.width) * 4 + 2] / 255
  const g = pixels[(x + y * image.width) * 4 + 1] / 255
  const b = pixels[(x + y * image.width) * 4 + 0] / 255
  return [r, g, b]
}

SkiaRenderer.prototype.getTexture = function() {
  return this.tex
}

SkiaRenderer.prototype.getCanvas = function() {
  return this.canvas
}

SkiaRenderer.prototype.getCanvasPaint = function() {
  return this.canvasPaint
}

SkiaRenderer.prototype.updateTexture = function() {
  if (!this.tex) return

  const numPixels = this.canvas.width * this.canvas.height * 4
  if (!this.pixels || this.pixels.length !== numPixels) {
    this.pixels = new Uint8Array(numPixels)
  }
  const pixels = this.pixels
  const canvas = this.canvas
  for (let y = canvas.height - 1; y >= 0; y--) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (x + y * canvas.width) * 4
      // SkiaCanvas is BGRA
      pixels[i] = canvas.pixels[i + 2]
      pixels[i + 1] = canvas.pixels[i + 1]
      pixels[i + 2] = canvas.pixels[i + 0]
      pixels[i + 3] = canvas.pixels[i + 3]
    }
  }
  this.ctx.update(this.tex, {
    data: pixels,
    width: this.canvas.width,
    height: this.canvas.height,
    flipY: true
  })
}

SkiaRenderer.prototype.dispose = function() {}

module.exports = SkiaRenderer
