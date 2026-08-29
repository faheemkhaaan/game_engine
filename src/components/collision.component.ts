import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";

export type CollisionComponentType = {
    isStatic: boolean,
    broadphaseRadius: number,
    layers: string[],
    enabled: boolean,
    isTrigger: boolean,

    mask: string[],
}
export class CollisionComponent {



    public entity: Entity | null;
    public static: boolean;
    public broadphaseRadius: number;
    public layers: string[];
    public mask: string[];
    public cachedVertices: Vector[] | null;
    public cachedRadius: Vector | null;
    public gridCell: { x: number, y: number } | null;
    public enabled: boolean;
    public isTrigger: boolean;
    public dirty: boolean = false;

    constructor({
        isStatic = false,
        broadphaseRadius = 0,
        layers = ['default'],
        enabled = true,
        isTrigger = false, // True if i want to detect overlap without physical bounce

        mask = ["default"], // Which layers this entity is allowed to hit

    }: CollisionComponentType) {
        /** @type {Entity|null} */
        this.entity = null;

        this.static = isStatic;
        this.broadphaseRadius = broadphaseRadius;
        this.layers = layers;

        /** @type {Vector[]|null} */
        this.cachedVertices = null;
        /** @type {number|null} */
        this.cachedRadius = null;

        /** @type {{x: number, y: number}|null} */
        this.gridCell = null;

        this.enabled = enabled;
        this.isTrigger = isTrigger;
        this.mask = mask;
    }
}
