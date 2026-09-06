import { Vector } from "../utils/vector";
import { SpiderComponent, SpiderBodySegment, SpiderLeg, SpiderLegSegment } from "../components/spider.component";
import { Entity } from "../core/entity";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";

export class SpiderSystem {
    world: World;
    events: EventBus;

    constructor(world: World, events: EventBus) {
        this.world = world;
        this.events = events;
        this.events.on('levelReady', () => this.initialSetup());
    }

    initialSetup() {
        const entities = this.world.query(SpiderComponent);
        for (const entity of entities) {
            const component = entity.getComponent(SpiderComponent) as SpiderComponent;
            const segments: SpiderBodySegment[] = [];

            for (let i = 0; i < SpiderComponent.bodyShape.length; i++) {
                segments.push({
                    pos: new Vector(0, 0),
                    rad: SpiderComponent.bodyShape[i] / 10,
                    dist: SpiderComponent.segmentDist,
                    color: SpiderComponent.color,
                    legColor: SpiderComponent.legColor,
                    angle: 0,
                    legs: [],
                });
            }

            // Spiders have 8 legs. We attach all 8 to the first segment (Cephalothorax)
            // Angles are in degrees: 4 on the left (negative), 4 on the right (positive)
            const legAngles = [-50, -90, -130, -160, 50, 90, 130, 160];

            for (const angle of legAngles) {
                const rad = angle * Math.PI / 180;
                segments[0].legs.push(this.createLeg(segments[0], rad));
            }

            // Seed foot positions so legs do not snap to 0,0 on frame 1
            for (const leg of segments[0].legs) {
                const initial = this.calculateNextLegStep(leg);
                leg.footPos = initial.clone();
                leg.nextFootPos = initial.clone();
            }

            component.segments = segments;
        }
    }

    update(dt: number): void {
        const entities = this.world.query(SpiderComponent);
        for (const entity of entities) {
            const spider = entity.getComponent(SpiderComponent) as SpiderComponent;

            for (let i = 0; i < spider.segments.length; i++) {
                const segment = spider.segments[i];
                if (i === 0) {
                    this.moveBodySegment(segment, entity.transform.pos);
                } else {
                    this.followBodySegment(segment, spider.segments[i - 1].pos);
                }

                for (const leg of segment.legs) {
                    this.moveLeg(leg);
                }
            }
        }
    }

    moveBodySegment(segment: SpiderBodySegment, target: Vector) {
        segment.pos = target;
    }

    followBodySegment(segment: SpiderBodySegment, target: Vector) {
        const d = Vector.sub(target, segment.pos);
        segment.angle = d.angle();
        segment.pos = new Vector(
            target.x - segment.dist * Math.cos(segment.angle),
            target.y - segment.dist * Math.sin(segment.angle)
        );
    }

    private createLeg(parent: SpiderBodySegment, angle: number): SpiderLeg {
        const L = SpiderComponent.legLength;
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

    calculateNextLegStep(leg: SpiderLeg): Vector {
        const a = leg.parentSegment.angle + leg.angle;
        return new Vector(
            leg.parentSegment.pos.x + leg.length * Math.cos(a),
            leg.parentSegment.pos.y + leg.length * Math.sin(a)
        );
    }

    moveLeg(leg: SpiderLeg) {
        const distance = Vector.dist(leg.footPos, leg.parentSegment.pos);

        // Step trigger
        if (distance > SpiderComponent.legLength * 1.3) {
            leg.nextFootPos = this.calculateNextLegStep(leg);
        }

        // IK: reach from foot upward, then pin from hip downward
        this.legSegmentFollowTo(leg.footPos, leg.segments[0]);
        this.legSegmentFollowTo(leg.segments[0].a, leg.segments[1]);
        this.moveLegSegment(leg.segments[1], leg.parentSegment.pos);
        this.moveLegSegment(leg.segments[0], leg.segments[1].b);

        leg.footPos.lerp(leg.nextFootPos, SpiderComponent.stepSpeed);
        this.groundCheck(leg);
    }

    groundCheck(leg: SpiderLeg) {
        const d = Vector.dist(leg.footPos, leg.nextFootPos);
        leg.grounded = d <= 0.2;
    }

    legSegmentFollowTo(target: Vector, legSegment: SpiderLegSegment) {
        const direction = Vector.sub(target, legSegment.a);
        legSegment.angle = direction.angle();
        direction.setMag(legSegment.length);
        direction.multNum(-1);
        legSegment.a = Vector.add(target, direction);
    }

    moveLegSegment(legSegment: SpiderLegSegment, target: Vector) {
        legSegment.a.set(target.x, target.y);
        const dx = legSegment.length * Math.cos(legSegment.angle);
        const dy = legSegment.length * Math.sin(legSegment.angle);
        legSegment.b.set(legSegment.a.x + dx, legSegment.a.y + dy);
    }
}