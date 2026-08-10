import * as gpu from "pex-gpu";

import CanvasRenderer from "./CanvasRenderer.js";

import TEXTURE_2D_WGSL from "../shaders/texture-2d.wgsl.js";
import TEXTURE_CUBE_WGSL from "../shaders/texture-cube.wgsl.js";

const BLEND = {
  color: {
    srcFactor: "src-alpha",
    dstFactor: "one-minus-src-alpha",
    operation: "add",
  },
  alpha: { srcFactor: "one", dstFactor: "one", operation: "add" },
};

const correctGamma = (texture) => (texture.format?.includes("srgb") ? 1 : 0);

class PexGPURenderer extends CanvasRenderer {
  #ctx;
  #texture;
  #retired = [];
  #sampler;
  #drawTexture2dCmd;
  #drawTextureCubeCmd;

  constructor(opts) {
    super(opts);

    const { ctx } = opts;
    this.#ctx = ctx;

    const attributes = {
      position: gpu.createBuffer(ctx, {
        usage: "vertex",
        data: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
      }),
      texCoord: gpu.createBuffer(ctx, {
        usage: "vertex",
        data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      }),
    };
    const indices = gpu.createBuffer(ctx, {
      usage: "index",
      data: new Uint16Array([0, 1, 2, 0, 2, 3]),
    });

    this.#sampler = gpu.createSampler(ctx, { filter: "linear" });

    this.#drawTexture2dCmd = {
      label: "gui_drawTexture2d",
      pipeline: {
        label: "gui_texture2d",
        vertex: TEXTURE_2D_WGSL,
        fragment: TEXTURE_2D_WGSL,
        blend: BLEND,
      },
      attributes,
      indices,
    };
    this.#drawTextureCubeCmd = {
      label: "gui_drawTextureCube",
      pipeline: {
        label: "gui_textureCube",
        vertex: TEXTURE_CUBE_WGSL,
        fragment: TEXTURE_CUBE_WGSL,
        blend: BLEND,
      },
      attributes,
      indices,
    };

    // Eager so getTexture() is valid from the first frame (afterDraw resizes it).
    this.#texture = gpu.createTexture(ctx, {
      width: this.canvas.width,
      height: this.canvas.height,
      format: "rgba8unorm",
    });
  }

  afterDraw() {
    const { width, height } = this.canvas;
    if (!width || !height) return;

    // draw() reads getTexture() before calling us, so the previous texture is
    // still referenced by the current frame's encoder: dispose it next frame,
    // once that submit has gone through.
    while (this.#retired.length) this.#retired.pop().dispose();

    // pex-gpu textures are immutable-size: recreate when the GUI canvas grows.
    if (this.#texture.width !== width || this.#texture.height !== height) {
      this.#retired.push(this.#texture);
      this.#texture = gpu.createTexture(this.#ctx, {
        width,
        height,
        format: "rgba8unorm",
      });
    }

    gpu.copyExternalImage(this.#ctx, this.#texture, this.canvas, {
      flipY: true,
    });
  }

  getTexture() {
    return this.#texture;
  }

  isTexture(value) {
    return (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      "texture" in value
    );
  }

  isTextureCube(texture) {
    return texture.dimension === "cube";
  }

  drawTexture2d(viewport, { texture, rect, flipY }) {
    if (flipY) {
      const y0 = rect[1];
      rect[1] = rect[3];
      rect[3] = y0;
    }

    this.#drawTexture2dCmd.viewport = viewport;
    this.#drawTexture2dCmd.uniforms = {
      params: { viewport, rect, correctGamma: correctGamma(texture) },
      uSampler: this.#sampler,
      uTexture: texture,
    };
    gpu.submit(this.#ctx, this.#drawTexture2dCmd);
  }

  drawTextureCube(viewport, { texture, rect, level, flipEnvMap }) {
    this.#drawTextureCubeCmd.viewport = viewport;
    this.#drawTextureCubeCmd.uniforms = {
      params: {
        viewport,
        rect,
        correctGamma: correctGamma(texture),
        level: level ?? 0,
        flipEnvMap: flipEnvMap ?? 1,
      },
      uSampler: this.#sampler,
      uTexture: texture,
    };
    gpu.submit(this.#ctx, this.#drawTextureCubeCmd);
  }

  dispose() {
    super.dispose();

    while (this.#retired.length) this.#retired.pop().dispose();
    this.#texture.dispose();
    this.#drawTexture2dCmd.attributes.position.dispose();
    this.#drawTexture2dCmd.attributes.texCoord.dispose();
    this.#drawTexture2dCmd.indices.dispose();
  }
}

export default PexGPURenderer;
