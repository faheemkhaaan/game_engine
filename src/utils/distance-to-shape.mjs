import { Vector } from "./vector.mjs";

export function distanceToShape(pos, shape, playerPos) {
    if (shape.width !== undefined && shape.height !== undefined) {
        const minX = pos.x - shape.width / 2;
        const maxX = pos.x + shape.width / 2;
        const minY = pos.y - shape.height / 2;
        const maxY = pos.y + shape.height / 2;

        const closestX = Math.max(minX, Math.min(playerPos.x, maxX));
        const closestY = Math.max(minY, Math.min(playerPos.y, maxY));

        return Vector.dist(new Vector(closestX, closestY), playerPos);
    }

    if (shape.radius !== undefined) {
        const centerDist = Vector.dist(pos, playerPos);
        return Math.max(0, centerDist - shape.radius);
    }

    return 0; // unknown shape, don't cull
}