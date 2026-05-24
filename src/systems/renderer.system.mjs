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

        // Sort entities by their zIndex (lowest to highest)
        renderableEntities.sort((a, b) => {
            const renderA = a.getComponent('RenderComponent');
            const renderB = b.getComponent('RenderComponent');
            return (renderA?.zIndex || 0) - (renderB?.zIndex || 0);
        });


        this.camera.apply(this.ctx);


        for (const entity of renderableEntities) {
            const render = entity.getComponent('RenderComponent');
            if (render.dead) continue;
            const shape = entity.getComponent('ShapeComponent')

            if (!shape || !shape.type) continue;

            render.type = shape.type;
            if (shape.width) render.width = shape.width;
            if (shape.height) render.height = shape.height;
            if (shape.radius) render.radius = shape.radius;

            this.renderEntity(render);
        }
        this.camera.restore(this.ctx)
    }

    clearCanvas() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * 
     * @param {RenderComponent} render 
     */
    renderEntity(render) {

        const strategy = RenderStratagies[render.type];
        if (!strategy) {
            console.error(`[RendererSystem] no render strategy for ${render.type}`);
        }
        strategy.render(this.ctx, render);

    }

}