import { Entity } from "../core/entity.mjs";




const defaultOptions = { color: '#2f2341', type: 'rect', height: 50, width: 50, image: null, radius: null, zIndex: 0 }

export class RenderComponent {

    /**
     * 
     * @type {Entity} 
     */
    entity


    constructor({ color = '#2f2341', image = null, zIndex = 0 } = {}) {
        this.entity = null;
        this.color = color || defaultOptions.color;

        this.image = image;
        this.zIndex = zIndex || defaultOptions.zIndex;

        // CACHING: Store cached vertices for static entities
        /** @type {Vector[]|null} */
        this.cachedVertices = null;
        /** @type {boolean} */
        this.dirty = true; // Flag to force recalculation when transform changes

        this.dead = false;
    }
}