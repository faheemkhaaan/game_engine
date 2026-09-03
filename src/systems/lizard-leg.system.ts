import { Vector } from "../utils/vector";
import { solveFABRIK } from "../utils/fabrik";
import { LizardComponent, LizardLeg } from "../components/lizard.component";
import { SnakeComponent } from "../components/snake.component";
import { Entity } from "../core/entity";
import { PhysicsComponent } from "../components/physics.component";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";

export class LizardLegSystem {
    world: World;
    events: EventBus;

    constructor(world: any, events: any) {
        this.world = world;
        this.events = events;
    }

    update(dt: number): void {
        const entities = this.world.query(LizardComponent);

        // console.log(entities)
        for (const entity of entities) {

            const lizard = entity.getComponent(LizardComponent);
            const snake = entity.getComponent(SnakeComponent);

            if (!lizard) continue;
            if (!snake) continue;
            if (!snake.segmentsGenerated) continue;

            const requiredSegments =
                Math.max(lizard.frontHipIndex, lizard.backHipIndex) + 8;

            if (snake.segments.length < requiredSegments) continue;

            if (!lizard.initialized) {
                this.initLegs(lizard, snake);
            }

            lizard.gaitTime += dt;

            this.updateLegs(entity, lizard, snake, dt);
        }
    }

    /**
     * Creates four legs.
     *
     * Diagonal pairing:
     * group 0 = front-left + back-right
     * group 1 = front-right + back-left
     */
    private initLegs(lizard: LizardComponent, snake: any): void {
        const createLeg = (
            hipIndex: number,
            side: number,
            group: number,
            name: string
        ): LizardLeg => {
            const hip = snake.segments[hipIndex].transform.pos;

            // Simple initial placement.
            // The solver will correct this once body direction is known.
            const planted = new Vector(
                hip.x + side * lizard.stanceWidth,
                hip.y + 10
            );

            return {
                name,
                hipIndex,
                side,
                group,

                planted: this.clone(planted),
                target: this.clone(planted),

                stepFrom: this.clone(planted),
                stepTo: this.clone(planted),

                stepping: false,
                t: 0,

                points: [],
            };
        };

        lizard.legs = [
            createLeg(lizard.frontHipIndex, 2, 0, "frontLeft"),
            createLeg(lizard.frontHipIndex, -2, 1, "frontRight"),
            createLeg(lizard.backHipIndex, 2, 1, "backLeft"),
            createLeg(lizard.backHipIndex, -2, 0, "backRight"),
        ];

        lizard.initialized = true;
    }

    private updateLegs(
        entity: Entity,
        lizard: LizardComponent,
        snake: SnakeComponent,
        dt: number
    ): void {
        const physics = entity.getComponent(PhysicsComponent);
        const speed =
            physics && physics.velocity
                ? physics.velocity.mag()
                : 0;

        const groupStepping: boolean[] = [false, false];

        for (const leg of lizard.legs) {
            if (leg.stepping) {
                groupStepping[leg.group] = true;
            }
        }

        for (const leg of lizard.legs) {
            const desired = this.getDesiredFootTarget(lizard, snake, leg);

            if (!leg.stepping) {
                const error = Vector.sub(desired, leg.planted).mag();

                const wantsToStep = error > lizard.stepTriggerDistance;

                const emergencyStep =
                    error > lizard.stepTriggerDistance * 2.2;

                const oppositeGroupIsStepping =
                    groupStepping[1 - leg.group];

                const canStartStep =
                    (speed >= lizard.minSpeedToStep || emergencyStep) &&
                    !oppositeGroupIsStepping;

                if (wantsToStep && canStartStep) {
                    leg.stepping = true;
                    leg.t = 0;

                    leg.stepFrom = this.clone(leg.planted);
                    leg.stepTo = this.clone(desired);

                    groupStepping[leg.group] = true;
                }
            }

            if (leg.stepping) {
                const speedFactor = Math.min(
                    Math.max(speed / lizard.minSpeedToStep, 1),
                    lizard.maxStepSpeedFactor
                );

                leg.t += (dt * speedFactor) / Math.max(0.06, lizard.stepDuration);

                if (leg.t >= 1) {
                    leg.t = 1;
                    leg.stepping = false;

                    leg.planted = this.clone(leg.stepTo);
                    leg.target = this.clone(leg.planted);
                } else {
                    const p = this.ease(leg.t);

                    const base = this.lerpVector(
                        leg.stepFrom,
                        leg.stepTo,
                        p
                    );

                    const liftAmount =
                        Math.sin(Math.PI * p) * lizard.stepHeight;

                    const lift = Vector.scale(
                        lizard.liftDirection || new Vector(0, -1),
                        liftAmount
                    );

                    leg.target = Vector.add(base, lift);
                }
            } else {
                leg.target = this.clone(leg.planted);
            }

            const { socket, forward, side } = this.getHipSocket(
                lizard,
                snake,
                leg
            );

            leg.points = this.solveLeg(
                socket,
                leg.target,
                lizard,
                leg,
                forward,
                side
            );
        }
    }

