import { load } from "pex-io";
import * as gpu from "pex-gpu";
import { torus as createTorus } from "primitive-geometry";

export default async function addExampleControls(gui, ctx, AllState) {
  const res = await load({
    paletteHsl: { image: `examples/assets/palette-hsl.png` },
  });

  const State = {
    scale: 1,
    rotate: false,
    time: 0,
    size: [1, 0.2],
    rotation: [0, 0, 0],
    bgColor: [0.2, 0.2, 0.2, 1],
    currentGeometry: 0,
    geometries: [],
  };

  gui.addTab("Example");
  gui.addColumn("Settings");
  gui.addParam("Scale", State, "scale", { min: 0.1, max: 2 });
  gui.addParam("Rotate camera", State, "rotate");
  gui.addParam("Rotation", State, "rotation", {
    min: -Math.PI / 2,
    max: Math.PI / 2,
  });
  gui.addHeader("Color");
  gui.addParam("BG Color [RGBA]", State, "bgColor");
  gui.addParam("BG Color [HSB]", State, "bgColor", {
    type: "color",
    palette: res.paletteHsl,
  });

  gui.addColumn("Geometry");
  gui.addRadioList("Type", State, "currentGeometry", State.geometries);
  gui.addParam("Torus Size", State, "size", { min: 0.1, max: 2 }, () => {
    const torus = createTorus({
      minorRadius: State.size[1],
      radius: State.size[0],
    });
    const isPexGPU = !!ctx.device;

    if (isPexGPU) {
      gpu.updateBuffer(
        ctx,
        State.geometries[1].attributes.aPosition,
        torus.positions,
      );
    } else {
      ctx.update(State.geometries[1].attributes.aPosition, {
        data: torus.positions,
      });
    }
  });

  gui.addColumn("Texture");
  gui.addTexture2D("Default", AllState.textures[1]);
  gui.addTexture2DList(
    "Default",
    AllState,
    "currentTexture",
    AllState.textures.map((tex, index) => {
      return { texture: tex, value: index };
    }),
  );

  return { State };
}
