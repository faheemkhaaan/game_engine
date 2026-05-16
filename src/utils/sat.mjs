import { Vector } from "./vector.mjs";
export class SAT {

    // ─── Entry point ───────────────────────────────────────────────

    static checkCollision(e1, r1, e2, r2) {
        const typeKey = r1.type + r2.type;

        if (typeKey === 'circlecircle') return SAT.circleCircle(e1, r1, e2, r2);

        if (typeKey === 'circlerect') {
            return SAT.circlePolygon(e1, r1, SAT.rectToVertices(e2, r2));
        }

        if (typeKey === 'rectcircle') {
            const verts = SAT.rectToVertices(e1, r1);
            const contact = SAT.circlePolygon(e2, r2, verts);
            // ✅ Flip by creating new Vector, not mutating with .scale()
            if (contact) contact.normal = new Vector(-contact.normal.x, -contact.normal.y);
            return contact;
        }

        if (typeKey === 'rectrect') return SAT.polygonPolygon(
            SAT.rectToVertices(e1, r1),
            SAT.rectToVertices(e2, r2)
        );

        return null;
    }
    // ─── Shape helpers ─────────────────────────────────────────────

    /**
     * Convert a rect entity into 4 world-space vertices
     * Supports rotation via entity.transform.rotation (radians)
     */
    static rectToVertices(entity, render) {
        const pos = entity.transform.pos;
        const hw = render.width / 2;
        const hh = render.height / 2;
        const rot = entity.transform.rotation || 0;

        // Define corners relative to center
        const localCorners = [
            new Vector(-hw, -hh),
            new Vector(hw, -hh),
            new Vector(hw, hh),
            new Vector(-hw, hh),
        ];

        // Rotate and translate to world space
        return localCorners.map(c => {
            const rotatedX = c.x * Math.cos(rot) - c.y * Math.sin(rot);
            const rotatedY = c.x * Math.sin(rot) + c.y * Math.cos(rot);
            return new Vector(pos.x + rotatedX, pos.y + rotatedY);
        });
    }

    // ─── Projection ────────────────────────────────────────────────

    /**
     * Project all polygon vertices onto an axis
     * Returns { min, max } — the shadow/interval on that axis
     */
    static projectPolygon(vertices, axis) {
        let min = Infinity;
        let max = -Infinity;

        for (const v of vertices) {
            // Dot product = how far along the axis this vertex sits
            const dot = Vector.dot(v, axis)
            if (dot < min) min = dot;
            if (dot > max) max = dot;
        }

        return { min, max };
    }

    /**
     * Project a circle onto an axis
     * Circle projects as [center_dot - radius, center_dot + radius]
     */
    static projectCircle(center, radius, axis) {
        const dot = Vector.dot(center, axis);
        return { min: dot - radius, max: dot + radius };
    }

    // ─── Axis helpers ──────────────────────────────────────────────

    /**
     * Get face normals for a polygon — these are the SAT axes to test
     * Each edge (v1→v2) has a perpendicular normal
     */
    static getAxes(vertices) {
        const axes = [];

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length]; // wrap around

            // Edge vector
            const edge = Vector.sub(v2, v1);

            // Perpendicular (normal) — rotate edge 90°
            const normal = edge.normal();

            // Normalize it

            axes.push(normal.clone().normalize());
        }

        return axes;
    }

    /**
     * For circle vs polygon, we also need the axis from the polygon's
     * closest vertex to the circle center — the "vertex axis"
     */
    static getClosestVertexAxis(vertices, circleCenter) {
        let minDist = Infinity;
        let closest = null;

        for (const v of vertices) {
            const dist = Vector.dist(circleCenter, v);
            if (dist < minDist) {
                minDist = dist;
                closest = v;
            }
        }

        const dx = circleCenter.x - closest.x;
        const dy = circleCenter.y - closest.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        return len > 0 ? new Vector(dx / len, dy / len) : new Vector(1, 0);
    }

    // ─── Overlap test ──────────────────────────────────────────────

    /**
     * Check if two 1D intervals overlap, return overlap amount
     * Returns null if there's a gap (separating axis found!)
     */
    static getOverlap(projA, projB) {
        const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
        return overlap > 0 ? overlap : null;
    }

    // ─── Collision tests ───────────────────────────────────────────

    static circleCircle(e1, r1, e2, r2) {
        const pos1 = e1.transform.pos;
        const pos2 = e2.transform.pos;
        const radius1 = r1.radius || 16;  // ✅ flat property
        const radius2 = r2.radius || 16;

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = radius1 + radius2;

        if (dist >= minDist) return null;

        const len = dist > 0 ? dist : 1;
        const normal = new Vector(dx / len, dy / len);
        return { normal, depth: minDist - dist };
    }

    static polygonPolygon(vertsA, vertsB) {
        // Gather all axes from both shapes' face normals
        const axes = [...SAT.getAxes(vertsA), ...SAT.getAxes(vertsB)];

        let minDepth = Infinity;
        let minAxis = null;

        for (const axis of axes) {
            const projA = SAT.projectPolygon(vertsA, axis);
            const projB = SAT.projectPolygon(vertsB, axis);
            const overlap = SAT.getOverlap(projA, projB);

            // Gap found on this axis → no collision at all
            if (overlap === null) return null;

            // Track the axis with the smallest overlap
            if (overlap < minDepth) {
                minDepth = overlap;
                minAxis = axis;
            }
        }

        // Ensure normal points from B to A
        const centerA = SAT.polygonCenter(vertsA);
        const centerB = SAT.polygonCenter(vertsB);
        const dir = Vector.sub(centerA, centerB);

        const dot = Vector.dot(dir, minAxis);
        if (dot < 0) {
            minAxis = new Vector(-minAxis.x, -minAxis.y);
        }

        return { normal: minAxis, depth: minDepth };
    }

    static circlePolygon(eCircle, rCircle, polyVerts) {  // ✅ removed unused eRect param
        const center = eCircle.transform.pos;
        const radius = rCircle.radius || 16;  // ✅ flat property

        const axes = [
            ...SAT.getAxes(polyVerts),
            SAT.getClosestVertexAxis(polyVerts, center)
        ];

        let minDepth = Infinity;
        let minAxis = null;

        for (const axis of axes) {
            const projCircle = SAT.projectCircle(center, radius, axis);
            const projPoly = SAT.projectPolygon(polyVerts, axis);
            const overlap = SAT.getOverlap(projCircle, projPoly);

            if (overlap === null) return null;

            if (overlap < minDepth) {
                minDepth = overlap;
                minAxis = axis;
            }
        }

        // Ensure normal points from polygon toward circle
        const polyCen = SAT.polygonCenter(polyVerts);
        const dir = new Vector(center.x - polyCen.x, center.y - polyCen.y);
        const dot = dir.x * minAxis.x + dir.y * minAxis.y;
        if (dot < 0) {
            minAxis = new Vector(-minAxis.x, -minAxis.y);  // ✅ new Vector, not .scale(-1)
        }

        return { normal: minAxis, depth: minDepth };
    }

    // ─── Utility ───────────────────────────────────────────────────

    static polygonCenter(vertices) {
        const sum = vertices.reduce(
            (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
            { x: 0, y: 0 }
        );
        return new Vector(sum.x / vertices.length, sum.y / vertices.length);
    }
}