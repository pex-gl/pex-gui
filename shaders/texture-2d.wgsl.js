import GAMMA from "./chunks/gamma.wgsl.js";
import VERT from "./main.vert.wgsl.js";

export default /* wgsl */ `
struct Params {
  viewport: vec4f,
  rect: vec4f,
  correctGamma: u32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var uSampler: sampler;
@group(0) @binding(2) var uTexture: texture_2d<f32>;

${GAMMA}
${VERT}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  var color = textureSample(uTexture, uSampler, input.texCoord);
  if (params.correctGamma != 0u) { color = toGamma(color); }
  return color;
}
`;
