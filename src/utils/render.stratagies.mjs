import { CellComponent } from "../components/cell.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
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
            // ctx.beginPath();
            // ctx.fillStyle = component.color ?? 'blue';
            // ctx.arc(pos.x, pos.y, component.radius, 0, Math.PI * 2);
            // ctx.fill();

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
                // console.log("Has Snake Component");
            }

            if (!snakeComponent) {

                ctx.beginPath();
                ctx.fillStyle = component.color ?? 'blue';
                ctx.arc(pos.x, pos.y, component.radius, 0, Math.PI * 2);
                ctx.fill();
            }

        }
    }

    static snake = {
        render(ctx, component) {
            const snakeComponent = component.entity.getComponent('SnakeComponent');
            if (!snakeComponent) return;
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