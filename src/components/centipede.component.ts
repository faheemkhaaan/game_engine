import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";

export interface CentipedeLegSegment {
    a: Vector;
    b: Vector;
    length: number;
    angle: number;
}

export interface CentipedeLeg {
    parentSegment: CentipedeBodySegment;
    angle: number;
    length: number;
    footPos: Vector;
    nextFootPos: Vector;
    grounded: boolean;
    segments: CentipedeLegSegment[];
}

export interface CentipedeBodySegment {
    pos: Vector;
    rad: number;
    dist: number;
    angle: number;
    legs: CentipedeLeg[];
    color: number[];
    legColor: number[];
}

export interface CentipedeBody {
    pos: Vector;
    vel: Vector;
    acc: Vector;
    dir: Vector;
    maxSpeed: number;
    turnSpeed: number;
    color: string;
    legColor: string;
}

export class CentipedeComponent {
    public static stepSpeed = 0.4; // Slightly slower step for many legs to look natural
    public static legLength = 35;  // Adjusted for centipede proportions

    // Centipede shape: slightly wider head, uniform body, tapering tail
    // Divided by 10 in the system, so these represent radii from 3.0 down to 0.4
    public static bodyShape = [
        30, 35, 40, 42, 45, 48, 50, 50, 50, 50,
        50, 50, 48, 48, 48, 45, 45, 45, 42, 42,
        40, 40, 38, 38, 35, 35, 32, 32, 30, 28,
        25, 22, 20, 18, 15, 12, 10, 8, 6, 4
    ];

    public static segmentDist = 8; // Distance between segments
    public static legColor = [10, 100, 80, 200];
    public static color = [10, 153, 89, 255];

    // Centipede legs stick out more to the sides (60 degrees) rather than pointing backward
    public static legBendAngle = 45;

    public entity: Entity | null = null;
    public footRad = 3;
    public target: Vector = new Vector(0, 0);
    public segments: CentipedeBodySegment[] = [];
    public headIndex = 0;
}