function loadShader(gl, type, source) {
    const shaderId = gl.createShader(type);
    gl.shaderSource(shaderId, source);
    gl.compileShader(shaderId);

    if (!gl.getShaderParameter(shaderId, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shaderId));
        gl.deleteShader(shaderId);
        return null;
    }

    return shaderId;
}

export function initShaderProgram(gl, shaderProgram) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, shaderProgram.vss);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, shaderProgram.fss);

    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShader);
    gl.attachShader(programId, fragmentShader);
    gl.linkProgram(programId);

    if (!gl.getProgramParameter(programId, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(programId));
        return null;
    }

    shaderProgram.id = programId;

    for (const attribute of shaderProgram.attributes) {
        const location = gl.getAttribLocation(programId, attribute.name);
        attribute.location = location;
    }

    for (const uniform of shaderProgram.uniforms) {
        const location = gl.getUniformLocation(programId, uniform.name);
        uniform.location = location;
    }

    return shaderProgram;
}

export const mandelbrotProgram = {
    vss: `
        attribute vec2 a_position;
        uniform mat3 model_mat;
        uniform mat3 view_mat;
        varying vec2 v_complex_position;

        void main() {
            v_complex_position = vec2(model_mat * vec3(a_position, 1));
            gl_Position = vec4(view_mat * model_mat * vec3(a_position, 1), 1);
        }
    `,

    fss: `
        precision mediump float;

        varying vec2 v_complex_position;

        #define MAX_ITERATIONS  200

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

            gl_FragColor = vec4(vec3( 2.71828 - exp(1.0 - escape_time) ), 1.0);
        }
    `,

    id: null,
    attributes: [
        {
            name: "a_position",
            location: null,
            number: 2,
            type: "float",
            normalize: false,
            stride: 8,
            offset: 0
        }
    ],
    uniforms: [
        {
            name: "model_mat",
            location: null,
        },
        {
            name: "view_mat",
            location: null,
        }
    ],
};
