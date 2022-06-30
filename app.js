import { initShaderProgram, mandelbrotProgram } from "/shaders.js";
import { ViewRect } from "/Math.js";

class Mandelbrot {
    canvas;
    #gl;
    #shaderProgram;
    #vertexBufferObject;
    #vao_ext;
    #vao;
    #viewRect;

    constructor(canvas) {
        this.canvas = canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        window.addEventListener("resize", () => {
            this.onResize();
        });

        const gl = canvas.getContext("webgl");
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        }

        this.#gl = gl;
        this.#shaderProgram = initShaderProgram(this.#gl, mandelbrotProgram);
        this.#vao_ext = gl.getExtension("OES_vertex_array_object");
        this.#viewRect = new ViewRect(-2.0, -1.25, 2.75, 2.5);

        this.#uploadVertices();
        this.#initVAO();
        this.render();
    }

    onResize() {
        const canvas = this.canvas;
        if (canvas.width === canvas.clientWidth && canvas.height === canvas.clientHeight) {
            return;
        }
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.#gl.viewport(0, 0, canvas.width, canvas.height);
        this.render();
    }

    #uploadVertices() {
        const gl = this.#gl;

        this.#vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBufferObject);
        const positions = [
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    #initVAO() {
        if (this.#vao) return;
        const gl = this.#gl;

        this.#vao = this.#vao_ext.createVertexArrayOES();
        this.#vao_ext.bindVertexArrayOES(this.#vao);

        // Bind array buffer to VAO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBufferObject);

        // Store vertex attribute configuration in VAO
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

        this.#vao_ext.bindVertexArrayOES(null);
    }

    render() {
        const gl = this.#gl;

        this.#vao_ext.bindVertexArrayOES(this.#vao);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.#shaderProgram.id);

        for (const uniform of this.#shaderProgram.uniforms) {
            switch (uniform.name) {
                case "model_mat":
                    gl.uniformMatrix3fv(uniform.location, false, this.#viewRect.inverseViewMatrix);
                    break;
                case "view_mat":
                    gl.uniformMatrix3fv(uniform.location, false, this.#viewRect.viewMatrix);
                    break;
            }
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.#vao_ext.bindVertexArrayOES(null);
    }
}

new Mandelbrot(document.querySelector("#mandelbrot"));
