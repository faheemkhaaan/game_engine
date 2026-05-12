
import { Entity } from './entity.mjs'

export class World {

    constructor() {
        /**
         * @type {Map<string,Entity>} 
         */
        this.entities = new Map();
    }

    /**
     * 
     * @param {string} name 
     * @returns {Entity}
     */
    createEntity(name) {
        const entity = new Entity(name);
        this.entities.set(entity.id, entity);
        return entity;
    }

    /**
     * 
     * @param {Entity} entity 
     * @returns {Entity}
     */
    addEntity(entity) {
        if (!this.entities.has(entity.id)) {
            this.entities.set(entity.id, entity);
        }
        return entity;
    }

    getEntity(name) {
        if (this.entities.has(name)) {
            return this.entities.get(name);
        }
        throw new Error(`Entity with Id ${name} not found`);
    }

    destory(name) {
        if (this.entities.has(name)) {
            this.entities.delete(name);
            return true;
        }
        return false;
    }

    /**
     * 
     * @param  {...string} componentsType 
     * @returns {Entity[]}
     */
    query(...componentsType) {
        const result = [];
        this.entities.forEach(e => {
            if (componentsType.some(type => e.components.has(type))) {
                result.push(e)
            }
        })
        return result;
    }

}