// Shared vertex stage for the texture visualisers. Maps the fullscreen quad
// into the pixel-space `rect` inside `viewport`. Ported verbatim from the GLSL
// main.vert: clip-space y is up in both WebGL and WebGPU, so the explicit y
// flip stays and yields the same on-screen orientation.
export default /* wgsl */ `
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) texCoord: vec2f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) texCoord: vec2f,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.texCoord = vec2f(input.texCoord.x, 1.0 - input.texCoord.y);

  let vertexPos = input.position * 0.5 + 0.5;
  let windowSize = vec2f(
    params.viewport.z - params.viewport.x,
    params.viewport.w - params.viewport.y,
  );

  var pos = vec2f(0.0);
  pos.x = params.rect.x / windowSize.x + vertexPos.x * (params.rect.z - params.rect.x) / windowSize.x;
  pos.y = params.rect.y / windowSize.y + vertexPos.y * (params.rect.w - params.rect.y) / windowSize.y;
  pos.y = 1.0 - pos.y;
  pos = pos * 2.0 - 1.0;

  output.position = vec4f(pos, 0.0, 1.0);
  return output;
}
`;
