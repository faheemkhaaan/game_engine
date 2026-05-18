import { Vector } from "../utils/vector.mjs";
import { Transform } from "./transform.mjs";



export class SegmentComponent {
    /**
     * 
     * @param {Transform} pointA 
     * @param {Transform} pointB 
     */
    constructor(pointA, pointB) {

        this.a = pointA;
        this.b = pointB;

        this.length = Vector.dist(pointA.pos, pointB.pos);
    }

}