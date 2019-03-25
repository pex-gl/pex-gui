module.exports = /* glsl */ `
attribute vec2 aPosition;
attribute vec2 aTexCoord0;

uniform vec4 uViewport;
uniform vec4 uRect;

varying vec2 vTexCoord0;

void main() {
  vTexCoord0 = vec2(aTexCoord0.x, 1.0 - aTexCoord0.y);
  vec2 vertexPos = aPosition * 0.5 + 0.5;

  vec2 pos = vec2(0.0, 0.0); // window pos
  vec2 windowSize = vec2(uViewport.z - uViewport.x, uViewport.w - uViewport.y);
  pos.x = uRect.x / windowSize.x + vertexPos.x * (uRect.z - uRect.x) / windowSize.x;
  pos.y = uRect.y / windowSize.y + vertexPos.y * (uRect.w - uRect.y) / windowSize.y;
  pos.y = 1.0 - pos.y;
  pos = pos * 2.0 - 1.0;

  gl_Position = vec4(pos, 0.0, 1.0);
}`
