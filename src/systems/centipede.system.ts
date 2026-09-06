import { Vector } from "../utils/vector";
import { LegSegment, LizardBodySegment, LizardComponent, LizardLeg } from "../components/lizard.component";
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

        this.events.on('levelReady', (player: Entity) => this.initialSetup(player))
    }

    initialSetup(player: Entity) {
        const entities = this.world.query(LizardComponent);
        // console.log(entities)
        for (const entity of entities) {
            const component = entity.getComponent(LizardComponent) as LizardComponent;
            const segments: LizardBodySegment[] = [];

            for (let i = 0; i < LizardComponent.bodyShape1.length; i++) {
                segments.push({
                    pos: new Vector(0, 0),
                    rad: LizardComponent.bodyShape1[i] / 10,
                    dist: LizardComponent.segmentDist,
                    color: LizardComponent.color,
                    legColor: LizardComponent.legColor,
                    angle: 0,
                    legs: [],
                });
            }

            this.addLegsToSegment(segments[4]);   // front legs
            this.addLegsToSegment(segments[10]);   // front legs
            this.addLegsToSegment(segments[16]);  // back legs
            component.segments = segments;
        }
    }

    update(dt: number): void {
        const entities = this.world.query(LizardComponent);
        for (const entity of entities) {
            const lizard = entity.getComponent(LizardComponent) as LizardComponent;

            for (let i = 0; i < lizard.segments.length; i++) {
                const segment = lizard.segments[i];
                if (i === 0) {
                    this.moveBodySegment(segment, entity.transform.pos);
                } else {
                    this.followBodySegment(segment, lizard.segments[i - 1].pos);
                }
                // if (this.player) this.player.transform.pos = lizard.segments[0].pos;

                for (const leg of segment.legs) {
                    this.moveLeg(leg);
                }
            }
        }
    }

    // ─── Body segment ops ───────────────────────────────────────────────
    moveBodySegment(segment: LizardBodySegment, target: Vector) {
        segment.pos = target;
    }

    followBodySegment(segment: LizardBodySegment, target: Vector) {
        const d = Vector.sub(target, segment.pos);
        segment.angle = d.angle();
        segment.pos = new Vector(
            target.x - segment.dist * Math.cos(segment.angle),
            target.y - segment.dist * Math.sin(segment.angle)
        );
    }

    // ─── Leg construction ───────────────────────────────────────────────
    addLegsToSegment(segment: LizardBodySegment) {
        const bendRad = LizardComponent.legBendAngle * Math.PI / 180;
        segment.legs.push(this.createLeg(segment, +bendRad));
        segment.legs.push(this.createLeg(segment, -bendRad));

        // Seed foot positions so legs don't snap to (0,0) on frame 1
        for (const leg of segment.legs) {
            const initial = this.calculateNextLegStep(leg);
            leg.footPos = initial.clone();
            leg.nextFootPos = initial.clone();
        }
    }

    private createLeg(parent: LizardBodySegment, angle: number): LizardLeg {
        const L = LizardComponent.legLength;
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

    calculateNextLegStep(leg: LizardLeg): Vector {
        const a = leg.parentSegment.angle + leg.angle;
        return new Vector(
            leg.parentSegment.pos.x + leg.length * Math.cos(a),
            leg.parentSegment.pos.y + leg.length * Math.sin(a)
        );
    }

    // ─── Leg update ─────────────────────────────────────────────────────
    moveLeg(leg: LizardLeg) {
        const distance = Vector.dist(leg.footPos, leg.parentSegment.pos);

        // Step trigger — pick a new planting spot when stretched too far
        if (distance > LizardComponent.legLength * 1.2) {
            // (Optional) spawn FootStep here at leg.footPos
            leg.nextFootPos = this.calculateNextLegStep(leg);
        }

        // IK: reach from foot upward, then pin from hip downward
        this.legSegmentFollowTo(leg.footPos, leg.segments[0]);          // shin → foot
        this.legSegmentFollowTo(leg.segments[0].a, leg.segments[1]);    // thigh → shin tail (FIXED)
        this.moveLegSegment(leg.segments[1], leg.parentSegment.pos);    // pin thigh base to hip
        this.moveLegSegment(leg.segments[0], leg.segments[1].b);        // pin shin base to knee

        // Interpolate foot toward next step (mutates in place)
        leg.footPos.lerp(leg.nextFootPos, LizardComponent.stepSpeed);

        this.groundCheck(leg);
    }

    groundCheck(leg: LizardLeg) {
        const d = Vector.dist(leg.footPos, leg.nextFootPos);
        leg.grounded = d <= 0.2;
    }

    // ─── Leg segment ops ────────────────────────────────────────────────
    legSegmentFollowTo(target: Vector, legSegment: LegSegment) {
        const direction = Vector.sub(target, legSegment.a);
        legSegment.angle = direction.angle();
        direction.setMag(legSegment.length);
        direction.multNum(-1);
        legSegment.a = Vector.add(target, direction);
    }

    moveLegSegment(legSegment: LegSegment, target: Vector) {
        legSegment.a.set(target.x, target.y);
        const dx = legSegment.length * Math.cos(legSegment.angle);
        const dy = legSegment.length * Math.sin(legSegment.angle);
        legSegment.b.set(legSegment.a.x + dx, legSegment.a.y + dy);
    }
}