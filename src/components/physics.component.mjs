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
    constructor(options = defaultOptions) {
        this.velociy = options.velociy
        this.aceleration = options.aceleration
        this.gravity = options.gravity
        this.drag = options.drag
        this.maxSpeed = options.maxSpeed
        this.static = options.static;
        this.mass = options.mass || 5

        this.forces = [];
    }


}