import { rect } from "pex-geom";
import { utils } from "pex-math";

import {
  CanvasRenderer,
  PexContextRenderer,
  PexGPURenderer,
} from "./renderers/index.js";

import GUIControl from "./GUIControl.js";
import DEFAULT_THEME from "./theme.js";

const isArrayLike = (value) =>
  Array.isArray(value) || ArrayBuffer.isView(value);

/**
 * GUI controls for PEX.
 *
 * @property {boolean} [enabled=true] Enable/disable pointer interaction and
 *   drawing.
 */
class GUI {
  #pixelRatio;
  #scale;

  get size() {
    if (this.ctx.gl) {
      return [this.ctx.gl.drawingBufferWidth, this.ctx.gl.drawingBufferHeight];
    }
    if (this.ctx.device) return [this.ctx.width, this.ctx.height];
    return [this.ctx.canvas.width, this.ctx.canvas.height];
  }

  get canvas() {
    return this.ctx.gl ? this.ctx.gl.canvas : this.ctx.canvas;
  }

  set pixelRatio(ratio) {
    if (this.renderer) this.renderer.pixelRatio = ratio;
    this.#pixelRatio = ratio;
  }

  /**
   * Creates an instance of GUI.
   *
   * @param {ctx | CanvasRenderingContext2D} ctx
   * @param {import("./types.js").GUIOptions} opts
   */
  constructor(
    ctx,
    {
      pixelRatio = devicePixelRatio,
      theme = {},
      scale = 1,
      responsive = true,
      overlay = false,
      renderer,
    } = {},
  ) {
    this.ctx = ctx;

    this.#pixelRatio = pixelRatio;
    this.theme = {
      ...DEFAULT_THEME,
      ...theme,
    };
    this.scale = scale;
    this.#scale = scale;
    this.responsive = responsive;
    this.enabled = true;

    const [W, H] = this.size;
    this.viewport = [0, 0, W, H];

    this.x = 0;
    this.y = 0;
    this.pointerOffset = [0, 0];
    this.items = [];

    // Create renderer
    const isPexContext = !!this.ctx.gl;
    const isPexGPU = !!this.ctx.device;
    const [rendererWidth, rendererHeight] = [W / 3, H / 3];

    this.renderer =
      renderer ||
      new (isPexGPU
        ? PexGPURenderer
        : isPexContext
          ? PexContextRenderer
          : CanvasRenderer)({
        ctx: this.ctx,
        width: rendererWidth,
        height: rendererHeight,
        pixelRatio: this.#pixelRatio,
        theme: this.theme,
      });

    if (overlay) {
      this.overlay = {
        container: document.createElement("div"),
        initialPointerEvents: this.canvas.style.pointerEvents,
      };
      this.canvas.style.pointerEvents = "none";
      this.canvas.after(this.overlay.container);
    } else {
      this.canvas.addEventListener(
        "pointerdown",
        this.onPointerDown.bind(this),
      );
      this.canvas.addEventListener(
        "pointermove",
        this.onPointerMove.bind(this),
      );
      this.canvas.addEventListener("pointerup", this.onPointerUp.bind(this));
    }

    addEventListener("keydown", this.onKeyDown.bind(this));
  }

  // Helpers
  setControlValue(value) {
    if (isArrayLike(value)) {
      value.forEach(
        (v, index) =>
          (this.activeControl.contextObject[this.activeControl.attributeName][
            index
          ] = value[index]),
      );
    } else {
      this.activeControl.contextObject[this.activeControl.attributeName] =
        value;
    }

    if (this.activeControl.onChange) {
      this.activeControl.onChange(
        this.activeControl.contextObject[this.activeControl.attributeName],
      );
    }
  }

  getImageColor({ data, width }, x, y) {
    return [
      data[(x + y * width) * 4 + 0] / 255,
      data[(x + y * width) * 4 + 1] / 255,
      data[(x + y * width) * 4 + 2] / 255,
    ];
  }

