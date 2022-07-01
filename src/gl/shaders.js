function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        const shaderTypeString = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
        logAndAlertError(`Failed to compile ${shaderTypeString} shader: " + ${error}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export function initShaderProgram(gl, { vs, fs }) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    if (vertexShader === null || fragmentShader === null) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        logAndAlertError(`Failed to link shader program: ${gl.getProgramInfoLog(program)}`);
        return null;
    }

    const programInfo = {
        program: program,
        attributes: {},
        uniforms: {}
    };

    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; ++i) {
        const info = gl.getActiveAttrib(program, i);
        programInfo.attributes[info.name] = {
            location: gl.getAttribLocation(program, info.name),
            type: info.type,
            size: info.size
        };
    }

    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
        const info = gl.getActiveUniform(program, i);
        programInfo.uniforms[info.name] = {
            location: gl.getUniformLocation(program, info.name),
            type: info.type,
            size: info.size
        };
    }

    return programInfo;
}

async function fetchShader(path) {
    const response = await fetch(path);
    // TODO: add some error checking
    return response.text();
}

export const  mandelbrotShaderSources = {
    vs: await fetchShader("./shaders/mandelbrot.vs"),
    fs: await fetchShader("./shaders/mandelbrot.fs")
};

function logAndAlertError(error) {
    // eslint-disable-next-line no-console
    console.error(error);
    alert(error);
}
