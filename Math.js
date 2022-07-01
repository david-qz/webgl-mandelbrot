export class Matrix2 {
    constructor(
        a11, a12,
        a21, a22
    ) {
        this.a11 = a11;
        this.a12 = a12;
        this.a21 = a21;
        this.a22 = a22;
    }

    mulVector({ x, y }) {
        return new Vector2(
            x * this.a11 + y * this.a12,
            x * this.a21 + y * this.a22,
        );
    }
}

export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(
            this.x + v.x,
            this.y + v.y
        );
    }

    sub(v) {
        return new Vector2(
            this.x - v.x,
            this.y - v.y
        );
    }
}

export class Complex {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    add(v) {
        return new Complex(
            this.a + v.a,
            this.b + v.b
        );
    }

    sub(v) {
        return new Complex(
            this.a - v.a,
            this.b - v.b
        );
    }

    mul(c) {
        return new Complex(
            this.a * c.a - this.b * c.b,
            this.a * c.b + this.b * c.a
        );
    }

    mag() {
        return Math.sqrt(this.a * this.a + this.b * this.b);
    }

    magSquared() {
        return this.a * this.a + this.b * this.b;
    }
}

export class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // returns a column-major 3x3 matrix representing an affine transformation
    // that, when applied to this rect, will transform it to the target rect.
    transformTo(rect) {
        const { x: x1, y: y1, width: w1, height: h1 } = this;
        const { x: x2, y: y2, width: w2, height: h2 } = rect;

        /* eslint-disable */
        return [
            w2/w1,         0,             0,
            0,             h2/h1,         0,
            x2 - w2*x1/w1, y2 - h2*y1/h1, 1
        ];
        /* eslint-enable */
    }
}
