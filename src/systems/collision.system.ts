

import { CollisionComponent } from "../components/collision.component";
import { PhysicsComponent } from "../components/physics.component";
import { ShapeComponent } from "../components/shape.component";
import { Entity } from "../core/entity";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";
import { CollisionGrid } from "../utils/collision-grid";
import { distanceToShape } from "../utils/distance-to-shape";
import { SAT } from "../utils/sat";
import { Vector } from "../utils/vector";



type ContactInfo = { normal: Vector | null; depth: number };
type ValidContactInfo = { normal: Vector; depth: number }

function isContactValid(contact: ContactInfo | null): contact is ValidContactInfo {
    return contact !== null && contact !== undefined && contact.normal !== null && contact.depth > 0;
}

export class CollisionSystem {

    private world: World;
    private grid = new CollisionGrid(200);
    private gridInitialized: boolean = false;
    private events: EventBus;
    private enable: boolean;

    /**
     * 
     * @param {World} world 
     * @param {EventBus} events
     */
    constructor(world: World, events: EventBus) {
        this.world = world;
        this.grid = new CollisionGrid(200);
        this.gridInitialized = false;
        this.events = events;
        this.enable = true;
        this.events.on('enableCollision', () => {
            this.enable = !this.enable;
        })
        this.events.on("dungeonGenerated", () => {

            this.initializeStaticGrid();
        })
    }

    initializeStaticGrid() {
        const entities = this.world.query(PhysicsComponent, ShapeComponent);

        for (const entity of entities) {
            const collision = entity.getComponent(CollisionComponent);
            if (collision && collision.static) {
                this.grid.addStaticEntity(entity);
            }
        }
        this.gridInitialized = true;
    }


    update(deltaTime: number) {
        if (!this.enable) return;

        const entities = this.world.query(PhysicsComponent);
        const player = this.world.getEntity('player');
        if (!player) return;

        const dynamicEntities = entities.filter(e => {
            const collision = e.getComponent(CollisionComponent);

            return collision && !collision.static;
        }).filter(entity => {
            const pos = entity.transform.pos;
            const shape = entity.getComponent(ShapeComponent);
            if (!shape) return true;
            return distanceToShape(pos, shape, player.transform.pos) < 2000;
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

    }
    /**
         * Determine if two collision components are allowed to collide based on their layers and masks.
         * @param {CollisionComponent} c1 
         * @param {CollisionComponent} c2 
         * @returns {boolean}
         */
    shouldCollide(c1: CollisionComponent, c2: CollisionComponent) {
        const c1CanHitC2 = c1.mask.some(maskLayer => c2.layers.includes(maskLayer));

        const c2CanHitC1 = c2.mask.some(maskLayer => c1.layers.includes(maskLayer));

        return c1CanHitC2 || c2CanHitC1;
    }
    /**
     * 
     * @param {Entity} e1 
     * @param {Entity} e2 
     * @returns 
     */
    checkCollision(e1: Entity, e2: Entity) {
        const p1 = e1.getComponent(PhysicsComponent);
        const p2 = e2.getComponent(PhysicsComponent);
        const c1 = e1.getComponent(CollisionComponent);
        const c2 = e2.getComponent(CollisionComponent);

        if (!this.shouldCollide(c1, c2)) {

            return;
        };
        const s1 = e1.getComponent(ShapeComponent);
        const s2 = e2.getComponent(ShapeComponent);
        if (!p1 || !p2 || !c1 || !c2 || !s1 || !s2) return;


        const contact = SAT.checkCollision(e1, s1, e2, s2);


        if (isContactValid(contact)) {
            this.events.emit('collisionDetected', e1, p1, e2, p2, contact);

            this.resolveCollision(e1, p1, e2, p2, contact);
        }
    }
    resolveCollision(e1: Entity, p1: PhysicsComponent, e2: Entity, p2: PhysicsComponent, contact: {
        normal: Vector;
        depth: number;
    }) {


        const invMass1 = p1.mass === 0 ? 0 : 1 / p1.mass;
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