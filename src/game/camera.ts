import { Transform } from "../components/transform";
import { Entity } from "../core/entity";
import { Vector } from "../utils/vector";



export class Camera {
    private transform: Transform;
    private target: null | Entity;
    private smoothing = 0.1;
    constructor(width: number, height: number) {

        this.transform = new Transform({ pos: new Vector(0, 0), size: new Vector(width, height), rotation: 0 });

        /**
         * @type {Entity}
         */
        this.target = null;
        this.smoothing = 0.1;
    }


    update(deltaTime: number) {
        if (this.target) {
            const halfWidth = this.transform.size.x / 2;
            const halfHeight = this.transform.size.y / 2;

            // console.log(halfHeight, halfWidth);
            const center = new Vector(halfWidth, halfHeight);
            const desired = Vector.sub(center, this.target.transform.pos);
            // 1 - (1 - 0.1)^dt*60
            const adjustedSmoothing = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);
            this.transform.pos = Vector.lerp(this.transform.pos, desired, adjustedSmoothing);
        }
    }

    /**
     * 
     * @param {Entity} target 
     * @param {number} smoothing 
     */
    follow(target: Entity, smoothing = 0.1) {
        this.target = target;
        this.smoothing = smoothing;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    apply(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const drawX = Math.round(this.transform.pos.x);
        const drawY = Math.round(this.transform.pos.y);
        ctx.translate(drawX, drawY)
    }


    /**
         * Converts a world position to a canvas/screen position.
         * Useful for drawing UI elements over world objects.
         * @param {Vector} worldPos - The position in the game world.
         * @returns {Vector} The corresponding position on the canvas.
         */
    worldToCanvas(worldPos: Vector) {
        // Since this.transform.pos is the translation offset applied to the canvas context:
        // Canvas Position = World Position + Camera Offset
        return Vector.add(worldPos, this.transform.pos);
    }

    /**
     * Converts a canvas/screen position (like a mouse click) to a world position.
     * Useful for handling mouse/touch interactions in the game world.
     * @param {Vector} canvasPos - The position on the canvas.
     * @returns {Vector} The corresponding position in the game world.
     */
    canvasToWorld(canvasPos: Vector) {
        // World Position = Canvas Position - Camera Offset
        return Vector.sub(canvasPos, this.transform.pos);
    }
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    restore(ctx: CanvasRenderingContext2D) {
        ctx.restore();
    }
}