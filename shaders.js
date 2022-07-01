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

async function fetchShader(path) {
    const response = await fetch(path);
    // TODO: add some error checking
    return response.text();
}

const mandelbrotVertexShader   = await fetchShader("shaders/mandelbrot.vs");
const mandelbrotFragmentShader = await fetchShader("shaders/mandelbrot.fs");

export const mandelbrotProgram = {
    id: null,
    vss: mandelbrotVertexShader,
    fss: mandelbrotFragmentShader,
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
            name: "view_mat",
            location: null,
        }
    ],
};
