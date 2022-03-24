import createGUI from "../index.js";
import addAllControls from "./all-controls.js";

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

const ctx = canvas.getContext("2d");
document.querySelector("main").appendChild(canvas);

const gui = createGUI(ctx, {
  theme: {
    fontFamily: "Courier New",
    fontSize: 12,
    capHeight: 0.115,

    leftOffset: 0,
    topOffset: 0,

    columnWidth: 200,

    tabHeight: 26,
    headerSize: 22,

    titleHeight: 24,
    itemHeight: 30,
    graphHeight: 60,

    padding: 1,
    textPadding: 1,
    accent: "rgba(255, 0, 0, 1)",
    tabColorActive: "rgba(255, 255, 255, 1)",
    tabBackgroundActive: "rgba(0, 0, 255,  1)",
  },
});

gui.scale = 1.2;
gui.x = 100;
gui.y = 100;

await addAllControls(gui, ctx);

requestAnimationFrame(function frame() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  gui.draw();
  requestAnimationFrame(frame);
});
