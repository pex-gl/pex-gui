import createGUI, { DEFAULT_THEME, Renderers } from "../index.js";
import addAllControls from "./all-controls.js";

const canvas = document.createElement("canvas");

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

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
};

window.addEventListener("resize", onResize);

onResize();
