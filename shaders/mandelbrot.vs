attribute vec2 a_position;
uniform mat3 view_mat;
varying vec2 v_complex_position;

void main() {
    v_complex_position = vec2(view_mat * vec3(a_position, 1));
    gl_Position = vec4(a_position, 1, 1);
}