    /**
     * Where the foot wants to be on the ground.
     */
    private getDesiredFootTarget(
        lizard: LizardComponent,
        snake: any,
        leg: LizardLeg
    ): any {
        const hip = snake.segments[leg.hipIndex].transform.pos;
        const forward = this.getBodyForward(snake, leg.hipIndex);
        const side = this.normal(forward);

        const lateral = Vector.scale(side, leg.side * lizard.stanceWidth);
        const ahead = Vector.scale(forward, lizard.stepAhead);

        return Vector.add(Vector.add(hip, lateral), ahead);
    }

    /**
     * Actual hip socket position on the body.
     */
    private getHipSocket(
        lizard: LizardComponent,
        snake: any,
        leg: LizardLeg
    ): { socket: any; forward: any; side: any } {
        const hip = snake.segments[leg.hipIndex].transform.pos;
        const forward = this.getBodyForward(snake, leg.hipIndex);
        const side = this.normal(forward);

        const socket = Vector.add(
            hip,
            Vector.scale(side, leg.side * lizard.hipWidth)
        );

        return {
            socket,
            forward,
            side,
        };
    }

    /**
     * Approximate body direction at a spine segment.
     *
     * Segment 0 is head.
     * Segment 1 is behind head.
     * Segment 2 is behind segment 1.
     *
     * So forward at segment N is roughly toward segment N-1.
     */
    private getBodyForward(snake: any, hipIndex: number): any {
        const segments = snake.segments;

        const current = segments[hipIndex].transform.pos;
        const aheadIndex = Math.max(0, hipIndex - 1);
        const ahead = segments[aheadIndex].transform.pos;

        const dir = Vector.sub(ahead, current);

        return this.normalize(dir);
    }

    // /**
    //  * Solve one leg with FABRIK.
    //  */
    // private solveLeg(
    //     root: any,
    //     target: any,
    //     lizard: LizardComponent,
    //     leg: LizardLeg,
    //     forward: any,
    //     side: any
    // ): any[] {
    //     const upper = lizard.upperLegLength;
    //     const lower = lizard.lowerLegLength;

    //     // Give the solver an initial bend so it does not start perfectly straight.
    //     // This helps FABRIK choose a nicer knee direction.
    //     const kneeHint = Vector.add(
    //         root,
    //         Vector.add(
    //             Vector.scale(forward, upper * 0.35),
    //             Vector.scale(side, leg.side * upper * 0.85)
    //         )
    //     );

    //     const initialJoints = [
    //         this.clone(root),
    //         kneeHint,
    //         this.clone(target),
    //     ];

    //     return solveFABRIK(
    //         initialJoints,
    //         [upper, lower],
    //         root,
    //         target,
    //         10
    //     );
    // }

