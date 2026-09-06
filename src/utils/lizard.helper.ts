import { LizardComponent, LizardLeg } from "../components/lizard.component";
import { PhysicsComponent } from "../components/physics.component";

function drawSingleLeg(ctx: CanvasRenderingContext2D, leg: LizardLeg) {
    if (!leg.segments || leg.segments.length < 2) return;

    // segments[1] = thigh (anchored at body), segments[0] = shin (ends at foot)
    const thigh = leg.segments[1];
    const shin = leg.segments[0];
    const hip = thigh.a;
    const knee = thigh.b;          // == shin.a after pinning
    const foot = shin.b;           // == leg.footPos after IK settle

    // Outline / shadow
    ctx.strokeStyle = '#1a2e14';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Main leg
    ctx.strokeStyle = '#557a46';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();

    // Joints (hip + knee)
    ctx.fillStyle = '#3b5a30';
    ctx.beginPath();
    ctx.arc(hip.x, hip.y, 4.5, 0, Math.PI * 2);
    ctx.arc(knee.x, knee.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Foot
    ctx.fillStyle = '#4a6b3a';
    ctx.beginPath();
    ctx.arc(leg.footPos.x, leg.footPos.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Claws pointing along the last bone
    const dirX = foot.x - knee.x;
    const dirY = foot.y - knee.y;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const nx = dirX / len, ny = dirY / len;

    ctx.strokeStyle = '#d4c3a3';
    ctx.lineWidth = 1.5;
    for (let t = -1; t <= 1; t++) {
        const a = t * 0.6;
        const c = Math.cos(a), s = Math.sin(a);
        const tx = nx * c - ny * s;
        const ty = nx * s + ny * c;
        ctx.beginPath();
        ctx.moveTo(leg.footPos.x, leg.footPos.y);
        ctx.lineTo(leg.footPos.x + tx * 6, leg.footPos.y + ty * 6);
        ctx.stroke();
    }
}

function drawLizardBody(ctx: CanvasRenderingContext2D, lizard: LizardComponent) {
    // Chain of overlapping circles produces the tail-on-body silhouette
    // console.info("Drawing Lizard Body")
    ctx.fillStyle = 'rgba(10, 153, 89, 1)';
    ctx.strokeStyle = 'rgba(10, 153, 89, 1)';
    ctx.lineWidth = 2;

    // console.info(lizard.segments.length)

    for (const segment of lizard.segments) {
        ctx.beginPath();
        ctx.arc(segment.pos.x, segment.pos.y, segment.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Head highlight on the first segment
    const head = lizard.segments[0];
    if (head) {
        // Head highlight
        ctx.fillStyle = '#0a9959';
        ctx.beginPath();
        ctx.arc(head.pos.x, head.pos.y, head.rad * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Eyes calculation based purely on head.angle (No ctx.rotate needed!)
        const eyeOffset = head.rad * 0.5;
        const fwdX = Math.cos(head.angle);
        const fwdY = Math.sin(head.angle);
        const perpX = -Math.sin(head.angle);
        const perpY = Math.cos(head.angle);

        ctx.fillStyle = 'white';
        for (const side of [-1, 1]) {
            // Calculate absolute position for each eye
            const ex = head.pos.x + fwdX * eyeOffset + perpX * side * eyeOffset;
            const ey = head.pos.y + fwdY * eyeOffset + perpY * side * eyeOffset;

            // White of the eye
            ctx.beginPath();
            ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupil (slightly offset forward in the direction the head is facing)
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(ex + fwdX * 1, ey + fwdY * 1, 1.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'white'; // Reset for next iteration
        }
    }
}

/**
 * Draws legs in two passes so back legs render BEHIND the body and front legs IN FRONT.
 * `legIndices` selects which segment indices to draw legs from.
 */
function drawLizardLegsFromSegments(
    ctx: CanvasRenderingContext2D,
    lizard: LizardComponent,
    segmentIndices: number[]
) {
    for (const i of segmentIndices) {
        const seg = lizard.segments[i];
        if (!seg) continue;
        for (const leg of seg.legs) {
            drawSingleLeg(ctx, leg);
        }
    }
}


export { drawLizardBody, drawLizardLegsFromSegments, drawSingleLeg }