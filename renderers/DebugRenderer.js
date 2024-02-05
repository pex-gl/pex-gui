import { rect } from "pex-geom";

import CanvasRenderer from "./CanvasRenderer.js";

class DebugRenderer extends CanvasRenderer {
  constructor(opts) {
    super(opts);
  }

  draw(items) {
    this.items = items;
    super.draw(items);
  }

  afterDraw() {
    this.items.forEach((item) => {
      this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      this.ctx.strokeRect(
        item.activeArea[0][0],
        item.activeArea[0][1],
        rect.width(item.activeArea),
        rect.height(item.activeArea),
      );
    });
  }
}

export default DebugRenderer;