    private solveLeg(
        root: any,
        target: any,
        lizard: LizardComponent,
        leg: LizardLeg,
        forward: any,
        side: any
    ): any[] {
        const upper = lizard.upperLegLength;
        const lower = lizard.lowerLegLength;
        const lengths = [upper, lower];

        // Seed the chain on first use so there's a sane starting knee bend,
        // same idea as your old kneeHint.
        if (!leg.points || leg.points.length !== 3) {
            const kneeHint = Vector.add(
                root,
                Vector.add(
                    Vector.scale(forward, upper * 0.35),
                    Vector.scale(side, leg.side * upper * 0.85)
                )
            );
            leg.points = [this.clone(root), kneeHint, this.clone(target)];
        }

        for (let iter = 0; iter < 10; iter++) {
            this.backwardMovement(leg.points, target, lengths); // pin foot, solve toward hip
            this.forwardMovement(leg.points, root, lengths);    // pin hip, solve toward foot
            this.applyKneeAngleConstraint(leg, lizard);
        }

        return leg.points;
    }

    /**
     * Root-anchored pass. Same math as SnakeSkeletonSystem.applyDistanceConstraint,
     * walking start -> end.
     */
    private forwardMovement(points: any[], root: any, lengths: number[]): void {
        points[0] = this.clone(root);

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const current = points[i];

            const currentVector = Vector.sub(current, prev);
            const currentLength = currentVector.mag();
            if (currentLength === 0) continue;

            const difference = (currentLength - lengths[i - 1]) / currentLength;
            const correction = Vector.scale(currentVector, difference);
            current.x -= correction.x;
            current.y -= correction.y;
        }
    }

    /**
     * Target-anchored pass. Identical constraint math, walking end -> start instead.
     */
    private backwardMovement(points: any[], target: any, lengths: number[]): void {
        const last = points.length - 1;
        points[last] = this.clone(target);

        for (let i = last - 1; i >= 0; i--) {
            const next = points[i + 1];
            const current = points[i];

            const currentVector = Vector.sub(current, next);
            const currentLength = currentVector.mag();
            if (currentLength === 0) continue;

            const difference = (currentLength - lengths[i]) / currentLength;
            const correction = Vector.scale(currentVector, difference);
            current.x -= correction.x;
            current.y -= correction.y;
        }
    }
    /**
     * Clamps the knee's bend and forces it to always bend to the same
     * rotational side, so the leg can't flip between elbow-up/elbow-down.
     */
    private applyKneeAngleConstraint(leg: LizardLeg, lizard: LizardComponent): void {
        const [hip, knee, foot] = leg.points;

        const v1 = Vector.sub(knee, hip);
        const v2 = Vector.sub(foot, knee);

        const v1mag = v1.mag();
        const v2mag = v2.mag();
        if (v1mag < 0.0001 || v2mag < 0.0001) return;

        const angle = Vector.angle(v1, v2);

        // leg.side > 0 = left leg, < 0 = right leg — pick one rotational
        // direction per side so the knee only ever bends outward.
        const desiredSign = leg.side >= 0 ? -1 : 1;

        let clamped = Math.min(Math.max(Math.abs(angle), lizard.minKneeBend), lizard.maxKneeBend);
        clamped *= desiredSign;

        const correction = clamped - angle;
        if (Math.abs(correction) < 0.0001) return;

        v2.rotate(correction);

        const lowerLength = lizard.lowerLegLength;
        foot.x = knee.x + (v2.x / v2mag) * lowerLength;
        foot.y = knee.y + (v2.y / v2mag) * lowerLength;
    }
    // ─── Math helpers ────────────────────────────────────────────────────

    private clone(v: any): any {
        return new Vector(v.x, v.y);
    }

    private normalize(v: any): any {
        const mag = v.mag();

        if (mag < 0.0001) {
            return new Vector(1, 0);
        }

        return Vector.scale(v, 1 / mag);
    }

    /**
     * Left normal.
     */
    private normal(v: any): any {
        return this.normalize(new Vector(-v.y, v.x));
    }

    private lerpVector(a: any, b: any, t: number): any {
        return new Vector(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }

    /**
     * Smoothstep.
     */
    private ease(t: number): number {
        return t * t * (3 - 2 * t);
    }
}