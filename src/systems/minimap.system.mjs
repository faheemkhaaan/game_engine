import { DungeonComponent } from "../components/dungeon.component.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";

export class MinimapSystem {
    /**
     * @param {World} world 
     * @param {EventBus} events
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(world, events, ctx) {
        this.world = world;
        this.ctx = ctx;
        this.size = 200; // Fixed size
        this.margin = 20; // Margin from bottom right
        this.enableMinMap = false;

        events.on('enableMinMap', () => {
            this.enableMinMap = !this.enableMinMap;
        })


    }

    update(dt) {
        if (!this.enableMinMap) return;
        const dungeons = this.world.query('DungeonComponent');
        if (dungeons.length === 0) return;

        const dungeonComponent = dungeons[0].getComponent('DungeonComponent');
        if (!dungeonComponent || !dungeonComponent.root) return;

        // Get total dungeon dimensions
        const rootCell = dungeonComponent.root;
        const dungeonWidth = rootCell.width;
        const dungeonHeight = rootCell.height;

        const scaleX = this.size / dungeonWidth;
        const scaleY = this.size / dungeonHeight;
        const scale = Math.min(scaleX, scaleY);

        const actualWidth = dungeonWidth * scale;
        const actualHeight = dungeonHeight * scale;

        // Position: Bottom right
        const mapX = this.ctx.canvas.width - actualWidth - this.margin;
        const mapY = this.ctx.canvas.height - actualHeight - this.margin;

        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(mapX, mapY, actualWidth, actualHeight);

        // Draw border
        this.ctx.strokeStyle = '#5a5a5a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(mapX, mapY, actualWidth, actualHeight);

        // Render dungeon elements
        const renderables = this.world.query('RenderComponent');

        for (const entity of renderables) {
            // We only care about room floors and halls
            if (entity.id.startsWith('room_floor_') || entity.id.startsWith('hall_floor_')) {
                const render = entity.getComponent('RenderComponent');
                const pos = entity.transform?.pos;

                if (!render || !pos) continue;

                const drawX = mapX + pos.x * scale;
                const drawY = mapY + pos.y * scale;
                const drawWidth = render.width * scale;
                const drawHeight = render.height * scale;

                this.ctx.fillStyle = render.color || '#2f2341';
                this.ctx.fillRect(drawX - drawWidth / 2, drawY - drawHeight / 2, drawWidth, drawHeight);
            }
        }

        // Draw player
        const player = this.world.getEntity('player');
        if (player && player.transform) {
            const pos = player.transform.pos;

            const playerX = mapX + pos.x * scale;
            const playerY = mapY + pos.y * scale;

            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
