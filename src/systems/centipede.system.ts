import { Vector } from "../utils/vector";
import { CentipedeComponent, CentipedeBodySegment, CentipedeLeg, CentipedeLegSegment } from "../components/centipede.component";
import { Entity } from "../core/entity";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";

export class CentipedeSystem {
    world: World;
    events: EventBus;

    private player: Entity | null = null;

    constructor(world: World, events: EventBus) {
        this.world = world;
        this.events = events;

        this.events.on('levelReady', (player: Entity) => this.initialSetup(player));
    }

    initialSetup(player: Entity) {
        this.player = player;
        const entities = this.world.query(CentipedeComponent);

        for (const entity of entities) {
            const component = entity.getComponent(CentipedeComponent) as CentipedeComponent;
            const segments: CentipedeBodySegment[] = [];

            // Create segments based on the centipede body shape
            for (let i = 0; i < CentipedeComponent.bodyShape.length; i++) {
                segments.push({
                    pos: new Vector(0, 0),
                    rad: CentipedeComponent.bodyShape[i] / 5, // Scale down for rendering
                    dist: CentipedeComponent.segmentDist,
                    color: CentipedeComponent.color,
                    legColor: CentipedeComponent.legColor,
                    angle: 0,
                    legs: [],
                });
            }

            // Centipedes have legs on almost every body segment!
            // We skip the very first (head) and the last two (tail) segments.
            for (let i = 1; i < segments.length - 2; i++) {
                this.addLegsToSegment(segments[i]);
            }

            component.segments = segments;
        }
    }

    update(dt: number): void {
        const entities = this.world.query(CentipedeComponent);
        for (const entity of entities) {
            const centipede = entity.getComponent(CentipedeComponent) as CentipedeComponent;

            for (let i = 0; i < centipede.segments.length; i++) {
                const segment = centipede.segments[i];
                if (i === 0) {
                    this.moveBodySegment(segment, entity.transform.pos);
                } else {
                    this.followBodySegment(segment, centipede.segments[i - 1].pos);
                }

                for (const leg of segment.legs) {
                    this.moveLeg(leg);
                }
            }
        }
    }

    // ─── Body segment ops ───────────────────────────────────────────────
    moveBodySegment(segment: CentipedeBodySegment, target: Vector) {
        segment.pos = target;
    }

    followBodySegment(segment: CentipedeBodySegment, target: Vector) {
        const d = Vector.sub(target, segment.pos);
        segment.angle = d.angle();
        segment.pos = new Vector(
            target.x - segment.dist * Math.cos(segment.angle),
            target.y - segment.dist * Math.sin(segment.angle)
        );
    }

    // ─── Leg construction ───────────────────────────────────────────────
    addLegsToSegment(segment: CentipedeBodySegment) {
        const bendRad = CentipedeComponent.legBendAngle * Math.PI / 180;
        segment.legs.push(this.createLeg(segment, +bendRad));
        segment.legs.push(this.createLeg(segment, -bendRad));

        // Seed foot positions so legs don't snap to (0,0) on frame 1
        for (const leg of segment.legs) {
            const initial = this.calculateNextLegStep(leg);
            leg.footPos = initial.clone();
            leg.nextFootPos = initial.clone();
        }
    }

    private createLeg(parent: CentipedeBodySegment, angle: number): CentipedeLeg {
        const L = CentipedeComponent.legLength;
        return {
            parentSegment: parent,
            angle,
            length: L,
            footPos: new Vector(0, 0),
            nextFootPos: new Vector(0, 0),
            grounded: false,
            segments: [
                { a: new Vector(0, 0), b: new Vector(0, 0), length: 3 * L / 5, angle: 0 },
                { a: new Vector(0, 0), b: new Vector(0, 0), length: 2 * L / 5, angle: 0 },
            ],
        };
    }

    calculateNextLegStep(leg: CentipedeLeg): Vector {
        const a = leg.parentSegment.angle + leg.angle;
        return new Vector(
            leg.parentSegment.pos.x + leg.length * Math.cos(a),
            leg.parentSegment.pos.y + leg.length * Math.sin(a)
        );
    }

    // ─── Leg update ─────────────────────────────────────────────────────
    moveLeg(leg: CentipedeLeg) {
        const distance = Vector.dist(leg.footPos, leg.parentSegment.pos);

        // Step trigger — pick a new planting spot when stretched too far
        if (distance > CentipedeComponent.legLength * 1.2) {
            leg.nextFootPos = this.calculateNextLegStep(leg);
        }

        // IK: reach from foot upward, then pin from hip downward
        this.legSegmentFollowTo(leg.footPos, leg.segments[0]);          // shin → foot
        this.legSegmentFollowTo(leg.segments[0].a, leg.segments[1]);    // thigh → shin tail
        this.moveLegSegment(leg.segments[1], leg.parentSegment.pos);    // pin thigh base to hip
        this.moveLegSegment(leg.segments[0], leg.segments[1].b);        // pin shin base to knee

        // Interpolate foot toward next step (mutates in place)
        leg.footPos.lerp(leg.nextFootPos, CentipedeComponent.stepSpeed);

        this.groundCheck(leg);
    }

    groundCheck(leg: CentipedeLeg) {
        const d = Vector.dist(leg.footPos, leg.nextFootPos);
        leg.grounded = d <= 0.2;
    }

    // ─── Leg segment ops ────────────────────────────────────────────────
    legSegmentFollowTo(target: Vector, legSegment: CentipedeLegSegment) {
        const direction = Vector.sub(target, legSegment.a);
        legSegment.angle = direction.angle();
        direction.setMag(legSegment.length);
        direction.multNum(-1);
        legSegment.a = Vector.add(target, direction);
    }

    moveLegSegment(legSegment: CentipedeLegSegment, target: Vector) {
        legSegment.a.set(target.x, target.y);
        const dx = legSegment.length * Math.cos(legSegment.angle);
        const dy = legSegment.length * Math.sin(legSegment.angle);
        legSegment.b.set(legSegment.a.x + dx, legSegment.a.y + dy);
    }
}