import { Entity } from "../core/entity.mjs";




export class CollisionGrid {

    constructor(cellSize = 200) {

        this.cellSize = cellSize;

        this.staticEntities = new Map();

        this.dynamicEntities = new Map();
    }

    clearDynamicEntities() {
        this.dynamicEntities.clear();
    }


    getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }


    /**
     * 
     * @param {Entity} entity 
     */
    addStaticEntity(entity) {
        const physics = entity.getComponent('PhysicsComponent');
        if (physics && !physics.static) return;
        const render = entity.getComponent("RenderComponent");

        if (!render) return;


        const pos = physics.entity.transform.pos;
        const hw = render.width / 2;
        const hh = render.height / 2;

        const minX = pos.x - hw;
        const maxX = pos.x + hw;
        const minY = pos.y - hh;
        const maxY = pos.y + hh;

        for (let x = minX; x <= maxX; x += this.cellSize) {
            for (let y = minY; y <= maxY; y += this.cellSize) {
                const key = this.getKey(x, y);
                if (!this.staticEntities.has(key)) {
                    this.staticEntities.set(key, new Set());
                }
                this.staticEntities.get(key).add(entity)
            }
        }
    }
    /**
    * Update dynamic entity position in grid (called every frame)
    */
    updateDynamicEntity(entity) {
        const physics = entity.getComponent('PhysicsComponent');
        if (!physics || physics.isStatic || physics.static) return;

        const render = entity.getComponent('RenderComponent');
        if (!render) return;

        const pos = entity.transform.pos;

        const hw = (render.width || render.radius * 2 || 0) / 2;
        const hh = (render.height || render.radius * 2 || 0) / 2;

        const minX = pos.x - hw;
        const maxX = pos.x + hw;
        const minY = pos.y - hh;
        const maxY = pos.y + hh;

        // Make sure we check boundaries rounded to cellSize to avoid missing edge cases
        const startX = Math.floor(minX / this.cellSize) * this.cellSize;
        const endX = Math.floor(maxX / this.cellSize) * this.cellSize;
        const startY = Math.floor(minY / this.cellSize) * this.cellSize;
        const endY = Math.floor(maxY / this.cellSize) * this.cellSize;

        for (let x = startX; x <= endX; x += this.cellSize) {
            for (let y = startY; y <= endY; y += this.cellSize) {
                const key = this.getKey(x, y);
                if (!this.dynamicEntities.has(key)) {
                    this.dynamicEntities.set(key, new Set());
                }
                this.dynamicEntities.get(key).add(entity);
            }
        }
    }

    /**
     * Get potential collision candidates for a dynamic entity
     */
    getPotentialCollisions(dynamicEntity) {
        const pos = dynamicEntity.transform.pos;
        const render = dynamicEntity.getComponent('RenderComponent');
        const physics = dynamicEntity.getComponent('PhysicsComponent');

        if (!render || !physics) return [];

        // Get radius for broadphase check
        const radius = Math.max(render.width, render.height) / 2;

        const candidates = new Set();
        const centerKey = this.getKey(pos.x, pos.y);

        // Check surrounding cells (3x3 grid)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cellX = Math.floor(pos.x / this.cellSize) + dx;
                const cellY = Math.floor(pos.y / this.cellSize) + dy;
                const key = `${cellX},${cellY}`;

                // Check static entities
                const staticEntities = this.staticEntities.get(key);
                if (staticEntities) {
                    for (const entity of staticEntities) {
                        candidates.add(entity);
                    }
                }

                // Check dynamic entities
                const dynamicEntities = this.dynamicEntities.get(key);
                if (dynamicEntities) {
                    for (const entity of dynamicEntities) {
                        if (entity !== dynamicEntity) {
                            candidates.add(entity);
                        }
                    }
                }
            }
        }

        return Array.from(candidates);
    }

    getPotentialBoids(dynamicEntity) {
        const pos = dynamicEntity.transform.pos;
        const render = dynamicEntity.getComponent('RenderComponent');
        const physics = dynamicEntity.getComponent('PhysicsComponent');

        if (!render || !physics) return [];

        // Get radius for broadphase check
        const radius = Math.max(render.width, render.height) / 2;

        const candidates = new Set();
        const centerKey = this.getKey(pos.x, pos.y);

        // Check surrounding cells (3x3 grid)
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                const cellX = Math.floor(pos.x / this.cellSize) + dx;
                const cellY = Math.floor(pos.y / this.cellSize) + dy;
                const key = `${cellX},${cellY}`;

                // Check static entities
                const staticEntities = this.staticEntities.get(key);
                if (staticEntities) {
                    for (const entity of staticEntities) {
                        candidates.add(entity);
                    }
                }

                // Check dynamic entities
                const dynamicEntities = this.dynamicEntities.get(key);
                if (dynamicEntities) {
                    for (const entity of dynamicEntities) {
                        if (entity !== dynamicEntity) {
                            candidates.add(entity);
                        }
                    }
                }
            }
        }

        return Array.from(candidates);
    }
    /**
     * Perform AABB (Axis-Aligned Bounding Box) fast check
     * Returns true if bounding boxes overlap
     */
    static aabbOverlap(pos1, width1, height1, pos2, width2, height2) {
        const halfW1 = width1 / 2;
        const halfH1 = height1 / 2;
        const halfW2 = width2 / 2;
        const halfH2 = height2 / 2;

        return Math.abs(pos1.x - pos2.x) < halfW1 + halfW2 &&
            Math.abs(pos1.y - pos2.y) < halfH1 + halfH2;
    }
}