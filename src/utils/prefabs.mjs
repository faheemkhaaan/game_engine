/**
 * Prefabs.mjs
 *
 * Factory functions for every recurring entity archetype in the game.
 * Each function returns a fully built Entity with all required components.
 *
 * WHY PREFABS ON TOP OF EntityBuilder?
 *  EntityBuilder gives you a fluent, type-safe way to assemble arbitrary
 *  entities. Prefabs go one level higher: they encode your game's specific
 *  design decisions (wall thickness, default colors, physics presets) so
 *  that DungeonSystem / BoidSpawnSystem etc. just call Prefabs.wall(...)
 *  rather than rebuilding that knowledge from scratch every time.
 */

import { EntityBuilder } from '../core/entity-builder.mjs';
import { randomColor } from './random-color-generator.mjs';
import { Vector } from './vector.mjs';


const WALL_COLOR = '#5a5a5a';
const FLOOR_COLOR = '#1e222a';

export const Prefabs = {

    // ─── Dungeon ──────────────────────────────────────────────────────────────

    /**
     * Solid wall segment (static physics + collision, rendered rect).
     * @param {import('../core/world.mjs').World} world
     * @param {string} id
     * @param {number} cx  Centre X
     * @param {number} cy  Centre Y
     * @param {number} w   Width
     * @param {number} h   Height
     */
    wall(world, id, cx, cy, w, h) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: WALL_COLOR })
            .withStaticPhysics({ restitution: 1 })
            .withStaticCollision()
            .build();
    },

    /**
     * Room / hall floor tile (visual only – no physics, no collision).
     */
    floor(world, id, cx, cy, w, h) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: FLOOR_COLOR, zIndex: -1 })
            .build();
    },
    walls(world, id, cx, cy, w, h) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: randomColor(), zIndex: -2 })
            .withStaticPhysics({ restitution: 1 })
            .withStaticCollision()
            .build();
    },

    dungeon(world, w, h, id = 'dungeon' + Math.random().toString(36)) {
        return new EntityBuilder(world, id)
            .at(0, 0, 0)
            .withDungeon(w, h)
            .build();
    },

    // ─── Creatures ────────────────────────────────────────────────────────────

    /**
     * Player snake head.
     * Physics + collision + snake logic.  Renderer uses transparent circle so
     * SnakeSkinSystem draws the actual visuals.
     */
    player(world, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: 'rgba(155,255,255,1)' })
            .withPhysics({ maxSpeed: 700, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision()
            // .withSnake()
            .build();
    },

    /**
     * Enemy snake (boid-driven).
     */
    enemySnake(world, id, pos = new Vector(0, 0)) {
        return new EntityBuilder(world, id)
            .at(100, 100)
            .asCircle(12)
            .withRender({ color: 'green', zIndex: 100 })
            .withPhysics({
                maxSpeed: 800,
                mass: 1,
                drag: 1,
                velocity: new Vector(
                    (Math.random() - 0.5) * 1300,
                    (Math.random() - 0.5) * 1300,
                ),
            })
            .withSnake()
            .withCollision()
            .withBoid()
            .build();
    },

    enemySnakes(world, id, pos = new Vector(0, 0), count = 10) {
        const snakes = [];

        for (let i = 0; i < count; i++) {
            const color = randomColor();
            snakes.push(
                new EntityBuilder(world, `${id}-${i}`)
                    .at(100, 100)
                    .asCircle(12)
                    .withRender({ color, zIndex: 100 })
                    .withPhysics({
                        maxSpeed: 800,
                        mass: 1,
                        drag: 1,
                        velocity: new Vector(
                            (Math.random() - 0.5) * 1300,
                            (Math.random() - 0.5) * 1300,
                        ),
                    })
                    .withSnake()
                    .withCollision()
                    .withBoid()
                    .build()
            )
        }
        return snakes;

    },

    /**
     * Boid flocking unit.
     */
    boid(world, pos = new Vector(0, 0)) {
        return new EntityBuilder(world)
            .at(pos.x, pos.y)
            .asRect(30, 30)
            .withRender({ color: 'lightblue', zIndex: 200 })
            .withPhysics({
                velocity: new Vector(
                    (Math.random() - 0.5) * 1300,
                    (Math.random() - 0.5) * 1300,
                ),
                mass: 2,
                maxSpeed: 800,
                drag: 1,
                restitution: 1,
            })
            .withBoid()
            .build();
    },

    /**
     * Snake body segment (invisible physics node; SnakeSkinSystem renders it).
     */
    snakeSegment(world, id, pos, radius) {
        return new EntityBuilder(world, id)
            .at(pos.x, pos.y)
            .asCircle(radius * 1.3)
            .withRender({ color: 'rgba(0,0,0,0)', zIndex: 3000 })
            .withPhysics({
                mass: 1,
                velocity: new Vector(
                    0,
                    0,
                ),
                restitution: 1
            })
            .withCollision({ mask: ['wall'] })
            .build();
    },
};