import { Vector } from "../utils/vector.mjs";
import { Transform } from "./transform.mjs";



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