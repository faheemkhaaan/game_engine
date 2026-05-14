import { Entity } from "../core/entity.mjs";
import { Vector } from "../utils/vector.mjs";


/**
 * @typedef PhysicsComponentOptions
 * @property {Vector} [velociy] - Velocity 
 * @property {Vector} [aceleration] - Aceleration 
 * @property {Vector} [gravity] - Gravity 
 * @property {number} [drag] - the friction  
 * @property {number} [maxSpeed] - the friction  
 * @property {boolean} [static] - the friction  
 * @property {number} [mass] - the mass  
 */

const defaultOptions = { velociy: new Vector(0, 0), aceleration: new Vector(0, 0), gravity: new Vector(0, 0), drag: 0.98, maxSpeed: 200, static: false, mass: 20 }
export class PhysicsComponent {

    /**
     * @type {Entity}
     */
    entity
    constructor({ velocity = new Vector(0, 0), aceleration = new Vector(0, 0), gravity = new Vector(0, 0), drag = 0.98, maxSpeed = 200, isStatic = false, mass = 2 } = {}) {
        /**
         * @type {Entity | null}
         */
        this.entity = null;
        this.velocity = velocity
        this.aceleration = aceleration
        this.gravity = gravity
        this.drag = drag
        this.maxSpeed = maxSpeed
        this.static = isStatic;
        this.mass = this.static ? 0 : mass || Math.random() * 2 + 2
        this.restitution = 0.4
        this.forces = [];

    }


}