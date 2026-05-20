import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { SnakeComponent } from "../components/snake.component.mjs";
import { Transform } from "../components/transform.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { Vector } from "../utils/vector.mjs";





export class SnakeSkeletonSystem {
    /**
     * 
     * @param {World} world 
     * @param {EventBus} events 
     */
    constructor(world, events) {
        this.world = world;
        this.events = events;


    }


    update(dt) {
        const entities = this.world.query('SnakeComponent');

        for (const entity of entities) {
            const snakeComponent = entity.getComponent('SnakeComponent');
            if (!snakeComponent.segmentsGenerated) this.generateSegments(snakeComponent);
            this.applyDistanceConstraint(snakeComponent);
        }


    }

    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    generateSegments(snakeComponent) {


        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;



        for (let i = 0; i < snakeComponent.totalSegments; i++) {

            const snakeBody = this.world.createEntity(`snake_body_part_${i}_` + entity.id);

            snakeBody.transform = new Transform({
                pos: new Vector(headPos.x + (snakeComponent.segmentLength * i), headPos.y),
                size: new Vector(1, 1),
                rotation: 0
            });

            snakeBody.addComponent(new RenderComponent({

                type: 'circle',
                radius: 30,
                zIndex: 3000,
                color: 'blue'

            }));

            snakeBody.addComponent(new PhysicsComponent({
                isStatic: false,
                mass: 1,
                velocity: new Vector(
                    (Math.random() - 0.5) * 1000,
                    (Math.random() - 0.5) * 1000)
            }));
            snakeComponent.segments.push(snakeBody);

        }

        snakeComponent.segmentsGenerated = true;
    }

    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    applyDistanceConstraint(snakeComponent) {

        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;

        for (let i = 1; i < snakeComponent.totalSegments; i++) {

            const first = snakeComponent.segments[i - 1];
            const second = snakeComponent.segments[i];

            const firstPos = first.transform.pos;
            const secondPos = second.transform.pos;

            // if (!firstPos || !secondPos) continue;

            const currentVector = Vector.sub(secondPos, firstPos);
            const currentLength = currentVector.mag();
            if (currentLength === 0) continue;

            const difference = (currentLength - snakeComponent.segmentLength) / currentLength;

            const correction = Vector.scale(currentVector, difference);
            secondPos.sub(correction);

        }

    }

}