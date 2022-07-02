#version 300 es

uniform mat3 view_mat;
in vec2 a_normalized_position;
out vec2 v_complex_position;

void main() {
    v_complex_position = vec2(view_mat * vec3(a_normalized_position, 1));
    gl_Position = vec4(a_normalized_position, 0, 1);
}
