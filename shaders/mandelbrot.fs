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
