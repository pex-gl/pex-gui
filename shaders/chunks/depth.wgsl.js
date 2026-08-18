// A depth texture carries one channel, and what that channel means depends on
// the projection that wrote it. An orthographic depth buffer, or a distance
// written by hand, is already linear across [0, 1] and displays as stored. A
// perspective one is not: it spends over half its range on the first few
// percent of the view distance, so shown raw it is a white square.
//
// `near`/`far` are the projection's own planes, which is what makes the
// perspective case invertible — undo the divide to recover view depth, then
// normalise that over the frustum. `near <= 0` means "already linear".
export default /* wgsl */ `
fn depthToColor(depth: f32, near: f32, far: f32) -> vec4f {
  var value = depth;
  if (near > 0.0) {
    let z = near * far / max(far - depth * (far - near), 1e-6);
    value = (z - near) / max(far - near, 1e-6);
  }
  return vec4f(vec3f(1.0 - saturate(value)), 1.0);
}
`;
