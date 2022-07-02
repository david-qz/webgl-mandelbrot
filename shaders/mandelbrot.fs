#version 300 es

precision highp float;

uniform mat3 view_mat;
uniform sampler2D u_palette_sampler;
in vec2 v_normalized_position;
out vec4 fragment_color;

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
    vec2 c = vec2(view_mat * vec3(v_normalized_position, 1));
    float escape_time = iterate(c);

    if (escape_time != 1.0) {
        float u = escape_time * 10.0;
        fragment_color = texture(u_palette_sampler, vec2(mod(u, 1.0), 0.5));
    } else {
        fragment_color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
