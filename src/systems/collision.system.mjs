
import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
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
        const entities = this.world.query('PhysicsComponent', 'RenderComponent');

        const filterEntities = entities.filter(entity => {
            const renderComponent = entity.getComponent('RenderComponent');

            return !renderComponent || !renderComponent.dead;
        })
        for (const entity of entities) {
            const physics = entity.getComponent('PhysicsComponent');
            if (physics && physics.static) {
                this.grid.addStaticEntity(entity);
            }
        }

        this.gridInitialized = true;
    }


    update(deltaTime) {
        // console.log(deltaTime);

        const entities = this.world.query('PhysicsComponent');

        const dynamicEntities = entities.filter(e => {
            const physics = e.getComponent('PhysicsComponent');

            return physics && !physics.static;
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

    checkCollision(e1, e2) {
        const p1 = e1.getComponent('PhysicsComponent');
        const p2 = e2.getComponent("PhysicsComponent");
        const r1 = e1.getComponent("RenderComponent");
        const r2 = e2.getComponent("RenderComponent");
        if (!p1 || !p2 || !r1 || !r2) return;

        // Use SAT for all collision checks - it's more robust and handles rotation
        const contact = SAT.checkCollision(e1, r1, e2, r2);

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