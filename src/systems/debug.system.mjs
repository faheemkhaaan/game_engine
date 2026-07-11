
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { SAT } from "../utils/sat.mjs";
import { Vector } from "../utils/vector.mjs";
export class CollisionDebugSystem {
    /**
     * 
     * @param {World} world 
     * @param {*} eventBus 
     * @param {*} ctx 
     * @param {*} camera 
     * @param {*} clock 
     */
    constructor(world, eventBus, ctx, camera, clock) {
        this.world = world;
        this.ctx = ctx;
        this.camera = camera
        this.clock = clock
        this.contacts = [];

        this.interval = 0;
        this.frameInterval = 20;
        this.debugEnabled = false;

        eventBus.on('collisionDetected', (e1, p1, e2, p2, contact) => {
            this.contacts.push({ e1, p1, e2, p2, contact });
        });
        eventBus.on("enableDebug", () => {
            this.debugEnabled = !this.debugEnabled;
        })
    }

    update() {
        if (!this.debugEnabled) return;
        const ctx = this.ctx;
        const player = this.world.getEntity('player');

        // Draw FPS in top-left (static UI, no camera apply yet)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 80, 25);
        ctx.fillStyle = '#0F0';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`FPS: ${Math.round(this.clock.fps)}`, 15, 27);
        this.drawPlayerInfo(player);
        ctx.restore();

        ctx.save();
        this.camera.apply(ctx);
        this.drawPlayPhysicsComponentInfo(player)
        // 1. Draw all collision shapes (vertices/radii)
        const entities = this.world.query('PhysicsComponent');
        entities.forEach(entity => {
            this.drawShape(ctx, entity);
        });

        // 2. Draw active collision info
        this.contacts.forEach(({ e1, p1, e2, p2, contact }) => {
            this.drawCollision(ctx, e1, e2, contact);
        });



        ctx.restore();

