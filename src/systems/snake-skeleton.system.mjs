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
        this.snakeTime = 0;


    }


    update(dt) {
        this.snakeTime += dt;
        const entities = this.world.query('SnakeComponent');

        for (const entity of entities) {
            const snakeComponent = entity.getComponent('SnakeComponent');
            if (!snakeComponent.segmentsGenerated) this.generateSegments(snakeComponent);
            // this.applySnakeMovement(snakeComponent, dt)
            this.applyDistanceConstraint(snakeComponent);
        }


    }
    /**
         * Apply sinusoidal lateral movement to create snake-like motion
         */
    applySnakeMovement(snakeComponent, dt) {
        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;

        // Get head's movement direction for orientation
        const physics = entity.getComponent('PhysicsComponent');
        const headVelocity = physics.velocity
        const headSpeed = headVelocity.mag();

        if (headSpeed < 0.1) return; // Don't undulate if not moving

        // Calculate perpendicular direction for lateral movement
        const forward = Vector.normalize(headVelocity);
        const perpendicular = new Vector(-forward.y, forward.x);

        // Snake movement parameters (can be adjusted)
        const waveFrequency = 4.0;     // How many waves along the body
        const waveAmplitude = 2.0;    // How wide the snake sways
        const waveSpeed = 8.0;        // How fast waves travel down the body

        for (let i = 0; i < snakeComponent.segments.length; i++) {
            const segment = snakeComponent.segments[i];

            // Calculate wave offset for this segment
            // The wave travels from head to tail
            const segmentPhase = (i / snakeComponent.totalSegments) * Math.PI * 2 * waveFrequency;
            const timePhase = this.snakeTime * waveSpeed;

            // Combine phases to create traveling wave
            const waveOffset = Math.sin(segmentPhase - timePhase) * waveAmplitude;

            // Dampen the wave for segments further from head
            const dampening = 1.0 - (i / snakeComponent.totalSegments) * 0.3;

            // Apply lateral movement
            const lateralMovement = Vector.scale(
                perpendicular,
                waveOffset * dampening
            );

            // Add subtle compression/expansion along the body
            const longitudinalOffset = Math.cos(segmentPhase * 2 - timePhase * 0.7) * 5;
            const longitudinalMovement = Vector.scale(forward, longitudinalOffset);

            // Apply movement to segment
            segment.transform.pos.add(lateralMovement);
            segment.transform.pos.add(longitudinalMovement);
        }
    }
    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    generateSegments(snakeComponent) {


        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;


        const segmentsRadius = [
            15, 16, 13, 14,
            14, 14, 14, 14,
            14, 14, 14, 14,
            14, 14, 14, 14,
            14, 14, 14, 14,
            10, 9, 8, 7,
            6, 5, 4, 3,
            2, 1,
        ]

        for (let i = 0; i < snakeComponent.totalSegments; i++) {

            const snakeBody = this.world.createEntity(`snake_body_part_${i}_` + entity.id);

            snakeBody.transform = new Transform({
                pos: new Vector(headPos.x + (snakeComponent.segmentLength * i), headPos.y),
                size: new Vector(1, 1),
                rotation: 0
            });

            snakeBody.addComponent(new RenderComponent({

                type: 'snake',
                radius: segmentsRadius[i],
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

        const firstSegment = snakeComponent.segments[0];

        const firstPos = firstSegment.transform.pos;

        const currentVector = Vector.sub(headPos, firstPos);
        const currentLength = currentVector.mag();

        if (currentLength > 0) {
            const difference = (currentLength - snakeComponent.segmentLength) / currentLength;
            const correction = Vector.scale(currentVector, difference);
            firstPos.add(correction);
        }

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