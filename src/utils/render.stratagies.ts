import { CellComponent } from "../components/cell.component";
import { DungeonComponent } from "../components/dungeon.component";
import { RenderComponent } from "../components/render.component";
import { ShapeComponent } from "../components/shape.component";
import { Vector } from "./vector";

// Optional: Uncomment these if you have them for stricter typing on getComponent()
// import { SnakeComponent } from "../components/snake.component";
// import { LizardComponent } from "../components/lizard.component";
// import { PhysicsComponent } from "../components/physics.component";

/**
 * Helper function to draw procedural FABRIK legs.
 * We split this into two passes (back legs vs front legs) for proper depth sorting.
 * 
 * @param ctx Canvas context
 * @param lizardComponent The LizardComponent instance
 * @param legIndices Which legs to draw (0,1 for front; 2,3 for back)
 */
function drawLizardLegs(ctx: CanvasRenderingContext2D, lizardComponent: any, legIndices: number[]) {
    if (!lizardComponent || !lizardComponent.legs) return;

    for (const i of legIndices) {
        const leg = lizardComponent.legs[i];
        if (!leg || !leg.points || leg.points.length < 2) continue;

        // 1. Draw Outline / Shadow for depth
        ctx.strokeStyle = '#1a2e14'; // Dark outline
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(leg.points[0].x, leg.points[0].y);
        for (let j = 1; j < leg.points.length; j++) {
            ctx.lineTo(leg.points[j].x, leg.points[j].y);
        }
        ctx.stroke();

        // 2. Draw Main Leg
        ctx.strokeStyle = '#557a46'; // Lizard green/olive
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(leg.points[0].x, leg.points[0].y);
        for (let j = 1; j < leg.points.length; j++) {
            ctx.lineTo(leg.points[j].x, leg.points[j].y);
        }
        ctx.stroke();

        // 3. Draw Joints (Hip, Knee)
        ctx.fillStyle = '#3b5a30';
        for (let j = 0; j < leg.points.length - 1; j++) {
            const point = leg.points[j];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Draw Foot and Claws
        const foot = leg.points[leg.points.length - 1];
        const knee = leg.points[leg.points.length - 2];

        // Foot base
        ctx.fillStyle = '#4a6b3a';
        ctx.beginPath();
        ctx.arc(foot.x, foot.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Claws pointing in the direction of the last bone
        ctx.strokeStyle = '#d4c3a3'; // Bone/claw color
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        const dirX = foot.x - knee.x;
        const dirY = foot.y - knee.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const nx = dirX / len;
        const ny = dirY / len;

        // 3 little toes spreading out
        for (let t = -1; t <= 1; t++) {
            const angleOffset = t * 0.6; // spread toes
            const cos = Math.cos(angleOffset);
            const sin = Math.sin(angleOffset);
            const toeX = nx * cos - ny * sin;
            const toeY = nx * sin + ny * cos;

            ctx.beginPath();
            ctx.moveTo(foot.x, foot.y);
            ctx.lineTo(foot.x + toeX * 6, foot.y + toeY * 6);
            ctx.stroke();
        }
    }
}

/**
 * Helper function to recursively draw dungeon cells.
 * Extracted from the class to keep the registry object clean.
 */
function drawCellHelper(ctx: CanvasRenderingContext2D, cell: CellComponent) {
    if (cell.left && cell.right) {
        drawCellHelper(ctx, cell.left);
        drawCellHelper(ctx, cell.right);
    } else {
        ctx.beginPath();
        ctx.fillStyle = 'brown';
        ctx.strokeRect(cell.topLeft.x, cell.topLeft.y, cell.width, cell.height);
    }
}

/**
 * Defines the exact shape of a render strategy.
 */
export interface RenderStrategy {
    render: (ctx: CanvasRenderingContext2D, component: any) => void;
}

/**
 * A type-safe registry of render strategies.
 * Using a Record<string, RenderStrategy> explicitly tells TypeScript that 
 * dynamic string indexing is allowed and safe.
 */
export const RenderStrategies: Record<string, RenderStrategy> = {
    rect: {
        render(ctx: CanvasRenderingContext2D, renderComponent: RenderComponent) {
            if (!renderComponent.entity) return;
            const pos = renderComponent.entity.transform.pos;
            const size = renderComponent.entity.transform.size;
            const w = renderComponent.width * size.x;
            const h = renderComponent.height * size.y;
            ctx.beginPath();
            ctx.fillStyle = renderComponent.color;
            ctx.fillRect(pos.x - w / 2, pos.y - h / 2, w, h);
        }
    },

    cell: {
        render(ctx: CanvasRenderingContext2D, dungeonComponent: DungeonComponent) {
            const root = dungeonComponent.root;
            drawCellHelper(ctx, root);
        }
    },

    circle: {
        render(ctx: CanvasRenderingContext2D, component: RenderComponent) {
            if (!component.entity) return;
            const pos = component.entity.transform.pos;
            const shapeComponent = component.entity.getComponent("ShapeComponent") as ShapeComponent;
            const snakeComponent = component.entity.getComponent('SnakeComponent');

            if (snakeComponent) {
                const lizardComponent = component.entity.getComponent('LizardComponent');

                // Draw BACK legs behind the body (Indices 2 and 3)
                if (lizardComponent) {
                    drawLizardLegs(ctx, lizardComponent, [2, 3]);
                }

                const skin = snakeComponent.snakeSkinVerticies;
                ctx.beginPath();
                ctx.fillStyle = component.color ?? 'green';
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;

                const first = skin[0];
                const last = skin[skin.length - 1];
                const mid = Vector.add(first, last).divByNumber(2);

                ctx.moveTo(mid.x, mid.y);
                for (let i = 0; i < skin.length; i++) {
                    const first = skin[i];
                    const next = skin[(i + 1) % skin.length];
                    const mid = Vector.add(first, next).divByNumber(2);
                    ctx.quadraticCurveTo(first.x, first.y, mid.x, mid.y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                // Draw FRONT legs in front of the body (Indices 0 and 1)
                if (lizardComponent) {
                    drawLizardLegs(ctx, lizardComponent, [0, 1]);
                }

                if (snakeComponent.leftEye) {
                    const left = snakeComponent.leftEye;
                    const right = snakeComponent.rightEye;
                    ctx.beginPath();
                    ctx.fillStyle = 'red';
                    ctx.arc(left.x, left.y, 3, 0, Math.PI * 2);
                    ctx.arc(right.x, right.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                return;
            }

            ctx.beginPath();
            ctx.fillStyle = component.color ?? 'blue';
            ctx.arc(pos.x, pos.y, shapeComponent.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    snake: {
        render(ctx: CanvasRenderingContext2D, component: RenderComponent) {
            if (!component.entity) return;
            const snakeComponent = component.entity.getComponent('SnakeComponent');
            if (!snakeComponent) return;

            const lizardComponent = component.entity.getComponent('LizardComponent');

            // Draw BACK legs behind the body
            if (lizardComponent) {
                drawLizardLegs(ctx, lizardComponent, [2, 3]);
            }

            const skin = snakeComponent.snakeSkinVerticies;
            if (!skin || skin.length < 3) return;

            ctx.beginPath();
            const snakeScaleCanvas = createSnakePattern();

            ctx.fillStyle = 'indigo';
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;

            const firstVert = skin[0];
            const lastVert = skin[skin.length - 1];

            const startX = (firstVert.x + lastVert.x) / 2;
            const startY = (firstVert.y + lastVert.y) / 2;
            ctx.moveTo(startX, startY);

            for (let i = 0; i < skin.length; i++) {
                const current = skin[i];
                const next = skin[(i + 1) % skin.length];

                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;

                ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Draw FRONT legs in front of the body
            if (lizardComponent) {
                drawLizardLegs(ctx, lizardComponent, [0, 1]);
            }

            if (snakeComponent.leftEye) {
                const left = snakeComponent.leftEye;
                const right = snakeComponent.rightEye;
                ctx.beginPath();
                ctx.fillStyle = 'red';
                ctx.arc(left.x, left.y, 3, 0, Math.PI * 2);
                ctx.arc(right.x, right.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    rat: {
        render(ctx: CanvasRenderingContext2D, component: RenderComponent) {
            if (!component.entity) return;
            const pos = component.entity.transform.pos;
            const physics = component.entity.getComponent('PhysicsComponent');

            const ratColor = '#b68119';
            const pinkColor = '#e19898';
            const eyeColor = 'white';

            const velocity = physics.velocity;
            const angle = velocity.angle();
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const headX = pos.x + cos * 15;
            const headY = pos.y + sin * 15;

            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y, 20, 15, angle, 0, Math.PI * 2);
            ctx.fillStyle = ratColor;
            ctx.fill();

            const earForward = -2;
            const earSide = 10;
            const leftEarAngle = angle - Math.PI / 4;
            const rightEarAngle = angle + Math.PI / 4;

            const leftEarX = headX + cos * earForward - sin * earSide;
            const leftEarY = headY + sin * earForward + cos * earSide;
            ctx.beginPath();
            ctx.ellipse(leftEarX, leftEarY, 6, 8, leftEarAngle, 0, Math.PI * 2);
            ctx.fillStyle = ratColor;
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(leftEarX, leftEarY, 3, 5, leftEarAngle, 0, Math.PI * 2);
            ctx.fillStyle = pinkColor;
            ctx.fill();

            const rightEarX = headX + cos * earForward + sin * earSide;
            const rightEarY = headY + sin * earForward - cos * earSide;
            ctx.beginPath();
            ctx.ellipse(rightEarX, rightEarY, 6, 8, rightEarAngle, 0, Math.PI * 2);
            ctx.fillStyle = ratColor;
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(rightEarX, rightEarY, 3, 5, rightEarAngle, 0, Math.PI * 2);
            ctx.fillStyle = pinkColor;
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(headX, headY, 15, 10, angle, 0, Math.PI * 2);
            ctx.fillStyle = ratColor;
            ctx.fill();

            const eyeForward = 7;
            const eyeSide = 4;

            ctx.beginPath();
            ctx.arc(
                headX + cos * eyeForward - sin * eyeSide,
                headY + sin * eyeForward + cos * eyeSide,
                2, 0, Math.PI * 2
            );
            ctx.fillStyle = eyeColor;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                headX + cos * eyeForward + sin * eyeSide,
                headY + sin * eyeForward - cos * eyeSide,
                2, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }
};

/**
 * Safely registers a new render strategy at runtime.
 * No more `(this as any)` hacks needed!
 */
export function registerRenderStrategy(name: string, strategy: RenderStrategy) {
    RenderStrategies[name] = strategy;
}

function createSnakePattern() {
    const scaleSize = 10;
    const canvas = document.createElement('canvas');
    canvas.width = scaleSize;
    canvas.height = scaleSize;
    const ctx = canvas.getContext('2d');

    // If context fails to load, return the canvas anyway to prevent breaking callers
    if (!ctx) return canvas;

    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(0, 0, scaleSize, scaleSize);

    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(scaleSize / 2, 0);
    ctx.lineTo(scaleSize, scaleSize / 2);
    ctx.lineTo(scaleSize / 2, scaleSize);
    ctx.lineTo(0, scaleSize / 2);
    ctx.closePath();
    ctx.stroke();

    return canvas;
}