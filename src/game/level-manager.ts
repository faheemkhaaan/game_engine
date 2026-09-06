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
import { DungeonComponent } from "../components/dungeon.component";
import { BoidComponent } from "../components/boid.component";
import { PhysicsSystem } from "../systems/physics.system";
import { PlayerControlSystem } from "../systems/player-control.system";
import { DungeonSystem } from "../systems/dungeon.system";
import { CollisionSystem } from "../systems/collision.system";
import { BoidSystem } from "../systems/boid.system";
import { SnakeSkeletonSystem } from "../systems/snake-skeleton.system";
import { SnakeSkinSystem } from "../systems/snake-skin.system";
import { RendererSystem } from "../systems/renderer.system";
import { LizardSystem } from "../systems/lizard.system";
import { MinimapSystem } from "../systems/minimap.system";
import { CollisionDebugSystem } from "../systems/debug.system";
import { CentipedeSystem } from "../systems/centipede.system";

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
    private systemsInitialized: boolean = false;

    public onLevelReady: ((player: Entity, currentIndex: number | null, config: LevelConfig) => void) | null;
    public onPlayerSelected: ((world: World, pos: Vector) => Entity) | null = null;
    constructor(engine: GameEngine) {
        this.engine = engine;
        this.world = engine.world;
        this.events = engine.eventBus;
        this.boidSpawnSystem = engine.getSystem(BoidSpawnSystem) as BoidSpawnSystem;

        this.currentLevelIndex = null;
        this.currentLevelConfig = null;

        /** Called once the player + enemies exist and the level is ready to play. */
        this.onLevelReady = null;


        this.events.on('dungeonGenerated', () => this.handleDungeonGenerated());
        this.setupSystem()
    }

    setupSystem() {
        if (this.systemsInitialized) return;
        this.systemsInitialized = true;

        const physicsSystem = new PhysicsSystem(this.engine.world);
        const boidSpawnSystem = new BoidSpawnSystem(this.world, this.engine.eventBus, { mouseCountPerRoom: 10 });
        const playerControlSystem = new PlayerControlSystem(this.world, this.events, physicsSystem, this.engine.inputs);
        this.boidSpawnSystem = boidSpawnSystem;

        this.engine.inputs.mapActions('attack', 'Space');
        this.engine.inputs.mapActions('jump', 'Space');
        this.engine.inputs.mapActions('move_up', 'KeyW');
        this.engine.inputs.mapActions('move_right', 'KeyD');
        this.engine.inputs.mapActions('move_left', 'KeyA');
        this.engine.inputs.mapActions('move_down', 'KeyS');
        this.engine.inputs.mapActions('enableDebug', 'KeyP');
        this.engine.inputs.mapActions('enableMinMap', 'KeyM');
        this.engine.inputs.mapActions('enableDungeonGeneration', 'KeyG');
        this.engine.inputs.mapActions('enableCollision', 'KeyC');
        this.engine.inputs.mapActions('respawnBoids', 'KeyR');
        // this.engine.eventBus.on('mousedown', (loc: Vector) => {
        //     const worldPos = this.engine.camera.canvasToWorld(loc);
        // });

        this.engine.addSystem(new DungeonSystem(this.world, this.events, this.engine.canvas.width, this.engine.canvas.height));
        this.engine.addSystem(physicsSystem);
        this.engine.addSystem(new CollisionSystem(this.world, this.events));
        this.engine.addSystem(boidSpawnSystem);
        this.engine.addSystem(new BoidSystem(this.world, this.events));
        this.engine.addSystem(playerControlSystem);
        this.engine.addSystem(new SnakeSkeletonSystem(this.world, this.events));
        this.engine.addSystem(new SnakeSkinSystem(this.world, this.events));
        this.engine.addSystem(new LizardSystem(this.world, this.events));
        this.engine.addSystem(new CentipedeSystem(this.world, this.events));
        this.engine.addSystem(new RendererSystem(this.world, this.engine.ctx!, this.engine.camera));
        this.engine.addSystem(new MinimapSystem(this.world, this.events, this.engine.ctx as CanvasRenderingContext2D));
        this.engine.addSystem(new CollisionDebugSystem(this.world, this.events, this.engine.ctx as CanvasRenderingContext2D, this.engine.camera, this.engine.clock));

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
        this.setupSystem()
        this.boidSpawnSystem.totalBoids = config.mouseCountPerRoom;
        this.boidSpawnSystem.enemySnakeCount = config.enemySnakeCount;
        this.boidSpawnSystem.spawned = false;

        // DungeonSystem listens for this and rebuilds at the given size;
        // it emits 'dungeonGenerated' once rooms/halls actually exist.
        this.engine.start();
        this.events.emit('enableDungeonGeneration', config);
    }

    clearLevelEntities() {
        this.world.clearEntities()
    }




    handleDungeonGenerated() {
        // Ignore regenerations not triggered by us (e.g. the debug KeyG binding).
        if (this.currentLevelConfig === null) return;

        const dungeonEntity = this.world.query(DungeonComponent)[0];
        if (!dungeonEntity) return;
        const dungeonComponent = dungeonEntity.getComponent(DungeonComponent);
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

        let player: Entity | null = null;
        if (this.onPlayerSelected) {
            player = this.onPlayerSelected(this.world, pos);
        }
        const enemySnakes = Prefabs.enemySnakes(this.world, 'snakeEnemy', new Vector(0, 0), this.currentLevelConfig.enemySnakeCount);
        enemySnakes.forEach((snake, index) => {
            snake.transform = new Transform({
                pos: new Vector(pos.x + (index * 30), pos.y + (index * 30)),
                size: new Vector(1, 1),
                rotation: 0
            });
        });


        if (player) this.engine.camera.follow(player);

        this.events.emit('levelReady', player)

        if (this.onLevelReady && player) {
            this.onLevelReady(player, this.currentLevelIndex, this.currentLevelConfig);
        }
    }
}