import { getHex } from "pex-color";
import { utils } from "pex-math";

function rectSet4(a, x, y, w, h) {
  a[0][0] = x;
  a[0][1] = y;
  a[1][0] = x + w;
  a[1][1] = y + h;
  return a;
}

function makePaletteImage(item, w, img) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = (w * img.height) / img.width;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  item.options.paletteImage = canvas;
  item.options.paletteImage.data = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  ).data;
  item.options.paletteImage.aspectRatio = canvas.height / canvas.width;
  item.dirty = true;
}

class CanvasRenderer {
  constructor({ width, height, pixelRatio = devicePixelRatio, theme }) {
    this.pixelRatio = pixelRatio;
    this.theme = theme;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.dirty = true;
  }

  draw(items) {
    this.dirty = false;

    const {
      fontFamily,
      fontSize,
      capHeight,
      leftOffset,
      topOffset,
      columnWidth,
      tabHeight,
      headerSize,
      titleHeight,
      itemHeight,
      graphHeight,
      padding,
      textPadding,
    } = this.theme;

    const sliderHeight = 0.7 * itemHeight;
    const buttonHeight = 1.2 * itemHeight;

    const ctx = this.ctx;

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const fontCapOffset = capHeight * fontSize;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";

    let dx = leftOffset;
    let dy = topOffset;
    let w = columnWidth;
    const gap = padding;

    let cellSize = 0;
    let numRows = 0;
    let columnIndex = 0;
    const tabs = items.filter(({ type }) => type === "tab");
    const defaultDy = tabs.length
      ? topOffset + tabHeight + padding * 3
      : topOffset;

    tabs.forEach((tab) => {
      ctx.fillStyle = this.theme.background;
      ctx.fillRect(dx, dy, w, tabHeight + padding * 2);

      ctx.fillStyle = tab.current
        ? this.theme.tabBackgroundActive
        : this.theme.tabBackground;

      const x = dx + padding;
      const y = dy + padding;
      const width = w - padding * 2;
      ctx.fillRect(x, y, width, tabHeight);

      if (!tab.current) {
        ctx.fillStyle = this.theme.background;
        ctx.fillRect(x, dy + tabHeight + padding / 2, width, padding / 2);
      }

      ctx.fillStyle = tab.current
        ? this.theme.tabColorActive
        : this.theme.tabColor;
      ctx.fillText(
        tab.title,
        x + textPadding,
        y + tabHeight / 2 + fontCapOffset
      );

      rectSet4(tab.activeArea, x, y, width, tabHeight);

      dx += w + gap;
    });

    dx = leftOffset;

    let maxWidth = 0;
    let maxHeight = 0;
    let needInitialDy = true;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (Number.isFinite(item.x)) dx = item.x;
      if (Number.isFinite(item.y)) dy = item.y;

      let eh = itemHeight;
      if (item.type === "tab") continue;

      if (tabs.length > 0) {
        const prevTabs = items.filter(
          ({ type }, index) => index < i && type === "tab"
        );
        const parentTab = prevTabs[prevTabs.length - 1];
        if (parentTab && !parentTab.current) {
          continue;
        } else {
          if (needInitialDy && item.type !== "column") {
            needInitialDy = false;
            dy += tabHeight;
          }
        }
        needInitialDy = false;
      }

      const x = dx + padding;
      const width = w - padding * 2;
      const textY = titleHeight / 2 + fontCapOffset;

      // Compute item height
      if (item.type === "column") {
        dx = leftOffset + columnIndex * (w + gap);
        dy = defaultDy;
        w = item.width;
        columnIndex++;
        continue;
      } else if (item.type === "slider") {
        eh = titleHeight + sliderHeight;
      } else if (item.type === "toggle") {
        eh = padding + itemHeight;
      } else if (item.type === "multislider") {
        const numSliders = item.getValue().length;
        eh =
          titleHeight + numSliders * sliderHeight + (numSliders - 1) * padding;
      } else if (item.type === "color") {
        const numSliders = item.options.alpha ? 4 : 3;
        const sliderGap = item.options.paletteImage ? 0 : 1;
        eh =
          titleHeight +
          numSliders * sliderHeight +
          (numSliders - sliderGap) * padding;
        if (item.options.paletteImage) {
          eh += width * item.options.paletteImage.aspectRatio;
        }
      } else if (item.type === "button") {
        eh = padding + buttonHeight;
      } else if (item.type === "texture2D") {
        eh = titleHeight + (item.texture.height * width) / item.texture.width;
      } else if (item.type === "textureCube") {
        eh = titleHeight + width / 2;
      } else if (item.type === "radiolist") {
        eh =
          titleHeight +
          item.items.length * itemHeight +
          (item.items.length - 1) * padding * 2;
      } else if (item.type === "texturelist") {
        cellSize = Math.floor(width / item.itemsPerRow);
        numRows = Math.ceil(item.items.length / item.itemsPerRow);
        eh = titleHeight + numRows * cellSize;
      } else if (item.type === "header") {
        eh = padding + headerSize;
      } else if (item.type === "text") {
        eh = titleHeight + buttonHeight;
      } else if (item.type === "graph") {
        eh = titleHeight + graphHeight;
      } else if (item.type === "stats") {
        eh = titleHeight + Object.entries(item.stats).length * titleHeight;
      } else if (item.type === "label") {
        eh = item.title.split("\n").length * titleHeight;
      }

      const needsPadding = !["column", "label"].includes(item.type);

      // Draw background
      if (item.type === "separator") {
        eh /= 2;
      } else {
        ctx.fillStyle = this.theme.background;
        ctx.fillRect(dx, dy, w, eh + (needsPadding ? padding : 0));
      }

      // Draw item
      if (item.type === "slider") {
        const y = dy + titleHeight;
        const height = eh - titleHeight;

        ctx.fillStyle = this.theme.color;
        ctx.fillText(
          `${item.title}: ${item.getStrValue()}`,
          x + textPadding,
          dy + textY
        );

        ctx.fillStyle = this.theme.input;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = this.theme.accent;
        ctx.fillRect(x, y, width * item.getNormalizedValue(), height);

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "multislider" || item.type === "color") {
        const isColor = item.type === "color";
        const y = dy + titleHeight;
        const height = eh - titleHeight;
        const numSliders = isColor
          ? item.options.alpha
            ? 4
            : 3
          : item.getValue().length;

        ctx.fillStyle = this.theme.color;
        ctx.fillText(
          `${item.title}: ${item.getStrValue()}`,
          x + textPadding,
          dy + textY
        );

        for (let j = 0; j < numSliders; j++) {
          const sliderY = y + j * (sliderHeight + padding);
          ctx.fillStyle = this.theme.input;
          ctx.fillRect(x, sliderY, width, sliderHeight);

          ctx.fillStyle = this.theme.accent;
          ctx.fillRect(
            x,
            sliderY,
            width * item.getNormalizedValue(j),
            sliderHeight
          );
        }

        if (isColor) {
          const sqSize = titleHeight * 0.6;

          ctx.fillStyle = getHex(item.contextObject[item.attributeName]);
          ctx.fillRect(
            dx + w - sqSize - padding,
            dy + titleHeight * 0.2,
            sqSize,
            sqSize
          );

          if (item.options?.palette && !item.options.paletteImage) {
            if (item.options.palette.width) {
              makePaletteImage(item, w, item.options.palette);
            } else {
              const img = new Image();
              img.onload = () => {
                makePaletteImage(item, w, img);
              };
              img.src = item.options.palette;
            }
          }

          if (item.options.paletteImage) {
            ctx.drawImage(
              item.options.paletteImage,
              x,
              y + (sliderHeight + padding) * numSliders,
              width,
              width * item.options.paletteImage.aspectRatio
            );
          }
        }

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "button") {
        const y = dy + padding;
        const height = buttonHeight;

        ctx.fillStyle = item.active ? this.theme.accent : this.theme.input;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = item.active ? this.theme.input : this.theme.color;
        ctx.fillText(
          item.title,
          x + textPadding * 2,
          y + height / 2 + fontCapOffset
        );

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "toggle") {
        const y = dy + padding;
        const height = itemHeight;
        ctx.fillStyle = item.contextObject[item.attributeName]
          ? this.theme.accent
          : this.theme.input;
        ctx.fillRect(x, y, height, height);

        ctx.fillStyle = this.theme.color;
        ctx.fillText(
          item.title,
          x + itemHeight + textPadding * 2,
          dy + padding + itemHeight / 2 + fontCapOffset
        );

        rectSet4(item.activeArea, x, y, height, height);
      } else if (item.type === "radiolist") {
        const y = dy + titleHeight;
        const height =
          item.items.length * itemHeight +
          (item.items.length - 1) * 2 * padding;

        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);

        for (let j = 0; j < item.items.length; j++) {
          const i = item.items[j];
          const radioY = j * (itemHeight + padding * 2);

          ctx.fillStyle =
            item.contextObject[item.attributeName] === i.value
              ? this.theme.accent
              : this.theme.input;
          ctx.fillRect(x, y + radioY, itemHeight, itemHeight);

          ctx.fillStyle = this.theme.color;
          ctx.fillText(
            i.name,
            x + itemHeight + textPadding * 2,
            titleHeight + radioY + dy + itemHeight / 2 + fontCapOffset
          );
        }

        rectSet4(item.activeArea, x, y, itemHeight, height);
      } else if (item.type === "texturelist") {
        const y = dy + titleHeight;
        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);

