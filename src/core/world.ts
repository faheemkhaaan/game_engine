
import { Vector } from '../utils/vector';
import { ComponentClass, Entity } from './entity'

/**
 * @typedef {'BoidComponent' | 'CellComponent' | 'CollisionComponent'| 'DungeonComponent' | 'HallComponent' |"PhysicsComponent" |"RenderComponent" |"SegmentComponent" |"SnakeComponent"|'ShapeComponent'|'SegmentComponent'} ComponentsTypes
 */
export class World {

    public entities = new Map<string, Entity>()
    constructor() {
        /**
         * @type {Map<string,Entity>} 
         */
        this.entities = new Map();
    }

    entitiesLength(): number {
        return this.entities.size
    }

    /**
     * 
     * @param {string} name 
     * @returns {Entity}
     */
    createEntity(name: string = '') {
        const entity = new Entity(name, {
            pos: new Vector(0, 0), size: new Vector(0, 0), rotation: 0
        });
        this.entities.set(entity.id, entity);
        return entity;
    }

    /**
     * 
     * @param {Entity} entity 
     * @returns {Entity}
     */
    addEntity(entity: Entity) {
        if (!this.entities.has(entity.id)) {
            this.entities.set(entity.id, entity);
        }
        return entity;
    }

    getEntity(name: string) {
        if (this.entities.has(name)) {
            return this.entities.get(name);
        }
        return null;
    }

    destory(name: string) {
        if (this.entities.has(name)) {
            this.entities.delete(name);
            return true;
        }
        return false;
    }

    /**
     * 
     * @param  {...ComponentsTypes} componentsType 
     * @returns {Entity[]}
     */
    query(...componentsType: ComponentClass[]) {
        const result: Entity[] = [];
        this.entities.forEach(e => {
            if (componentsType.some(componentClass => e.components.has(componentClass))) {
                result.push(e)
            }
        })
        return result;
    }


    clearEntities() {
        this.entities.clear()
    }
}