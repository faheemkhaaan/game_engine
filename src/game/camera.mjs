import { Transform } from "../components/transform.mjs";
import { Entity } from "../core/entity.mjs";
import { Vector } from "../utils/vector.mjs";



export class Camera {
    constructor(width, height) {

        this.transform = new Transform({ pos: new Vector(0, 0), size: new Vector(width, height), rotation: 0 });

        /**
         * @type {Entity}
         */
        this.target = null;
        this.smoothing = 0.1;
    }


    update(deltaTime) {
        if (this.target) {
            const halfWidth = this.transform.size.x / 2;
            const halfHeight = this.transform.size.y / 2;

            // console.log(halfHeight, halfWidth);
            const center = new Vector(halfWidth, halfHeight);
            const desired = Vector.sub(center, this.target.transform.pos);
            this.transform.pos = Vector.lerp(this.transform.pos, desired, this.smoothing);
        }
    }

    /**
     * 
     * @param {Entity} target 
     * @param {number} smoothing 
     */
    follow(target, smoothing = 0.1) {
        this.target = target;
        this.smoothing = smoothing;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    apply(ctx) {
        ctx.save();
        ctx.translate(this.transform.pos.x, this.transform.pos.y)
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    restore(ctx) {
        ctx.restore();
    }
}