import GAMMA from "./chunks/gamma.glsl.js";

export default /* glsl */ `#version 100
precision highp float;

uniform sampler2D uTexture;
uniform bool uCorrectGamma;
uniform float uExposure;

varying vec2 vTexCoord0;

${GAMMA}

void main() {
  vec4 color = texture2D(uTexture, vTexCoord0);
  color.rgb *= uExposure;
  if (uCorrectGamma) color = toGamma(color);
  gl_FragColor = color;
}`;
