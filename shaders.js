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

    const attributes = shaderProgram.attributes;
    for (const attribute of Object.keys(attributes)) {
        const location = gl.getAttribLocation(programId, attribute);
        attributes[attribute].location = location;
    }

    return shaderProgram;
}

export const mandelbrotProgram = {
    vss: `
        attribute vec4 a_position;
        attribute vec2 a_complex_position;

        varying vec2 v_complex_position;

        void main() {
            gl_Position = a_position;
            v_complex_position = a_complex_position;
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
    attributes: {
        "a_position": {
            location: null,
            number: 2,
            type: "float",
            normalize: false,
            stride: 16,
            offset: 0
        },
        "a_complex_position": {
            location: null,
            number: 2,
            type: "float",
            normalize: false,
            stride: 16,
            offset: 8
        }
    }
};
