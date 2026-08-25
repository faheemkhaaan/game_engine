import { Vector } from "../utils/vector";
/**
 * @typedef TransformOptions
 * @property {Vector} [pos] - Position vector
 * @property {Vector} [size] - size Vector
 * @property {number} [rotation] - Rotation number
 */

const defaultOptions = { pos: new Vector(0, 0), size: new Vector(1, 1), rotation: 0 }
export class Transform {

    public pos: Vector;
    public size: Vector;
    public rotation: number;
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
    setPos(pos: Vector) {
        this.pos = pos
        return this;
    }
    /**
     * 
     * @param {Vector} size 
     * @returns 
     */
    setsize(size: Vector) {
        this.size = size
        return this;
    }

    /**
     * 
     * @param {number} angle 
     */
    setRotation(angle: number) {
        this.rotation = angle;
        return this;
    }
    /**
     * 
     * @param {Vector} vec 
     * @returns {Transform}
     */
    translate(vec: Vector) {
        this.pos.add(vec);
        return this;
    }

    /**
     * 
     * @param {Vector} vec 
     * @param {number} factor 
     * @returns {Transform}
     */
    scaledTranslate(vec: Vector, factor: number) {
        this.pos.addScaled(vec, factor);
        return this;
    }

    /**
     * @param {number} amount
     */
    scale(amount: number) {
        this.size.scale(amount)
        return this;
    }

    /**
     * 
     * @param {Transform} other 
     * @returns {Transform}
     */
    copy(other: Transform) {
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