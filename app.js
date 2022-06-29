import { initShaderProgram } from "/gl-utils.js";

class Mandelbrot {
    static vss = `
        attribute vec4 a_position;
        attribute vec2 a_complex_position;

        varying vec2 v_complex_position;

        void main() {
            gl_Position = a_position;
            v_complex_position = a_complex_position;
        }
    `;

    static fss = `
        precision mediump float;

        varying vec2 v_complex_position;

        #define MAX_ITERATIONS  100

        vec2 squareComplex(vec2 c) {
            return vec2(c.x*c.x - c.y*c.y, 2.0*c.x*c.y);
        }

        float iterate(vec2 c) {
            vec2 z = vec2(0, 0);
            for(int i=0; i < MAX_ITERATIONS; ++i) {
                z = squareComplex(z) + c;
                if (length(z) > 2.0) {
                    return float(i)/float(MAX_ITERATIONS);
                }
            }

            return 1.0;
        }

        void main() {
            vec2 c = v_complex_position;
            float escape_time = iterate(c);

            gl_FragColor = vec4(vec3(escape_time), 1.0);
        }
    `;

    constructor(canvas) {
        this.canvas = canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        window.addEventListener('resize', () => {
            this.onResize();
        });

        const gl = canvas.getContext("webgl");
        this.gl = gl;
        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        }

        this.shaderProgram = initShaderProgram(this.gl, Mandelbrot.vss, Mandelbrot.fss);
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const positions = [
            -1.0, -1.0, -2.0, -1.25,
            -1.0, 1.0, -2.0, 1.25,
            1.0, -1.0, 0.75, -1.25,
            1.0, 1.0, 0.75, 1.25,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.render();
    }

    #setupVertexAttribs() {
        const gl = this.gl;
        const posAttribLocation = gl.getAttribLocation(this.shaderProgram, "a_position");
        gl.vertexAttribPointer(
            posAttribLocation,
            2,
            gl.FLOAT,
            false,
            16,
            0
        );
        gl.enableVertexAttribArray(posAttribLocation);

        const complexAttribLocation = gl.getAttribLocation(this.shaderProgram, "a_complex_position");
        gl.vertexAttribPointer(
            complexAttribLocation,
            2,
            gl.FLOAT,
            false,
            16,
            8
        );
        gl.enableVertexAttribArray(complexAttribLocation);
    }

    onResize() {
        const canvas = this.canvas;
        if (canvas.width === canvas.clientWidth && canvas.height === canvas.clientHeight) {
            return;
        }
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.render();
    }

    render() {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.#setupVertexAttribs();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

new Mandelbrot(document.querySelector("#mandelbrot"));
