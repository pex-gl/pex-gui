import DEPTH from "./chunks/depth.wgsl.js";
import GAMMA from "./chunks/gamma.wgsl.js";
import VERT from "./main.vert.wgsl.js";

export default ({ depth = false } = {}) => /* wgsl */ `
struct Params {
  viewport: vec4f,
  rect: vec4f,
  correctGamma: u32,
  near: f32,
  far: f32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var uSampler: sampler;
@group(0) @binding(2) var uTexture: ${depth ? "texture_depth_2d" : "texture_2d<f32>"};

${depth ? DEPTH : ""}
${GAMMA}
${VERT}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  ${
    depth
      ? `let d = textureSampleLevel(uTexture, uSampler, input.texCoord, 0);
  var color = depthToColor(d, params.near, params.far);`
      : `var color = textureSample(uTexture, uSampler, input.texCoord);`
  }
  if (params.correctGamma != 0u) { color = toGamma(color); }
  return color;
}
`;
