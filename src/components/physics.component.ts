import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";


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
    public entity: Entity | null;
    public velocity: Vector;
    public aceleration: Vector;
    public gravity: Vector;
    public drag: number;
    public maxSpeed: number;
    public static: boolean;
    public restitution: number;
    public forces: Vector[];
    public prevPos: Vector;
    public mass: number;
    constructor({ velocity = new Vector(0, 0), aceleration = new Vector(0, 0), gravity = new Vector(0, 0), drag = 0.98, maxSpeed = 200, isStatic = false, mass = 2, restitution = 0.4 } = {}) {
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
        this.restitution = restitution || 0.4
        this.forces = [];
        this.prevPos = new Vector(0, 0)

    }


}