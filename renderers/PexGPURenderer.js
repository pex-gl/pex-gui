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

const isDepth = (texture) => !!texture.format?.startsWith("depth");

const LINEAR_DEPTH = { near: 0, far: 1 };

class PexGPURenderer extends CanvasRenderer {
  #ctx;
  #texture;
  #retired = [];
  #sampler;
  #depthSampler;
  #depthAspectViews = new WeakMap();
  #drawTexture2dCmd;
  #drawTextureCubeCmd;
  #drawTextureDepth2dCmd;
  #drawTextureDepthCubeCmd;

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
    this.#depthSampler = gpu.createSampler(ctx, { filter: "nearest" });

    const drawCommand = (label, source, depth) => {
      const wgsl = source({ depth });
      return {
        label: `gui_draw${label}`,
        pipeline: {
          label: `gui_${label}`,
          vertex: wgsl,
          fragment: wgsl,
          blend: BLEND,
        },
        attributes,
        indices,
      };
    };

    this.#drawTexture2dCmd = drawCommand("texture2d", TEXTURE_2D_WGSL, false);
    this.#drawTextureCubeCmd = drawCommand(
      "textureCube",
      TEXTURE_CUBE_WGSL,
      false,
    );
    this.#drawTextureDepth2dCmd = drawCommand(
      "textureDepth2d",
      TEXTURE_2D_WGSL,
      true,
    );
    this.#drawTextureDepthCubeCmd = drawCommand(
      "textureDepthCube",
      TEXTURE_CUBE_WGSL,
      true,
    );

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

    while (this.#retired.length) this.#retired.pop().dispose();

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
    return texture.viewDimension === "cube";
  }

  #depthBinding(texture) {
    if (!texture.format.includes("stencil")) return texture;

    let view = this.#depthAspectViews.get(texture);
    if (!view) {
      view = texture.texture.createView({ aspect: "depth-only" });
      this.#depthAspectViews.set(texture, view);
    }
    return view;
  }

  drawTexture2d(viewport, { texture, rect, flipY, near, far }) {
    if (flipY) {
      const y0 = rect[1];
      rect[1] = rect[3];
      rect[3] = y0;
    }

    const depth = isDepth(texture);
    const cmd = depth ? this.#drawTextureDepth2dCmd : this.#drawTexture2dCmd;
    cmd.viewport = viewport;
    cmd.uniforms = {
      params: {
        viewport,
        rect,
        correctGamma: correctGamma(texture),
        near: near ?? LINEAR_DEPTH.near,
        far: far ?? LINEAR_DEPTH.far,
      },
      uSampler: depth ? this.#depthSampler : this.#sampler,
      uTexture: depth ? this.#depthBinding(texture) : texture,
    };
    gpu.submit(this.#ctx, cmd);
  }

  drawTextureCube(viewport, { texture, rect, level, flipEnvMap, near, far }) {
    const depth = isDepth(texture);
    const cmd = depth
      ? this.#drawTextureDepthCubeCmd
      : this.#drawTextureCubeCmd;
    cmd.viewport = viewport;
    cmd.uniforms = {
      params: {
        viewport,
        rect,
        correctGamma: correctGamma(texture),
        level: level ?? 0,
        flipEnvMap: flipEnvMap ?? 1,
        near: near ?? LINEAR_DEPTH.near,
        far: far ?? LINEAR_DEPTH.far,
      },
      uSampler: depth ? this.#depthSampler : this.#sampler,
      uTexture: depth ? this.#depthBinding(texture) : texture,
    };
    gpu.submit(this.#ctx, cmd);
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
