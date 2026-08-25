import { RenderComponent } from "../components/render.component";
import { World } from "../core/world";
import { Camera } from "../game/camera";
import { distanceToShape } from "../utils/distance-to-shape";
import { RenderStratagies } from "../utils/render.stratagies";



export class RendererSystem {

    private renderDistance: number;
    /**
     * 
     * @param {World} world 
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
    */
    constructor(private world: World, private ctx: CanvasRenderingContext2D, private camera: Camera) {
        this.renderDistance = 3000;
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
    update(deltaTime: number) {
        this.clearCanvas();
        // console.log(deltaTime);
        const playerEntity = this.world.getEntity('player');



        const renderableEntities = this.world.query('RenderComponent').filter(a => {
            const pos = a.transform.pos;
            const shape = a.getComponent('ShapeComponent');
            if (!shape) return true; // no shape info, don't cull it blindly
            return distanceToShape(pos, shape, playerEntity.transform.pos) < this.renderDistance
        });

        // Sort entities by their zIndex (lowest to highest)
        renderableEntities.sort((a, b) => {
            const renderA = a.getComponent('RenderComponent');
            const renderB = b.getComponent('RenderComponent');
            return (renderA?.zIndex || 0) - (renderB?.zIndex || 0);
        })

        this.camera.apply(this.ctx);

        for (const entity of renderableEntities) {
            const render = entity.getComponent('RenderComponent');
            if (render.dead) continue;
            const shape = entity.getComponent('ShapeComponent')

            if (!shape || !shape.type) continue;

            if (!render.type) render.type = shape.type;
            if (shape.width) render.width = shape.width;
            if (shape.height) render.height = shape.height;
            if (shape.radius) render.radius = shape.radius;

            this.renderEntity(render);
        }
        // this.ctx.beginPath();
        // this.ctx.fillStyle = 'lightblue';
        // this.ctx.globalAlpha = 0.3;
        // this.ctx.arc(playerEntity.transform.pos.x, playerEntity.transform.pos.y, this.renderDistance, 0, Math.PI * 2);
        // this.ctx.fill();
        // this.ctx.globalAlpha = 1;
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
    renderEntity(render: RenderComponent) {

        const strategy = RenderStratagies[render.type];
        if (!strategy) {
            console.error(`[RendererSystem] no render strategy for ${render.type}`);
        }
        strategy.render(this.ctx, render);

    }

}