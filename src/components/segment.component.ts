import { Vector } from "../utils/vector.ts";
import { Transform } from "./transform.ts";



export class SegmentComponent {
    /**
     * 
     * @param {Transform} pointA 
     * @param {Transform} pointB 
     */
    constructor(radius, parentId) {

        this.radius = radius;
        this.parentId = parentId;
    }

}