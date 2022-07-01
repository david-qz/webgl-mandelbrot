import { initShaderProgram, mandelbrotProgram } from "/shaders.js";
import { Rect } from "/Math.js";

class MandelbrotRenderer {
    #gl;
    #shaderProgram;
    #vao;
    #ndcRect;
    #viewRect;
    #viewMatrix;

    constructor(canvas) {
        this.#gl = canvas.getContext("webgl2");

        if (!this.#gl) {
            alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
        }

        this.#shaderProgram = initShaderProgram(this.#gl, mandelbrotProgram);

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

        // Set up vertex attributes
        for (const attr of this.#shaderProgram.attributes) {
            gl.vertexAttribPointer(
                attr.location,
                attr.number,
                gl.FLOAT,
                attr.normalize,
                attr.stride,
                attr.offset
            );
            gl.enableVertexAttribArray(attr.location);
        }

        gl.bindVertexArray(null);
        this.#vao = vao;
    }

    #updateViewMatrixUniform() {
        const gl = this.#gl;
        const program = this.#shaderProgram;

        gl.useProgram(program.id);
        const location = program.uniforms.find(x => x.name === "view_mat").location;
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
        gl.useProgram(this.#shaderProgram.id);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.useProgram(null);
        gl.bindVertexArray(null);
    }

    setGlViewport(x, y, width, height) {
        this.#gl.viewport(x, y, width, height);
    }

    set viewRect(rect) {
        this.#viewRect = new Rect(rect.x, rect.y, rect.width, rect.height);
        this.#viewMatrix = this.#ndcRect.transformTo(rect);
        this.#updateViewMatrixUniform();
    }

    get viewRect() {
        const { x, y, width, height } = this.#viewRect;
        return new Rect(x, y, width, height);
    }
}

export class Mandelbrot {
    constructor(canvas) {
        this.renderer = new MandelbrotRenderer(canvas);
        this.canvas = canvas;

        this.#setupEventListeners();
        this.handleResize();
        this.renderer.render();
    }

    #setupEventListeners() {
        window.addEventListener("resize", () => {
            this.handleResize();
            this.renderer.render();
        });
    }

    handleResize() {
        const c = this.canvas;

        if (c.width !== c.clientWidth || c.height !== c.clientHeight) {
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            this.renderer.setGlViewport(0, 0, c.width, c.height);
        }
    }
}