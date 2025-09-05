import GAMMA from "./chunks/gamma.glsl.js";

export default /* glsl */ `#version 100
precision highp float;

uniform sampler2D uTexture;
uniform bool uCorrectGamma;

varying vec2 vTexCoord0;

${GAMMA}

void main() {
  vec4 color = texture2D(uTexture, vTexCoord0);
  if (uCorrectGamma) color = toGamma(color);
  gl_FragColor = color;
}`;
