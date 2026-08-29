import { BoidComponent } from "../components/boid.component";
import { CollisionComponent } from "../components/collision.component";
import { PhysicsComponent } from "../components/physics.component";
import { RenderComponent } from "../components/render.component";
import { ShapeComponent } from "../components/shape.component";
import { Transform } from "../components/transform";
import { Entity } from "../core/entity";
import { World } from "../core/world";
import { EventBus } from "../game/eventBus";
import { Prefabs } from "../utils/prefabs";
import { Vector } from "../utils/vector";


type BoidSpawnSystemOptionType = {
    mouseCountPerRoom?: number,
    enemySnakeCount?: number
}

export class BoidSpawnSystem {

    public spawned = false;
    public shouldSpawnBoids = true;
    public totalBoids = 100;
    public enemySnakeCount = 5;

    /**
     * 
     * @param {World} world 
     * @param {EventBus} events
     */
    /**
     * @param {World} world
     * @param {EventBus} events
     * @param {{ mouseCountPerRoom?: number, enemySnakeCount?: number }} [options] level-driven density, overridden per-level by LevelManager
     */
    constructor(private world: World, private events: EventBus, options: BoidSpawnSystemOptionType) {

        this.spawned = false;
        this.shouldSpawnBoids = true;
        this.totalBoids = options.mouseCountPerRoom ?? 100;
        this.enemySnakeCount = options.enemySnakeCount ?? 5;


        this.events.on('respawnBoids', () => {
            const dungeons = this.world.query('DungeonComponent');
            const firstDungeon = dungeons[0]
            const boids = this.world.query('BoidComponent');

            const dungeonComponent = firstDungeon.getComponent('DungeonComponent')

            const firstCell = dungeonComponent.cells[0];

            const firstRoom = this.world.getEntity('room_floor_' + firstCell.id);
            if (!firstRoom) return;
            const pos = firstRoom.transform.pos;
            const snakes = Prefabs.enemySnakes(this.world, 'snakeEnemy', undefined, this.enemySnakeCount);

            for (const boid of boids) {
                if (boid.id !== 'player' && boid.id !== 'snake-enemy') {
                    this.world.destory(boid.id);
                }
            }
            this.spawnBoidsInRooms(firstDungeon);
            snakes.forEach((snake, index) => {
                const p = new Vector(pos.x + (index * 30), pos.y + (index * 30));
                snake.transform = new Transform({ pos: p, size: new Vector(1, 1), rotation: 0 });
            });
        })
        this.events.on('dungeonGenerated', () => {
            this.shouldSpawnBoids = true;
        })


    }



    update(dt: number) {
        if (!this.shouldSpawnBoids) return;
        const dungeon = this.world.query('DungeonComponent');

        if (!this.spawned && dungeon.length > 0) {
            this.spawnBoidsInRooms(dungeon[0]);
            this.spawned = true;
        };
    }


    /**
     * 
     * @param {DungeonComponent} dungeon 
     */
    spawnBoidsInRooms(dungeon: Entity) {


        const dungeonComponent = dungeon.getComponent('DungeonComponent')

        for (const cell of dungeonComponent.cells) {

            // if (Math.random() > 0.6) continue;

            const floor = this.world.getEntity('room_floor_' + cell.id);

            if (!floor) continue;


            const render = floor.getComponent('ShapeComponent');

            // const count = Math.floor(Math.random() * 20) + 10;


            for (let i = 0; i < this.totalBoids; i++) {
                this.spawnSingleBoid(floor, render)
            }
        }
    }


    /**
     * 
     * @param {Entity} floor 
     * @param {RenderComponent} render 
     */
    spawnSingleBoid(floor: Entity, render: RenderComponent) {

        const boid = this.world.createEntity();
        const pos = new Vector(
            floor.transform.pos.x + (Math.random() - 0.5) * render.width * 0.8,
            floor.transform.pos.y + (Math.random() - 0.5) * render.height * 0.8
        );
        // Prefabs.boid(this.world, pos)
        boid.transform = new Transform({
            pos: new Vector(
                floor.transform.pos.x + (Math.random() - 0.5) * render.width * 0.8,
                floor.transform.pos.y + (Math.random() - 0.5) * render.height * 0.8
            ),
            size: new Vector(1, 1),
            rotation: 0
        });



        boid.addComponent(new RenderComponent({ zIndex: 200, color: "lightblue", type: "rat", height: 0, width: 0, image: '', radius: 0 }));

        boid.addComponent(new PhysicsComponent({
            velocity: new Vector(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800
            ),
            aceleration: new Vector(1, 1),
            mass: 2,
            maxSpeed: 400,
            drag: 1,
            restitution: 1
        }));


        boid.addComponent(new BoidComponent({}));
        boid.addComponent(new CollisionComponent({ isStatic: false, mask: ['walls'], layers: ['boid'], broadphaseRadius: 0, isTrigger: true, enabled: false }));
        boid.addComponent(new ShapeComponent({ type: 'rect', width: 30, height: 30 }));
    }
}