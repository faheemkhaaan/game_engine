import { BoidComponent } from "../components/boid.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { CollisionGrid } from "../utils/collision-grid.mjs";
import { SAT } from "../utils/sat.mjs";
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
        this.events.on("dungeonGenerated", () => {
            if (!this.gridInitialized) {
                this.initializeStaticGrid();
            }
        })
    }

    initializeStaticGrid() {
        const entities = this.world.query('PhysicsComponent', 'RenderComponent');

        for (const entity of entities) {
            const physics = entity.getComponent('PhysicsComponent');
            if (physics && physics.static) {
                this.grid.addStaticEntity(entity);
            }
        }

        this.gridInitialized = true;
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
            // const avoidWall = this.wallAvoidance(entity);

            seperation.scale(boidComponent.seperationWeight);
            cohision.scale(boidComponent.cohesionWeight);
            alignment.scale(boidComponent.alignmentWeight);
            // escape.scale(boidComponent.playerAvoidWeight);


            // avoidWall.scale(boidComponent.playerAvoidWeight);
            // physicsComponent.forces.push(seperation, cohision, alignment);

            physicsComponent.forces.push(escape, seperation, cohision, alignment);

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
        const renderComponent = entity.getComponent("RenderComponent");
        const playerRenderComponent = player.getComponent('RenderComponent');
        const collision = SAT.checkCollision(entity, renderComponent, player, playerRenderComponent);

        if (collision) {
            renderComponent.dead = true;
        }

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

    /**
     * @param {Entity} entity 
     */
    wallAvoidance(entity) {
        const physicsComponent = entity.getComponent("PhysicsComponent");
        const boidComponent = entity.getComponent('BoidComponent');

        if (physicsComponent.velocity.mag() === 0) return new Vector(0, 0);

        const lookAhead = 80;
        const heading = physicsComponent.velocity.clone().normalize();
        const antena = heading.clone().scale(lookAhead);
        const directionToEntity = Vector.sub(entity.transform.pos, antena);

        const nearByEntities = this.grid.getPotentialCollisions(entity);



        let closestWall = null;
        let minDistance = Infinity;

        nearByEntities.forEach(other => {
            const otherPhysics = other.getComponent('PhysicsComponent');
            if (!otherPhysics.static) return;

            const wallPos = other.transform.pos;

            const distToWall = Vector.dist(directionToEntity, wallPos);

            const wallAvoidance = 50;

            if (distToWall < wallAvoidance && distToWall < minDistance) {
                closestWall = other;
                minDistance = distToWall
            }
        })


        if (closestWall) {
            const toWall = Vector.sub(closestWall.transform.pos, entity.transform.pos);

            const sideIndicator = Vector.cross(heading, toWall);
            const dodgeDirection = heading.normal();

            if (sideIndicator > 0) {
                dodgeDirection.scale(-1);
            } else {

            }

            const desired = dodgeDirection.normalize().scale(physicsComponent.maxSpeed);
            const steering = Vector.sub(desired, physicsComponent.velocity);

            steering.limit(boidComponent.maxForce * 3.0);
            return steering;

        }

        return new Vector(0, 0);
    }
}