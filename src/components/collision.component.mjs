
export class CollisionComponent {

    constructor({
        isStatic = false,
        broadphaseRadius = 0,
        layers = ['default'],
        enabled = true,
        isTrigger = false, // True if i want to detect overlap without physical bounce

        mask = ["default"], // Which layers this entity is allowed to hit

    } = {}) {
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
