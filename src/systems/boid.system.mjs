import { BoidComponent } from "../components/boid.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { CollisionGrid } from "../utils/collision-grid.mjs";
import { Vector } from "../utils/vector.mjs";




export class BoidSystem {
    /**
     * 
     * @param {World} world 
     * @param {EventBus} events 
     */
    constructor(world, events) {
        this.world = world;
        this.grid = new CollisionGrid(200)
        this.events = events;
    }



    update(dt) {
        const entites = this.world.query('BoidComponent');


        this.grid.clearDynamicEntities();

        for (const entity of entites) {
            this.grid.updateDynamicEntity(entity);
        }
        entites.forEach(entity => {
            /**
             * @type {BoidComponent}
             */
            const boidComponent = entity.getComponent("BoidComponent");

            /**@type {PhysicsComponent} */
            const physicsComponent = entity.getComponent("PhysicsComponent");

            const seperation = this.seperation(entity);
            const cohision = this.cohision(entity);
            const alignment = this.alignment(entity);
            const escape = this.fleeing(entity);

            seperation.scale(boidComponent.seperationWeight);
            cohision.scale(boidComponent.cohesionWeight);
            alignment.scale(boidComponent.alignmentWeight);
            // escape.scale(boidComponent.playerAvoidWeight);

            // console.log(seperation, cohision, alignment)
            // physicsComponent.forces.push(seperation, cohision, alignment);

            physicsComponent.forces.push(escape, seperation, cohision, alignment)

        });
    }


    /**
     * 
     * @param {Entity} entity
     * @returns {Vector}
     */
    seperation(entity) {
        /*
            1. get all the entites 
            2. get the distance from the entites and calculate the steering force and add them to the steering vector
            3. average the steering force and add it to the main entity.
        */
        const entities = this.grid.getPotentialCollisions(entity);
        // console.log(entities.length);
        /**
         * @type {PhysicsComponent}
         */
        const physicsComponent = entity.getComponent('PhysicsComponent');
        /**
         * @type {BoidComponent}
         */
        const boidComponent = entity.getComponent('BoidComponent');
        const pos = entity.transform.pos;
        const steering = new Vector(0, 0);
        let count = 0;
        entities.forEach(other => {
            if (other === entity) return;

            const otherPos = other.transform.pos;

            const dist = Vector.dist(pos, otherPos);

            if (dist < boidComponent.separationRadius) {

                const distVect = Vector.sub(pos, otherPos);

                distVect.normalize();

                distVect.divByNumber(dist);
                steering.add(distVect);
                count++
            }
        })

        if (count > 0) {
            steering.divByNumber(count);
            steering.normalize();
            steering.scale(physicsComponent.maxSpeed);
            steering.sub(physicsComponent.velocity);
            steering.limit(boidComponent.maxForce);
        }



        return steering;
    }

    /**
     * @param {Entity} entity
     * @returns {Vector}
     */
    alignment(entity) {
        /**@type {BoidComponent} */
        const boidComponent = entity.getComponent('BoidComponent');
        const physicsComponent = entity.getComponent('PhysicsComponent');
        // console.log(physicsComponent)
        const entities = this.grid.getPotentialCollisions(entity);
        // console.log(entities)
        const steering = new Vector(0, 0);
        let count = 0;


        entities.forEach(entityB => {

            if (entity === entityB) return;

            const physicsComponent = entityB.getComponent('PhysicsComponent');
            // console.log(physicsComponent)
            const dist = Vector.dist(entity.transform.pos, entityB.transform.pos);

            if (dist < boidComponent.alignmentRadius) {
                steering.add(physicsComponent.velocity);

                count++;
            }
        });
        if (count > 0) {
            steering.divByNumber(count);
            steering.normalize();
            steering.scale(physicsComponent.maxSpeed);
            steering.sub(physicsComponent.velocity);
            steering.limit(boidComponent.maxForce);


        }

        return steering;

    }


    /**
     * @param {Entity} entity
     * @returns {Vector}
     */
    cohision(entity) {

        const entities = this.grid.getPotentialCollisions(entity);
        /**@type {BoidComponent} */
        const boidComponent = entity.getComponent('BoidComponent');
        const physicsComponent = entity.getComponent("PhysicsComponent");
        const steering = new Vector(0, 0);
        let count = 0;
        entities.forEach(entityB => {
            if (entity === entityB) return;

            const pos = entityB.transform.pos;

            const dist = Vector.dist(entity.transform.pos, pos);

            if (dist < boidComponent.cohesionRadius) {
                steering.add(pos);
                count++
            }
        });

        if (count > 0) {
            steering.divByNumber(count);
            steering.sub(entity.transform.pos)
            steering.normalize();
            steering.scale(physicsComponent.maxSpeed);
            steering.sub(physicsComponent.velocity);
            steering.limit(boidComponent.maxForce);

        }
        return steering
    }



    /**
     * 
     * @param {Entity} entity 
     */
    fleeing(entity) {
        const player = this.world.getEntity('player');
        if (!player || !player.transform) return new Vector(0, 0);

        const physicsComponent = entity.getComponent('PhysicsComponent');
        const boidComponent = entity.getComponent('BoidComponent');

        // Vector from player to boid (escape direction)
        const fromPlayer = Vector.sub(entity.transform.pos, player.transform.pos);
        const distance = fromPlayer.mag(); // Get magnitude, not dist()

        // Only flee if within detection radius
        if (distance < boidComponent.playerAvoidRadius && distance > 0) {
            // Calculate desired velocity (away from player, at max speed)
            const desired = fromPlayer.clone();
            desired.normalize();
            // desired.divByNumber(distance);
            desired.scale(physicsComponent.maxSpeed);

            // Steering = desired - current velocity
            const steering = Vector.sub(desired, physicsComponent.velocity);
            steering.limit(boidComponent.maxForce * boidComponent.playerAvoidWeight);

            return steering;
        }

        return new Vector(0, 0)
    }
}