import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { SnakeComponent } from "../components/snake.component.mjs";
import { Transform } from "../components/transform.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { Prefabs } from "../utils/prefabs.mjs";
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

        this.events.on('snakeEatsMouse', () => {
            const player = this.world.getEntity('player');
            const snakeComponent = player.getComponent('SnakeComponent');
            snakeComponent.enemyEaten += 1;
            if (!snakeComponent.segmentsGenerated) return;
            if (snakeComponent.enemyEaten < snakeComponent.enemyEatenGrowThreshold) return;
            snakeComponent.segmentLength += 0.9;
            snakeComponent.totalSegments += 1;

            const lastSegment = snakeComponent.segments[snakeComponent.segments.length - 1];
            const lastSegmentPos = lastSegment.transform.pos;
            const angle = lastSegmentPos.angle()
            const spawnPosX = lastSegmentPos.x * Math.cos(angle) - lastSegmentPos.y * Math.sin(angle);
            const spawnPosY = lastSegmentPos.x * Math.sin(angle) + lastSegmentPos.y * Math.cos(angle);
            const spawnPos = new Vector(spawnPosX, spawnPosY);
            this.generateSingleSegment(snakeComponent, spawnPos, snakeComponent.totalSegments);
            const snakeSegments = snakeComponent.segments;
            for (const entity of snakeSegments) {
                const shapeComponent = entity.getComponent('ShapeComponent');
                // console.log((1 - (snakeSegments.length / 1000)) * 0.5, snakeSegments.length);
                shapeComponent.radius += (Math.abs(1 - (snakeSegments.length / 1000))) * 0.5
            }

            snakeComponent.enemyEaten = 0;
        })


    }


    update(dt) {
        this.snakeTime += dt;
        const entities = this.world.query('SnakeComponent');
        for (const entity of entities) {
            const snakeComponent = entity.getComponent('SnakeComponent');
            if (!snakeComponent.segmentsGenerated) this.generateSegments(snakeComponent);
            // this.applySnakeMovement(snakeComponent, dt)
            const physics = entity.getComponent('PhysicsComponent');
            if (!physics || physics.velocity.mag() < 1) continue; // skip if idle

            for (let iter = 0; iter < 5; iter++) {
                this.applyDistanceConstraint(snakeComponent);
                this.applyAngleConstraint(snakeComponent);
                this.applyDistanceConstraint(snakeComponent);
            }
        }

    }
    /**
         * Apply sinusoidal lateral movement to create snake-like motion
         * @param {SnakeComponent} snakeComponent
         */
    applySnakeMovement(snakeComponent, dt) {
        if (!snakeComponent.isSnakeMoving) return;
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
    generateSingleSegment(snakeComponent, spawnPos, i) {
        const entity = snakeComponent.entity;
        const radius = this.getSegmentThickness(i, snakeComponent.totalSegments);
        const segment = Prefabs.snakeSegment(
            this.world,
            `snake_body_part_${i}_` + entity.id,
            spawnPos,
            radius,
        );
        snakeComponent.segments.push(segment);

    }
    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    generateSegments(snakeComponent) {


        const entity = snakeComponent.entity;
        const headPos = entity.transform.pos;
        const shapeComponent = entity.getComponent('ShapeComponent');

        shapeComponent.radius = 12

        snakeComponent.segments.push(entity);


        for (let i = 0; i < snakeComponent.totalSegments; i++) {
            const spawnPos = new Vector(
                headPos.x - (i + 1) * snakeComponent.segmentLength,
                headPos.y
            );
            this.generateSingleSegment(snakeComponent, spawnPos, i);

        }

        snakeComponent.segmentsGenerated = true;
    }

    /**
     * 
     * @param {SnakeComponent} snakeComponent 
     */
    applyDistanceConstraint(snakeComponent) {

        const entity = snakeComponent.entity;
        const physics = entity.getComponent('PhysicsComponent');

        // Skip constraint propagation if snake is essentially still
        // if (physics && physics.velocity.mag() < 1) return;
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

            if (!firstPos || !secondPos) continue;

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

        // const entity = snakeComponent.entity;
        const segments = snakeComponent.segments;
        const maxBend = (40 * Math.PI) / 180;


        for (let i = 1; i < segments.length - 1; i++) {

            const previous = segments[i - 1];
            const joint = segments[i];
            const next = segments[i + 1];
            if (!previous || !joint || !next) continue;

            const v1 = Vector.sub(joint.transform.pos, previous.transform.pos);
            const v2 = Vector.sub(next.transform.pos, joint.transform.pos);

            const v1mag = v1.mag();
            const v2mag = v2.mag();
            if (v1mag < 0.0001 || v2mag < 0.0001) continue; //

            const angle = Vector.angle(v1, v2);

            if (Math.abs(angle) > maxBend) {




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

