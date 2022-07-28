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

/**
 * Represents a rectangle with one corner at (x,y). Which corner (x,y) represents is arbitrary.
*/
export class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Returns an affine transformation that transforms each point within rect1 to the corresponding
     * point in rect2.
     * @param {Rect} rect1
     * @param {Rect} rect2
     * @returns {Array} A column-major 3x3 matrix
     */
    static transformation(rect1, rect2) {
        const { x: x1, y: y1, width: w1, height: h1 } = rect1;
        const { x: x2, y: y2, width: w2, height: h2 } = rect2;

        return [
            (w2 / w1),           0,                   0,
            0,                   (h2 / h1),           0,
            (x2 - w2 * x1 / w1), (y2 - h2 * y1 / h1), 1
        ];
    }

    /**
     * Scales the rectangle about point and returns a new Rect. If you x, y are provided, will
     * scale about the rectangle's center.
     * @param {Number} factor - the scale factor
     * @param {Number} x - x coordinate to scale about
     * @param {Number} y - y coordinate to scale about
     * @returns {Rect} A new Rect
     */
    scale(factor, x, y) {
        x = x ?? this.x + this.width / 2;
        y = y ?? this.y + this.height / 2;

        return new Rect(
            (this.x - x) * factor + x,
            (this.y - y) * factor + y,
            this.width * factor,
            this.height * factor
        );
    }

    /**
     * Translates the Rect
     * @param {Number} dx - the translation along the x-axis
     * @param {Number} dy - the translation along the y-axis
     * @returns {Rect}
     */
    translate(dx, dy) {
        return new Rect(
            this.x + dx,
            this.y + dy,
            this.width,
            this.height,
        );
    }

    aspectRatio() {
        return this.width / this.height;
    }

    equals(rect) {
        return this.x === rect.x &&
               this.y === rect.y &&
               this.width === rect.width &&
               this.height === rect.height;
    }
}