        // Clear contacts for next frame
        this.contacts.length = 0;
    }

    drawShape(ctx, entity) {
        const render = entity.getComponent('RenderComponent');
        const shape = entity.getComponent("ShapeComponent");
        if (!render || !shape) return;

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';

        if (shape.type === 'circle') {
            const pos = entity.transform.pos;
            const radius = shape.radius || 16;

            // Draw circle outline
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw center point
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (shape.type === 'rect') {
            const verts = SAT.rectToVertices(entity, shape);

            // Draw edges
            ctx.beginPath();
            ctx.moveTo(verts[0].x, verts[0].y);
            for (let i = 1; i < verts.length; i++) {
                ctx.lineTo(verts[i].x, verts[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Draw vertices
            verts.forEach((v, i) => {
                ctx.fillStyle = '#0FF'; // Cyan for vertices
                ctx.beginPath();
                ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
                ctx.fill();

                // Label vertex index
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.fillText(`v${i}`, v.x + 5, v.y - 5);
            });
        }
    }

    drawCollision(ctx, e1, e2, contact) {
        const p1 = e1.transform.pos;
        const p2 = e2.transform.pos;

        // Draw active collision info
        // this.drawSATVisuals(ctx, e1, e2, contact);

        // Draw dashed line between centers
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw normal on object 1
        if (contact.normal) {
            const normalScale = 60;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p1.x + contact.normal.x * normalScale, p1.y + contact.normal.y * normalScale);
            ctx.stroke();

            const angle = Math.atan2(contact.normal.y, contact.normal.x);
            ctx.beginPath();
            ctx.moveTo(p1.x + contact.normal.x * normalScale, p1.y + contact.normal.y * normalScale);
            ctx.lineTo(
                p1.x + contact.normal.x * normalScale - 10 * Math.cos(angle - Math.PI / 6),
                p1.y + contact.normal.y * normalScale - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                p1.x + contact.normal.x * normalScale - 10 * Math.cos(angle + Math.PI / 6),
                p1.y + contact.normal.y * normalScale - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = '#FFD700';
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`DEPTH: ${contact.depth.toFixed(1)}`, p1.x + 20, p1.y - 40);
        }
    }

    drawSATVisuals(ctx, e1, e2, contact) {
        const r1 = e1.getComponent('RenderComponent');
        const r2 = e2.getComponent('RenderComponent');
        const s1 = e1.getComponent('ShapeComponent');
        const s2 = e1.getComponent('ShapeComponent');
        // Get all axes being tested
        const verts1 = s1.type === 'rect' ? SAT.rectToVertices(e1, s1) : null;
        const verts2 = s2.type === 'rect' ? SAT.rectToVertices(e2, s2) : null;

        const axes = [];
        if (verts1) axes.push(...SAT.getAxes(verts1));
        if (verts2) axes.push(...SAT.getAxes(verts2));

        // For circle, add the vertex-center axis
        if (r1.type === 'circle' && verts2) axes.push(SAT.getClosestVertexAxis(verts2, e1.transform.pos));
        if (r2.type === 'circle' && verts1) axes.push(SAT.getClosestVertexAxis(verts1, e2.transform.pos));

        // Draw each axis and the projections (shadows)
        axes.forEach((axis, i) => {
            const axisColor = i === 0 ? '#ff4757' : i === 1 ? '#2ed573' : i === 2 ? '#1e90ff' : '#ffa502';

            // Draw the axis line passing through the midpoint of the two objects
            const mid = Vector.lerp(e1.transform.pos, e2.transform.pos, 0.5);
            const lineLen = 200;

            ctx.strokeStyle = axisColor;
            ctx.globalAlpha = 0.3;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(mid.x - axis.x * lineLen, mid.y - axis.y * lineLen);
            ctx.lineTo(mid.x + axis.x * lineLen, mid.y + axis.y * lineLen);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            ctx.setLineDash([]);

            // Project both shapes onto this axis
            const proj1 = r1.type === 'rect' ? SAT.projectPolygon(verts1, axis) : SAT.projectCircle(e1.transform.pos, r1.radius, axis);
            const proj2 = r2.type === 'rect' ? SAT.projectPolygon(verts2, axis) : SAT.projectCircle(e2.transform.pos, r2.radius, axis);

            // Draw the "shadows" offset slightly from the axis line
            const offset = 20 + i * 15;
            const perp = axis.normal();

            // Draw Shadow 1
            ctx.strokeStyle = r1.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mid.x + axis.x * proj1.min + perp.x * offset, mid.y + axis.y * proj1.min + perp.y * offset);
            ctx.lineTo(mid.x + axis.x * proj1.max + perp.x * offset, mid.y + axis.y * proj1.max + perp.y * offset);
            ctx.stroke();

            // Draw Shadow 2
            ctx.strokeStyle = r2.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mid.x + axis.x * proj2.min + perp.x * (offset + 5), mid.y + axis.y * proj2.min + perp.y * (offset + 5));
            ctx.lineTo(mid.x + axis.x * proj2.max + perp.x * (offset + 5), mid.y + axis.y * proj2.max + perp.y * (offset + 5));
            ctx.stroke();
            ctx.lineWidth = 2;
        });
    }



    /**
     * 
     * @param {Entity} entity 
     */
    drawPlayerInfo(entity) {

        const physicsComponent = entity.getComponent('PhysicsComponent');
        const vel = {
            x: Math.round(physicsComponent.velocity.x),
            y: Math.round(physicsComponent.velocity.y),
        };
        const pos = {
            x: Math.round(entity.transform.pos.x),
            y: Math.round(entity.transform.pos.y)
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)'


        this.ctx.fillRect(90, 10, 480, 25);

        this.ctx.fillStyle = '#0F0'
        this.ctx.fillText(`Player-velocity x:${vel.x} y:${vel.y}`, 90, 27)
        this.ctx.fillText(`Player-pos x:${pos.x} y:${pos.y}`, 340, 27);



    }

    drawPlayPhysicsComponentInfo(entity) {

        const physicsComponent = entity.getComponent('PhysicsComponent');
        const vel = {
            x: Math.round(physicsComponent.velocity.x),
            y: Math.round(physicsComponent.velocity.y),
        };
        const pos = {
            x: Math.round(entity.transform.pos.x),
            y: Math.round(entity.transform.pos.y)
        }
        const ctx = this.ctx;
        const scale = 0.4;

        const endX = pos.x + vel.x * scale;
        const endY = pos.y + vel.y * scale;

        // Only draw if there's meaningful velocity
        if (Math.abs(vel.x) < 0.01 && Math.abs(vel.y) < 0.01) return;

        // Draw velocity line
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(vel.y, vel.x);
        const headLength = 10;

        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Optional: Draw a small circle at the tip
        // ctx.fillStyle = '#FF0000';
        // ctx.beginPath();
        // ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        // ctx.fill()
    }
}
