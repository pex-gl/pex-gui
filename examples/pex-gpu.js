import * as gpu from "pex-gpu";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { mat4, quat } from "pex-math";
import { cube as createCube, torus as createTorus } from "primitive-geometry";

import createGUI from "../index.js";
import addAllControls from "./all-controls.js";
import addExampleControls from "./example-controls.js";

const ctx = await gpu.createContext({ pixelRatio: devicePixelRatio });
document.querySelector("main").append(ctx.canvas);

// GUI
const gui = createGUI(ctx);

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.width / ctx.height,
  near: 0.1,
  far: 100,
  position: [3, 3, 3],
  target: [0, 0, 0],
});
createOrbiter({ camera });

const { State } = await addAllControls(gui, ctx);
const { State: ExampleState } = await addExampleControls(gui, ctx, State);

// Scene

const sampler = gpu.createSampler(ctx, {
  filter: "linear",
  addressMode: "repeat",
});

const cube = createCube();
ExampleState.geometries.push({
  name: "Cube",
  value: 0,
  attributes: {
    aPosition: gpu.createBuffer(ctx, {
      usage: "vertex",
      data: cube.positions,
    }),
    aTexCoord: gpu.createBuffer(ctx, { usage: "vertex", data: cube.uvs }),
  },
  indices: gpu.createBuffer(ctx, { usage: "index", data: cube.cells }),
});

const torus = createTorus();
ExampleState.geometries.push({
  name: "Torus",
  value: 1,
  attributes: {
    aPosition: gpu.createBuffer(ctx, {
      usage: "vertex",
      data: torus.positions,
    }),
    aTexCoord: gpu.createBuffer(ctx, { usage: "vertex", data: torus.uvs }),
  },
  indices: gpu.createBuffer(ctx, { usage: "index", data: torus.cells }),
});

const shader = /* wgsl */ `
struct Uniforms {
  projection: mat4x4f,
  view: mat4x4f,
  model: mat4x4f,
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var uSampler: sampler;
@group(0) @binding(2) var uTexture: texture_2d<f32>;

struct VertexIn {
  @location(0) aPosition: vec3f,
  @location(1) aTexCoord: vec2f,
};
struct VertexOut {
  @builtin(position) aPosition: vec4f,
  @location(0) aTexCoord: vec2f,
};

@vertex
fn vertexMain(input: VertexIn) -> VertexOut {
  return VertexOut(
    uniforms.projection * uniforms.view * uniforms.model * vec4f(input.aPosition, 1.0),
    input.aTexCoord,
  );
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  return textureSample(uTexture, uSampler, input.aTexCoord);
}
`;

const modelMatrix = mat4.create();
const rotationQuat = quat.create();

const drawCmd = gpu.defineCommand({
  label: "drawTexturedCube",
  pass: { clearValue: ExampleState.bgColor, depthClearValue: 1 },
  pipeline: {
    vertex: shader,
    fragment: shader,
    depthWriteEnabled: true,
    cullMode: "back",
  },
  uniforms: {
    uniforms: {
      projection: camera.projectionMatrix,
      view: camera.viewMatrix,
      model: modelMatrix,
    },
    uSampler: sampler,
  },
});

window.addEventListener("resize", () => {
  gpu.resize(ctx, window.innerWidth, window.innerHeight);
  camera.set({ aspect: ctx.width / ctx.height });
});

gpu.frame(ctx, ({ deltaTime }) => {
  if (ExampleState.rotate) ExampleState.time += deltaTime;

  quat.fromEuler(rotationQuat, [
    ExampleState.rotation[0],
    ExampleState.rotation[1] + ExampleState.time,
    ExampleState.rotation[2],
  ]);
  mat4.fromQuat(modelMatrix, rotationQuat);
  mat4.scale(modelMatrix, [
    ExampleState.scale,
    ExampleState.scale,
    ExampleState.scale,
  ]);

  drawCmd.pass.clearValue = ExampleState.bgColor;

  if (State.textures.length > 0) {
    Object.assign(drawCmd, {
      attributes:
        ExampleState.geometries[ExampleState.currentGeometry].attributes,
      indices: ExampleState.geometries[ExampleState.currentGeometry].indices,
    });
    drawCmd.uniforms.uTexture = State.textures[State.currentTexture];

    gpu.submit(ctx, drawCmd);
  }

  gui.draw();
});