  checkPalette(image, aa, aaWidth, aaHeight, mx, my) {
    const iw = image.width;
    const ih = image.height;

    let y = my - aa[0][1];

    const renderedImageHeight = aaWidth * image.aspectRatio;
    const imageStartY = aaHeight - renderedImageHeight;

    if (y > imageStartY && isNaN(this.activeControl.clickedSlider)) {
      const u = (mx - aa[0][0]) / aaWidth;
      const v = (y - imageStartY) / renderedImageHeight;
      const x = Math.floor(iw * u);
      y = Math.floor(ih * v);
      const color = this.getImageColor(
        image,
        utils.clamp(x, 0, iw - 1),
        utils.clamp(y, 0, ih - 1),
      );
      this.setControlValue(color);

      return { imageStartY, clicked: true };
    }

    return { imageStartY };
  }

  setPointerOffset(event, target = event.currentTarget || event.srcElement) {
    const { left, top } = target.getBoundingClientRect();
    this.pointerOffset[0] = event.clientX - left - this.x;
    this.pointerOffset[1] = event.clientY - top - this.y;
  }

  // Event handlers
  onPointerDown(event) {
    if (!this.enabled) return;

    this.items.forEach((item) => {
      if (!(item.type === "text" && item.focus)) return;

      item.focus = false;
      item.dirty = true;
    });

    this.activeControl = null;

    this.setPointerOffset(event, this.canvas, this.pointerOffset);

    for (let i = 0; i < this.items.length; i++) {
      const prevTabs = this.items.filter(
        ({ type }, index) => index < i && type === "tab",
      );
      const parentTab = prevTabs.at(-1);
      if (parentTab && !parentTab.current && this.items[i].type !== "tab") {
        continue;
      }

      const aa = this.getScaledActiveArea(this.items[i].activeArea);

      if (rect.containsPoint(aa, this.pointerOffset)) {
        this.activeControl = this.items[i];

        this.activeControl.active = true;
        this.activeControl.dirty = true;

        const aaWidth = rect.width(aa);
        const aaHeight = rect.height(aa);

        if (this.activeControl.type === "button") {
          if (this.activeControl.onClick) this.activeControl.onClick();
        } else if (this.activeControl.type === "tab") {
          this.activeControl.setActive(true);
        } else if (this.activeControl.type === "toggle") {
          this.setControlValue(
            !this.activeControl.contextObject[this.activeControl.attributeName],
          );
        } else if (this.activeControl.type === "radiolist") {
          const hitY = this.pointerOffset[1] - aa[0][1];
          const hitItemIndex = Math.floor(
            (this.activeControl.items.length * hitY) / aaHeight,
          );
          if (
            hitItemIndex < 0 ||
            hitItemIndex >= this.activeControl.items.length
          ) {
            continue;
          }

          this.setControlValue(this.activeControl.items[hitItemIndex].value);
        } else if (this.activeControl.type === "texturelist") {
          let clickedItem = null;
          this.activeControl.items.forEach((item) => {
            if (
              rect.containsPoint(
                this.getScaledActiveArea(item.activeArea),
                this.pointerOffset,
              )
            ) {
              clickedItem = item;
            }
          });

          if (!clickedItem) continue;

          this.setControlValue(clickedItem.value);
        } else if (this.activeControl.type === "color") {
          if (this.activeControl.options.palette) {
            const paletteResult = this.checkPalette(
              this.activeControl.options.paletteImage,
              aa,
              aaWidth,
              aaHeight,
              this.pointerOffset[0],
              this.pointerOffset[1],
            );
            if (paletteResult.clicked) {
              this.activeControl.clickedPalette = true;
              continue;
            }
          }
        } else if (this.activeControl.type === "text") {
          this.activeControl.focus = true;
        }
        event.stopPropagation();
        this.onPointerMove(event);
        break;
      }
    }
  }

