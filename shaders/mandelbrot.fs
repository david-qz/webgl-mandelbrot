#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

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

    gl_FragColor = vec4(vec3( 2.71828 - exp(1.0 - escape_time) ), 1.0);
}
