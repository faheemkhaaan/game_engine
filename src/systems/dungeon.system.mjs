import { CellComponent } from "../components/cell.component.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { Transform } from "../components/transform.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { GameEngine } from "../game/game.mjs";
import { SpatialGrid } from "../utils/spatial-grid.mjs";
import { Vector } from "../utils/vector.mjs";



export class DungeonSystem {
    /** @type {World}   */
    world
    /** @type {EventBus} */
    events
    /** @type {GameEngine} */
    engine
    /**
     * @param {World} world
     * @param {EventBus} events
     */
    constructor(world, events) {
        this.world = world;
        this.events = events;
        this.dungenGenerated = false;
    }

    update(dt) {

        const dungeonEntities = this.world.query('DungeonComponent');

        if (!this.dungenGenerated && dungeonEntities) {
            for (const entity of dungeonEntities) {
                const dungenComponent = entity.getComponent('DungeonComponent');
                if (dungenComponent) {
                    this.divide(dungenComponent);
                    this.getNeighbours(dungenComponent);
                    this.shrink(dungenComponent);
                    this.addHalls(dungenComponent);
                }
            }
            this.dungenGenerated = true;
            this.events.emit('dungeonGenerated', this.dungenGenerated);
        }

    }
    /**
   * @param {DungeonComponent} dungenComponent
   */
    addHalls(dungenComponent) {
        const hallWidth = 60 * Math.floor(DungeonComponent.scaler * 0.5);
        const wallThickness = 20;

        for (const c1 of dungenComponent.cells) {
            const floor1 = this.world.getEntity('room_floor_' + c1.id);
            if (!floor1) continue;
            const r1 = floor1.getComponent("RenderComponent");

            // Visual bounds of Room 1
            const r1MinX = floor1.transform.pos.x - r1.width / 2;
            const r1MaxX = floor1.transform.pos.x + r1.width / 2;
            const r1MinY = floor1.transform.pos.y - r1.height / 2;
            const r1MaxY = floor1.transform.pos.y + r1.height / 2;

            // --- 1. VERTICAL NEIGHBORS (c2 sits BELOW c1) ---
            for (const c2 of c1.vNeighbours) {
                if (c1.bottomRight.y !== c2.topLeft.y) continue;

                const floor2 = this.world.getEntity('room_floor_' + c2.id);
                if (!floor2) continue;
                const r2 = floor2.getComponent("RenderComponent");

                // Visual bounds of Room 2
                const r2MinX = floor2.transform.pos.x - r2.width / 2;
                const r2MaxX = floor2.transform.pos.x + r2.width / 2;
                const r2MinY = floor2.transform.pos.y - r2.height / 2;

                // CRITICAL: Calculate overlap based on the VISUAL ROOM boundaries, not structural grid boundaries
                const overlapMinX = Math.max(r1MinX, r2MinX);
                const overlapMaxX = Math.min(r1MaxX, r2MaxX);
                const overlapWidth = overlapMaxX - overlapMinX;

                // Only spawn if the actual rooms visually line up enough to fit the hallway
                if (overlapWidth > hallWidth) {
                    const centerX = overlapMinX + (overlapWidth / 2);
                    const hallX = centerX - (hallWidth / 2);

                    const startY = r1MaxY;
                    const endY = r2MinY;
                    const hallHeight = endY - startY;
                    const centerY = startY + (hallHeight / 2);

                    if (hallHeight <= 0) continue; // Skip if rooms visually overlap/touch

                    // Spawn Hallway Floor
                    const hallFloor = this.world.createEntity(`hall_floor_${c1.id}_to_${c2.id}`);
                    hallFloor.transform = new Transform({ pos: new Vector(centerX, centerY - wallThickness), size: new Vector(1, 1) });
                    hallFloor.addComponent(new RenderComponent({ width: hallWidth, height: hallHeight + wallThickness * 4, type: 'rect', color: '#2f2341', zIndex: -1 }));

                    // Spawn Left Wall
                    const leftWall = this.world.createEntity(`hall_wall_l_${c1.id}_to_${c2.id}`);
                    leftWall.transform = new Transform({ pos: new Vector(hallX + (wallThickness / 2), centerY), size: new Vector(1, 1) });
                    leftWall.addComponent(new RenderComponent({ width: wallThickness, height: hallHeight + wallThickness * 2, type: 'rect', color: '#5a5a5a' }));
                    leftWall.addComponent(new PhysicsComponent({ isStatic: true }));

                    // Spawn Right Wall
                    const rightWall = this.world.createEntity(`hall_wall_r_${c1.id}_to_${c2.id}`);
                    rightWall.transform = new Transform({ pos: new Vector(hallX + hallWidth - (wallThickness / 2), centerY), size: new Vector(1, 1) });
                    rightWall.addComponent(new RenderComponent({ width: wallThickness, height: hallHeight + wallThickness * 2, type: 'rect', color: '#5a5a5a' }));
                    rightWall.addComponent(new PhysicsComponent({ isStatic: true }));

                    // Split C1's Bottom Wall (Horizontal cut along X: between hallX and hallX + hallWidth)
                    this.splitWall('wall_bottom_' + c1.id, hallX, hallX + hallWidth, false, wallThickness);

                    // Split C2's Top Wall (Horizontal cut along X: between hallX and hallX + hallWidth)
                    this.splitWall('wall_top_' + c2.id, hallX, hallX + hallWidth, false, wallThickness);

                }
            }

            // --- 2. HORIZONTAL NEIGHBORS (c2 sits to the RIGHT of c1) ---
            for (const c2 of c1.hNeighbours) {
                if (c1.bottomRight.x !== c2.topLeft.x) continue;

                const floor2 = this.world.getEntity('room_floor_' + c2.id);
                if (!floor2) continue;
                const r2 = floor2.getComponent("RenderComponent");

                // Visual bounds of Room 2
                const r2MinY = floor2.transform.pos.y - r2.height / 2;
                const r2MaxY = floor2.transform.pos.y + r2.height / 2;
                const r2MinX = floor2.transform.pos.x - r2.width / 2;

                // CRITICAL: Calculate overlap based on the VISUAL ROOM boundaries, not structural grid boundaries
                const overlapMinY = Math.max(r1MinY, r2MinY);
                const overlapMaxY = Math.min(r1MaxY, r2MaxY);
                const overlapHeight = overlapMaxY - overlapMinY;

                if (overlapHeight > hallWidth) {
                    const centerY = overlapMinY + (overlapHeight / 2);
                    const hallY = centerY - (hallWidth / 2);

                    const startX = r1MaxX;
                    const endX = r2MinX;
                    const hallWidthSegment = endX - startX;
                    const centerX = startX + (hallWidthSegment / 2);

                    if (hallWidthSegment <= 0) continue; // Skip if rooms visually overlap/touch

                    // Spawn Hallway Floor
                    const hallFloor = this.world.createEntity(`hall_floor_${c1.id}_to_${c2.id}`);
                    hallFloor.transform = new Transform({ pos: new Vector(centerX, centerY), size: new Vector(1, 1) });
                    hallFloor.addComponent(new RenderComponent({ width: hallWidthSegment + wallThickness * 4, height: hallWidth, type: 'rect', color: '#2f2341', zIndex: -1 }));

                    // Spawn Top Wall
                    const topWall = this.world.createEntity(`hall_wall_t_${c1.id}_to_${c2.id}`);
                    topWall.transform = new Transform({ pos: new Vector(centerX, hallY + (wallThickness / 2)), size: new Vector(1, 1) });
                    topWall.addComponent(new RenderComponent({ width: hallWidthSegment + wallThickness * 2, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
                    topWall.addComponent(new PhysicsComponent({ isStatic: true }));

                    // Spawn Bottom Wall
                    const bottomWall = this.world.createEntity(`hall_wall_b_${c1.id}_to_${c2.id}`);
                    bottomWall.transform = new Transform({ pos: new Vector(centerX, hallY + hallWidth - (wallThickness / 2)), size: new Vector(1, 1) });
                    bottomWall.addComponent(new RenderComponent({ width: hallWidthSegment + wallThickness * 2, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
                    bottomWall.addComponent(new PhysicsComponent({ isStatic: true }));

                    this.splitWall('wall_right_' + c1.id, hallY, hallY + hallWidth, true, wallThickness);

                    // Split C2's Left Wall (Vertical cut along Y: between hallY and hallY + hallWidth)
                    this.splitWall('wall_left_' + c2.id, hallY, hallY + hallWidth, true, wallThickness);
                }
            }
        }
    }
    /**
 * Splits an existing room wall to carve a path for a hallway.
 * @param {string} oldWallId The entity ID of the room wall to destroy and split.
 * @param {number} hallStart The minimum coordinate along the cutting axis where the hall begins.
 * @param {number} hallEnd The maximum coordinate along the cutting axis where the hall ends.
 * @param {boolean} isVerticalWall True if splitting a Left/Right wall (Y-axis), False if splitting a Top/Bottom wall (X-axis).
 * @param {number} wallThickness Thickness of the room walls.
 */
    splitWall(oldWallId, hallStart, hallEnd, isVerticalWall, wallThickness) {
        const oldWall = this.world.getEntity(oldWallId);
        if (!oldWall) return;

        const render = oldWall.getComponent("RenderComponent");
        const pos = oldWall.transform.pos;



        if (!isVerticalWall) {
            // --- SPLITTING A HORIZONTAL WALL (Top/Bottom Walls running along X-axis) ---
            const wallMinX = pos.x - render.width / 2;
            const wallMaxX = pos.x + render.width / 2;

            // Segment A: Left side of the doorway
            const widthA = hallStart - wallMinX;
            if (widthA > 5) { // Avoid creating micro-artifacts
                const centerXA = wallMinX + widthA / 2;
                const partA = this.world.createEntity(`${oldWallId}_split_left`);
                partA.transform = new Transform({ pos: new Vector(centerXA, pos.y), size: new Vector(1, 1) });
                partA.addComponent(new RenderComponent({ width: widthA, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
                partA.addComponent(new PhysicsComponent({ isStatic: true }));
            }

            // Segment B: Right side of the doorway
            const widthB = wallMaxX - hallEnd;
            if (widthB > 5) {
                const centerXB = hallEnd + widthB / 2;
                const partB = this.world.createEntity(`${oldWallId}_split_right`);
                partB.transform = new Transform({ pos: new Vector(centerXB, pos.y), size: new Vector(1, 1) });
                partB.addComponent(new RenderComponent({ width: widthB, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
                partB.addComponent(new PhysicsComponent({ isStatic: true }));
            }
        } else {
            // --- SPLITTING A VERTICAL WALL (Left/Right Walls running along Y-axis) ---
            const wallMinY = pos.y - render.height / 2;
            const wallMaxY = pos.y + render.height / 2;

            // Segment A: Top side of the doorway
            const heightA = hallStart - wallMinY;
            if (heightA > 5) {
                const centerYA = wallMinY + heightA / 2;
                const partA = this.world.createEntity(`${oldWallId}_split_top`);
                partA.transform = new Transform({ pos: new Vector(pos.x, centerYA), size: new Vector(1, 1) });
                partA.addComponent(new RenderComponent({ width: wallThickness, height: heightA, type: 'rect', color: '#5a5a5a' }));
                partA.addComponent(new PhysicsComponent({ isStatic: true }));
            }

            // Segment B: Bottom side of the doorway
            const heightB = wallMaxY - hallEnd;
            if (heightB > 5) {
                const centerYB = hallEnd + heightB / 2;
                const partB = this.world.createEntity(`${oldWallId}_split_bottom`);
                partB.transform = new Transform({ pos: new Vector(pos.x, centerYB), size: new Vector(1, 1) });
                partB.addComponent(new RenderComponent({ width: wallThickness, height: heightB, type: 'rect', color: '#5a5a5a' }));
                partB.addComponent(new PhysicsComponent({ isStatic: true }));
            }
        }
        this.world.destory(oldWallId);

    }
    /**
     * 
     * @param {DungeonComponent} dungenComponent 
     */
    shrink(dungenComponent) {

        for (const cell of dungenComponent.cells) {
            const topLeft = new Vector(
                cell.topLeft.x + Math.floor(cell.width * 0.4 * (Math.random() * 0.5 + 0.3)),
                cell.topLeft.y + Math.floor(cell.height * 0.4 * (Math.random() * 0.5 + 0.3))
            );
            const bottomRight = new Vector(
                cell.bottomRight.x - Math.floor(cell.width * 0.4 * (Math.random() * 0.5 + 0.3)),
                cell.bottomRight.y - Math.floor(cell.height * 0.4 * (Math.random() * 0.5 + 0.3))
            );

            const width = bottomRight.x - topLeft.x;
            const height = bottomRight.y - topLeft.y;
            const center = new Vector(topLeft.x + width / 2, topLeft.y + height / 2);

            const wallThickness = 20;

            // Floor (visual only, no physics, so player can walk on it)
            const floor = this.world.createEntity('room_floor_' + cell.id);
            floor.transform = new Transform({ pos: center, size: new Vector(1, 1) });
            floor.addComponent(new RenderComponent({ width, height, type: 'rect', color: '#2f2341', zIndex: -1 }));

            // Top Wall
            const topWall = this.world.createEntity('wall_top_' + cell.id);
            topWall.transform = new Transform({ pos: new Vector(center.x, topLeft.y + wallThickness / 2), size: new Vector(1, 1) });
            topWall.addComponent(new RenderComponent({ width: width, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
            topWall.addComponent(new PhysicsComponent({ isStatic: true }));

            // Bottom Wall
            const bottomWall = this.world.createEntity('wall_bottom_' + cell.id);
            bottomWall.transform = new Transform({ pos: new Vector(center.x, bottomRight.y - wallThickness / 2), size: new Vector(1, 1) });
            bottomWall.addComponent(new RenderComponent({ width: width, height: wallThickness, type: 'rect', color: '#5a5a5a' }));
            bottomWall.addComponent(new PhysicsComponent({ isStatic: true }));

            // Left Wall
            const leftWall = this.world.createEntity('wall_left_' + cell.id);
            leftWall.transform = new Transform({ pos: new Vector(topLeft.x + wallThickness / 2, center.y), size: new Vector(1, 1) });
            leftWall.addComponent(new RenderComponent({ width: wallThickness, height: height, type: 'rect', color: '#5a5a5a' }));
            leftWall.addComponent(new PhysicsComponent({ isStatic: true }));

            // Right Wall
            const rightWall = this.world.createEntity('wall_right_' + cell.id);
            rightWall.transform = new Transform({ pos: new Vector(bottomRight.x - wallThickness / 2, center.y), size: new Vector(1, 1) });
            rightWall.addComponent(new RenderComponent({ width: wallThickness, height: height, type: 'rect', color: '#5a5a5a' }));
            rightWall.addComponent(new PhysicsComponent({ isStatic: true }));
        }
    }
    /**
     * 
     * @param {DungeonComponent} dungeonComponent 
     */
    getNeighbours(dungeonComponent) {
        const root = dungeonComponent.root;
        const spatialGrid = new SpatialGrid(root);

        for (const cellA of spatialGrid.cells) {
            // 1. Find Horizontal Neighbours (checking the RIGHT edge of cellA)
            // We sample the spatial grid just along the right edge of cellA
            const potentialHNeighbours = new Set();
            for (let y = cellA.topLeft.y; y < cellA.bottomRight.y; y += Math.min(50, spatialGrid.cellSize)) {
                const cells = spatialGrid.getPotentialsCells(cellA.bottomRight.x, y);
                for (const c of cells) potentialHNeighbours.add(c);
            }

            for (const cellB of potentialHNeighbours) {
                if (cellB === cellA) continue; // Skip self

                // Ensure cellB is physically to the right of cellA and their Y spans overlap
                if (cellA.bottomRight.x === cellB.topLeft.x &&
                    cellA.topLeft.y < cellB.bottomRight.y && cellA.bottomRight.y > cellB.topLeft.y) {

                    if (!cellA.hNeighbours.includes(cellB)) cellA.hNeighbours.push(cellB);
                    if (!cellB.hNeighbours.includes(cellA)) cellB.hNeighbours.push(cellA);
                }
            }

            // 2. Find Vertical Neighbours (checking the BOTTOM edge of cellA)
            // We sample the spatial grid just along the bottom edge of cellA
            const potentialVNeighbours = new Set();
            for (let x = cellA.topLeft.x; x < cellA.bottomRight.x; x += Math.min(50, spatialGrid.cellSize)) {
                const cells = spatialGrid.getPotentialsCells(x, cellA.bottomRight.y);
                for (const c of cells) potentialVNeighbours.add(c);
            }

            for (const cellB of potentialVNeighbours) {
                if (cellB === cellA) continue; // Skip self

                // Ensure cellB is physically below cellA and their X spans overlap
                if (cellA.bottomRight.y === cellB.topLeft.y &&
                    cellA.topLeft.x < cellB.bottomRight.x && cellA.bottomRight.x > cellB.topLeft.x) {

                    if (!cellA.vNeighbours.includes(cellB)) cellA.vNeighbours.push(cellB);
                    if (!cellB.vNeighbours.includes(cellA)) cellB.vNeighbours.push(cellA);
                }
            }
        }
        dungeonComponent.cells = spatialGrid.cells;

    }
    /**
     * 
     * @param {DungeonComponent} dungenComponent 
     */
    divide(dungenComponent) {
        const root = dungenComponent.root;
        let rooms = 0;
        while (rooms < dungenComponent.minRooms) {
            if (this.divideCell(root, dungenComponent)) {
                rooms++;
            }
        }

    }
    /**
     * 
     * @param {CellComponent} cell 
     * @param {DungeonComponent} dungeonComponent
     */
    divideCell(cell, dungeonComponent) {
        if (cell.width < dungeonComponent.minDimensions || cell.height < dungeonComponent.minDimensions) return false;

        if (cell.left && cell.right) {
            if (Math.random() > 0.5) {
                return this.divideCell(cell.left, dungeonComponent);
            } else {
                return this.divideCell(cell.right, dungeonComponent)
            }
        }

        // split horizontally else split the cell vertically
        if (cell.width > cell.height) {
            const midX = cell.topLeft.x + Math.floor(Math.random() * (cell.width * 0.5) + cell.width * 0.25);
            cell.left = new CellComponent(new Vector(cell.topLeft.x, cell.topLeft.y), new Vector(midX, cell.bottomRight.y));
            cell.right = new CellComponent(new Vector(midX, cell.topLeft.y), new Vector(cell.bottomRight.x, cell.bottomRight.y));
        } else {

            const midY = cell.topLeft.y + Math.floor(Math.random() * (cell.height * 0.5) + cell.height * 0.25);
            cell.left = new CellComponent(new Vector(cell.topLeft.x, cell.topLeft.y), new Vector(cell.bottomRight.x, midY));
            cell.right = new CellComponent(new Vector(cell.topLeft.x, midY), new Vector(cell.bottomRight.x, cell.bottomRight.y));
        }

        return true;
    }
}