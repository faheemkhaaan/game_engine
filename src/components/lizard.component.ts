import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";



export interface LegSegment {
    a: Vector;
    b: Vector;
    length: number;
    angle: number;
}
export interface LizardLeg {

    parentSegment: LizardBodySegment;
    angle: number;
    length: number;
    footPos: Vector;
    nextFootPos: Vector;
    grounded: boolean;
    segments: LegSegment[]
}




export interface LizardBodySegment {
    pos: Vector;
    rad: number;
    dist: number;
    angle: number;
    legs: LizardLeg[];
    color: number[];
    legColor: number[]


}

export interface LizardBody {

    pos: Vector;
    vel: Vector;
    acc: Vector;
    dir: Vector;
    maxSpeed: number;
    turnSpeed: number;
    color: string;
    legColor: string;

}

export class LizardComponent {



    public static stepSpeed = 0.5;
    public static legLength = 50;
    public static bodyShape1 = [140, 160, 70, 75, 85, 95, 105, 110, 115, 120, 120, 120, 115, 110, 105, 100, 90, 80, 70, 60, 50, 45, 40, 35, 35, 30, 28, 25, 25, 20, 20, 20, 15, 15, 15, 15, 15, 15, 15, 15]
    public static segmentDist = 5;
    public static legColor = [10, 100, 80, 200];
    public static color = [10, 153, 89, 255];
    public static legBendAngle = 35;


    public entity: Entity | null = null

    public footRad = 5;

    public target: Vector = new Vector(0, 0);
    public segments: LizardBodySegment[] = [];



    public headIndex = 0;


}