
import { BoidComponent } from "@/components/boid.component";
import { PhysicsComponent } from "../components/physics.component";
import { ShapeComponent } from "../components/shape.component";
import { SnakeComponent } from "../components/snake.component";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";
import { Prefabs } from "../utils/prefabs";
import { Vector } from "../utils/vector";
import { Entity } from "@/core/entity";





export class SnakeSkeletonSystem {
    private snakeTime: number = 0

    constructor(private world: World, private events: EventBus) {
        this.world = world;
        this.events = events;

        this.events.on('snakeEatsMouse', () => {
            const player = this.world.getEntity('player');
            if (!player) return;
            const snakeComponent = player.getComponent(SnakeComponent);
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
                shapeComponent.radius += (Math.abs(1 - (snakeSegments.length / 1000))) * 0.5
            }

            snakeComponent.enemyEaten = 0;
        })


    }


    update(dt: number) {
        this.snakeTime += dt;
        const entities = this.world.query(SnakeComponent);

        // OPTIMIZATION: Query boids once per frame instead of inside the entity loop
        const boidEntities = this.world.query(BoidComponent);

        for (const entity of entities) {
            const snakeComponent = entity.getComponent(SnakeComponent);
            if (!snakeComponent.segmentsGenerated) this.generateSegments(snakeComponent);

            const physics = entity.getComponent(PhysicsComponent);
            if (!physics || physics.velocity.mag() < 1) continue; // skip if idle

            if (entity.id !== 'player') {
                this.attackBoidAiEnemies(boidEntities, entity);
            }
            for (let iter = 0; iter < 5; iter++) {
                this.applyDistanceConstraint(snakeComponent);
                this.applyAngleConstraint(snakeComponent);
                this.applyDistanceConstraint(snakeComponent);
            }

            // AI Logic for non-player snakes
        }

    }

    applySnakeMovement(snakeComponent: SnakeComponent, dt: number) {
        if (!snakeComponent.isSnakeMoving) return;
        const entity = snakeComponent.entity;
        if (!entity) return;
        const headPos = entity.transform.pos;

        // Get head's movement direction for orientation
        const physics = entity.getComponent(PhysicsComponent);
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
    getSegmentThickness(index: number, totalSegments: number) {
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
    generateSingleSegment(snakeComponent: SnakeComponent, spawnPos: Vector, i: number) {
        const entity = snakeComponent.entity;
        if (!entity) return;
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
    generateSegments(snakeComponent: SnakeComponent) {


        const entity = snakeComponent.entity;
        if (!entity) return;
        const headPos = entity.transform.pos;

        const shapeComponent = entity.getComponent(ShapeComponent);

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
    applyDistanceConstraint(snakeComponent: SnakeComponent) {

        const entity = snakeComponent.entity;
        if (!entity) return;
        // const physics = entity.getComponent(PhysicsComponent);

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
    applyAngleConstraint(snakeComponent: SnakeComponent) {

        // const entity = snakeComponent.entity;
        const segments = snakeComponent.segments;
        const maxBend = (35 * Math.PI) / 180;


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
    attackBoidAiEnemies(preys: Entity[], attacker: Entity) {
        const attackerPos = attacker.transform.pos;
        const MAX_DISTANCE = 120; // Detection radius (increased slightly for better AI)
        let closestPrey: Entity | null = null;
        let minDistance = MAX_DISTANCE;

        // 1. Find the closest prey within range
        for (const prey of preys) {
            const preyPos = prey.transform.pos;
            const distance = Vector.sub(preyPos, attackerPos).mag();

            if (distance < minDistance) {
                minDistance = distance;
                closestPrey = prey;
            }
        }

        // 2. If a prey is found, initiate attack/chase behavior
        if (closestPrey) {
            // console.log('Snake is targeting the closest prey!');

            // --- OPTION A: Make the snake chase the prey ---
            const physics = attacker.getComponent(PhysicsComponent);
            if (physics) {
                const direction = Vector.sub(closestPrey.transform.pos, attackerPos).normalize();
                const chaseSpeed = 850; // Adjust this value based on your game's speed scale
                physics.velocity = Vector.scale(direction, chaseSpeed);
            }

            // --- OPTION B: Trigger an attack event (Uncomment if you handle damage via events) ---
            // if (minDistance < 20) { // Only "eat" or "damage" when very close
            //     this.events.emit('snakeAttacksPrey', { attacker, prey: closestPrey });
            // }
        } else {
            // Optional: If no prey is nearby, you could revert the snake to a wandering state here
        }
    }
}

