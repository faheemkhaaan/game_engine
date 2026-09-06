import { CentipedeComponent, CentipedeLeg } from "../components/centipede.component";

function drawSingleCentipedeLeg(ctx: CanvasRenderingContext2D, leg: CentipedeLeg) {
    if (!leg.segments || leg.segments.length < 2) return;

    const thigh = leg.segments[1];
    const shin = leg.segments[0];
    const hip = thigh.a;
    const knee = thigh.b;
    const foot = shin.b;

    const lc = leg.parentSegment.legColor;
    const legColor = `rgba(${lc[0]}, ${lc[1]}, ${lc[2]}, ${lc[3] / 255})`;
    const darkColor = `rgba(${Math.max(0, lc[0] - 30)}, ${Math.max(0, lc[1] - 30)}, ${Math.max(0, lc[2] - 30)}, ${lc[3] / 255})`;

    // Outline / shadow
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Main leg
    ctx.strokeStyle = legColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Joints
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(hip.x, hip.y, 2.5, 0, Math.PI * 2);
    ctx.arc(knee.x, knee.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Foot
    ctx.fillStyle = legColor;
    ctx.beginPath();
    ctx.arc(leg.footPos.x, leg.footPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawCentipedeBody(ctx: CanvasRenderingContext2D, centipede: CentipedeComponent) {
    const c = CentipedeComponent.color;
    const bodyColor = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`;

    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 1;

    // Draw body segments from tail to head so overlaps look natural
    for (let i = centipede.segments.length - 1; i >= 0; i--) {
        const segment = centipede.segments[i];
        ctx.beginPath();
        ctx.arc(segment.pos.x, segment.pos.y, segment.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Head highlight on the first segment
    const head = centipede.segments[0];
    if (head) {
        ctx.fillStyle = `rgba(${c[0]}, ${Math.min(255, c[1] + 40)}, ${c[2]}, ${c[3] / 255})`;
        ctx.beginPath();
        ctx.arc(head.pos.x, head.pos.y, head.rad * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Simple eyes
        const eyeOffset = head.rad * 0.6;
        const perpX = -Math.sin(head.angle);
        const perpY = Math.cos(head.angle);
        const fwdX = Math.cos(head.angle);
        const fwdY = Math.sin(head.angle);

        ctx.fillStyle = 'black';
        for (const side of [-1, 1]) {
            const ex = head.pos.x + fwdX * eyeOffset * 0.8 + perpX * side * eyeOffset * 0.5;
            const ey = head.pos.y + fwdY * eyeOffset * 0.8 + perpY * side * eyeOffset * 0.5;
            ctx.beginPath();
            ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawCentipedeLegs(ctx: CanvasRenderingContext2D, centipede: CentipedeComponent) {
    for (const segment of centipede.segments) {
        for (const leg of segment.legs) {
            drawSingleCentipedeLeg(ctx, leg);
        }
    }
}

export { drawCentipedeBody, drawCentipedeLegs, drawSingleCentipedeLeg };