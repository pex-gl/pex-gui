import createGUI from "../index.js";
import addAllControls from "./all-controls.js";

const guis = new Map();

Object.assign(document.querySelector("main").style, {
  position: "relative",
  padding: "0 20px",
});

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const mainElement = document.querySelector("main");

// Helpers
const addSeparator = () =>
  mainElement.appendChild(document.createElement("hr"));

const addButton = (title, cb) => {
  const buttonElement = document.createElement("button");
  buttonElement.innerText = title;
  buttonElement.addEventListener("click", cb);
  mainElement.appendChild(buttonElement);
};
const addText = (title, tagName = "h3") => {
  const titleElement = document.createElement(tagName);
  titleElement.innerHTML = title;
  mainElement.appendChild(titleElement);
};

const addGUI = async (
  title,
  options = {},
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  pixelRatio = devicePixelRatio
) => {
  addText(title, "p");

  const canvas = document.createElement("canvas");
  mainElement.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const gui = createGUI(ctx, options);
  guis.set(ctx, gui);

  await addAllControls(gui, ctx);
};

// Content
addText("Change all canvas dimensions (canvas.width and canvas.height)", "h3");
addButton("Divide all by two", () => {
  Array.from(guis.values()).forEach((ctx) => {
    ctx.canvas.width /= 2;
    ctx.canvas.height /= 2;
  });
});
addButton("Multiply all by two", () => {
  Array.from(guis.values()).forEach((ctx) => {
    ctx.canvas.width *= 2;
    ctx.canvas.height *= 2;
  });
});

addSeparator();
addText(
  "Default render at the same size regardless of the canvas size or pixel ratio unless it overflows the canvas viewport"
);
await addGUI(
  "Default ({ responsive: true, scale: 1, pixelRatio: devicePixelRatio })"
);
await addGUI(
  "Default with canvas at double size",
  undefined,
  DEFAULT_WIDTH * 2,
  DEFAULT_HEIGHT * 2
);
await addGUI(
  "Default with canvas at half size",
  undefined,
  DEFAULT_WIDTH / 2,
  DEFAULT_HEIGHT / 2
);
await addGUI(
  "Default with canvas dimensions at multiplied by a ratio of 1",
  undefined,
  undefined,
  undefined,
  1
);
await addGUI(
  "Default with canvas dimensions at multiplied by a ratio of 0.5",
  undefined,
  undefined,
  undefined,
  0.5
);

addSeparator();
addText("How big is the GUI");

await addGUI("Hardcoded scale at 2", { scale: 2 });
await addGUI("Hardcoded scale at 0.5", { scale: 0.5 });

addSeparator();
addText("How sharp things are");

await addGUI("Renderer at pixelRatio 1", { pixelRatio: 1 });
await addGUI("Renderer at pixelRatio 0.5", { pixelRatio: 0.5 });

addSeparator();
addText("No responsive doesn't change rendering size");

await addGUI("No responsive", { responsive: false });
await addGUI("No responsive and renderer at pixelRatio 0.5", {
  responsive: false,
  pixelRatio: 0.5,
});

addSeparator();
addText("No responsive on small canvas will make the content overflow");

await addGUI(
  "No responsive overflowing",
  { responsive: false },
  DEFAULT_WIDTH / 2,
  DEFAULT_HEIGHT / 2
);
await addGUI(
  "No responsive overflowing and renderer at pixelRatio 0.5",
  {
    responsive: false,
    pixelRatio: 0.5,
  },
  DEFAULT_WIDTH / 2,
  DEFAULT_HEIGHT / 2
);

addSeparator();
addText("Scale can compensate for non-responsive GUI");

await addGUI(
  "No responsive, hardcoded scale at 0.5",
  { responsive: false, scale: 0.5 },
  DEFAULT_WIDTH / 2,
  DEFAULT_HEIGHT / 2
);
await addGUI(
  "No responsive, hardcoded scale at 0.5 and renderer at pixelRatio 0.5",
  {
    responsive: false,
    scale: 0.5,
    pixelRatio: 0.5,
  },
  DEFAULT_WIDTH / 2,
  DEFAULT_HEIGHT / 2
);

requestAnimationFrame(function frame() {
  Array.from(guis.entries()).forEach(([ctx, gui]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gui.draw();
  });
  requestAnimationFrame(frame);
});
