import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";



export type RenderComponentType = {
    color: string;
    type: string;
    height: number;
    width: number;
    image: null | string;
    radius: null | number;
    zIndex: number;
}
const defaultOptions = { color: '#2f2341', type: 'rect', height: 50, width: 50, image: null, radius: null, zIndex: 0 }

export class RenderComponent {

    /**
     * 
     * @type {Entity} 
     */
    public entity: Entity | null;
    public color: string;
    public image: string | null;
    public zIndex: number;
    public cachedVertices: Vector[] | null;
    public dirty: boolean;
    public dead: boolean;
    public type: string;
    public width: number;
    public height: number;


    constructor({ color = '#2f2341', image = null, zIndex = 0, type, width, height }: RenderComponentType) {
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
        this.type = type;
        this.width = width;
        this.height = height;
    }
}