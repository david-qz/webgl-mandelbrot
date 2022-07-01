#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform sampler2D u_palette_sampler;

varying vec2 v_complex_position;

vec2 squareComplex(vec2 c) {
    return vec2(c.x*c.x - c.y*c.y, 2.0*c.x*c.y);
}

const int MAX_ITERATIONS = 500;
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

    if (escape_time != 1.0) {
        float u = escape_time * 10.0;
        gl_FragColor = texture2D(u_palette_sampler, vec2(mod(u, 1.0), 0.5));
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
