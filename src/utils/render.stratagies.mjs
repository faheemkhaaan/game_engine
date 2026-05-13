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
            ctx.beginPath();
            ctx.fillStyle = renderComponent.color;
            ctx.fillRect(pos.x, pos.y, renderComponent.width * size.x, renderComponent.height * size.y)
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