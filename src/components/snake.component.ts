import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";




export class SnakeComponent {

    public entity: Entity | null;
    public leftEye: Vector | null;
    public rightEye: Vector | null;
    public segments: Entity[];
    public snakeSkinVerticies: Vector[] = [];
    public segmentsGenerated: boolean = false;
    public segmentLength: number = 12;
    public totalSegments: number = 30;
    public isSnakeMoving: boolean = false;
    public enemyEaten: number = 0;
    public enemyEatenGrowThreshold: number = 10;
    constructor(



    ) {
        /**@type {Entity} */
        this.entity = null;
        /**@type {Vector|null} */
        this.leftEye = null;
        /**@type {Vector|null} */
        this.rightEye = null;
        /**@type {Entity[]} */
        this.segments = [];

    }
}