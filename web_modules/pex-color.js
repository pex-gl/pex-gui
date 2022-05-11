import './common/web.dom-collections.iterator-6b2d1033.js';
import './common/es.string.replace-4c4b8f7a.js';
import './common/esnext.iterator.map-f17cc22a.js';
import './common/set-to-string-tag-75893d8e.js';
import './common/_commonjsHelpers-eb5a497e.js';

/**
 * Updates a color based on linear r, g, b, a values.
 * @param {color} color
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} [a]
 * @return {color}
 */

function fromRGB(color, r, g, b, a) {
  color[0] = r;
  color[1] = g;
  color[2] = b;
  if (a !== undefined) color[3] = a;
  return color;
}
/**
 * Alias for {@link copy}
 * @function
 */

const getRGB = copy;

/**
 * Creates a new color from linear values.
 * @param {number} [r=0]
 * @param {number} [g=0]
 * @param {number} [b=0]
 * @param {number} [a]
 * @return {color}
 */

function create(r = 0, g = 0, b = 0, a = 1) {
  return [r, g, b, a];
}
/**
 * Returns a copy of a color.
 * @param {color} color
 * @param {color} [out] Deprecated: use set(c, d)
 * @return {color}
 */

function copy(color, out) {
  if (out) set(out, color); // For backward compatibility.

  return color.slice();
}
/**
 * Sets a color to another color.
 * @param {color} color
 * @param {color|number} color2
 * @param {number} [g] // Deprecated: use fromRGB(color, r, g, b, a)
 * @param {number} [b] // Deprecated: use fromRGB(color, r, g, b, a)
 * @param {number} [a] // Deprecated: use fromRGB(color, r, g, b, a)
 * @return {color}
 */

function set(color, color2, g) {
  if (g !== undefined) return fromRGB(...arguments); // For backward compatibility.

  color[0] = color2[0];
  color[1] = color2[1];
  color[2] = color2[2];
  if (color2[3] !== undefined) color[3] = color2[3];
  return color;
}

/**
 * @typedef {number[]} bytes All components in the range 0 <= x <= 255
 */

/**
 * Updates a color based on byte values.
 * @param {color} color
 * @param {bytes} bytes
 * @returns {color}
 */
function fromRGBBytes(color, [r, g, b, a]) {
  color[0] = r / 255;
  color[1] = g / 255;
  color[2] = b / 255;
  if (a !== undefined) color[3] = a / 255;
  return color;
}
/**
 * Get RGB[A] color components as bytes array.
 * @param {color} color
 * @param {Array} out
 * @return {bytes}
 */

function getRGBBytes(color, out = []) {
  out[0] = Math.round(color[0] * 255);
  out[1] = Math.round(color[1] * 255);
  out[2] = Math.round(color[2] * 255);
  if (color[3] !== undefined) out[3] = Math.round(color[3] * 255);
  return out;
}

/**
 * @typedef {string} hex hexadecimal string (RGB[A] or RRGGBB[AA]).
 */

/**
 * Updates a color based on a hexadecimal string.
 * @param {color} color
 * @param {hex} hex Leading '#' is optional.
 * @return {color}
 */
