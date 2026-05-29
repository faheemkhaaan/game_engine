

import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { CollisionGrid } from "../utils/collision-grid.mjs";
import { SAT } from "../utils/sat.mjs";
import { Vector } from "../utils/vector.mjs";





export class CollisionSystem {
    /**
     * 
     * @param {World} world 
     * @param {EventBus} events
     */
    constructor(world, events) {
        this.world = world;
        this.grid = new CollisionGrid(200);
        this.gridInitialized = false;
        this.events = events;
        this.events.on("dungeonGenerated", () => {
            if (!this.gridInitialized) {
                this.initializeStaticGrid();
            }
        })

    }
    /**
 * Initialize static entities in the grid (called after dungeon generation)
 */
    initializeStaticGrid() {
        const entities = this.world.query('PhysicsComponent', 'ShapeComponent');

        for (const entity of entities) {
            const collision = entity.getComponent('CollisionComponent');
            if (collision && collision.static) {
                this.grid.addStaticEntity(entity);
            }
        }

        this.gridInitialized = true;
    }


    update(deltaTime) {
        // console.log(deltaTime);

        const entities = this.world.query('PhysicsComponent');

        const dynamicEntities = entities.filter(e => {
            const collision = e.getComponent('CollisionComponent');

            return collision && !collision.static;
        });

        this.grid.clearDynamicEntities();

        for (const entity of dynamicEntities) {
            this.grid.updateDynamicEntity(entity);
        }
        const checked = new Set()
        for (const entityA of dynamicEntities) {
            const candidates = this.grid.getPotentialCollisions(entityA);

            for (const entityB of candidates) {
                const pairKey = entityA.id < entityB.id ?
                    `${entityA.id}-${entityB.id}` :
                    `${entityB.id}-${entityA.id}`;

                if (checked.has(pairKey)) continue;
                checked.add(pairKey)

                this.checkCollision(entityA, entityB);
            }
        }
        // console.log(entities[0])
        // for (let i = 0; i < entities.length; i++) {
        //     for (let j = i + 1; j < entities.length; j++) {
        //         this.checkCollision(entities[i], entities[j]);

        //     }
        // }
    }
    /**
         * Determines if two collision components are allowed to collide based on their layers and masks.
         * @param {CollisionComponent} c1 
         * @param {CollisionComponent} c2 
         * @returns {boolean}
         */
    shouldCollide(c1, c2) {
        // Does c1's mask include any of c2's layers?
        const c1CanHitC2 = c1.mask.some(maskLayer => c2.layers.includes(maskLayer));

        // Does c2's mask include any of c1's layers?
        const c2CanHitC1 = c2.mask.some(maskLayer => c1.layers.includes(maskLayer));

        // Both must agree to collide. (If you prefer one-way permissions, change this to ||)
        return c1CanHitC2 || c2CanHitC1;
    }
    /**
     * 
     * @param {Entity} e1 
     * @param {Entity} e2 
     * @returns 
     */
    checkCollision(e1, e2) {
        const p1 = e1.getComponent('PhysicsComponent');
        const p2 = e2.getComponent("PhysicsComponent");
        const c1 = e1.getComponent('CollisionComponent');
        const c2 = e2.getComponent('CollisionComponent');

        if (!this.shouldCollide(c1, c2)) return;
        const s1 = e1.getComponent('ShapeComponent');
        const s2 = e2.getComponent('ShapeComponent');
        if (!p1 || !p2 || !c1 || !c2 || !s1 || !s2) return;

        // Use SAT for all collision checks - it's more robust and handles rotation
        const contact = SAT.checkCollision(e1, s1, e2, s2);

        if (contact && contact.depth > 0) {
            this.events.emit('collisionDetected', e1, p1, e2, p2, contact);

            this.resolveCollision(e1, p1, e2, p2, contact);
        }
    }
    resolveCollision(e1, p1, e2, p2, contact) {
        const invMass1 = p1.mass === 0 ? 0 : 1 / p1.mass; // Handle static objects (mass 0)
        const invMass2 = p2.mass === 0 ? 0 : 1 / p2.mass;

        const totalInMass = invMass1 + invMass2;

        if (totalInMass <= 0) return;

        const percent = 0.4;
        const slop = 0.01
        const correctionAmount = (Math.max(contact.depth - slop, 0) / totalInMass) * percent;
        const correction = contact.normal.clone().scale(correctionAmount / 2);

        // e1.transform.pos.add(correction.clone().scale(invMass1 / totalInMass));
        // e2.transform.pos.sub(correction.clone().scale(invMass2 / totalInMass));

        e1.transform.pos.addScaled(correction, invMass1 / totalInMass);
        e2.transform.pos.subScaled(correction, invMass2 / totalInMass);

        const relativeVelocity = Vector.sub(p1.velocity, p2.velocity);
        const velocityAlongNormal = Vector.dot(relativeVelocity, contact.normal);

        if (velocityAlongNormal > 0) return;

        const restitution = Math.min(p1.restitution, p2.restitution);
        const velocityThreshold = 0.5;
        const effectiveRestitution =
            Math.abs(velocityAlongNormal) < velocityThreshold ? 0 : restitution;
        const j = -(1 + effectiveRestitution) * velocityAlongNormal / totalInMass

        const impules = contact.normal.clone().scale(j);

        p1.velocity.addScaled(impules, invMass1);
        p2.velocity.subScaled(impules, invMass2)
    }
}