        for (let j = 0; j < item.items.length; j++) {
          const col = j % item.itemsPerRow;
          const row = Math.floor(j / item.itemsPerRow);
          const itemX = x + col * cellSize;
          const itemY = dy + titleHeight + row * cellSize;
          let shrink = 0;
          if (item.items[j].value === item.contextObject[item.attributeName]) {
            ctx.fillStyle = "none";
            ctx.strokeStyle = this.theme.accent;
            ctx.lineWidth = padding;
            ctx.strokeRect(
              itemX + padding * 0.5,
              itemY + padding * 0.5,
              cellSize - 1 - padding,
              cellSize - 1 - padding
            );
            ctx.lineWidth = 1;
            shrink = padding;
          }
          if (!item.items[j].activeArea) {
            item.items[j].activeArea = [
              [0, 0],
              [0, 0],
            ];
          }
          rectSet4(
            item.items[j].activeArea,
            itemX + shrink,
            itemY + shrink,
            cellSize - 1 - 2 * shrink,
            cellSize - 1 - 2 * shrink
          );
        }

        rectSet4(item.activeArea, x, y, width, cellSize * numRows);
      } else if (item.type === "texture2D") {
        const y = dy + titleHeight;
        const height = eh - titleHeight;

        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "textureCube") {
        const y = dy + titleHeight;
        const height = eh - titleHeight;
        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "header") {
        ctx.fillStyle = this.theme.headerBackground;
        ctx.fillRect(x, dy + padding, width, eh - padding);

        ctx.fillStyle = this.theme.headerColor;
        ctx.fillText(
          item.title,
          x + textPadding,
          dy + padding + headerSize / 2 + fontCapOffset
        );
      } else if (item.type === "text") {
        const y = dy + titleHeight;
        const height = eh - titleHeight;

        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);

        ctx.fillStyle = this.theme.input;
        ctx.fillRect(
          x,
          y,
          item.activeArea[1][0] - item.activeArea[0][0],
          item.activeArea[1][1] - item.activeArea[0][1]
        );

        ctx.fillStyle = this.theme.color;
        ctx.fillText(
          item.contextObject[item.attributeName],
          x + textPadding * 2,
          y + buttonHeight / 2 + fontCapOffset
        );
        if (item.focus) {
          ctx.strokeStyle = this.theme.accent;
          ctx.strokeRect(
            item.activeArea[0][0] - 0.5,
            item.activeArea[0][1] - 0.5,
            item.activeArea[1][0] - item.activeArea[0][0],
            item.activeArea[1][1] - item.activeArea[0][1]
          );
        }

        rectSet4(item.activeArea, x, y, width, height);
      } else if (item.type === "graph") {
        const y = dy + titleHeight;
        const height = eh - titleHeight;

        if (item.values.length > width) item.values.shift();
        if (item.values.length) {
          item.max = item.options.max ?? Math.max(...item.values);
        }
        if (item.values.length) {
          item.min = item.options.min ?? Math.min(...item.values);
        }

        ctx.fillStyle = this.theme.graphBackground;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = this.theme.background;
        ctx.beginPath();
        ctx.moveTo(x, y + padding);
        ctx.lineTo(x + width, y + padding);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + height - padding);
        ctx.lineTo(x + width, y + height - padding);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = this.theme.color;
        ctx.save();
        ctx.font = `${fontSize * 0.5}px ${fontFamily}`;
        ctx.textAlign = "right";
        const textX = x + width - padding;
        if (item.max !== undefined) {
          ctx.fillText(item.max, textX, y + padding * 2.5);
        }
        if (item.min !== undefined) {
          ctx.fillText(item.min, textX, y + height - padding * 2.5);
        }
        ctx.restore();

        ctx.strokeStyle = this.theme.color;
        ctx.beginPath();
        for (let j = 0; j < item.values.length; j++) {
          const v = utils.map(item.values[j], item.min, item.max, 0, 1);
          ctx[j === 0 ? "moveTo" : "lineTo"](
            x + j,
            y + height - v * (height - padding * 2) - padding
          );
        }
        ctx.stroke();

        ctx.fillText(
          `${item.title}: ${item.values[item.values.length - 1] || ""}`,
          x + textPadding,
          dy + textY
        );
      } else if (item.type === "stats") {
        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);
        Object.entries(item.stats).map(([name, value], i) => {
          ctx.fillText(
            `${name}: ${value}`,
            x + textPadding * 2,
            dy + textY + titleHeight * (i + 1)
          );
        });
      } else if (item.type === "label") {
        ctx.fillStyle = this.theme.color;
        const lines = item.title.split("\n");
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], x + textPadding, dy + textY + titleHeight * i);
        }
      } else if (item.type === "separator") {
      } else {
        ctx.fillStyle = this.theme.color;
        ctx.fillText(item.title, x + textPadding, dy + textY);
      }
      dy += eh + (needsPadding ? padding : 0) + gap;
      maxWidth = Math.max(maxWidth, dx + w + leftOffset);
      maxHeight = Math.max(maxHeight, dy + topOffset);
    }

    this.afterDraw();
    ctx.restore();

    maxWidth = Math.max(maxWidth, tabs.length * (w + gap));

    if (maxWidth && maxHeight) {
      maxWidth = (maxWidth * this.pixelRatio) | 0;
      maxHeight = (maxHeight * this.pixelRatio) | 0;
      if (this.canvas.width !== maxWidth) {
        this.canvas.width = maxWidth;
        this.dirty = true;
      }
      if (this.canvas.height !== maxHeight) {
        this.canvas.height = maxHeight;
        this.dirty = true;
      }
      if (this.dirty) {
        this.draw(items);
      }
    }
  }

  afterDraw() {}

  getTexture() {
    return this.canvas;
  }

  dispose() {
    this.canvas.remove();
  }
}

export default CanvasRenderer;
