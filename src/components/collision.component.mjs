// components/collision.component.mjs
export class CollisionComponent {

    constructor({
        isStatic = false,
        broadphaseRadius = 0,
        layers = ['default'],
        enabled = true,
        isTrigger = false, // True if you want to detect overlap without physical bounce

        mask = ["default"] // Which layers this entity is allowed to hit
    } = {}) {
        /** @type {Entity|null} */
        this.entity = null;

        this.static = isStatic;
        this.broadphaseRadius = broadphaseRadius;
        this.layers = layers;

        // CACHING: For SAT collision data
        /** @type {Vector[]|null} */
        this.cachedVertices = null;
        /** @type {number|null} */
        this.cachedRadius = null;

        // Broadphase: Store grid cell coordinates for quick lookup
        /** @type {{x: number, y: number}|null} */
        this.gridCell = null;

        this.enabled = enabled;
        this.isTrigger = isTrigger;
        this.mask = mask;
    }
}
