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

const float PI = 3.1415926;

varying vec2 vTexCoord0;

uniform samplerCube uTexture;
uniform int uTextureEncoding;
uniform float uLevel;
uniform float uFlipEnvMap;

void main() {
  float theta = PI * (vTexCoord0.x * 2.0);
  float phi = PI * (1.0 - vTexCoord0.y);

  float x = sin(phi) * sin(theta);
  float y = -cos(phi);
  float z = -sin(phi) * cos(theta);

  vec3 N = normalize(vec3(uFlipEnvMap * x, y, z));
  vec4 color = textureCube(uTexture, N, uLevel);
  color = decode(color, uTextureEncoding);
  // if LINEAR || RGBM then tonemap
  if (uTextureEncoding == LINEAR || uTextureEncoding == RGBM) {
    color.rgb = color.rgb / (color.rgb + 1.0);
  }
  gl_FragColor = encode(color, 2); // to gamma
}`
