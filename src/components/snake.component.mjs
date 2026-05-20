import { Entity } from "../core/entity.mjs";




export class SnakeComponent {
    constructor() {
        /**@type {Entity} */
        this.entity = null;
        this.leftEye = 0;
        this.rightEye = 0;
        this.segments = [];
        this.snakeSkinVerticies = [];
        this.segmentsGenerated = false;
        this.segmentLength = 20;
        this.totalSegments = 10;
    }
}