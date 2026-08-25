import { Vector } from "./vector";

/**
 * Simple 2D FABRIK solver.
 *
 * @param initialJoints Starting joint positions.
 * @param lengths Bone lengths. For 3 joints, this has 2 lengths.
 * @param root Fixed root position, usually the hip.
 * @param target Desired end effector position, usually the foot.
 * @param iterations Solver iterations.
 */
export function solveFABRIK(
    initialJoints: any[],
    lengths: number[],
    root: any,
    target: any,
    iterations: number = 10
): any[] {
    const pts: any[] = initialJoints.map((p: any) => new Vector(p.x, p.y));

    const totalLength: number = lengths.reduce((a, b) => a + b, 0);

    const rootPoint = new Vector(root.x, root.y);
    const targetPoint = new Vector(target.x, target.y);

    const rootToTarget = Vector.sub(targetPoint, rootPoint);
    const distance = rootToTarget.mag();

    // Unreachable target: stretch straight toward target.
    if (distance > totalLength) {
        pts[0] = rootPoint;

        const dir =
            distance > 0.0001
                ? Vector.scale(rootToTarget, 1 / distance)
                : new Vector(1, 0);

        for (let i = 0; i < lengths.length; i++) {
            pts[i + 1] = Vector.add(pts[i], Vector.scale(dir, lengths[i]));
        }

        return pts;
    }

    for (let iter = 0; iter < iterations; iter++) {
        // Backward reaching pass.
        pts[pts.length - 1] = targetPoint;

        for (let i = pts.length - 2; i > 0; i--) {
            const v = Vector.sub(pts[i], pts[i + 1]);
            const len = v.mag();

            if (len < 0.0001) continue;

            const dir = Vector.scale(v, 1 / len);
            pts[i] = Vector.add(pts[i + 1], Vector.scale(dir, lengths[i]));
        }

        // Forward reaching pass.
        pts[0] = rootPoint;

        for (let i = 0; i < pts.length - 1; i++) {
            const v = Vector.sub(pts[i + 1], pts[i]);
            const len = v.mag();

            if (len < 0.0001) continue;

            const dir = Vector.scale(v, 1 / len);
            pts[i + 1] = Vector.add(pts[i], Vector.scale(dir, lengths[i]));
        }
    }

    return pts;
}