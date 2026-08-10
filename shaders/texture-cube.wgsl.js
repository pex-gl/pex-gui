import GAMMA from "./chunks/gamma.wgsl.js";
import VERT from "./main.vert.wgsl.js";

export default /* wgsl */ `
const PI: f32 = 3.1415926;

struct Params {
  viewport: vec4f,
  rect: vec4f,
  correctGamma: u32,
  level: f32,
  flipEnvMap: f32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var uSampler: sampler;
@group(0) @binding(2) var uTexture: texture_cube<f32>;

${GAMMA}
${VERT}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let theta = PI * (input.texCoord.x * 2.0);
  let phi = PI * (1.0 - input.texCoord.y);

  let x = sin(phi) * sin(theta);
  let y = -cos(phi);
  let z = -sin(phi) * cos(theta);

  let N = normalize(vec3f(params.flipEnvMap * x, y, z));
  var color = textureSampleLevel(uTexture, uSampler, N, params.level);
  if (params.correctGamma != 0u) { color = toGamma(color); }
  return color;
}
`;
