import { fromHSL, getHSL } from "pex-color";

class GUIControl {
  constructor(options) {
    Object.assign(this, options);
  }

  getNormalizedValue(idx) {
    if (!this.contextObject) return 0;

    let val = this.contextObject[this.attributeName];
    if (
      this.options &&
      this.options.min !== undefined &&
      this.options.max !== undefined
    ) {
      if (this.type === "multislider") {
        val =
          (val[idx] - this.options.min) / (this.options.max - this.options.min);
      } else if (this.type === "color") {
        const hsl = getHSL(val);
        if (idx === 0) val = hsl[0];
        if (idx === 1) val = hsl[1];
        if (idx === 2) val = hsl[2];
        if (idx === 3) val = val[3];
      } else {
        val = (val - this.options.min) / (this.options.max - this.options.min);
      }
    }
    return val;
  }

  setNormalizedValue(val, idx) {
    if (!this.contextObject) return;

    if (
      this.options &&
      this.options.min !== undefined &&
      this.options.max !== undefined
    ) {
      if (this.type === "multislider") {
        const a = this.contextObject[this.attributeName];
        if (idx >= a.length) {
          return;
        }
        a[idx] = this.options.min + val * (this.options.max - this.options.min);
        val = a;
      } else if (this.type === "color") {
        const c = this.contextObject[this.attributeName];
        if (idx === 3) {
          c[3] = val;
        } else {
          const hsl = getHSL(c);
          if (idx === 0) hsl[0] = val;
          if (idx === 1) hsl[1] = val;
          if (idx === 2) hsl[2] = val;
          fromHSL(c, ...hsl);
        }

        val = c;
      } else {
        val = this.options.min + val * (this.options.max - this.options.min);
      }
      if (this.options && this.options.step) {
        val = val - (val % this.options.step);
      }
    }
    this.contextObject[this.attributeName] = val;
  }

  getSerializedValue() {
    return this.contextObject ? this.contextObject[this.attributeName] : "";
  }

  setSerializedValue(value) {
    if (this.type === "slider") {
      this.contextObject[this.attributeName] = value;
    } else if (this.type === "multislider") {
      this.contextObject[this.attributeName] = value;
    } else if (this.type === "color") {
      this.contextObject[this.attributeName].r = value.r;
      this.contextObject[this.attributeName].g = value.g;
      this.contextObject[this.attributeName].b = value.b;
      this.contextObject[this.attributeName].a = value.a;
    } else if (this.type === "toggle") {
      this.contextObject[this.attributeName] = value;
    } else if (this.type === "radiolist") {
      this.contextObject[this.attributeName] = value;
    }
  }

  getValue() {
    if (this.type === "slider") {
      return this.contextObject[this.attributeName];
    } else if (this.type === "multislider") {
      return this.contextObject[this.attributeName];
    } else if (this.type === "color") {
      return this.contextObject[this.attributeName];
    } else if (this.type === "toggle") {
      return this.contextObject[this.attributeName];
    } else {
      return 0;
    }
  }

  getStrValue() {
    if (this.type === "slider") {
      const str = `${this.contextObject[this.attributeName]}`;
      let dotPos = str.indexOf(".") + 1;

      if (dotPos === 0) return `${str}.0`;

      while (str.charAt(dotPos) === "0") {
        dotPos++;
      }
      return str.substr(0, dotPos + 2);
    } else if (this.type === "color") {
      return this.options.alpha ? "HSLA" : "HSL";
    } else if (this.type === "toggle") {
      return this.contextObject[this.attributeName];
    } else {
      return "";
    }
  }
}

export default GUIControl;
