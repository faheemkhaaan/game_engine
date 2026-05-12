import { RenderComponent } from "../components/render.component.mjs";
import { World } from "../core/world.mjs";
import { Camera } from "../game/camera.mjs";
import { RenderStratagies } from "../utils/render.stratagies.mjs";



export class RendererSystem {
    /**
     * 
     * @param {World} world 
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
    */
    constructor(world, ctx, camera) {
        /**
         * @type {World}
         */
        this.world = world

        this.ctx = ctx;
        this.camera = camera;

        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }


    /**
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.clearCanvas();
        // console.log(deltaTime);
        const renderableEntities = this.world.query('RenderComponent');
        this.camera.apply(this.ctx);
        renderableEntities.forEach(entity => {
            const renderComponent = entity.getComponent('RenderComponent');
            if (renderComponent) {
                this.renderEntity(renderComponent);
            }
        });
        this.camera.restore(this.ctx)
    }

    clearCanvas() {
        this.ctx.fillStyle = 'lightblue'
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * 
     * @param {RenderComponent} render 
     */
    renderEntity(render) {

        const renderType = RenderStratagies[render.type];
        renderType.render(this.ctx, render);

    }

}