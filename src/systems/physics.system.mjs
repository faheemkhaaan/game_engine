import { PhysicsComponent } from "../components/physics.component.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { Vector } from "../utils/vector.mjs";

export class PhysicsSystem {

    /**
     * 
     * @param {World} world 
     */
    constructor(world) {
        /**
         * @type {World}
         */
        this.world = world;



    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {


        const entities = this.world.query('PhysicsComponent');
        entities.forEach(entity => {
            const physicsComponent = entity.getComponent("PhysicsComponent")
            this.updatePhysics(physicsComponent, deltaTime);
        })

    }

    /**
     * 
     * @param {PhysicsComponent} physics 
     * @param {number} deltaTime
     */
    updatePhysics(physics, deltaTime) {

        physics.forces.forEach(force => {
            physics.aceleration.add(force.divByNumber(physics.mass));
        });
        physics.forces.length = 0;

        physics.velociy.add(physics.gravity);

        physics.velociy.add(physics.aceleration.scale(deltaTime));

        physics.velociy.scale(physics.drag);


        if (physics.velociy.mag() > physics.maxSpeed) {
            physics.velociy.normalize().scale(physics.maxSpeed);
        }

        physics.entity.transform.translate(physics.velociy.scale(deltaTime));

        physics.aceleration.set(0, 0);
    }

    /**
     * 
     * @param {Entity} entity 
     * @param {Vector} force 
     */
    applyForce(entity, force) {
        const physics = entity.getComponent("PhysicsComponent");
        if (physics) {
            physics.forces.push(force.clone())
        }
    }

    /**
     * 
     * @param {Entity} entity 
     * @param {Vector} impulse 
     */
    applyImpulse(entity, impulse) {
        const physics = entity.getComponent("PhysicsComponent");
        if (physics) {
            physics.velociy.add(impulse);
        }
    }
}   