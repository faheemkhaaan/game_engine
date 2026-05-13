
import { World } from "../core/world.mjs";
import { SAT } from "../utils/sat.mjs";
import { Vector } from "../utils/vector.mjs";





export class CollisionSystem {
    /**
     * 
     * @param {World} world 
     */
    constructor(world) {
        this.world = world

    }


    update(deltaTime) {
        // console.log(deltaTime);
        const entities = this.world.query('PhysicsComponent');
        // console.log(entities[0])
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                this.checkCollision(entities[i], entities[j]);

            }
        }
    }

    checkCollision(e1, e2) {
        const p1 = e1.getComponent('PhysicsComponent');
        const p2 = e2.getComponent("PhysicsComponent");
        const r1 = e1.getComponent("RenderComponent");
        const r2 = e2.getComponent("RenderComponent");
        if (!p1 || !p2 || !r1 || !r2) return;

        const contact = SAT.checkCollision(e1, r1, e2, r2);
        if (contact && contact.depth > 0) {
            this.resolveCollision(e1, p1, e2, p2, contact);
        }

    }

    circleRectCollision(p1, p2) {

    }
    /**
     * 
     * @param {PhysicsComponent} p1
     * @param {PhysicsComponent} p1
     * @param {NewType} r1
     * @param {RenderComponent} r2
     */
    circleCircleCollision(p1, p2, r1, r2) {
        const distVector = Vector.sub(p2, p1);
        const dist = distVector.dist();
        const minDist = r1.radius + r2.radius;
        if (dist >= minDist) return;

        const normal = dist !== 0 ? distVector.clone().normalize() : new Vector(1, 0);
        return {
            normal: normal,
            depth: minDist - dist
        }
    }
    resolveCollision(e1, p1, e2, p2, contact) {
        const invMass1 = p1.mass === 0 ? 0 : 1 / p1.mass; // Handle static objects (mass 0)
        const invMass2 = p2.mass === 0 ? 0 : 1 / p2.mass;

        const totalInMass = invMass1 + invMass2;

        const percent = 0.4;
        const slop = 0.01
        const correctionAmount = (Math.max(contact.depth - slop, 0) / totalInMass) * percent;
        const correction = contact.normal.clone().scale(correctionAmount / 2);

        e1.transform.pos.add(correction.clone().scale(invMass1 * correctionAmount));
        e2.transform.pos.sub(correction.clone().scale(invMass2 * correctionAmount));

        const relativeVelocity = Vector.sub(p1.velocity, p2.velocity);
        const velocityAlongNormal = Vector.dot(relativeVelocity, contact.normal);

        if (velocityAlongNormal > 0) return;

        const restitution = Math.min(p1.restitution, p2.restitution);
        const velocityThreshold = 0.5;
        const effectiveRestitution =
            Math.abs(velocityAlongNormal) < velocityThreshold ? 0 : restitution;
        const j = -(1 + effectiveRestitution) * velocityAlongNormal / totalInMass

        const impules = contact.normal.clone().scale(j);

        p1.velocity.add(impules.clone().scale(invMass1));
        p2.velocity.sub(impules.clone().scale(invMass2))
    }
}