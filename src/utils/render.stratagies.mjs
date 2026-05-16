import { CellComponent } from "../components/cell.component.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";




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