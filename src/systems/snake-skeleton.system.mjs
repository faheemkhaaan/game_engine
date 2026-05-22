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
            this.applyAngleConstraint(snakeComponent)
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
    getSegmentThickness(index, totalSegments) {
        // Head (first 5 segments)
        if (index === 0) return 14;  // Snout
        if (index === 1) return 18;  // Head widest
        if (index === 2) return 17;  // Head-narrowing
        if (index === 3) return 15;  // Neck
        if (index === 4) return 13;  // Neck

        // Tail (last 8 segments)
        const segmentsFromEnd = totalSegments - 1 - index;
        const tailSizes = [0.2, 0.3, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13.5];
        if (segmentsFromEnd < tailSizes.length) {
            return tailSizes[Math.min(segmentsFromEnd, tailSizes.length - 1)] || 0.3;
        }

        // Main body
        return 14;
    }
    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    generateSegments(snakeComponent) {


        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;
        const entityRenderComponent = entity.getComponent('RenderComponent');

        entityRenderComponent.radius = 12

        snakeComponent.segments.push(entity);


        for (let i = 0; i < snakeComponent.totalSegments; i++) {

            const snakeBody = this.world.createEntity(`snake_body_part_${i}_` + entity.id);
            const radius = this.getSegmentThickness(i, snakeComponent.totalSegments);
            snakeBody.transform = new Transform({
                pos: new Vector(headPos.x + (snakeComponent.segmentLength * i), headPos.y),
                size: new Vector(1, 1),
                rotation: 0
            });

            snakeBody.addComponent(new RenderComponent({

                type: 'snake',
                radius: radius * 1.3,
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


    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    applyAngleConstraint(snakeComponent) {

        const entity = snakeComponent.entity;
        const segments = snakeComponent.segments;
        const maxBend = (45 * Math.PI) / 180;


        for (let i = 1; i < segments.length - 1; i++) {

            const previous = segments[i - 1];
            const joint = segments[i];
            const next = segments[i + 1];
            if (!previous || !joint || !next) continue;

            const v1 = Vector.sub(joint.transform.pos, previous.transform.pos);
            const v2 = Vector.sub(next.transform.pos, joint.transform.pos);


            const angle = Vector.angle(v1, v2);

            if (Math.abs(angle) > maxBend) {
                // console.log(Math.abs(angle), maxBend)
                // console.log("Should Apply angle constraint")

                // const clampedAngle = Math.sign(angle) * maxBend;

                // // Get the current distance between the joint and the next segment
                // const segmentLength = v2.mag(); // Assuming your Vector has a magnitude method

                // // Rotate v1 by the clamped angle to find the new allowed direction for v2
                // const v1Heading = Math.atan2(v1.y, v1.x);
                // const targetHeading = v1Heading + clampedAngle;

                // // Reconstruct the corrected position for the next segment
                // next.transform.pos.x = joint.transform.pos.x + Math.cos(targetHeading) * segmentLength;
                // next.transform.pos.y = joint.transform.pos.y + Math.sin(targetHeading) * segmentLength;



                const correction = (Math.abs(angle) - maxBend) * Math.sign(angle);

                // Get the structural length of the segment to avoid shrinking the snake
                const segmentLength = v2.mag();
                if (segmentLength === 0) continue;

                // Rotate v2 backward towards the valid constraint arc
                v2.rotate(-correction);

                // Set the new constraint position by projecting outwards from the joint
                next.transform.pos.x = joint.transform.pos.x + (v2.x / segmentLength) * snakeComponent.segmentLength;
                next.transform.pos.y = joint.transform.pos.y + (v2.y / segmentLength) * snakeComponent.segmentLength;
            }
        }
    }

}

