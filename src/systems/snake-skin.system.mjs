import { SnakeComponent } from "../components/snake.component.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { Vector } from "../utils/vector.mjs";



export class SnakeSkinSystem {
    /**
     * 
     * @param {World} world 
     * @param {EventBus} events 
     */
    constructor(world, events) {
        this.world = world;
        this.events = events;
    }


    update(dt) {
        // console.log(dt);

        const entities = this.world.query('SnakeComponent');

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const snakeComponent = entity.getComponent('SnakeComponent');

            this.generateSkinVerts(snakeComponent);
        }
    }

    /**
     * 
     * @param {SnakeComponent} snakeComponent
     */
    generateSkinVerts(snakeComponent) {

        const segments = snakeComponent.segments;
        const left = [];
        const right = [];
        /**
         *         
         * 0 1 2 3 4 5
         */
        for (let i = 1; i < segments.length; i++) {
            const firstBodyPart = segments[i - 1];
            const secondBodyPart = segments[i];


            const firstRadius = firstBodyPart.getComponent('RenderComponent').radius;
            const firstPos = firstBodyPart.transform.pos;

            const secondRadius = secondBodyPart.getComponent('RenderComponent').radius;
            const secondPos = secondBodyPart.transform.pos;


            // if (!firstPos || !secondPos || !firstRadius || !secondRadius) continue;

            const direction = Vector.sub(secondPos, firstPos);

            if (i === 1) {
                const { lVert: fLVert, rVert: fRVert } = this.getSkinPoints(secondPos, secondRadius * 0.8, direction);
                snakeComponent.leftEye = fLVert;
                snakeComponent.rightEye = fRVert;

            }
            const { lVert: fLVert, rVert: fRVert } = this.getSkinPoints(firstPos, firstRadius, direction);
            // const { lVert: sLVert, rVert: sRVert } = this.getSkinPoints(secondPos, secondRadius,direction);

            left.push(fLVert);
            right.push(fRVert);
        }
        snakeComponent.snakeSkinVerticies.length = 0;

        snakeComponent.snakeSkinVerticies.push(
            ...left,
            ...right.reverse()
        );
    }

    /**
     * 
     * @param {Vector} pos
     * @param {number} rad 
     * @param {Vector} direction
     */
    getSkinPoints(pos, rad, direction) {


        const left = direction.normal();
        const right = Vector.scale(left, -1);

        const leftVert = left.normalize().scale(rad);
        const rightVert = right.normalize().scale(rad);

        const leftSkinVert = Vector.add(pos, leftVert);
        const rightSkinVert = Vector.add(pos, rightVert);
        return { lVert: leftSkinVert, rVert: rightSkinVert }
    }
}