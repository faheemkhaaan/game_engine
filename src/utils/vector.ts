


export class Vector {

    public x: number;
    public y: number;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static create() {
        return new Vector(0, 0);
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector}
     */
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    add(other: Vector) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    sub(other: Vector) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    mult(other: Vector) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    div(other: Vector) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }


    divByNumber(factor: number) {
        this.x /= factor;
        this.y /= factor;
        return this;
    }


    scale(factor: number) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }


    rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;
        return this;
    }


    mag() {
        return Math.hypot(this.x, this.y);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    normal() {
        return new Vector(this.y, -this.x);
    }


    limit(value: number) {
        const mag = this.mag();
        if (mag > value) {
            this.x = (this.x / mag) * value;
            this.y = (this.y / mag) * value;
        }
        return this;
    }



    normalize(): Vector {
        const mag = this.mag();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    multNum(n: number) {
        this.x *= n;
        this.y *= n;
        return this;
    }


    /**
     * 
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y);
    }

    dist() {
        return Math.hypot(this.x, this.y);
    }

    copy(other: Vector) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }


    addScaled(other: Vector, factor: number) {

        this.x += other.x * factor;
        this.y += other.y * factor;
        return this;
    }

    subScaled(other: Vector, factor: number) {
        this.x -= other.x * factor;
        this.y -= other.y * factor;
        return this;
    }
    lerp(other: Vector, t: number): this {
        this.x += (other.x - this.x) * t;
        this.y += (other.y - this.y) * t;
        return this;
    }
    static add(v1: Vector, v2: Vector) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }


    static dist(v1: Vector, v2: Vector) {
        return Math.hypot(v2.x - v1.x, v2.y - v1.y);
    }



    static sub(v1: Vector, v2: Vector) {
        return new Vector(
            v1.x - v2.x,
            v1.y - v2.y
        )
    }

    static mult(v1: Vector, v2: Vector) {
        return new Vector(v1.x * v2.x, v1.y * v2.y);
    }



    static scale(v1: Vector, factor: number) {
        return new Vector(v1.x * factor, v1.y * factor);
    }


    static lerp(v1: Vector, v2: Vector, t: number) {
        return new Vector(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        )
    }


    static dot(v1: Vector, v2: Vector) {
        return v1.x * v2.x + v1.y * v2.y;
    }


    static getIntersection(a: Vector, b: Vector, c: Vector, d: Vector) {
        const AB = Vector.sub(b, a);
        const CD = Vector.sub(d, c);

        const AC = Vector.sub(c, a);

        const bottom = Vector.cross(AB, CD);

        if (bottom !== 0) {

            const tTop = Vector.cross(AC, AB);
            const uTop = Vector.cross(AC, CD);

            const t = tTop / bottom;
            const u = uTop / bottom;

            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {

                return {
                    p: Vector.lerp(a, b, t),
                    offset: t
                }
            }
        }
    }

    static cross(v1: Vector, v2: Vector) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static normalize(v: Vector) {
        const mag = v.mag();
        if (mag > 0) {
            return new Vector(v.x / mag, v.y / mag);
        }
        return new Vector(0, 0)
    }


    static angle(v1: Vector, v2: Vector) {
        return Math.atan2(Vector.cross(v1, v2), Vector.dot(v1, v2));
    }

    setMag(length: number) {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag > 0) {
            this.x = (this.x / mag) * length;
            this.y = (this.y / mag) * length;
        }
        return this;
    }
}