  onPointerMove(event) {
    if (!this.enabled) return;

    this.setPointerOffset(event, this.canvas, this.pointerOffset);

    if (this.activeControl) {
      const aa = this.getScaledActiveArea(this.activeControl.activeArea);

      let value;
      let index = 0;

      const isSlider = this.activeControl.type === "slider";
      const isMultiSlider = this.activeControl.type === "multislider";
      const isColor = this.activeControl.type === "color";

      if (isSlider || isMultiSlider || isColor) {
        const aaWidth = rect.width(aa);
        const aaHeight = rect.height(aa);
        value = (this.pointerOffset[0] - aa[0][0]) / aaWidth;
        value = utils.clamp(value, 0, 1);

        let slidersHeight = aaHeight;
        const numSliders = isMultiSlider
          ? this.activeControl.getValue().length
          : this.activeControl.options.alpha
            ? 4
            : 3;

        if (isColor) {
          if (this.activeControl.options.palette) {
            const paletteResult = this.checkPalette(
              this.activeControl.options.paletteImage,
              aa,
              aaWidth,
              aaHeight,
              this.pointerOffset[0],
              this.pointerOffset[1],
            );
            slidersHeight = paletteResult.imageStartY;
            if (paletteResult.clicked) {
              this.activeControl.dirty = true;
              event.stopPropagation();
              return;
            }
          }

          if (this.activeControl.clickedPalette) {
            event.stopPropagation();
            return;
          }
        }

        if (isMultiSlider || isColor) {
          index = Math.floor(
            (numSliders * (this.pointerOffset[1] - aa[0][1])) / slidersHeight,
          );
          if (isNaN(this.activeControl.clickedSlider)) {
            this.activeControl.clickedSlider = index;
          } else {
            index = this.activeControl.clickedSlider;
          }
        }

        this.activeControl.setNormalizedValue(value, index);
        if (this.activeControl.onChange) {
          this.activeControl.onChange(
            this.activeControl.contextObject[this.activeControl.attributeName],
          );
        }
        this.activeControl.dirty = true;
      }

      event.stopPropagation();
    }
  }

  onPointerUp() {
    if (!this.activeControl) return;

    this.activeControl.active = false;
    this.activeControl.dirty = true;
    this.activeControl.clickedSlider = undefined;
    this.activeControl.clickedPalette = undefined;
    this.activeControl = null;
  }

