


export class Vector {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector}
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    mult(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    div(other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }


    divByNumber(factor) {
        this.x /= factor;
        this.y /= factor;
        return this;
    }


    /**
     * 
     * @param {number} factor 
     * @returns {Vector}
     */
    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    /**
     * 
     * @param {number} angle 
     * @returns  {Vector}
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * 
     * @returns {number}
     */
    mag() {
        return Math.hypot(this.x, this.y);
    }

    /**
     * 
     * @returns {number}
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }
    /**
     * 
     * @returns {Vector}
     */
    normal() {
        return new Vector(this.y, -this.x);
    }

    /**
     * 
     * @param {number} value 
     * @returns {Vector}
     */
    limit(value) {
        const mag = this.mag();
        if (mag > value) {
            this.x = (this.x / mag) * value;
            this.y = (this.y / mag) * value;
        }
        return this;
    }


    /**
     * 
     * @returns {Vector}
     */
    normalize() {
        const mag = this.mag();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
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


    /**
     * 
     * @param {Vector} other 
     * @returns {Vector}
     */
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @param {number} factor 
     * @returns {Vector}
     */
    addScaled(other, factor) {

        this.x += Math.round(other.x * factor);
        this.y += Math.round(other.y * factor);
        return this;
    }

    /**
     * 
     * @param {Vector} other 
     * @param {null} factor 
     * @return {Vector} 
     */
    subScaled(other, factor) {
        this.x -= other.x * factor;
        this.y -= other.y * factor;
        return this;
    }
    /**
     * 
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    /**
     * 
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {number}
     */
    static dist(v1, v2) {
        return Math.hypot(v2.x - v1.x, v2.y - v1.y);
    }


    /**
     * 
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static sub(v1, v2) {
        return new Vector(
            v1.x - v2.x,
            v1.y - v2.y
        )
    }


    /**
     * 
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @param {number} t 
     * @returns {Vector}
     */
    static lerp(v1, v2, t) {
        return new Vector(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        )
    }


    /**
     * 
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }


    static getIntersection(a, b, c, d) {
        const AB = Vector.sub(b, a);
        const CD = Vector.sub(d, c);

        const AC = Vector.sub(c, a);

        const bottom = Vector.cross(AB, CD);

        if (b !== 0) {

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

    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
}