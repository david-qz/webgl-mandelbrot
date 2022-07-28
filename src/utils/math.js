/**
 * A 3x3 Matrix. Currently, this only used as an affine transformation for Vector2.
 */
export class Matrix3 {
    constructor(
        a11, a12, a13,
        a21, a22, a23,
        a31, a32, a33,
    ) {
        this.a11 = a11;
        this.a12 = a12;
        this.a13 = a13;
        this.a21 = a21;
        this.a22 = a22;
        this.a23 = a23;
        this.a31 = a31;
        this.a32 = a32;
        this.a33 = a33;
    }

    mulVector2({ x, y}) {
        return new Vector2(
            x * this.a11 + y * this.a12 + this.a13,
            x * this.a21 + y * this.a22 + this.a23,
        );
    }

    toArray() {
        // return [
        //     this.a11, this.a21, this.a31,
        //     this.a12, this.a22, this.a32,
        //     this.a13, this.a23, this.a33
        // ];
        return [
            this.a11, this.a12, this.a13,
            this.a21, this.a22, this.a23,
            this.a31, this.a32, this.a33
        ];
    }
}

/**
 * A 2 component vector.
 */
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

/**
 * Represents a rectangle with one corner at (x,y). Which corner (x,y) represents is arbitrary, but should be kept
 * consistent between usages of the class that interact through class methods.
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
     * @returns {Matrix3} A column-major 3x3 matrix
     */
    static transformation(rect1, rect2) {
        const { x: x1, y: y1, width: w1, height: h1 } = rect1;
        const { x: x2, y: y2, width: w2, height: h2 } = rect2;

        return new Matrix3(
            (w2 / w1), 0, (x2 - w2 * x1 / w1),
            0, (h2 / h1), (y2 - h2 * y1 / h1),
            0, 0, 1
        );
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
