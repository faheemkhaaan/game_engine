import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";

export interface SpiderLegSegment {
    a: Vector;
    b: Vector;
    length: number;
    angle: number;
}

export interface SpiderLeg {
    parentSegment: SpiderBodySegment;
    angle: number;
    length: number;
    footPos: Vector;
    nextFootPos: Vector;
    grounded: boolean;
    segments: SpiderLegSegment[];
}

export interface SpiderBodySegment {
    pos: Vector;
    rad: number;
    dist: number;
    angle: number;
    legs: SpiderLeg[];
    color: number[];
    legColor: number[];
}

export class SpiderComponent {
    public static stepSpeed = 0.35; // Deliberate, creepy crawl speed
    public static legLength = 65;   // Long legs
    public static bodyShape = [35, 50]; // Cephalothorax (small), Abdomen (slightly larger)
    public static segmentDist = 15;
    public static legColor = [40, 40, 40, 255]; // Dark grey/black legs
    public static color = [60, 20, 20, 255];    // Dark reddish brown / black body
    public static legBendAngle = 75; // Legs stick out wide and bend down

    public entity: Entity | null = null;
    public footRad = 2;
    public target: Vector = new Vector(0, 0);
    public segments: SpiderBodySegment[] = [];
}