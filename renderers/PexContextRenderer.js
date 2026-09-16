import CanvasRenderer from "./CanvasRenderer.js";

import VERT from "../shaders/main.vert.js";
import TEXTURE_2D_FRAG from "../shaders/texture-2d.frag.js";
import TEXTURE_CUBE_FRAG from "../shaders/texture-cube.frag.js";

class PexContextRenderer extends CanvasRenderer {
  #ctx;
  #drawTexture2dCmd;
  #drawTextureCubeCmd;

  constructor(opts) {
    super(opts);

    const { ctx } = opts;

    this.#ctx = ctx;

    this.rendererTexture = ctx.texture2D({
      width: opts[0],
      height: opts[1],
      pixelFormat: ctx.PixelFormat.RGBA8,
    });

    const attributes = {
      aPosition: {
        buffer: ctx.vertexBuffer([
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]),
      },
      aTexCoord0: {
        buffer: ctx.vertexBuffer([
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]),
      },
    };

    const indices = {
      buffer: ctx.indexBuffer([
        [0, 1, 2],
        [0, 2, 3],
      ]),
    };

    const pipelineOptions = {
      depthTest: false,
      depthWrite: false,
      blend: true,
      blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
      blendSrcAlphaFactor: ctx.BlendFactor.One,
      blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
      blendDstAlphaFactor: ctx.BlendFactor.One,
    };

    this.#drawTexture2dCmd = {
      name: "gui_drawTexture2d",
      pipeline: ctx.pipeline({
        vert: VERT,
        frag: TEXTURE_2D_FRAG,
        ...pipelineOptions,
      }),
      attributes,
      indices,
    };

    this.#drawTextureCubeCmd = {
      name: "gui_drawTextureCube",
      pipeline: ctx.pipeline({
        vert: VERT,
        frag: TEXTURE_CUBE_FRAG,
        ...pipelineOptions,
      }),
      attributes,
      indices,
      uniforms: {
        uFlipEnvMap: 1,
      },
    };
  }

  afterDraw() {
    this.#ctx.update(this.rendererTexture, {
      data: this.canvas,
      width: this.canvas.width,
      height: this.canvas.height,
      flipY: true,
    });
  }

  getTexture() {
    return this.rendererTexture;
  }

  #correctGamma(texture) {
    return [
      this.#ctx.PixelFormat.SRGB8,
      this.#ctx.PixelFormat.SRGB8_ALPHA8,
    ].includes(texture.pixelFormat);
  }

  isTexture(value) {
    return (
      Object.prototype.hasOwnProperty.call(value, "class") &&
      value.class === "texture"
    );
  }

  isTextureCube(texture) {
    return texture.target === this.#ctx.gl.TEXTURE_CUBE_MAP;
  }

  drawTexture2d(viewport, { texture, rect, flipY }) {
    if (flipY) {
      const y0 = rect[1];
      rect[1] = rect[3];
      rect[3] = y0;
    }

    this.#ctx.submit(this.#drawTexture2dCmd, {
      viewport,
      uniforms: {
        uTexture: texture,
        uCorrectGamma: this.#correctGamma(texture),
        uViewport: viewport,
        uRect: rect,
      },
    });
  }

  drawTextureCube(viewport, { texture, rect, level, flipEnvMap }) {
    this.#ctx.submit(this.#drawTextureCubeCmd, {
      viewport,
      uniforms: {
        uTexture: texture,
        uCorrectGamma: this.#correctGamma(texture),
        uViewport: viewport,
        uRect: rect,
        uLevel: level,
        uFlipEnvMap: flipEnvMap || 1,
      },
    });
  }

  dispose() {
    super.dispose();

    this.#ctx.dispose(this.rendererTexture);
  }
}

export default PexContextRenderer;
