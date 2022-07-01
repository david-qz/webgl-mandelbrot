import { initShaderProgram, mandelbrotShaderSources } from "/shaders.js";
import { Rect } from "/Math.js";

class MandelbrotRenderer {
    #gl;
    #programInfo;
    #program;
    #vao;
    #ndcRect;
    #viewRect;
    #viewMatrix;

    constructor(canvas) {
        this.#gl = canvas.getContext("webgl2");

        if (!this.#gl) {
            alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
        }

        this.#programInfo = initShaderProgram(this.#gl, mandelbrotShaderSources);
        this.#program = this.#programInfo.program;

        this.#ndcRect = new Rect(-1.0, -1.0, 2.0, 2.0);
        this.viewRect = new Rect(-2.0, -1.25, 2.75, 2.5);

        this.#init();
    }

    #init() {
        const gl = this.#gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Upload vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            -1,  1,
             1, -1,
             1,  1
        ]), gl.STATIC_DRAW);

        // Set up vertex attribute
        const location = this.#programInfo.attributes["a_normalized_position"].location;
        gl.vertexAttribPointer(
            location,
            2,
            gl.FLOAT,
            false,
            8,
            0
        );
        gl.enableVertexAttribArray(location);

        gl.bindVertexArray(null);
        this.#vao = vao;
    }

    #updateViewMatrixUniform() {
        const gl = this.#gl;

        gl.useProgram(this.#program);
        const location = this.#programInfo.uniforms["view_mat"].location;
        gl.uniformMatrix3fv(location, false, this.#viewMatrix);
        gl.useProgram(null);
    }

    render() {
        const gl = this.#gl;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindVertexArray(this.#vao);
        gl.useProgram(this.#program);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.useProgram(null);
        gl.bindVertexArray(null);
    }

    setGlViewport(x, y, width, height) {
        this.#gl.viewport(x, y, width, height);
    }

    set viewRect(rect) {
        this.#viewRect = new Rect(rect.x, rect.y, rect.width, rect.height);
        this.#viewMatrix = Rect.transformation(this.#ndcRect, rect);
        this.#updateViewMatrixUniform();
    }

    get viewRect() {
        const { x, y, width, height } = this.#viewRect;
        return new Rect(x, y, width, height);
    }
}

export class Mandelbrot {
    #renderer;
    #canvasRect;

    constructor(canvas) {
        this.#renderer = new MandelbrotRenderer(canvas);
        this.canvas = canvas;

        this.#setupEventListeners();
        this.handleResize();
        this.#renderer.render();
    }

    #setupEventListeners() {
        window.addEventListener("resize", () => {
            this.handleResize();
            this.#renderer.render();
        });

        this.canvas.addEventListener("wheel", e => {
            this.handleScroll({
                x: e.offsetX,
                y: e.offsetY,
                amount: e.deltaY
            });
        });
    }

    handleResize() {
        const c = this.canvas;

        if (c.width !== c.clientWidth || c.height !== c.clientHeight) {
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            this.#renderer.setGlViewport(0, 0, c.width, c.height);
        }
    }

    handleScroll({ x, y, amount }) {
        const viewRect = this.#renderer.viewRect;

        const a = x * (viewRect.width / this.canvas.clientWidth) + viewRect.x;
        const b = (viewRect.height - y * (viewRect.height / this.canvas.clientHeight)) + viewRect.y;
        const scale = 1 + (amount / 400);

        const newViewRect = viewRect.scale(scale, a, b);
        this.#renderer.viewRect = newViewRect;
        this.#renderer.render();
    }
}
