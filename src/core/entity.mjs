import { Transform } from "../components/transform.mjs";

/**
 * @typedef TransformOptions
 * @property {Vector} [pos] - Position vector
 * @property {Vector} [size] - Size Vector
 * @property {number} [rotation] - Rotation number
 */

export class Entity {
    /**
     * 
     * @param {string} id 
     * @param {TransformOptions} options
     */
    constructor(id, options = {}) {
        this.id = id || Math.random().toString(36);
        this.transform = new Transform({ pos: options?.pos, size: options?.size, rotation: options?.rotation });
        this.components = new Map();
    }


    addComponent(component) {
        component.entity = this;
        this.components.set(component.constructor.name, component);
    }

    /**
     * 
     * @param {string} type 
     * @returns 
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