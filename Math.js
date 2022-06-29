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

export class AffineTransformation {
    constructor(matrix2, translation) {
        this.matrix = matrix2;
        this.translation = translation;
    }

    transform(vector) {
        let newVector = this.matrix.mulVector(vector);
        newVector = newVector.add(this.translation);
        return newVector;
    }
}
