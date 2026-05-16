import { Entity } from "../core/entity.mjs";




const defaultOptions = { color: '#2f2341', type: 'rect', height: 50, width: 50, image: null, radius: null, zIndex: 0 }

export class RenderComponent {

    /**
     * 
     * @type {Entity} 
     */
    entity


    constructor(options = defaultOptions) {
        this.entity = null;
        this.color = options.color || defaultOptions.color;
        this.type = options.type || defaultOptions.type;
        this.width = options.width;
        this.height = options.height;
        this.image = options.image;
        this.radius = options.radius;
        this.zIndex = options.zIndex !== undefined ? options.zIndex : defaultOptions.zIndex;
    }
}