import { Vector } from "../utils/vector.mjs";
/**
 * @typedef TransformOptions
 * @property {Vector} [pos] - Position vector
 * @property {Vector} [size] - size Vector
 * @property {number} [rotation] - Rotation number
 */

const defaultOptions = { pos: new Vector(0, 0), size: new Vector(1, 1), rotation: 0 }
export class Transform {
    /**
     * 
     * @param {TransformOptions} options 
     */
    constructor(options = defaultOptions) {
        this.pos = options.pos
        this.size = options.size
        this.rotation = options.rotation
    };

    /**
     * 
     * @param {Vector} pos 
     * @returns 
     */
    setPos(pos) {
        this.pos = pos
        return this;
    }
    /**
     * 
     * @param {Vector} size 
     * @returns 
     */
    setsize(size) {
        this.size = size
        return this;
    }

    /**
     * 
     * @param {number} angle 
     */
    setRotation(angle) {
        this.rotation = angle;
        return this;
    }
    /**
     * 
     * @param {Vector} vec 
     * @returns {Vector}
     */
    translate(vec) {
        this.pos.add(vec);
        return this;
    }

    /**
     * @param {number} amount
     */
    scale(amount) {
        this.size.scale(amount)
        return this;
    }

    /**
     * 
     * @param {Transform} other 
     * @returns {Transform}
     */
    copy(other) {
        this.pos = other.pos;
        this.size = other.size;
        this.rotation = other.rotation;
        return this;
    }

    /**
     * 
     * @returns {Transform}
     */
    clone() {
        return new Transform({
            pos: this.pos,
            size: this.size,
            rotation: this.rotation
        })
    }

}