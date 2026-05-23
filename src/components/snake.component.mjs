import { Entity } from "../core/entity.mjs";
import { Vector } from "../utils/vector.mjs";




export class SnakeComponent {
    constructor() {
        /**@type {Entity} */
        this.entity = null;
        /**@type {Vector|null} */
        this.leftEye = null;
        /**@type {Vector|null} */
        this.rightEye = null;
        /**@type {Entity[]} */
        this.segments = [];
        this.snakeSkinVerticies = [];
        this.segmentsGenerated = false;
        this.segmentLength = 25;
        this.totalSegments = 30;
    }
}