import { load } from "pex-io";

export default async function addAllControls(gui, ctx) {
  const res = await load({
    palette: { image: `examples/assets/palette.jpg` },
    paletteHsl: { image: `examples/assets/palette-hsl.png` },
    plask: { image: `examples/assets/plask.png` },
    pex: { image: `examples/assets/pex.png` },
    noise: { image: `examples/assets/noise.png` },
    posx: { image: `examples/assets/pisa/pisa_posx.jpg` },
    negx: { image: `examples/assets/pisa/pisa_negx.jpg` },
    posy: { image: `examples/assets/pisa/pisa_posy.jpg` },
    negy: { image: `examples/assets/pisa/pisa_negy.jpg` },
    posz: { image: `examples/assets/pisa/pisa_posz.jpg` },
    negz: { image: `examples/assets/pisa/pisa_negz.jpg` },
  });

  const isPexGl = ctx.gl;

  const images = [res.plask, res.pex, res.noise];

  const State = {
    currentRadioListChoice: 0,
    radioListChoices: ["Choice 1", "Choice 2", "Choice 3"].map(
      (name, value) => ({
        name,
        value,
      }),
    ),
    checkboxValue: false,
    message: "Message",
    range: 0,
    position: [2, 0],
    rgb: [0.92, 0.2, 0.2],
    rgba: [0.2, 0.92, 0.2, 1.0],
    palette: Float32Array.of(0.2, 0.2, 0.92, 1.0),
    paletteHsl: Float32Array.of(0.92, 0.2, 0.92, 1.0),
    cubeTexture: isPexGl
      ? ctx.textureCube({
          data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
          width: 64,
          height: 64,
        })
      : null,
    currentTexture: 0,
    textures: isPexGl
      ? images.map((image) =>
          ctx.texture2D({
            data: image,
            width: image.width,
            height: image.height,
            flipY: true,
            wrap: ctx.Wrap.Repeat,
            encoding: ctx.Encoding.SRGB,
            mipmap: true,
            min: ctx.Filter.LinearMipmapLinear,
            aniso: 16,
          }),
        )
      : images,
  };

  // Controls
  gui.addTab("Controls");
  gui.addColumn("Inputs");
  gui.addLabel("Special Parameters");
  gui.addLabel("Multiline\nLabel");
  gui.addButton("Button", () => {
    console.log("Called back");
  });
  gui.addRadioList(
    "Radio list",
    State,
    "currentRadioListChoice",
    State.radioListChoices,
  );

  gui.addSeparator();
  gui.addLabel("Smart Parameters");
  gui.addParam("Checkbox", State, "checkboxValue");
  gui.addParam("Text message", State, "message", {}, (value) => {
    console.log(value);
  });
  gui.addParam("Slider", State, "range", {
    min: -Math.PI / 2,
    max: Math.PI / 2,
  });
  gui.addParam("Multi Slider", State, "position", {
    min: 0,
    max: 10,
  });

  gui.addColumn("Colors");
  gui.addParam("Color", State, "rgb", {
    type: "color",
  });
  gui.addParam("Color alpha", State, "rgba", {
    type: "color",
    alpha: true,
  });
  gui.addParam("Palette", State, "palette", {
    type: "color",
    palette: res.palette,
  });
  gui.addParam("Palette HSL", State, "paletteHsl", {
    type: "color",
    palette: res.paletteHsl,
  });

  gui.addColumn("Textures");
  gui.addTexture2D("Single", State.textures[0]); // or gui.addParam("Single", State, "texture");
  gui.addTexture2D("Single flipped", State.textures[0], { flipY: true });
  gui.addTexture2DList(
    "List",
    State,
    "currentTexture",
    State.textures.map((texture, value) => ({
      texture,
      value,
    })),
  );
  if (isPexGl) gui.addTextureCube("Cube", State.cubeTexture, { level: 2 }); // gui.addParam("Cube", State, "cubeTexture", { level: 2 });

  gui.addColumn("Graphs");
  gui.addGraph("Sin", {
    interval: 500,
    t: 0,
    update(item) {
      item.options.t += 0.01;
    },
    redraw(item) {
      item.values.push(Math.sin(item.options.t));
    },
    format: (value) => value?.toFixed(3) || "",
  });
  gui.addFPSMeeter();
  gui.addHeader("Stats");
  gui.addStats();
  gui.addStats("Object stats", {
    update(item) {
      Object.assign(item.stats, {
        r: State.rgb[0],
        g: State.rgb[1],
        b: State.rgb[2],
      });
    },
  });

  return { State, res };
}
