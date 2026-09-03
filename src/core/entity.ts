
import { Transform } from "../components/transform";
import { Vector } from "../utils/vector.js";

export type ComponentClass<T = any> = new (...args: any[]) => T;

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
    public components = new Map<ComponentClass, any>();
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


    addComponent<T extends { entity: Entity | null }>(component: T): this {
        component.entity = this;
        this.components.set(component.constructor as ComponentClass, component);
        return this;
    }

    attachPhysics() {

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
    getComponent(componentClass: ComponentClass) {
        return this.components.get(componentClass);
    }

    deleteComponent(type: ComponentClass) {
        if (this.components.has(type)) {
            return this.components.delete(type);
        }
        return false;
    }


}