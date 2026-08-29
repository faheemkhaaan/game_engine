import { CollisionComponent } from "../components/collision.component";
import { ShapeComponent } from "../components/shape.component";
import { Entity } from "../core/entity";
import { Vector } from "./vector";


export type Contact = {
    normal: Vector;
    depth: number;
}

export type PolygonProjType = {
    max: number;
    min: number;
}
export class SAT {

    // ─── Entry point ───────────────────────────────────────────────


    static checkCollision(e1: Entity, s1: ShapeComponent, e2: Entity, s2: ShapeComponent) {
        const typeKey = s1.type + s2.type;

        const col1 = e1.getComponent('CollisionComponent');
        const col2 = e2.getComponent('CollisionComponent')
        if (typeKey === 'circlecircle') return SAT.circleCircle(e1, s1, e2, s2);

        if (typeKey === 'circlerect') {
            return SAT.circlePolygon(e1, s1, SAT.getCachedVerticies(e2, col2));
        }

        if (typeKey === 'rectcircle') {
            const verts = SAT.getCachedVerticies(e1, col1);
            const contact = SAT.circlePolygon(e2, s2, verts);
            // ✅ Flip by creating new Vector, not mutating with .scale()
            if (contact && contact.normal) contact.normal = new Vector(-contact.normal.x, -contact.normal.y);
            return contact;
        }

        if (typeKey === 'rectrect') return SAT.polygonPolygon(
            SAT.getCachedVerticies(e1, col1),
            SAT.getCachedVerticies(e2, col2)
        );

        return null;
    }

    static getCachedVerticies(entity: Entity, collisionComp: CollisionComponent) {
        const physics = entity.getComponent('PhysicsComponent');
        const shapeComp = entity.getComponent('ShapeComponent')
        const isStatic = physics.static;

        if (isStatic) {
            const cachedKey = entity.id;

            if (collisionComp.cachedVertices && !collisionComp.dirty) {
                return collisionComp.cachedVertices;
            }

            const vertices = SAT.rectToVertices(entity, shapeComp);
            collisionComp.cachedVertices = vertices;
            collisionComp.dirty = false;

            return vertices;
        }
        return SAT.rectToVertices(entity, shapeComp);
    }
    // ─── Shape helpers ─────────────────────────────────────────────

    /**
     * Convert a rect entity into 4 world-space vertices
     * Supports rotation via entity.transform.rotation (radians)
     */
    static rectToVertices(entity: Entity, shape: ShapeComponent) {
        const pos = entity.transform.pos;
        const hw = shape.width / 2;
        const hh = shape.height / 2;
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
    static projectPolygon(vertices: Vector[], axis: Vector) {
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
    static projectCircle(center: Vector, radius: number, axis: Vector) {
        const dot = Vector.dot(center, axis);
        return { min: dot - radius, max: dot + radius };
    }

    // ─── Axis helpers ──────────────────────────────────────────────

    /**
     * Get face normals for a polygon — these are the SAT axes to test
     * Each edge (v1→v2) has a perpendicular normal
     */
    static getAxes(vertices: Vector[]) {
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
    static getClosestVertexAxis(vertices: Vector[], circleCenter: Vector) {
        let minDist = Infinity;
        let closest = null;

        for (const v of vertices) {
            const dist = Vector.dist(circleCenter, v);
            if (dist < minDist) {
                minDist = dist;
                closest = v;
            }
        }
        if (!closest) {
            return new Vector(1, 0);
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
    static getOverlap(projA: PolygonProjType, projB: PolygonProjType) {
        const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
        return overlap > 0 ? overlap : null;
    }

    // ─── Collision tests ───────────────────────────────────────────

    static circleCircle(e1: Entity, s1: ShapeComponent, e2: Entity, s2: ShapeComponent) {
        const pos1 = e1.transform.pos;
        const pos2 = e2.transform.pos;
        const radius1 = s1.radius || 16;  // ✅ flat property
        const radius2 = s2.radius || 16;

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = radius1 + radius2;

        if (dist >= minDist) return null;

        const len = dist > 0 ? dist : 1;
        const normal = new Vector(dx / len, dy / len);
        return { normal, depth: minDist - dist };
    }

    static polygonPolygon(vertsA: Vector[], vertsB: Vector[]) {
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

        const dot = Vector.dot(dir, minAxis ?? new Vector(0, 0));
        if (dot < 0 && minAxis) {
            minAxis = new Vector(-minAxis.x, -minAxis.y);
        }

        return { normal: minAxis, depth: minDepth };
    }

    static circlePolygon(eCircle: Entity, rCircle: ShapeComponent, polyVerts: Vector[]) {  // ✅ removed unused eRect param
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
        const minAx = minAxis ?? new Vector(0, 0)
        const dot = dir.x * minAx.x + dir.y * minAx.y;
        if (dot < 0) {
            minAxis = new Vector(-minAx.x, -minAx.y);  // ✅ new Vector, not .scale(-1)
        }

        return { normal: minAxis, depth: minDepth };
    }

    // ─── Utility ───────────────────────────────────────────────────

    static polygonCenter(vertices: Vector[]) {
        const sum = vertices.reduce(
            (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
            { x: 0, y: 0 }
        );
        return new Vector(sum.x / vertices.length, sum.y / vertices.length);
    }
}