
import { SAT } from "../utils/sat.mjs";
export class CollisionDebugSystem {
    constructor(world, eventBus, ctx, camera, clock) {
        this.world = world;
        this.ctx = ctx;
        this.camera = camera
        this.clock = clock
        this.contacts = [];
        eventBus.on('collisionDetected', (e1, p1, e2, p2, contact) => {
            this.contacts.push({ e1, p1, e2, p2, contact });
        });
    }

    update() {
        const ctx = this.ctx;

        // Draw FPS in top-left (static UI, no camera apply yet)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 80, 25);
        ctx.fillStyle = '#0F0';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`FPS: ${Math.round(this.clock.fps)}`, 15, 27);
        ctx.restore();

        ctx.save();
        this.camera.apply(ctx);

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
        this.contacts = [];
    }

    drawShape(ctx, entity) {
        const render = entity.getComponent('RenderComponent');
        if (!render) return;

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';

        if (render.type === 'circle') {
            const pos = entity.transform.pos;
            const radius = render.radius || 16;

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
        else if (render.type === 'rect') {
            const verts = SAT.rectToVertices(entity, render);

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

        // Get all axes being tested
        const verts1 = r1.type === 'rect' ? SAT.rectToVertices(e1, r1) : null;
        const verts2 = r2.type === 'rect' ? SAT.rectToVertices(e2, r2) : null;

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
}
