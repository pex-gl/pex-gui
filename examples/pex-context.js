import createContext from "pex-context";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { mat4, quat } from "pex-math";
import { torus as createTorus, cube as createCube } from "primitive-geometry";

import createGUI from "../index.js";
import GAMMA from "../shaders/chunks/gamma.glsl.js";

import allControls from "./all-controls.js";

const ExampleState = {
  scale: 1,
  rotate: false,
  time: 0,
  size: [1, 0.2],
  rotation: [0, 0, 0],
  bgColor: [0.2, 0.2, 0.2, 1.0],
  currentGeometry: 0,
  geometries: [],
};

const vert = /* glsl */ `
attribute vec2 aTexCoord;
attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`;

const frag = /* glsl */ `precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uRepeat;

varying vec2 vTexCoord;

${GAMMA}

void main() {
  gl_FragColor = toGamma(texture2D(uTexture, vTexCoord * uRepeat));
}`;

const ctx = createContext({ pixelRatio: devicePixelRatio });

const gui = createGUI(ctx);

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [3, 3, -3],
  target: [0, 0, 0],
});

const orbiter = createOrbiter({ camera });

const { State, res } = await allControls(gui, ctx);

// Example
gui.addTab("Example");
gui.addColumn("Settings");
gui.addParam("Scale", ExampleState, "scale", { min: 0.1, max: 2 });
gui.addParam("Rotate camera", ExampleState, "rotate");
gui.addParam("Rotation", ExampleState, "rotation", {
  min: -Math.PI / 2,
  max: Math.PI / 2,
});
gui.addHeader("Color");
gui.addParam("BG Color [RGBA]", ExampleState, "bgColor");
gui.addParam("BG Color [HSB]", ExampleState, "bgColor", {
  type: "color",
  palette: res.paletteHsl,
});

gui.addColumn("Geometry");
gui.addRadioList(
  "Type",
  ExampleState,
  "currentGeometry",
  ExampleState.geometries,
);
gui.addParam("Torus Size", ExampleState, "size", { min: 0.1, max: 2 }, () => {
  const torus = createTorus({
    minorRadius: ExampleState.size[1],
    radius: ExampleState.size[0],
  });
  ctx.update(ExampleState.geometries[1].attributes.aPosition, {
    data: torus.positions,
  });
});

gui.addColumn("Texture");
gui.addTexture2D("Default", State.textures[1]);
gui.addTexture2DList(
  "Default",
  State,
  "currentTexture",
  State.textures.map((tex, index) => {
    return { texture: tex, value: index };
  }),
);

const clearCmd = {
  pass: ctx.pass({
    clearColor: ExampleState.bgColor,
    clearDepth: 1,
  }),
};

const cube = createCube();
ExampleState.geometries.push({
  name: "Cube",
  value: 0,
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aTexCoord: ctx.vertexBuffer(cube.uvs),
  },
  indices: ctx.indexBuffer(cube.cells),
});

const torus = createTorus();
ExampleState.geometries.push({
  name: "Torus",
  value: 1,
  attributes: {
    aPosition: ctx.vertexBuffer(torus.positions),
    aTexCoord: ctx.vertexBuffer(torus.uvs),
  },
  indices: ctx.indexBuffer(torus.cells),
});

const modelMatrix = mat4.create();
const rotationQuat = quat.create();

const drawCmd = {
  name: "drawCmd",
  pipeline: ctx.pipeline({
    vert,
    frag,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: modelMatrix,
    uRepeat: [1, 1],
  },
};

let frameNumber = 0;
ctx.frame(() => {
  ctx.debug(frameNumber++ === 10);
  ctx.submit(clearCmd);

  quat.fromEuler(rotationQuat, ExampleState.rotation);
  mat4.fromQuat(modelMatrix, rotationQuat);
  mat4.scale(modelMatrix, [
    ExampleState.scale,
    ExampleState.scale,
    ExampleState.scale,
  ]);

  if (ExampleState.rotate) {
    ExampleState.time += 1 / 60;
    camera.set({
      position: [
        Math.cos(ExampleState.time * Math.PI) * 5,
        Math.sin(ExampleState.time * 0.5) * 3,
        Math.sin(ExampleState.time * Math.PI) * 5,
      ],
    });
    orbiter.set({ camera });
  }

  if (State.textures.length > 0) {
    ctx.submit(drawCmd, {
      attributes:
        ExampleState.geometries[ExampleState.currentGeometry].attributes,
      indices: ExampleState.geometries[ExampleState.currentGeometry].indices,
      uniforms: {
        uTexture: State.textures[State.currentTexture],
      },
    });
  }

  gui.draw();
});

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({
    width: W,
    height: H,
  });
  camera.set({
    aspect: W / H,
  });
};

window.addEventListener("resize", onResize);

onResize();
