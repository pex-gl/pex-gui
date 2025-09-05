import CanvasRenderer from "./CanvasRenderer.js";

class PexContextRenderer extends CanvasRenderer {
  #ctx;

  constructor(opts) {
    super(opts);

    const { ctx } = opts;

    this.#ctx = ctx;

    this.rendererTexture = ctx.texture2D({
      width: opts[0],
      height: opts[1],
      pixelFormat: ctx.PixelFormat.RGBA8,
    });
  }

  draw(items) {
    super.draw(items);
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

  dispose() {
    super.dispose();

    this.#ctx.dispose(this.rendererTexture);
  }
}

export default PexContextRenderer;
