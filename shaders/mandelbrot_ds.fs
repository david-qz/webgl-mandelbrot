#version 300 es

precision highp float;

uniform mat3 view_mat;
uniform sampler2D u_palette_sampler;
in vec2 v_normalized_position;
out vec4 fragment_color;

// Double precision emulation from GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
//
// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
// Substract: res = ds_add(a, b) => res = a + b
vec2 ds_add(vec2 dsa, vec2 dsb) {
    vec2 dsc;
    float t1, t2, e;

    t1 = dsa.x + dsb.x;
    e = t1 - dsa.x;
    t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    return dsc;
}

// Substract: res = ds_sub(a, b) => res = a - b
vec2 ds_sub(vec2 dsa, vec2 dsb) {
    vec2 dsc;
    float e, t1, t2;

    t1 = dsa.x - dsb.x;
    e = t1 - dsa.x;
    t2 = ((-dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y - dsb.y;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    return dsc;
}

// Compare: res = -1 if a < b
//              = 0 if a == b
//              = 1 if a > b
int ds_compare(vec2 dsa, vec2 dsb) {
    if (dsa.x < dsb.x) return -1;
    else if (dsa.x == dsb.x) {
        if (dsa.y < dsb.y) return -1;
        else if (dsa.y == dsb.y) return 0;
        else return 1;
    }
    else return 1;
}

// Multiply: res = ds_mul(a, b) => res = a * b
vec2 ds_mul(vec2 dsa, vec2 dsb) {
    vec2 dsc;
    float c11, c21, c2, e, t1, t2;
    float a1, a2, b1, b2, cona, conb, split = 8193.;

    cona = dsa.x * split;
    conb = dsb.x * split;
    a1 = cona - (cona - dsa.x);
    b1 = conb - (conb - dsb.x);
    a2 = dsa.x - a1;
    b2 = dsb.x - b1;

    c11 = dsa.x * dsb.x;
    c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

    c2 = dsa.x * dsb.y + dsa.y * dsb.x;

    t1 = c11 + c2;
    e = t1 - c11;
    t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);

    return dsc;
}

// create double-single number from float
vec2 ds_set(float a) {
    vec2 z;
    z.x = a;
    z.y = 0.0;
    return z;
}

void squareComplex(inout vec2 ds_a, inout vec2 ds_b) {
    // a' = a^2 - b^2, b' = 2ab
    vec2 product_a = ds_sub(ds_mul(ds_a, ds_a), ds_mul(ds_b, ds_b));
    vec2 product_b = ds_mul(ds_mul(ds_set(2.0), ds_a), ds_b);

    ds_a = product_a;
    ds_b = product_b;
}

const int MAX_ITERATIONS = 1000;
float iterate(vec2 ds_a, vec2 ds_b) {
    vec2 z_a = ds_set(0.0);
    vec2 z_b = ds_set(0.0);

    for(int i=0; i < MAX_ITERATIONS; ++i) {
        squareComplex(z_a, z_b);
        z_a = ds_add(z_a, ds_a);
        z_b = ds_add(z_b, ds_b);

        vec2 mag_squared = ds_add(ds_mul(z_a, z_a), ds_mul(z_b, z_b));
        if (ds_compare(mag_squared, ds_set(4.0)) == 1) {
            return float(i)/float(MAX_ITERATIONS);
        }
    }

    return 1.0;
}

void main() {
    // View matrix multiplication in double-single precision
    vec2 ds_in_x = ds_set(v_normalized_position.x);
    vec2 ds_in_y = ds_set(v_normalized_position.y);
    vec2 ds_a = ds_add(ds_mul(ds_set(view_mat[0][0]), ds_in_x), ds_set(view_mat[2][0]));
    vec2 ds_b = ds_add(ds_mul(ds_set(view_mat[1][1]), ds_in_y), ds_set(view_mat[2][1]));

    float escape_time = iterate(ds_a, ds_b);

    if (escape_time != 1.0) {
        float u = escape_time * 10.0;
        fragment_color = texture(u_palette_sampler, vec2(mod(u, 1.0), 0.5));
    } else {
        fragment_color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
