// components/collision.component.mjs
export class CollisionComponent {
    constructor({
        static = false,
        broadphaseRadius = 0,
        layers = ['default']
    } = {}) {
        /** @type {Entity|null} */
        this.entity = null;

        this.static = static;
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
    }
}