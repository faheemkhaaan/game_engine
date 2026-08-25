import { BoidComponent } from "../components/boid.component";
import { CellComponent } from "../components/cell.component";
import { CollisionComponent } from "../components/collision.component";
import { DungeonComponent } from "../components/dungeon.component";
import { PhysicsComponent } from "../components/physics.component";
import { RenderComponent } from "../components/render.component";
import { ShapeComponent } from "../components/shape.component";
import { SnakeComponent } from "../components/snake.component";
import { Transform } from "../components/transform";
import { Vector } from "../utils/vector.js";

/**
 * @typedef TransformOptions
 * @property {Vector} [pos] - Position vector
 * @property {Vector} [size] - Size Vector
 * @property {number} [rotation] - Rotation number
 */


type TransformOptions = {
    pos: Vector;
    size: Vector;
    rotation: number;
}
/**
 * @typedef {'BoidComponent' | 'CellComponent' | 'CollisionComponent'| 'DungeonComponent' | 'HallComponent' |"PhysicsComponent" |"RenderComponent" |"SegmentComponent" |"SnakeComponent" |"ShapeComponent"} ComponentsTypes
 */
export class Entity {

    public transform: Transform;
    public components = new Map();
    public id: string = crypto.randomUUID();
    /**
     * 
     * @param {string} id 
     * @param {TransformOptions} options
     */
    constructor(id: string | null, options: TransformOptions) {
        this.id = id || crypto.randomUUID();
        this.transform = new Transform({ pos: options?.pos, size: options?.size, rotation: options?.rotation });
        this.components = new Map();
    }


    addComponent(component) {
        component.entity = this;
        this.components.set(component.constructor.name, component);
    }

    /**
     * @template {ComponentsTypes} T
     * @param {T} type 
     * @returns {T extends 'BoidComponent' ? BoidComponent :
     * T extends 'CellComponent' ? CellComponent :
     * T extends 'CollisionComponent' ? CollisionComponent :
     * T extends 'DungeonComponent' ? DungeonComponent :
     * T extends 'PhysicsComponent' ? PhysicsComponent :
     * T extends 'RenderComponent' ? RenderComponent :
     * T extends 'SnakeComponent' ? SnakeComponent
     * T extends 'ShapeComponent' ? ShapeComponent
      * }
     */
    getComponent(type: string) {
        if (this.components.has(type)) {
            return this.components.get(type);
        }
        return null;
    }

    deleteComponent(type: string) {
        if (this.components.has(type)) {
            return this.components.delete(type);
        }
        return false;
    }


}