function fromHex(color, hex) {
  hex = hex.replace(/^#/, "");
  let a = 1;

  if (hex.length === 8) {
    a = parseInt(hex.slice(6, 8), 16) / 255;
    hex = hex.slice(0, 6);
  } else if (hex.length === 4) {
    a = parseInt(hex.slice(3, 4).repeat(2), 16) / 255;
    hex = hex.slice(0, 3);
  }

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const num = parseInt(hex, 16);
  color[0] = (num >> 16 & 255) / 255;
  color[1] = (num >> 8 & 255) / 255;
  color[2] = (num & 255) / 255;
  if (color[3] !== undefined) color[3] = a;
  return color;
}
/**
 * Returns a hexadecimal string representation of a given color.
 * @param {color} color
 * @param {boolean} alpha Handle alpha
 * @return {hex}
 */

function getHex(color, alpha = true) {
  const c = color.map(val => Math.round(val * 255));
  return `#${(c[2] | c[1] << 8 | c[0] << 16 | 1 << 24).toString(16).slice(1).toUpperCase()}${alpha && color[3] !== undefined && color[3] !== 1 ? (c[3] | 1 << 8).toString(16).slice(1) : ""}`;
}

const setAlpha = (color, a) => {
  if (a !== undefined) color[3] = a;
  return color;
}; // https://github.com/hsluv/hsluv/tree/master/haxe/src/hsluv

const m = [[3.240969941904521, -1.537383177570093, -0.498610760293], [-0.96924363628087, 1.87596750150772, 0.041555057407175], [0.055630079696993, -0.20397695888897, 1.056971514242878]];
const minv = [[0.41239079926595, 0.35758433938387, 0.18048078840183], [0.21263900587151, 0.71516867876775, 0.072192315360733], [0.019330818715591, 0.11919477979462, 0.95053215224966]];
const REF_Y = 1;
const REF_U = 0.19783000664283;
const REF_V = 0.46831999493879;
const KAPPA = 903.2962962;
const EPSILON = 0.0088564516;

const yToL = Y => Y <= EPSILON ? Y / REF_Y * KAPPA : 116 * (Y / REF_Y) ** (1 / 3) - 16;

const lToY = L => L <= 8 ? REF_Y * L / KAPPA : REF_Y * ((L + 16) / 116) ** 3;

const xyzToLuv = ([X, Y, Z]) => {
  const divider = X + 15 * Y + 3 * Z;
  let varU = 4 * X;
  let varV = 9 * Y;

  if (divider != 0) {
    varU /= divider;
    varV /= divider;
  } else {
    varU = NaN;
    varV = NaN;
  }

  const L = yToL(Y);
  if (L == 0) return [0, 0, 0];
  return [L, 13 * L * (varU - REF_U), 13 * L * (varV - REF_V)];
};
const luvToXyz = ([L, U, V]) => {
  if (L == 0) return [0, 0, 0];
  const varU = U / (13 * L) + REF_U;
  const varV = V / (13 * L) + REF_V;
  const Y = lToY(L);
  const X = 0 - 9 * Y * varU / ((varU - 4) * varV - varU * varV);
  return [X, Y, (9 * Y - 15 * varV * Y - varV * X) / (3 * varV)];
};
const luvToLch = ([L, U, V]) => {
  const C = Math.sqrt(U * U + V * V);
  let H;

  if (C < 0.00000001) {
    H = 0;
  } else {
    const Hrad = Math.atan2(V, U);
    H = Hrad * 180 / Math.PI;
    if (H < 0) H = 360 + H;
  }

  return [L, C, H];
};
const lchToLuv = ([L, C, H]) => {
  const Hrad = H / 360 * 2 * Math.PI;
  return [L, Math.cos(Hrad) * C, Math.sin(Hrad) * C];
};
const getBounds = L => {
  const result = [];
  const sub1 = (L + 16) ** 3 / 1560896;
  const sub2 = sub1 > EPSILON ? sub1 : L / KAPPA;
  let _g = 0;

  while (_g < 3) {
    const c = _g++;
    const m1 = m[c][0];
    const m2 = m[c][1];
    const m3 = m[c][2];
    let _g1 = 0;

    while (_g1 < 2) {
      const t = _g1++;
      const top1 = (284517 * m1 - 94839 * m3) * sub2;
      const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
      const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      result.push({
        slope: top1 / bottom,
        intercept: top2 / bottom
      });
    }
  }

  return result;
};
const fromLinear = c => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
const toLinear = c => c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;

/**
 * @typedef {number[]} hsl hue, saturation, lightness. All components in the range 0 <= x <= 1
 */

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
/**
 * Updates a color based on HSL values and alpha.
 * @param {color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @return {color}
 */


function fromHSL(color, h, s, l, a) {
  if (s === 0) {
    color[0] = color[1] = color[2] = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    color[0] = hue2rgb(p, q, h + 1 / 3);
    color[1] = hue2rgb(p, q, h);
    color[2] = hue2rgb(p, q, h - 1 / 3);
  }

  return setAlpha(color, a);
}
/**
 * Returns a HSL representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {hsl}
 */

function getHSL([r, g, b, a], out = []) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  out[2] = (max + min) / 2;

  if (max === min) {
    out[0] = out[1] = 0; // achromatic
  } else {
    const d = max - min;
    out[1] = out[2] > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        out[0] = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        out[0] = (b - r) / d + 2;
        break;

      case b:
        out[0] = (r - g) / d + 4;
        break;
    }

    out[0] /= 6;
  }

  return setAlpha(out, a);
}

/**
 * @typedef {number[]} hsv hue, saturation, value. All components in the range 0 <= x <= 1
 */

/**
 * Updates a color based on HSV values and alpha.
 * @param {color} color
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @param {number} [a]
 * @return {color}
 */

function fromHSV(color, h, s, v, a) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      color[0] = v;
      color[1] = t;
      color[2] = p;
      break;

    case 1:
      color[0] = q;
      color[1] = v;
      color[2] = p;
      break;

    case 2:
      color[0] = p;
      color[1] = v;
      color[2] = t;
      break;

    case 3:
      color[0] = p;
      color[1] = q;
      color[2] = v;
      break;

    case 4:
      color[0] = t;
      color[1] = p;
      color[2] = v;
      break;

    case 5:
      color[0] = v;
      color[1] = p;
      color[2] = q;
      break;
  }

  return setAlpha(color, a);
}
/**
 * Returns a HSV representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {hsv}
 */

