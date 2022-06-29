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

export function initShaderProgram(gl, vss, fss) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vss);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fss);

    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShader);
    gl.attachShader(programId, fragmentShader);
    gl.linkProgram(programId);

    if (!gl.getProgramParameter(programId, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(programId));
        return null;
    }

    return programId;
}
