import createGUI, { DEFAULT_THEME, Renderers } from "../index.js";
import addAllControls from "./all-controls.js";

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

const ctx = canvas.getContext("2d");
document.querySelector("main").appendChild(canvas);

const gui = createGUI(ctx, {
  renderer: new Renderers.DebugRenderer({
    width: canvas.width / 3,
    height: canvas.height / 3,
    theme: DEFAULT_THEME,
  }),
});

await addAllControls(gui, ctx);

requestAnimationFrame(function frame() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  gui.draw();
  requestAnimationFrame(frame);
});
