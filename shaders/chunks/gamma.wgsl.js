export default /* wgsl */ `
const GAMMA: f32 = 2.2;

fn toGamma(color: vec4f) -> vec4f {
  return vec4f(pow(color.rgb, vec3f(1.0 / GAMMA)), color.a);
}
`;
