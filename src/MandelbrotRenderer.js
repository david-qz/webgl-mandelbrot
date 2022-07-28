import shaders, { initShaderProgram } from "./gl/shaders.js";
import { Rect } from "./utils/math.js";
import palettes from "./utils/palettes.js";

export default class MandelbrotRenderer {
    #gl;
    #programInfo;
    #program;
    #vao;
    #texture;
    #ndcRect;
    #viewRect;
    #viewMatrix;

    constructor(canvas) {
        this.#gl = canvas.getContext("webgl2");

        if (!this.#gl) {
            alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
        }

        this.#programInfo = initShaderProgram(this.#gl, shaders.mandelbrot);
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

        // Upload palette texture
        const texture = gl.createTexture();
        this.#texture = texture;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const palette = palettes.wikipedia;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
            palette.length / 3, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
            palette);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.#updateTextureUniform();
    }

    #updateViewMatUniform() {
        const gl = this.#gl;

        // View matrix uniform
        gl.useProgram(this.#program);
        const viewMatLoc = this.#programInfo.uniforms["view_mat"].location;
        gl.uniformMatrix3fv(viewMatLoc, true, this.#viewMatrix.toArray());
        gl.useProgram(null);
    }

    #updateTextureUniform() {
        const gl = this.#gl;

        gl.useProgram(this.#program);
        const paletteSamplerLoc = this.#programInfo.uniforms["u_palette_sampler"].location;
        gl.uniform1i(paletteSamplerLoc, 0);
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
        this.#updateViewMatUniform();
    }

    get viewRect() {
        const { x, y, width, height } = this.#viewRect;
        return new Rect(x, y, width, height);
    }
}
