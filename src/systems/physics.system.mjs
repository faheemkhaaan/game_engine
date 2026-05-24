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
        const filteredDeadEntities = entities.filter(entity => {
            const renderComponent = entity.getComponent('RenderComponent');

            return renderComponent && !renderComponent.dead;
        })
        filteredDeadEntities.forEach(entity => {
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
        if (physics.static) return;
        physics.forces.forEach(force => {
            physics.aceleration.add(force.divByNumber(physics.mass));
        });
        physics.forces.length = 0;


        physics.velocity.addScaled(physics.aceleration, deltaTime);
        physics.velocity.addScaled(physics.gravity, deltaTime);
        physics.velocity.scale(physics.drag);


        if (physics.velocity.mag() > physics.maxSpeed) {
            physics.velocity.normalize().scale(physics.maxSpeed);
        }
        physics.entity.transform.scaledTranslate(physics.velocity, deltaTime);
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
            physics.velocity.add(impulse);
        }
    }
}   