/**
 * @typedef {object} GUIControlOptions
 * @property {number} [min=0]
 * @property {number} [max=0]
 * @property {"color"} [type] Interpret an array as color.
 * @property {string} [colorSpace] Display a color as values of a pex-color color space.
 * @property {boolean} [alpha] Add a 4th slider for colors.
 * @property {HTMLImageElement} [palette] Draw a palette image as color picker.
 * @property {boolean} [flipEnvMap] Should be 1 for dynamic cubemaps and -1 for cubemaps from file with X axis flipped.
 * @property {boolean} [flipY] Flip texture 2D vertically.
 * @property {number} [level] Level of detail for cube textures.
 */
/**
 * @typedef {object} GUIOptions
 * @property {boolean} [pixelRatio=window.devicePixelRatio]
 * @property {boolean} [theme={}] See [theme file]{@link https://github.com/pex-gl/pex-gui/blob/main/theme.js} for all options.
 * @property {number} [scale=1]
 * @property {boolean} [responsive=true] Adapts to canvas dimension.
 */

/** @typedef {import("pex-context").ctx} ctx  */

export {};
