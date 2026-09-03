import { PhysicsComponent } from "../components/physics.component";
import { SnakeComponent } from "../components/snake.component";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";
import { InputSystem } from "../game/input.system";
import { Vector } from "../utils/vector";
import { PhysicsSystem } from "./physics.system";

/**
 * PlayerControlSystem
 *
 * Reads movement input and drives the 'player' entity, same logic that used
 * to live inline in main.mjs as an anonymous system. Pulled out into its own
 * class, and — critically — looks up `world.getEntity('player')` fresh every
 * frame instead of closing over the entity reference from page load, since
 * the player is now destroyed and rebuilt every time a level starts.
 */
export class PlayerControlSystem {


    /**
     * @param {import('../core/world.mjs').World} world
     * @param {import('../game/eventBus.mjs').EventBus} events
     * @param {import('../systems/physics.system.mjs').PhysicsSystem} physicsSystem
     * @param {import('./input.system.mjs').InputSystem} inputs
     */
    constructor(
        private world: World,
        private events: EventBus,
        private physicsSystem: PhysicsSystem,
        private inputs: InputSystem
    ) {
        this.world = world;
        this.events = events;
        this.physicsSystem = physicsSystem;
        this.inputs = inputs;

        this.events.on('jump', () => {
            const player = this.world.getEntity('player');
            if (!player) return;
            this.physicsSystem.applyForce(player, new Vector(0, -35000));
        });
    }

    update() {
        const player = this.world.getEntity('player');
        if (!player) return;

        const force = this.inputs.getAxis('move_up', 'move_down', 'move_left', 'move_right');
        const snakeComponent = player.getComponent(SnakeComponent);
        const physicsComponent = player.getComponent(PhysicsComponent);
        if (!physicsComponent) return;

        const playerVelocity = physicsComponent.velocity;
        if (playerVelocity.mag() < 1) {
            physicsComponent.velocity.set(0, 0);
        }

        if (force.mag() > 0) {
            if (snakeComponent) snakeComponent.isSnakeMoving = true;
            this.physicsSystem.applyForce(player, force.normalize().scale(1500));
        } else {
            if (snakeComponent) snakeComponent.isSnakeMoving = false;
        }
    }
}