  onKeyDown(event) {
    const focusedItem = this.items.find(
      ({ type, focus }) => type === "text" && focus,
    );
    if (!focusedItem) return;

    switch (event.key) {
      case "Backspace": {
        const str = focusedItem.contextObject[focusedItem.attributeName];
        focusedItem.contextObject[focusedItem.attributeName] = str.slice(
          0,
          Math.max(0, str.length - 1),
        );
        focusedItem.dirty = true;
        if (focusedItem.onChange) {
          focusedItem.onChange(
            focusedItem.contextObject[focusedItem.attributeName],
          );
        }
        event.stopImmediatePropagation();
        event.preventDefault();
        break;
      }
    }

    const c = event.key.codePointAt(0);
    if (event.key.length === 1 && c >= 32 && c <= 126) {
      focusedItem.contextObject[focusedItem.attributeName] += event.key;
      focusedItem.dirty = true;
      if (focusedItem.onChange) {
        focusedItem.onChange(
          focusedItem.contextObject[focusedItem.attributeName],
        );
      }
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  // Public API
  /**
   * Add a tab control.
   *
   * @param {string} title
   * @param {object} contextObject
   * @param {string} attributeName
   * @param {import("./types.js").GUIControlOptions} [options={}]
   * @param {Function} onChange
   * @returns {GUIControl}
   */
  addTab(title, contextObject, attributeName, options = {}, onChange) {
    const gui = this;
    const tab = new GUIControl({
      type: "tab",
      title,
      current: this.items.filter(({ type }) => type === "tab").length === 0,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      contextObject,
      attributeName,
      options,
      onChange,
      setActive() {
        gui.items
          .filter(({ type }) => type === "tab")
          .forEach((item) => (item.current = item === this));

        let prevValue = null;
        if (contextObject) {
          prevValue = contextObject[attributeName];
          contextObject[attributeName] = this.value;
        }
        if (this.onChange) this.onChange(prevValue, this.value);
      },
    });
    this.items.push(tab);
    return tab;
  }

  /**
   * Add a column control with a header.
   *
   * @param {string} title
   * @param {number} [width=this.theme.columnWidth]
   * @returns {GUIControl}
   */
  addColumn(title, width = this.theme.columnWidth) {
    const column = new GUIControl({
      width,
      type: "column",
      activeArea: [
        [0, 0],
        [0, 0],
      ],
    });
    this.items.push(column);

    if (title) {
      const ctrl = new GUIControl({
        type: "header",
        title,
        dirty: true,
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        setTitle(title) {
          this.title = title;
          this.dirty = true;
        },
      });
      this.items.push(ctrl);
    }
    return column;
  }

  /**
   * Add a header control.
   *
   * @param {string} title
   * @returns {GUIControl}
   */
  addHeader(title) {
    const ctrl = new GUIControl({
      type: "header",
      title,
      dirty: true,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      setTitle(title) {
        this.title = title;
        this.dirty = true;
      },
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add some breathing space between controls.
   *
   * @returns {GUIControl}
   */
  addSeparator() {
    const ctrl = new GUIControl({
      type: "separator",
      dirty: true,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a text label. Can be multiple line.
   *
   * @example
   *
   * ```js
   * gui.addLabel("Multiline\nLabel");
   * ```
   *
   * @param {string} title
   * @param {import("./types.js").GUIControlOptions} [options={}]
   * @returns {GUIControl}
   */
  addLabel(title, options) {
    const ctrl = new GUIControl({
      type: "label",
      title,
      dirty: true,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      setTitle(title) {
        this.title = title;
        this.dirty = true;
      },
      options,
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a generic parameter control.
   *
   * @example
   *
   * ```js
   * gui.addParam("Checkbox", State, "rotate");
   *
   * gui.addParam("Text message", State, "text", {}, function (value) {
   *   console.log(value);
   * });
   *
   * gui.addParam("Slider", State, "range", {
   *   min: -Math.PI / 2,
   *   max: Math.PI / 2,
   * });
   *
   * gui.addParam("Multi Slider", State, "position", {
   *   min: 0,
   *   max: 10,
   * });
   *
   * gui.addParam("Color [RGBA]", State, "color");
   *
   * gui.addParam("Texture", State, "texture");
   * gui.addParam("Texture Cube", State, "textureCube");
   * ```
   *
   * @param {string} title
   * @param {object} contextObject
   * @param {string} attributeName
   * @param {import("./types.js").GUIControlOptions} [options={}]
   * @param {Function} onChange
   * @returns {GUIControl}
   */
  addParam(title, contextObject, attributeName, options = {}, onChange) {
    let ctrl = null;
    options ??= {};
    if (options.min === undefined) options.min = 0;
    if (options.max === undefined) options.max = 1;

    const value = contextObject?.[attributeName];

    if (this.renderer.isTexture?.(value)) {
      const texture = value;

      ctrl = this.renderer.isTextureCube?.(texture)
        ? new GUIControl({
            type: "textureCube",
            title,
            contextObject,
            attributeName,
            texture,
            options: options || { flipEnvMap: 1 },
            activeArea: [
              [0, 0],
              [0, 0],
            ],
            dirty: true,
          })
        : new GUIControl({
            type: "texture2D",
            title,
            contextObject,
            attributeName,
            texture,
            options,
            activeArea: [
              [0, 0],
              [0, 0],
            ],
            dirty: true,
          });
      this.items.push(ctrl);
      return ctrl;
    } else if (value === false || value === true) {
      ctrl = new GUIControl({
        type: "toggle",
        title,
        contextObject,
        attributeName,
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        options,
        onChange,
        dirty: true,
      });
      this.items.push(ctrl);
      return ctrl;
    } else if (!isNaN(value)) {
      ctrl = new GUIControl({
        type: "slider",
        title,
        contextObject,
        attributeName,
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        options,
        onChange,
        dirty: true,
      });
      this.items.push(ctrl);
      return ctrl;
    } else if (isArrayLike(value) && options && options.type === "color") {
      ctrl = new GUIControl({
        type: "color",
        title,
        contextObject,
        attributeName,
        colorSpace: options.colorSpace || "HSL",
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        options,
        onChange,
        dirty: true,
      });
      this.items.push(ctrl);
      return ctrl;
    } else if (isArrayLike(value)) {
      ctrl = new GUIControl({
        type: "multislider",
        title,
        contextObject,
        attributeName,
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        options,
        onChange,
        dirty: true,
      });
      this.items.push(ctrl);
      return ctrl;
    } else if (typeof value === "string") {
      ctrl = new GUIControl({
        type: "text",
        title,
        contextObject,
        attributeName,
        activeArea: [
          [0, 0],
          [0, 0],
        ],
        options,
        onChange,
        dirty: true,
      });
      this.items.push(ctrl);
      return ctrl;
    }
    return ctrl;
  }

  /**
   * Add a clickable button.
   *
   * @example
   *
   * ```js
   * gui.addButton("Button", () => {
   *   console.log("Called back");
   * });
   * ```
   *
   * @param {string} title
   * @param {Function} onClick
   * @returns {GUIControl}
   */
  addButton(title, onClick) {
    const ctrl = new GUIControl({
      type: "button",
      title,
      onClick,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      dirty: true,
      options: {},
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a radio list with options.
   *
   * @example
   *
   * ```js
   * gui.addRadioList(
   *   "Radio list",
   *   State,
   *   "currentRadioListChoice",
   *   ["Choice 1", "Choice 2", "Choice 3"].map((name, value) => ({
   *     name,
   *     value,
   *   })),
   * );
   * ```
   *
   * @param {string} title
   * @param {object} contextObject
   * @param {string} attributeName
   * @param {{ name: string; value: number }[]} items
   * @param {Function} onChange
   * @returns {GUIControl}
   */
  addRadioList(title, contextObject, attributeName, items, onChange) {
    const ctrl = new GUIControl({
      type: "radiolist",
      title,
      contextObject,
      attributeName,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      items,
      onChange,
      dirty: true,
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a texture visualiser and selector for multiple textures (from
   * pex-context) or images.
   *
   * @example
   *
   * ```js
   * gui.addTexture2DList("List", State, "currentTexture", textures.map((texture, value) = > ({ texture, value })));
   * ```
   *
   * @param {string} title
   * @param {object} contextObject
   * @param {string} attributeName
   * @param {{
   *   texture: import("pex-context").texture | CanvasImageSource;
   *   value: number;
   * }[]} items
   * @param {number} [itemsPerRow=4]
   * @param {Function} onChange
   * @returns {GUIControl}
   */
  addTexture2DList(
    title,
    contextObject,
    attributeName,
    items,
    itemsPerRow,
    onChange,
  ) {
    const ctrl = new GUIControl({
      type: "texturelist",
      title,
      contextObject,
      attributeName,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      items,
      itemsPerRow: itemsPerRow || 4,
      onChange,
      dirty: true,
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a texture (from pex-context) or image visualiser. Notes: texture cannot
   * be updated once created.
   *
   * @example
   *
   * ```js
   * gui.addTexture2D("Single", image);
   * ```
   *
   * @param {string} title
   * @param {import("pex-context").texture | CanvasImageSource} texture
   * @param {import("./types.js").GUIControlOptions} options
   * @returns {GUIControl}
   */
  addTexture2D(title, texture, options) {
    const ctrl = new GUIControl({
      type: "texture2D",
      title,
      texture,
      options,
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      dirty: true,
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a cube texture visualiser (from pex-context). Notes: texture cannot be
   * updated once created.
   *
   * @example
   *
   * ```js
   * gui.addTextureCube("Cube", State.cubeTexture, { level: 2 });
   * ```
   *
   * @param {string} title
   * @param {import("pex-context").textureCube} texture
   * @param {import("./types.js").GUIControlOptions} options
   * @returns {GUIControl}
   */
  addTextureCube(title, texture, options) {
    const ctrl = new GUIControl({
      type: "textureCube",
      title,
      texture,
      options: options || { flipEnvMap: 1 },
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      dirty: true,
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a XY graph visualiser from the control values.
   *
   * @example
   *
   * ```js
   * gui.addGraph("Sin", {
   *   interval: 500,
   *   t: 0,
   *   update(item) {
   *     item.options.t += 0.01;
   *   },
   *   redraw(item) {
   *     item.values.push(+Math.sin(item.options.t).toFixed(3));
   *   },
   * });
   * ```
   *
   * @param {string} title
   * @param {import("./types.js").GUIControlOptions} options
   * @returns {GUIControl}
   */
  addGraph(title, options) {
    const ctrl = new GUIControl({
      type: "graph",
      title,
      options: {
        format: (value) => value,
        ...options,
      },
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      dirty: true,
      prev: 0,
      values: [],
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Add a FPS counter. Need "gui.draw()" to be called on frame.
   *
   * @returns {GUIControl}
   */
  addFPSMeeter() {
    const ctrl = this.addGraph("FPS", {
      time: {
        now: 0,
        frames: -1,
        fps: 0,
        fpsTime: 0,
        fpsFrames: 0,
        update(now) {
          const delta = now - this.now;
          this.now = now;
          this.frames++;

          if (this.fpsTime > 1000) {
            this.fps =
              Math.floor((this.fpsFrames / (this.fpsTime / 1000)) * 10) / 10;
            this.fpsTime = 0;
            this.fpsFrames = 0;
          } else {
            this.fpsTime += delta;
            this.fpsFrames++;
          }
        },
      },
      interval: 1000,
      min: 0,
      update(item, now) {
        item.options.time.update(now);
      },
      redraw(item) {
        item.values.push(item.options.time.fps);
      },
      format: (value) => (Number.isFinite(value) ? Math.round(value) : ""),
    });

    return ctrl;
  }

  /**
   * Add an updatable object stats visualiser.
   *
   * @param {string} title
   * @param {object} [options] An object with an update() function to update
   *   control.stats.
   * @returns {GUIControl}
   */
  addStats(title, options) {
    const ctrl = new GUIControl({
      type: "stats",
      title: title ?? "STATS",
      activeArea: [
        [0, 0],
        [0, 0],
      ],
      dirty: true,
      ctx: this.ctx,
      stats: {},
      prev: 0,
      options: options || {
        update(item) {
          Object.assign(
            item.stats,
            Object.fromEntries(
              Object.entries(item.ctx?.stats || {}).map(([k, v]) => [
                k,
                `${v.alive} / ${v.total}`,
              ]),
            ),
          );
        },
      },
    });
    this.items.push(ctrl);
    return ctrl;
  }

  /**
   * Remove controls
   *
   * @param {GUIControl | GUIControl[]} items
   */
  remove(items) {
    items = Array.isArray(items) ? items : [items];
    this.items = this.items.filter((item) => {
      const itemToRemove = items.find((i) => i === item);
      if (itemToRemove) itemToRemove.dispose?.();
      return !itemToRemove;
    });
  }

  /**
   * Move a control after another
   *
   * @param {GUIControl} item
   * @param {GUIControl} targetItem
   */
  moveAfter(item, targetItem) {
    const fromIndex = this.items.indexOf(item);
    const toIndex = this.items.indexOf(targetItem);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [item] = this.items.splice(fromIndex, 1);
      this.items.splice(toIndex + 1, 0, item);
    }
  }

  // Update
  isAnyItemDirty(items) {
    let dirty = false;
    items.forEach((item) => {
      if (!item.dirty) return;

      item.dirty = false;
      dirty = true;
    });
    return dirty;
  }

  getScaledActiveArea(activeArea) {
    return activeArea.map((a) => a.map((b) => b * this.#scale));
  }

  update() {
    const now = performance.now();

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      if (
        item.options &&
        (item.options.update || Number.isFinite(item.options.interval))
      ) {
        item.prev ??= 0;
        item.options.update?.(item, now);

        const dt = now - item.prev;
        if (dt > (item.options.interval ?? 2000)) {
          item.prev = now;
          item.options.redraw?.(item);
          item.dirty = true;
        }
      }
    }
  }

  // Draw
  getScale() {
    return this.canvas.height / this.canvas.clientHeight;
  }

  initOverlayItem(item) {
    const overlayItem = document.createElement("div");
    Object.assign(overlayItem.style, {
      position: "absolute",
      pointerEvents: "all",
    });

    overlayItem.addEventListener("pointerdown", this.onPointerDown.bind(this));
    overlayItem.addEventListener("pointermove", this.onPointerMove.bind(this));
    overlayItem.addEventListener("pointerup", this.onPointerUp.bind(this));

    item.dispose = () => {
      overlayItem.removeEventListener("pointerdown", this.onPointerDown);
      overlayItem.removeEventListener("pointermove", this.onPointerMove);
      overlayItem.removeEventListener("pointerup", this.onPointerUp);
      overlayItem.remove();
    };
    this.overlay.container.append(overlayItem);

    item.overlayItem = overlayItem;
  }

  updateOverlayItem({ activeArea, overlayItem }) {
    const scaledActiveArea = this.getScaledActiveArea(activeArea);

    Object.assign(overlayItem.style, {
      left: `${this.x + scaledActiveArea[0][0]}px`,
      top: `${this.y + scaledActiveArea[0][1]}px`,
      width: `${rect.width(scaledActiveArea)}px`,
      height: `${rect.height(scaledActiveArea)}px`,
    });
  }

  /** Renders the GUI. Should be called at the end of the frame. */
  draw() {
    if (!this.enabled || this.items.length === 0) return;

    this.update();

    const [W, H] = this.size;

    let resized = false;

    if (W !== this.viewport[2] || H !== this.viewport[3]) {
      this.viewport[2] = W;
      this.viewport[3] = H;
      resized = true;
    }

    const texture = this.renderer.getTexture();
    const canvasScale = this.getScale();
    const rendererWidth = texture.width / this.renderer.pixelRatio;
    const rendererHeight = texture.height / this.renderer.pixelRatio;

    if (this.isAnyItemDirty(this.items) || resized || this.renderer.dirty) {
      this.renderer.draw(this.items);

      this.#scale = this.responsive
        ? Math.min(
            this.canvas.clientWidth / rendererWidth,
            this.canvas.clientHeight / rendererHeight,
            this.scale,
          )
        : this.scale;

      if (this.overlay) {
        const { left, top, width, height } =
          this.canvas.getBoundingClientRect();

        Object.assign(this.overlay.container.style, {
          position: "fixed",
          pointerEvents: "none",
          left: `${this.x + left + window.scrollX}px`,
          top: `${this.y + top + window.scrollY}px`,
          width: `${width}px`,
          height: `${height}px`,
        });

        for (let i = 0; i < this.items.length; i++) {
          const item = this.items[i];

          if (
            item.activeArea &&
            rect.width(item.activeArea) &&
            rect.height(item.activeArea)
          ) {
            if (!item.overlayItem) this.initOverlayItem(item);
            this.updateOverlayItem(item);
          }
        }
      }
    }

    this.renderer.drawTexture2d(this.viewport, {
      texture,
      rect: [
        0,
        0,
        canvasScale * this.#scale * rendererWidth || 2,
        canvasScale * this.#scale * rendererHeight || 2,
      ],
    });

    this.drawTextures();
  }

  drawTextures() {
    const items = this.items;
    const tabs = items.filter(({ type }) => type === "tab");
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (tabs.length > 0) {
        const prevTabs = items.filter(
          ({ type }, index) => index < i && type === "tab",
        );
        const parentTab = prevTabs.at(-1);
        if (parentTab && !parentTab.current) {
          continue;
        }
      }
      const scale = this.#scale * this.getScale();
      let bounds = [];

      const drawTexture = ({ activeArea, texture }) => {
        // we are trying to match flipped gui texture which 0,0 starts at the top with window coords that have 0,0 at the bottom
        bounds = [
          activeArea[0][0] * scale,
          activeArea[1][1] * scale,
          activeArea[1][0] * scale,
          activeArea[0][1] * scale,
        ];
        const flipY = item.options?.flipY;
        if (texture.flipY) {
          [bounds[1], bounds[3]] = [bounds[3], bounds[1]];
        }
        this.renderer.drawTexture2d(this.viewport, {
          texture,
          rect: bounds,
          flipY,
          near: item.options?.near,
          far: item.options?.far,
          layer: item.options?.layer,
        });
      };
      if (item.type === "texture2D") {
        drawTexture(item);
      } else if (item.type === "texturelist") {
        item.items.forEach(drawTexture);
      } else if (item.type === "textureCube") {
        bounds = [
          item.activeArea[0][0] * scale,
          item.activeArea[1][1] * scale,
          item.activeArea[1][0] * scale,
          item.activeArea[0][1] * scale,
        ];
        this.renderer.drawTextureCube(this.viewport, {
          texture: item.contextObject
            ? item.contextObject[item.attributeName]
            : item.texture,
          rect: bounds,
          level:
            item.options && item.options.level !== undefined
              ? item.options.level
              : 0,
          flipEnvMap: item.options.flipEnvMap,
          near: item.options.near,
          far: item.options.far,
          layer: item.options.layer,
        });
      }
    }
  }

  /**
   * Retrieve a serialized value of the current GUI's state.
   *
   * @returns {object}
   */
  serialize() {
    return Object.fromEntries(
      this.items.map((item) => [item.title, item.getSerializedValue()]),
    );
  }

  /**
   * Deserialize a previously serialized data state GUI's state.
   *
   * @param {object} data
   */
  deserialize(data) {
    this.items.forEach((item) => {
      if (data[item.title] === undefined) return;

      item.setSerializedValue(data[item.title]);
      item.dirty = true;
    });
  }

  /**
   * Remove events listeners, empty list of controls and dispose of the gui's
   * resources.
   */
  dispose() {
    if (this.overlay) {
      this.canvas.style.pointerEvents = this.overlay.initialPointerEvents;
      this.overlay.container.remove();
    } else {
      this.canvas.removeEventListener("pointerdown", this.onPointerDown);
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerup", this.onPointerUp);
      removeEventListener("keydown", this.onKeyDown);
    }

    for (let i = 0; i < this.items.length; i++) {
      this.items[i].dispose?.();
    }

    this.items = [];

    this.renderer.dispose();
  }
}

export * as Renderers from "./renderers/index.js";
export { DEFAULT_THEME };

/**
 * @param {import("./types.js").ctx | CanvasRenderingContext2D} ctx
 * @param {import("./types.js").GUIOptions} opts
 * @returns {GUI}
 * @alias module:pex-gui.default
 */
function createGUI(ctx, opts) {
  return new GUI(ctx, opts);
}

/**
 * @module pex-gui
 *
 * @summary
 * Export a factory function for creating a GUI instance.
 */
export default createGUI;
