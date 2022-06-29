import {
    Matrix2,
    Vector2,
    Complex,
    AffineTransformation
} from './Math.js';

const debouncedCallback = (debounceTime, callback) => {
    const timeout = null;
    return () => {
        clearTimeout(timeout);
        setTimeout(callback, debounceTime);
    };
};

class Mandelbrot {
    constructor(canvas) {
        this.canvas = canvas;
        this.#onResize();

        window.addEventListener('resize', debouncedCallback(1000, () => {
            const size = `${this.canvas.clientWidth}:${this.canvas.clientHeight}`;

            if (this.lastSize && size === this.lastSize) {
                return;
            }

            this.lastSize = `${this.canvas.clientWidth}:${this.canvas.clientHeight}`;
            this.#onResize();
        }));
    }

    #onResize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.#calculateTransform();
        this.render();
    }

    #calculateTransform() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const xScale = 1 / w * 2;
        const yScale = 1 / h * 2;

        this.transformation = new AffineTransformation(
            new Matrix2(
                xScale, 0,
                0, -yScale
            ),
            new Vector2(
                -1.5,
                1
            )
        );
    }

    inSet(c, iterations) {
        let z = new Complex(0, 0);
        for (let i = 0; i < iterations; i++) {
            z = z.mul(z).add(c);

            if (z.magSquared() > 4) {
                return [false, z.mag()];
            }
        }
        return [true, z.mag()];
    }


    render() {
        const ctx = this.canvas.getContext('2d');

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const imageData = ctx.createImageData(w, h);

        // Iterate through every pixel
        for (let i = 0; i < imageData.data.length; i += 4) {
            const x = (i / 4) % w;
            const y = Math.floor((i / 4) / w);

            // Transform canvas coords to complex plane
            let v = new Vector2(x, y);
            v = this.transformation.transform(v);
            const c = new Complex(v.x, v.y);

            // Do iteration
            const [inSet, mag] = this.inSet(c, 150);

            // Modify pixel data
            if (inSet) {
                imageData.data[i + 0] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 255;
            } else {
                imageData.data[i + 0] = mag * 40;
                imageData.data[i + 1] = mag * 40;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

new Mandelbrot(document.querySelector('#mandelbrot'));
