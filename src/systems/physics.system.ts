import { PhysicsComponent } from "../components/physics.component";
import { RenderComponent } from "../components/render.component";
import { ShapeComponent } from "../components/shape.component";
import { Entity } from "../core/entity";
import { World } from "../core/world";
import { distanceToShape } from "../utils/distance-to-shape";
import { Vector } from "../utils/vector";

export class PhysicsSystem {

    /**
     * 
     * @param {World} world 
     */
    constructor(private world: World) {
        /**
         * @type {World}
         */
        this.world = world;



    }

    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime: number) {


        const entities = this.world.query(PhysicsComponent);
        const player = entities.find(e => e.id === 'player');
        if (!player) return;
        const filteredDeadEntities = entities.filter(entity => {
            const renderComponent = entity.getComponent(RenderComponent);
            return renderComponent && !renderComponent.dead;
        })
            .filter(entity => {
                const pos = entity.transform.pos;
                const shape = entity.getComponent(ShapeComponent);
                if (!shape) return true;
                return distanceToShape(pos, shape, player.transform.pos) < 2000;
            });

        for (const entity of filteredDeadEntities) {
            const physicsComponent = entity.getComponent(PhysicsComponent)
            this.updatePhysics(physicsComponent, deltaTime);
        }


    }

    /**
     * 
     * @param {PhysicsComponent} physics 
     * @param {number} deltaTime
     */
    updatePhysics(physics: PhysicsComponent, deltaTime: number) {
        if (physics.static || !physics.entity) return;
        physics.prevPos = physics.entity.transform.pos.clone();

        for (const force of physics.forces) {
            physics.aceleration.add(force.divByNumber(physics.mass));

        }
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
    applyForce(entity: Entity, force: Vector) {
        const physics = entity.getComponent(PhysicsComponent);
        if (physics) {
            physics.forces.push(force.clone())
        }
    }

    /**
     * 
     * @param {Entity} entity 
     * @param {Vector} impulse 
     */
    applyImpulse(entity: Entity, impulse: Vector) {
        const physics = entity.getComponent(PhysicsComponent);
        if (physics) {
            physics.velocity.add(impulse);
        }
    }
}   