import { SpiderComponent, SpiderLeg } from "../components/spider.component";

function drawSingleSpiderLeg(ctx: CanvasRenderingContext2D, leg: SpiderLeg) {
    if (!leg.segments || leg.segments.length < 2) return;

    const thigh = leg.segments[1];
    const shin = leg.segments[0];
    const hip = thigh.a;
    const knee = thigh.b;
    const foot = shin.b;

    const lc = leg.parentSegment.legColor;
    const legColor = `rgba(${lc[0]}, ${lc[1]}, ${lc[2]}, ${lc[3] / 255})`;
    const darkColor = `rgba(${Math.max(0, lc[0] - 20)}, ${Math.max(0, lc[1] - 20)}, ${Math.max(0, lc[2] - 20)}, ${lc[3] / 255})`;

    // Outline
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Main leg
    ctx.strokeStyle = legColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Joints
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(hip.x, hip.y, 2, 0, Math.PI * 2);
    ctx.arc(knee.x, knee.y, 2.5, 0, Math.PI * 2); // Knee is usually more pronounced
    ctx.fill();

    // Foot
    ctx.fillStyle = legColor;
    ctx.beginPath();
    ctx.arc(leg.footPos.x, leg.footPos.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawSpiderBody(ctx: CanvasRenderingContext2D, spider: SpiderComponent) {
    const c = SpiderComponent.color;
    const bodyColor = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`;
    const darkColor = `rgba(${Math.max(0, c[0] - 30)}, ${Math.max(0, c[1] - 30)}, ${Math.max(0, c[2] - 30)}, ${c[3] / 255})`;

    // Draw abdomen first (segment 1), then cephalothorax (segment 0) for correct overlap
    for (let i = spider.segments.length - 1; i >= 0; i--) {
        const segment = spider.segments[i];
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(segment.pos.x, segment.pos.y, segment.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Head / Cephalothorax details (Segment 0)
    const head = spider.segments[0];
    if (head) {
        // Spider eyes (multiple small dots)
        ctx.fillStyle = '#ff3333'; // Glowing red eyes
        const eyeOffset = head.rad * 0.4;
        const fwdX = Math.cos(head.angle);
        const fwdY = Math.sin(head.angle);
        const perpX = -Math.sin(head.angle);
        const perpY = Math.cos(head.angle);

        // Draw 4 eyes in a row
        for (let i = -1.5; i <= 1.5; i += 1) {
            const ex = head.pos.x + fwdX * eyeOffset + perpX * i * 1.5;
            const ey = head.pos.y + fwdY * eyeOffset + perpY * i * 1.5;
            ctx.beginPath();
            ctx.arc(ex, ey, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawSpiderLegs(ctx: CanvasRenderingContext2D, spider: SpiderComponent) {
    for (const segment of spider.segments) {
        for (const leg of segment.legs) {
            drawSingleSpiderLeg(ctx, leg);
        }
    }
}

export { drawSpiderBody, drawSpiderLegs, drawSingleSpiderLeg };