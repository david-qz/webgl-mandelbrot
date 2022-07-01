import { Mandelbrot } from "./Mandelbrot.js";

window.addEventListener("load", () => {
    new Mandelbrot(document.querySelector("#mandelbrot"));
});
