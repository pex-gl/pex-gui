import GAMMA from "./chunks/gamma.glsl.js";
import RGBM from "./chunks/rgbm.glsl.js";
import DECODE_ENCODE from "./chunks/encode-decode.glsl.js";

export default /* glsl */ `#version 100
precision highp float;

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
}`;
