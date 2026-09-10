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

import { CentipedeComponent } from '../components/centipede.component';
import { LizardComponent } from '../components/lizard.component';
import { SegmentComponent } from '../components/segment.component';
import { SpiderComponent } from '../components/spider.component';
import { EntityBuilder } from '../core/entity-builder';
import { World } from '../core/world';
import { randomColor } from './random-color-generator';
import { Vector } from './vector';


const WALL_COLOR = '#5a5a5a';
const FLOOR_COLOR = '#1e222a';

export const Prefabs = {

    // ─── Dungeon ──────────────────────────────────────────────────────────────


    wall(world: World, id: string, cx: number, cy: number, w: number, h: number) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: WALL_COLOR })
            .withStaticPhysics({ restitution: 1 })
            .withStaticCollision({ layers: ['walls'], mask: ['player', "snake_segment", 'boid'] })
            .build();
    },

    /**
     * Room / hall floor tile (visual only – no physics, no collision).
     */
    floor(world: World, id: string, cx: number, cy: number, w: number, h: number) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: FLOOR_COLOR, zIndex: -1 })
            .build();
    },
    walls(world: World, id: string, cx: number, cy: number, w: number, h: number) {
        return new EntityBuilder(world, id)
            .at(cx, cy)
            .asRect(w, h)
            .withRender({ color: randomColor(), zIndex: -2 })
            .withStaticPhysics({ restitution: 1 })
            .withStaticCollision({ layers: ['walls'], mask: ["player", "snake_segment", 'boid'], })
            .build();
    },


    dungeon(world: World, w: number, h: number, id = 'dungeon' + Math.random().toString(36), options = {}) {
        return new EntityBuilder(world, id)
            .at(0, 0, 0)
            .withDungeon(w, h, options)
            .build();
    },

    // ─── Creatures ────────────────────────────────────────────────────────────

    /**
     * Player snake head.
     * Physics + collision + snake logic.  Renderer uses transparent circle so
     * SnakeSkinSystem draws the actual visuals.
     */
    player(world: World, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: randomColor(), type: 'lizard' })
            .withPhysics({ maxSpeed: 700, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision({ mask: ["walls"], layers: ['player'] })
            // .with(new SegmentComponent())
            .with(new LizardComponent())
            // .withSnake()
            .build();
    },

    /**
    * Player snake head.
    * Physics + collision + snake logic.  Renderer uses transparent circle so
    * SnakeSkinSystem draws the actual visuals.
    */
    playerSnake(world: World, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: randomColor(), type: 'snake' })
            .withPhysics({ maxSpeed: 500, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision({ mask: ["walls"], layers: ['player'] })
            // .with(new SegmentComponent())
            .withSnake()
            .build();
    },
    /**
        * Player snake head.
        * Physics + collision + snake logic.  Renderer uses transparent circle so
        * SnakeSkinSystem draws the actual visuals.
        */
    playerLizard(world: World, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: randomColor(), type: 'lizard' })
            .withPhysics({ maxSpeed: 500, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision({ mask: ["walls"], layers: ['player'] })
            // .with(new SegmentComponent())
            .with(new LizardComponent())
            .build();
    },
    /**
       * Player snake head.
       * Physics + collision + snake logic.  Renderer uses transparent circle so
       * SnakeSkinSystem draws the actual visuals.
       */
    playerCentipede(world: World, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: randomColor(), type: 'centipede' })
            .withPhysics({ maxSpeed: 500, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision({ mask: ["walls"], layers: ['player'] })
            // .with(new SegmentComponent())
            .with(new CentipedeComponent())
            .build();
    },

    /**
     * Player snake head.
     * Physics + collision + snake logic.  Renderer uses transparent circle so
     * SnakeSkinSystem draws the actual visuals.
     */
    playerSpider(world: World, pos = new Vector(100, 100)) {
        return new EntityBuilder(world, 'player')
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: randomColor(), type: 'spider' })
            .withPhysics({ maxSpeed: 500, mass: 1, restitution: 0.1, gravity: new Vector(0, 0) })
            .withCollision({ mask: ["walls"], layers: ['player'] })
            // .with(new SegmentComponent())
            .with(new SpiderComponent())
            .build();
    },
    /**
     * Enemy snake (boid-driven).
     */
    enemySnake(world: World, id: string, pos = new Vector(0, 0)) {
        return new EntityBuilder(world, id)
            .at(pos.x, pos.y)
            .asCircle(12)
            .withRender({ color: 'green', zIndex: 100, type: "snake", width: 60, height: 60, radius: 0, image: '' })
            .withPhysics({
                maxSpeed: 500,
                mass: 1,
                drag: 1,
                velocity: new Vector(
                    (Math.random() - 0.5) * 1300,
                    (Math.random() - 0.5) * 1300,
                ),
            })
            .withSnake()
            .withCollision({ mask: ['walls'], layers: ['boid'] })
            .withBoid()
            .build();
    },

    enemySnakes(world: World, id: string, pos = new Vector(0, 0), count = 10) {
        const snakes = [];

        for (let i = 0; i < count; i++) {
            const color = randomColor();
            snakes.push(
                // new EntityBuilder(world, `${id}-${i}`)
                //     .at(100, 100)
                //     .asCircle(12)    
                //     .withRender({ color, zIndex: 100 })
                //     .withPhysics({
                //         maxSpeed: 800,
                //         mass: 1,
                //         drag: 1,
                //         velocity: new Vector(
                //             (Math.random() - 0.5) * 1300,
                //             (Math.random() - 0.5) * 1300,
                //         ),
                //     })
                //     .withSnake()
                //     .withCollision()
                //     .withBoid()  
                //     .build()

                Prefabs.enemySnake(world, `${id}+${Math.random()}`, pos)
            )
        }
        return snakes;

    },

    /**
     * Boid flocking unit.
     */
    boid(world: World, pos = new Vector(0, 0)) {
        return new EntityBuilder(world, `boid-${Math.random()}`)
            .at(pos.x, pos.y)
            .asRect(30, 30)
            .withRender({ zIndex: 200, color: "lightblue", type: "rat", width: 50, height: 50, radius: 0, image: "" })
            .withPhysics({
                velocity: new Vector(
                    (Math.random() - 0.5) * 800,
                    (Math.random() - 0.5) * 800
                ),
                aceleration: new Vector(1, 1),
                mass: 2,
                maxSpeed: 300,
                drag: 1,
                restitution: 1
            })
            .withCollision({ mask: ['walls'], layers: ['boid'] })
            .withShape({ type: 'rect', width: 30, height: 30 })
            .withBoid()
            .build();
    },

    /**
     * Snake body segment (invisible physics node; SnakeSkinSystem renders it).
     */
    snakeSegment(world: World, id: string, pos: Vector, radius: number) {
        return new EntityBuilder(world, id)
            .at(pos.x, pos.y)
            .asCircle(radius * 1.3)
            .withRender({ color: 'rgba(0,0,0,0)', zIndex: 3000, height: 0, width: 0, radius, type: 'snake_segment', image: '' })
            .withPhysics({
                mass: 1,
                velocity: new Vector(
                    0,
                    0,
                ),
                restitution: 1
            })
            .withCollision({ mask: ['walls'], layers: ['snake_segment'] })
            .with(new SegmentComponent(10, id))
            .build();
    },
};