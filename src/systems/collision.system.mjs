import { Entity } from "../core/entity.mjs";





export class CollisionSystem {
    constructor() {


    }


    update(deltaTime) {
        console.log(deltaTime);

    }

    checkCollision() {
        const p1 = e1.getComponent('PhysicsComponent');
        const p2 = e2.getComponent("PhysicsComponent");
        const r1 = e1.getComponent("RenderComponent");
        const r2 = e2.getComponent("RenderComponent");

    }

    /**
     * 
     * @param {Entity} e1 
     * @param {Entity} e2 
     */
    circleCircleCollision(e1, e2) {




    }
}