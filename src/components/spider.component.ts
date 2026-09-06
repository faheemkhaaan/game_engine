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
    public static stepSpeed = 0.65; // Deliberate, creepy crawl speed
    public static legLength = 85;   // Long legs
    public static bodyShape = [65, 80]; // Cephalothorax (small), Abdomen (slightly larger)
    public static segmentDist = 15;
    public static legColor = [210, 210, 210, 255]; // Bright light gray legs
    public static color = [230, 90, 90, 255];      // Bright red/orange body

    public static legBendAngle = 45; // Legs stick out wide and bend down

    public entity: Entity | null = null;
    public footRad = 2;
    public target: Vector = new Vector(0, 0);
    public segments: SpiderBodySegment[] = [];
}