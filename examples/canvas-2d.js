import { toHex } from "pex-color";
import createGUI from "../index.js";
import addAllControls from "./all-controls.js";

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d");
document.querySelector("main").appendChild(canvas);

const gui = createGUI(ctx);

window.gui = gui;

const { State } = await addAllControls(gui, ctx);

window.State = State;

requestAnimationFrame(function frame() {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = toHex(State.rgb);
  ctx.fillRect(W * 0.5 - 100, H * 0.5 - 100, 200, 200);
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
