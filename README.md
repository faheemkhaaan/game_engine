# 2D Game Engine - Collision Logic (SAT)

This engine uses the **Separating Axis Theorem (SAT)** for robust, rotation-aware collision detection between circles and polygons.

## What is SAT?
The core principle of SAT is simple: **If you can find a line (axis) that separates two shapes, they are not colliding.**

Think of it like a flashlight: if you shine a light from some angle and see a gap between the shadows of two objects on the wall, they aren't touching.

---

## The Step-by-Step Logic

### 1. Generating Axes
We don't need to check every infinite angle. We only check the "normals" (perpendicular directions) of the edges of our shapes.
- **Rectangles**: Have 4 edges, but only 2 unique axes (parallel edges share an axis).
- **Circles**: Need an axis that points from the circle center to the closest vertex on the polygon.

### 2. Projection (The "Shadow")
We project every vertex of a shape onto an axis using the **Dot Product**.
```javascript
projection = (vertex.x * axis.x) + (vertex.y * axis.y)
```
After projecting all vertices, we get a `min` and `max` value. This represents the "shadow" of the shape on that axis.

### 3. Overlap Testing
For every axis:
- Calculate the `min` and `max` for Shape A.
- Calculate the `min` and `max` for Shape B.
- Check if the shadows overlap: `overlap = min(maxA, maxB) - max(minA, minB)`.
- **CRITICAL**: If `overlap <= 0` on **any** axis, we stop. We found a gap! The shapes are NOT colliding.

### 4. Minimum Translation Vector (MTV)
If we checked *all* axes and they *all* had overlaps, the shapes are colliding. 
- We look for the axis that had the **smallest overlap**. 
- This axis is our **Collision Normal**.
- The overlap amount is our **Collision Depth**.
- To fix the collision, we push the objects apart along this Normal by the Depth.

---

## Why use SAT instead of AABB?
1.  **Rotation**: AABB (Axis-Aligned Bounding Boxes) only works if your rectangles never rotate. SAT works at any angle.
2.  **Accuracy**: SAT provides the exact vector needed to push objects apart, preventing "tunneling" or objects getting stuck inside each other.
3.  **Flexibility**: You can use the same logic for triangles, hexagons, or any convex polygon.

## Troubleshooting
- **Flipped Normals**: If objects are being sucked into each other instead of pushed apart, your normal is likely backwards. SAT ensures the normal always points from Shape B toward Shape A.
- **Deep Penetration**: If objects move very fast, they might pass through each other in one frame. This is called "tunneling" and usually requires smaller time steps or "Continuous Collision Detection" (CCD).
