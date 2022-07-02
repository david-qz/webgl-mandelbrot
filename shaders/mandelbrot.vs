#version 300 es

in vec2 a_normalized_position;
out vec2 v_normalized_position;

void main() {
    v_normalized_position = a_normalized_position;
    gl_Position = vec4(a_normalized_position, 0, 1);
}
