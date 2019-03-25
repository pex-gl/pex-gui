const isPlask = require('is-plask')

const GAMMA = require('./chunks/gamma.glsl.js')
const RGBM = require('./chunks/rgbm.glsl.js')
const DECODE_ENCODE = require('./chunks/encode-decode.glsl.js')

module.exports = /* glsl */ `${
  !isPlask ? '#version 100\nprecision highp float;' : ''
}
${GAMMA}
${RGBM}
${DECODE_ENCODE}

uniform sampler2D uTexture;
uniform int uTextureEncoding;
varying vec2 vTexCoord0;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord0);
  color = decode(color, uTextureEncoding);
  // if LINEAR || RGBM then tonemap
  if (uTextureEncoding == LINEAR || uTextureEncoding == RGBM) {
    color.rgb = color.rgb / (color.rgb + 1.0);
  }
  gl_FragColor = encode(color, 2); // to gamma
}`
