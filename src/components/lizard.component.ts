import { Vector } from "../utils/vector";

export interface LizardLeg {
    name: string;
    hipIndex: number;

    /**
     * -1 = right side
     *  1 = left side
     */
    side: number;

    /**
     * Diagonal gait group.
     *
     * group 0: front-left + back-right
     * group 1: front-right + back-left
     */
    group: number;

    /**
     * Foot position currently planted on the ground.
     */
    planted: any;

    /**
     * Current foot target used by FABRIK.
     */
    target: any;

    /**
     * Where the current step started.
     */
    stepFrom: any;

    /**
     * Where the current step wants to land.
     */
    stepTo: any;

    stepping: boolean;

    /**
     * Step progress from 0 to 1.
     */
    t: number;

    /**
     * Solved FABRIK joints:
     * [hip, knee, foot]
     */
    points: any[];
}

export class LizardComponent {
    /**
     * The entity this lizard component belongs to.
     */
    entity: any = null;

    initialized = false;

    legs: LizardLeg[] = [];

    /**
     * Global animation timer.
     */
    gaitTime = 0;

    /**
     * Which snake/spine segments the hips attach to.
     *
     * Segment 0 is the head in your current SnakeComponent setup.
     */
    frontHipIndex = 4;
    backHipIndex = 12;

    /**
     * How far sideways from the spine the hip socket sits.
     */
    hipWidth = 7;

    /**
     * How far sideways from the spine the foot wants to stand.
     */
    stanceWidth = 12;

    /**
     * How far ahead of the hip the foot wants to plant.
     */
    stepAhead = 14;

    /**
     * Foot starts a step when its planted position is this far from desired target.
     */
    stepTriggerDistance = 22;

    /**
     * Step duration in seconds.
     */
    stepDuration = 0.22;

    /**
     * Visual lift height while stepping.
     *
     * If your game is side view, keep this positive and liftDirection upward.
     * If your game is top-down, you may set this to 0 or fake lift visually.
     */
    stepHeight = 10;

    /**
     * Direction used for foot lift.
     *
     * Side view:
     * new Vector(0, -1)
     *
     * Top-down:
     * new Vector(0, 0)
     */
    liftDirection: any;

    /**
     * Leg bone lengths.
     */
    upperLegLength = 18;
    lowerLegLength = 20;

    /**
     * Legs only step when the body is actually moving.
     */
    minSpeedToStep = 8;

    /**
     * Useful for debug rendering.
     */
    debugDraw = true;

    constructor() {
        this.liftDirection = new Vector(0, -1);
    }
}