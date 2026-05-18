# Next Steps & TODO Flow

Based on your git history and current optimization analysis, here is the recommended development flow to get your engine to the next level:

### 1. Fix the Boid Spawn Bug (Highest Priority)
- [ ] Open `dungeon.system.mjs` and check how room dimensions/coordinates are stored.
- [ ] In your boid spawner system, fetch the valid `room` bounds (usually `room.x`, `room.y`, `room.width`, `room.height`).
- [ ] Ensure you are generating random boid coordinates *strictly inside* those boundaries (accounting for the boid's own radius so they don't clip into walls instantly).

### 2. Implement the AABB Fast-Path for SAT
- [ ] Update `CollisionSystem.mjs`.
- [ ] Before running the full SAT polygon projection, perform a simple Axis-Aligned Bounding Box (AABB) overlap check.
- [ ] If the AABBs do not overlap, `return false` early and skip the expensive dot-products.

### 3. Cache Physics Vertices
- [ ] In `SAT.mjs` (or your physics component), stop recalculating `rectToVertices` every frame for static objects.
- [ ] Add a `dirty` flag to `PhysicsComponent`. Set it to `true` when the object moves or rotates.
- [ ] Only recalculate and cache vertices when `dirty === true`.

### 4. Merge Collinear Dungeon Walls
- [ ] Create a post-processing step in `DungeonSystem.mjs` after generation.
- [ ] Loop through the static wall entities and find adjacent blocks that form a straight line.
- [ ] Merge them into a single, long Rectangle Entity.
- [ ] Destroy the smaller, redundant wall fragments.

### 5. Complete the Boids Flocking Logic
- [ ] Implement the **Separation** rule (steer to avoid crowding local flockmates).
- [ ] Implement the **Alignment** rule (steer towards the average heading of local flockmates).
- [ ] Implement the **Cohesion** rule (steer to move towards the average position of local flockmates).
- [ ] Hook the boids into the Spatial Grid broadphase so they only check nearby boids, avoiding another O(N²) bottleneck!

### 6. Offscreen Canvas Rendering (Optional but powerful)
- [ ] Instead of iterating through all dungeon tiles in `RendererSystem` every frame, draw the static walls and floors to an offscreen `<canvas>` once when the level is generated.
- [ ] Draw this single pre-rendered canvas background image in your main game loop.
