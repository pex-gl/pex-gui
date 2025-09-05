import GAMMA from "./chunks/gamma.glsl.js";

export default /* glsl */ `#version 100
precision highp float;

const float PI = 3.1415926;

uniform samplerCube uTexture;
uniform bool uCorrectGamma;
uniform float uLevel;
uniform float uFlipEnvMap;

varying vec2 vTexCoord0;

${GAMMA}

void main() {
  float theta = PI * (vTexCoord0.x * 2.0);
  float phi = PI * (1.0 - vTexCoord0.y);

  float x = sin(phi) * sin(theta);
  float y = -cos(phi);
  float z = -sin(phi) * cos(theta);

  vec3 N = normalize(vec3(uFlipEnvMap * x, y, z));
  vec4 color = textureCube(uTexture, N, uLevel);
  if (uCorrectGamma) color = toGamma(color);
  gl_FragColor = color;
}`;
