import { CellComponent } from "../components/cell.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { SnakeComponent } from "../components/snake.component.mjs";
import { Vector } from "./vector.mjs";




export class RenderStratagies {


    static rect = {
        /**
         * 
         * @param {CanvasRenderingContext2D} ctx 
         * @param {RenderComponent} renderComponent 
         */
        render(ctx, renderComponent) {
            const pos = renderComponent.entity.transform.pos;
            const size = renderComponent.entity.transform.size;
            const w = renderComponent.width * size.x;
            const h = renderComponent.height * size.y;
            ctx.beginPath();
            ctx.fillStyle = renderComponent.color;
            ctx.fillRect(pos.x - w / 2, pos.y - h / 2, w, h);
        }
    }

    static cell = {
        // /**
        //  * 
        //  * @param {CanvasRenderingContext2D} ctx 
        //  * @param {DungeonComponent} renderComponent 
        //  */
        render(ctx, dungenComponent) {


            const root = dungenComponent.root;

            RenderStratagies.drawCell(ctx, root);

        }
    }

    static circle = {
        /**
         * @param {CanvasRenderingContext2D} ctx
         */
        render(ctx, component) {
            const pos = component.entity.transform.pos;
            const snakeComponent = component.entity.getComponent('SnakeComponent');

            if (snakeComponent) {
                const skin = snakeComponent.snakeSkinVerticies

                ctx.beginPath();
                ctx.fillStyle = 'indigo'
                ctx.strokeStyle = 'yellow'
                const first = skin[0];
                const last = skin[skin.length - 1];

                const mid = Vector.add(first, last).divByNumber(2);

                ctx.moveTo(mid.x, mid.y);
                for (let i = 0; i < skin.length; i++) {

                    const first = skin[i];
                    const next = skin[(i + 1) % skin.length]

                    const mid = Vector.add(first, next).divByNumber(2);
                    // console.log(mid);
                    // ctx.lineTo(skin[i].x, skin[i].y);
                    ctx.quadraticCurveTo(first.x, first.y, mid.x, mid.y);
                }
                ctx.closePath()
                ctx.stroke();
                ctx.fill();
                if (snakeComponent.leftEye) {
                    const left = snakeComponent.leftEye;
                    const right = snakeComponent.rightEye;
                    // console.log(left);
                    ctx.beginPath();
                    ctx.fillStyle = 'green'

                    ctx.arc(left.x, left.y, 3, 0, Math.PI * 2);
                    ctx.arc(right.x, right.y, 3, 0, Math.PI * 2);
                    ctx.fill()
                }
                return;
            }



            ctx.beginPath();
            ctx.fillStyle = component.color ?? 'blue';
            ctx.arc(pos.x, pos.y, component.radius, 0, Math.PI * 2);
            ctx.fill();


        }
    }

    static snake = {
        render(ctx, component) {
            /** @type {SnakeComponent} */
            const snakeComponent = component.entity.getComponent('SnakeComponent');
            if (!snakeComponent) return;

            const skin = snakeComponent.snakeSkinVerticies;
            if (!skin || skin.length < 3) return; // Guard against empty or incomplete meshes

            ctx.beginPath();
            ctx.fillStyle = 'indigo';
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2; // Make that outline clean

            const firstVert = skin[0];
            const lastVert = skin[skin.length - 1];

            // Safe midpoint calculation without modifying engine references
            const startX = (firstVert.x + lastVert.x) / 2;
            const startY = (firstVert.y + lastVert.y) / 2;
            ctx.moveTo(startX, startY);

            for (let i = 0; i < skin.length; i++) {
                const current = skin[i];
                const next = skin[(i + 1) % skin.length];

                // Calculate the target midpoint for the end of this curve segment
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;

                // current.x/y acts perfectly as the control anchor pulling the hull outward
                ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // console.log(snakeComponent.leftEye)
            if (snakeComponent.leftEye) {
                const left = snakeComponent.leftEye;
                const right = snakeComponent.rightEye;
                // console.log(left);
                ctx.beginPath();
                ctx.fillStyle = 'green'
                ctx.arc(left.x, left.y, 3, 0, Math.PI * 2);
                ctx.arc(right.x, right.y, 3, 0, Math.PI * 2);
                ctx.fill()
            }
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {CellComponent} cell 
     */
    static drawCell(ctx, cell) {
        if (cell.left && cell.right) {
            RenderStratagies.drawCell(ctx, cell.left);
            RenderStratagies.drawCell(ctx, cell.right);
        } else {
            ctx.beginPath();
            ctx.fillStyle = 'brown'
            ctx.strokeRect(cell.topLeft.x, cell.topLeft.y, cell.width, cell.height);
        }
    }



    /**
     * 
     * @param {string} name 
     * @param {Function} renderFunction 
     */
    static register(name, renderFunction) {
        this[name] = { render: renderFunction };
    }
}