import DEPTH from "./chunks/depth.wgsl.js";
import GAMMA from "./chunks/gamma.wgsl.js";
import VERT from "./main.vert.wgsl.js";

export default ({ depth = false } = {}) => /* wgsl */ `
const PI: f32 = 3.1415926;

struct Params {
  viewport: vec4f,
  rect: vec4f,
  correctGamma: u32,
  level: f32,
  flipEnvMap: f32,
  near: f32,
  far: f32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var uSampler: sampler;
@group(0) @binding(2) var uTexture: ${depth ? "texture_depth_cube" : "texture_cube<f32>"};

${depth ? DEPTH : ""}
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
  ${
    depth
      ? `let d = textureSampleLevel(uTexture, uSampler, N, i32(params.level));
  var color = depthToColor(d, params.near, params.far);`
      : `var color = textureSampleLevel(uTexture, uSampler, N, params.level);`
  }
  if (params.correctGamma != 0u) { color = toGamma(color); }
  return color;
}
`;
