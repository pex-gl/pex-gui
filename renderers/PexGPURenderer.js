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
  #views = new WeakMap();
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
    return (
      texture.viewDimension === "cube" || texture.viewDimension === "cube-array"
    );
  }

  /**
   * Get the resource to bind as `uTexture` in the preview shaders.
   *
   * @param {import("pex-gpu").GpuTexture} texture
   * @param {number} [layer=0] Array layer, or cube index for a cube array.
   * @returns {import("pex-gpu").GpuTexture | GPUTextureView}
   */
  #binding(texture, layer = 0) {
    const cubeArray = texture.viewDimension === "cube-array";
    const layered = cubeArray || texture.viewDimension === "2d-array";
    const aspect = texture.format?.includes("stencil")
      ? "depth-only"
      : undefined;
    // Shaders declare a plain 2d/cube texture: stencil formats need the depth
    // aspect, layered textures a single slice.
    if (!layered && !aspect) return texture;

    // pex-gpu caches bind groups by view identity: a view per frame would leak
    // a bind group per frame.
    let views = this.#views.get(texture);
    if (!views) {
      views = new Map();
      this.#views.set(texture, views);
    }

    let view = views.get(layer);
    if (!view) {
      view = texture.texture.createView({
        ...(aspect && { aspect }),
        // A cube-array layer is one cube, so six array layers wide.
        ...(layered && {
          dimension: cubeArray ? "cube" : "2d",
          baseArrayLayer: cubeArray ? layer * 6 : layer,
          arrayLayerCount: cubeArray ? 6 : 1,
        }),
      });
      views.set(layer, view);
    }
    return view;
  }

  drawTexture2d(viewport, { texture, rect, flipY, near, far, layer }) {
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
      uTexture: this.#binding(texture, layer),
    };
    gpu.submit(this.#ctx, cmd);
  }

  drawTextureCube(
    viewport,
    { texture, rect, level, flipEnvMap, near, far, layer },
  ) {
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
      uTexture: this.#binding(texture, layer),
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
