import MandelbrotRenderer from "./MandelbrotRenderer.js";
import { Rect } from "./utils/math.js";

export default class Mandelbrot {
    #renderer;
    #pointerDown;

    constructor(canvas) {
        this.#renderer = new MandelbrotRenderer(canvas);
        this.canvas = canvas;

        this.#setupEventListeners();
        this.#handleResize();
        this.#renderer.render();
    }

    #setupEventListeners() {
        window.addEventListener("resize", () => {
            this.#handleResize();
            this.#renderer.render();
        });

        this.canvas.addEventListener("wheel", e => {
            this.#handleScroll({
                x: e.offsetX,
                y: e.offsetY,
                amount: e.deltaY
            });
        });

        this.canvas.addEventListener("pointerdown", () => {
            this.#handlePointerDown();
        });

        this.canvas.addEventListener("pointerup", () => {
            this.#handlePointerUp();
        });

        this.canvas.addEventListener("pointermove", e => {
            this.#handlePointerMove(e.movementX, e.movementY);
        });
    }

    get #clientRect() {
        return new Rect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    get #canvasRect() {
        return new Rect(0, 0, this.canvas.width, this.canvas.height);
    }

    set #canvasRect(rect) {
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    #handleResize() {
        const clientRect = this.#clientRect;
        if (this.#canvasRect.equals(clientRect)) return;

        this.#canvasRect = clientRect;
        this.#renderer.setGlViewport(0, 0, clientRect.width, clientRect.height);
    }

    #handleScroll({ x, y, amount }) {
        const viewRect = this.#renderer.viewRect;

        const a = x * (viewRect.width / this.canvas.clientWidth) + viewRect.x;
        const b = (viewRect.height - y * (viewRect.height / this.canvas.clientHeight)) + viewRect.y;
        const scale = 1 + (amount / 400);

        this.#renderer.viewRect = viewRect.scale(scale, a, b);
        this.#renderer.render();
    }

    #handlePointerDown() {
        this.#pointerDown = true;
    }

    #handlePointerUp() {
        this.#pointerDown = false;
    }

    #handlePointerMove(dx, dy) {
        if (this.#pointerDown) {
            console.log(`dragged ${dx} ${dy}`);
        }
    }
}
