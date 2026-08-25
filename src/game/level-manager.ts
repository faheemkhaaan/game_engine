import { EntityBuilder } from "../core/entity-builder";
import { Transform } from "../components/transform";
import { Vector } from "../utils/vector";
import { Prefabs } from "../utils/prefabs";
import { randomColor } from "../utils/random-color-generator";
import { getLevel, LevelConfig } from "./level-config";
import { LizardComponent } from "../components/lizard.component.js";
import { GameEngine } from "./game.js";
import { World } from "../core/world.js";
import { BoidSpawnSystem } from "../systems/boid.spawn.system.js";
import { Entity } from "../core/entity.js";

/**
 * LevelManager
 *
 * Owns the "start a level" flow: clears whatever's currently in the world
 * (mice, enemy snakes, the player), asks DungeonSystem to regenerate at the
 * level's size, then — once DungeonSystem reports the dungeon is actually
 * built — spawns the player and enemy snakes into the first room, and
 * hands BoidSpawnSystem the level's mouse density so it repopulates rooms
 * on its own on the next update.
 *
 * This mirrors the one-shot setup that used to live directly in main.mjs,
 * just made repeatable so it can run once per level instead of once per
 * page load.
 */
export class LevelManager {
    public engine: GameEngine;
    public world: World;
    public events: GameEngine['eventBus']
    public boidSpawnSystem: BoidSpawnSystem
    public currentLevelIndex: null | number;
    public currentLevelConfig: null | LevelConfig
    public onLevelReady: ((player: Entity, currentIndex: number | null, config: LevelConfig) => void) | null;
    /** 
     * @param {import('./game.mjs').GameEngine} engine
     * @param {{ boidSpawnSystem: import('../systems/boid.spawn.system.mjs').BoidSpawnSystem }} systems
     */
    constructor(engine: GameEngine, { boidSpawnSystem }: { boidSpawnSystem: BoidSpawnSystem }) {
        this.engine = engine;
        this.world = engine.world;
        this.events = engine.eventBus;
        this.boidSpawnSystem = boidSpawnSystem;

        this.currentLevelIndex = null;
        this.currentLevelConfig = null;

        /** Called once the player + enemies exist and the level is ready to play. */
        this.onLevelReady = null;

        this.events.on('dungeonGenerated', () => this.handleDungeonGenerated());
    }

    /**
     * @param {number} levelIndex
     */
    startLevel(levelIndex: number) {
        const config = getLevel(levelIndex);
        if (!config) {
            console.warn(`[LevelManager] No level at index ${levelIndex}`);
            return;
        }

        this.currentLevelIndex = levelIndex;
        this.currentLevelConfig = config;

        this.clearLevelEntities();

        // Hand the level's density to BoidSpawnSystem *before* the dungeon
        // regenerates, so it's ready by the time 'dungeonGenerated' fires
        // and its own update() spawns mice.
        this.boidSpawnSystem.totalBoids = config.mouseCountPerRoom;
        this.boidSpawnSystem.enemySnakeCount = config.enemySnakeCount;
        this.boidSpawnSystem.spawned = false;

        // DungeonSystem listens for this and rebuilds at the given size;
        // it emits 'dungeonGenerated' once rooms/halls actually exist.
        this.events.emit('enableDungeonGeneration', config);
    }

    clearLevelEntities() {
        const boids = this.world.query('BoidComponent');
        for (const boid of boids) {
            this.world.destory(boid.id);
        }
        if (this.world.getEntity('player')) {
            this.world.destory('player');
        }
    }

    handleDungeonGenerated() {
        // Ignore regenerations not triggered by us (e.g. the debug KeyG binding).
        if (this.currentLevelConfig === null) return;

        const dungeonEntity = this.world.query('DungeonComponent')[0];
        if (!dungeonEntity) return;
        const dungeonComponent = dungeonEntity.getComponent('DungeonComponent');
        const firstCell = dungeonComponent.cells[0];
        if (!firstCell) return;

        const firstRoom = this.world.getEntity('room_floor_' + firstCell.id);
        if (!firstRoom) return;
        const pos = firstRoom.transform.pos;

        // const player = new EntityBuilder(this.world, 'player')
        //     .at(pos.x, pos.y)
        //     .asCircle(12)
        //     .withRender({ color: randomColor() })
        //     .withPhysics({ maxSpeed: 700, mass: 1, restitution: 0.1, gravity: new Vector(0, 0), velocity: new Vector(0, 0) })
        //     .withCollision({ dungeonBound: true })
        //     .withSnake()
        //     .build();

        const player = Prefabs.player(this.world, pos)

        const enemySnakes = Prefabs.enemySnakes(this.world, 'snakeEnemy', new Vector(0, 0), this.currentLevelConfig.enemySnakeCount);
        enemySnakes.forEach((snake, index) => {
            snake.transform = new Transform({
                pos: new Vector(pos.x + (index * 30), pos.y + (index * 30)),
                size: new Vector(1, 1),
                rotation: 0
            });
        });

        this.engine.camera.follow(player);

        if (this.onLevelReady) {
            this.onLevelReady(player, this.currentLevelIndex, this.currentLevelConfig);
        }
    }
}