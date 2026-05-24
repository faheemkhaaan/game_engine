import { BoidComponent } from "../components/boid.component.mjs";
import { CellComponent } from "../components/cell.component.mjs";
import { CollisionComponent } from "../components/collision.component.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { ShapeComponent } from "../components/shape.component.mjs";
import { SnakeComponent } from "../components/snake.component.mjs";
import { Transform } from "../components/transform.mjs";

/**
 * @typedef TransformOptions
 * @property {Vector} [pos] - Position vector
 * @property {Vector} [size] - Size Vector
 * @property {number} [rotation] - Rotation number
 */

/**
 * @typedef {'BoidComponent' | 'CellComponent' | 'CollisionComponent'| 'DungeonComponent' | 'HallComponent' |"PhysicsComponent" |"RenderComponent" |"SegmentComponent" |"SnakeComponent" |"ShapeComponent"} ComponentsTypes
 */
export class Entity {
    /**
     * 
     * @param {string} id 
     * @param {TransformOptions} options
     */
    constructor(id, options = {}) {
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
    getComponent(type) {
        if (this.components.has(type)) {
            return this.components.get(type);
        }
        return null;
    }

    deleteComponent(type) {
        if (this.components.has(type)) {
            return this.components.delete(type);
        }
        return false;
    }


}