function getHSV([r, g, b, a], out = []) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  out[2] = max;
  const d = max - min;
  out[1] = max === 0 ? 0 : d / max;

  if (max === min) {
    out[0] = 0; // achromatic
  } else {
    switch (max) {
      case r:
        out[0] = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        out[0] = (b - r) / d + 2;
        break;

      case b:
        out[0] = (r - g) / d + 4;
        break;
    }

    out[0] /= 6;
  }

  return setAlpha(out, a);
}

/**
 * @typedef {number[]} xyz Components range: 0 <= x <= 95; 0 <= y <= 100; 0 <= z <= 108;
 */

/**
 * Updates a color based on XYZ values and alpha.
 * @param {color} color
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} a
 * @return {color}
 */

function fromXYZ(color, x, y, z, a) {
  const r = x * m[0][0] + y * m[0][1] + z * m[0][2];
  const g = x * m[1][0] + y * m[1][1] + z * m[1][2];
  const b = x * m[2][0] + y * m[2][1] + z * m[2][2];
  color[0] = fromLinear(r / 100);
  color[1] = fromLinear(g / 100);
  color[2] = fromLinear(b / 100);
  return setAlpha(color, a);
}
/**
 * Returns a XYZ representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {color}
 */

function getXYZ([r, g, b, a], out = []) {
  const lr = toLinear(r) * 100;
  const lg = toLinear(g) * 100;
  const lb = toLinear(b) * 100;
  out[0] = lr * minv[0][0] + lg * minv[0][1] + lb * minv[0][2];
  out[1] = lr * minv[1][0] + lg * minv[1][1] + lb * minv[1][2];
  out[2] = lr * minv[2][0] + lg * minv[2][1] + lb * minv[2][2];
  return setAlpha(out, a);
}

/**
 * @typedef {number[]} lab CIELAB with D65 standard illuminant. Components range: 0 <= l <= 100; -128 <= a <= 127; -128 <= b <= 127;
 */

/**
 * Illuminant D65: x,y,z tristimulus values
 * @private
 * @see {@link https://en.wikipedia.org/wiki/Illuminant_D65}
 */

const D65 = [95.047, 100, 108.883];

function fromLabValueToXYZValue(val, white) {
  const pow = val ** 3;
  return (pow > 0.008856 ? pow : (val - 16 / 116) / 7.787) * white;
}

function fromXYZValueToLabValue(val, white) {
  val /= white;
  return val > 0.008856 ? val ** (1 / 3) : 7.787 * val + 16 / 116;
}
/**
 * Updates a color based on Lab values and alpha.
 * @param {color} color
 * @param {number} l
 * @param {number} a
 * @param {number} b
 * @param {number} α
 * @return {color}
 */


function fromLab(color, l, a, b, α) {
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  return fromXYZ(color, fromLabValueToXYZValue(x, D65[0]), fromLabValueToXYZValue(y, D65[1]), fromLabValueToXYZValue(z, D65[2]), α);
}
/**
 * Returns a Lab representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {lab}
 */

function getLab(color, out = []) {
  const xyz = getXYZ(color);
  const x = fromXYZValueToLabValue(xyz[0], D65[0]);
  const y = fromXYZValueToLabValue(xyz[1], D65[1]);
  const z = fromXYZValueToLabValue(xyz[2], D65[2]);
  out[0] = 116 * y - 16;
  out[1] = 500 * (x - y);
  out[2] = 200 * (y - z);
  return setAlpha(out, color[3]);
}

/**
 * @typedef {number[]} oklab Components range: 0 <= l <= 100; -128 <= a <= 127; -128 <= b <= 127;
 * @see {@link https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab}
 */

/**
 * Updates a color based on Oklab values and alpha.
 * @param {color} color
 * @param {number} l
 * @param {number} a
 * @param {number} b
 * @param {number} [α]
 * @return {color}
 */

function fromOklab(color, L, a, b, α) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  color[0] = fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  color[1] = fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  color[2] = fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return setAlpha(color, α);
}
/**
 * Returns an Oklab representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {oklab}
 */

