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


    /**
     * 
     * @param {string} name 
     * @param {Function} renderFunction 
     */
    static register(name, renderFunction) {
        this[name] = { render: renderFunction };
    }
}