function getOklab([r, g, b, a], out = []) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  out[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  out[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  out[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return setAlpha(out, a);
}

/**
 * @typedef {number[]} lchuv CIELChuv Luminance Chroma Hue. All components in the range 0 <= x <= 1
 * Components range: 0 <= l <= 100; 0 <= c <= 100; 0 <= h <= 360;
 */

/**
 * Updates a color based on LCHuv values and alpha.
 * @param {color} color
 * @param {number} l
 * @param {number} c
 * @param {number} h
 * @param {number} [a]
 * @return {color}
 */

function fromLCHuv(color, l, c, h, a) {
  return fromXYZ(color, ...luvToXyz(lchToLuv([l, c, h])).map(n => n * 100), a);
}
/**
 * Returns a LCHuv representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {lchuv}
 */

function getLCHuv([r, g, b, a], out = []) {
  [out[0], out[1], out[2]] = luvToLch(xyzToLuv(getXYZ([r, g, b]).map(n => n / 100)));
  return setAlpha(out, a);
}

/**
 * @typedef {number[]} hsluv CIELUV hue, saturation, lightness. All components in the range 0 <= x <= 1
 * Components range: 0 <= h <= 360; 0 <= s <= 100; 0 <= l <= 100;
 */

const lengthOfRayUntilIntersect = (theta, {
  intercept,
  slope
}) => intercept / (Math.sin(theta) - slope * Math.cos(theta));

const maxChromaForLH = (L, H) => {
  const hrad = H / 360 * Math.PI * 2;
  const bounds = getBounds(L);
  let min = Infinity;
  let _g = 0;

  while (_g < bounds.length) {
    const bound = bounds[_g];
    ++_g;
    const length = lengthOfRayUntilIntersect(hrad, bound);
    if (length >= 0) min = Math.min(min, length);
  }

  return min;
};

const hsluvToLch = ([H, S, L]) => {
  if (L > 99.9999999) return [100, 0, H];
  if (L < 0.00000001) return [0, 0, H];
  return [L, maxChromaForLH(L, H) / 100 * S, H];
};

const lchToHsluv = ([L, C, H]) => {
  if (L > 99.9999999) return [H, 0, 100];
  if (L < 0.00000001) return [H, 0, 0];
  return [H, C / maxChromaForLH(L, H) * 100, L];
};
/**
 * Updates a color based on HSLuv values and alpha.
 * @param {color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @return {color}
 */


function fromHSLuv(color, h, s, l, a) {
  return fromLCHuv(color, ...hsluvToLch([h, s, l]), a);
}
/**
 * Returns a HSLuv representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {hsluv}
 */

function getHSLuv([r, g, b, a], out = []) {
  [out[0], out[1], out[2]] = lchToHsluv(getLCHuv([r, g, b]));
  return setAlpha(out, a);
}

/**
 * @typedef {number[]} hpluv CIELUV hue, saturation, lightness. All components in the range 0 <= x <= 1.
 * Components range: 0 <= h <= 360; 0 <= s <= 100; 0 <= l <= 100;
 */

const distanceLineFromOrigin = ({
  intercept,
  slope
}) => Math.abs(intercept) / Math.sqrt(slope ** 2 + 1);

const maxSafeChromaForL = L => {
  const bounds = getBounds(L);
  let min = Infinity;
  let _g = 0;

  while (_g < bounds.length) {
    const bound = bounds[_g];
    ++_g;
    const length = distanceLineFromOrigin(bound);
    min = Math.min(min, length);
  }

  return min;
};

const hpluvToLch = ([H, S, L]) => {
  if (L > 99.9999999) return [100, 0, H];
  if (L < 0.00000001) return [0, 0, H];
  return [L, maxSafeChromaForL(L) / 100 * S, H];
};

const lchToHpluv = ([L, C, H]) => {
  if (L > 99.9999999) return [H, 0, 100];
  if (L < 0.00000001) return [H, 0, 0];
  return [H, C / maxSafeChromaForL(L) * 100, L];
};
/**
 * Updates a color based on HPLuv values and alpha.
 * @param {color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @return {color}
 */


function fromHPLuv(color, h, s, l, a) {
  return fromLCHuv(color, ...hpluvToLch([h, s, l]), a);
}
/**
 * Returns a HPLuv representation of a given color.
 * @param {color} color
 * @param {Array} out
 * @return {hpluv}
 */

function getHPLuv([r, g, b, a], out = []) {
  [out[0], out[1], out[2]] = lchToHpluv(getLCHuv([r, g, b]));
  return setAlpha(out, a);
}

export { copy, create, fromHPLuv, fromHSL, fromHSLuv, fromHSV, fromHex, fromLCHuv, fromLab, fromOklab, fromRGB, fromRGBBytes, fromXYZ, getHPLuv, getHSL, getHSLuv, getHSV, getHex, getLCHuv, getLab, getOklab, getRGB, getRGBBytes, getXYZ, set };
