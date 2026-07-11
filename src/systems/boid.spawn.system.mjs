import { BoidComponent } from "../components/boid.component.mjs";
import { CollisionComponent } from "../components/collision.component.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { ShapeComponent } from "../components/shape.component.mjs";
import { Transform } from "../components/transform.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { EventBus } from "../game/eventBus.mjs";
import { Prefabs } from "../utils/prefabs.mjs";
import { Vector } from "../utils/vector.mjs";




export class BoidSpawnSystem {
    /**
     * 
     * @param {World} world 
     * @param {EventBus} events
     */
    constructor(world, events) {
        this.world = world;
        this.events = events;
        this.spawned = false;
        this.shouldSpawnBoids = true;
        this.totalBoids = 100;


        this.events.on('respawnBoids', () => {
            const dungeons = this.world.query('DungeonComponent');
            const firstDungeon = dungeons[0]
            const boids = this.world.query('BoidComponent');

            const dungeonComponent = firstDungeon.getComponent('DungeonComponent')

            const firstCell = dungeonComponent.cells[0];

            const firstRoom = this.world.getEntity('room_floor_' + firstCell.id);
            const pos = firstRoom.transform.pos;
            const snakes = Prefabs.enemySnakes(this.world, 'snakeEnemy', null, 5);

            for (const boid of boids) {
                if (boid.id !== 'player' && boid.id !== 'snake-enemy') {
                    this.world.destory(boid.id);
                }
            }
            this.spawnBoidsInRooms(firstDungeon);
            snakes.forEach((snake, index) => {
                const p = new Vector(pos.x + (index * 30), pos.y + (index * 30));
                snake.transform = new Transform({ pos: p, size: new Vector(1, 1) });
            });
        })
        this.events.on('dungeonGenerated', () => {
            this.shouldSpawnBoids = true;
        })


    }



    update(dt) {
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
    spawnBoidsInRooms(dungeon) {


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
    spawnSingleBoid(floor, render) {

        const boid = this.world.createEntity();


        boid.transform = new Transform({
            pos: new Vector(
                floor.transform.pos.x + (Math.random() - 0.5) * render.width * 0.8,
                floor.transform.pos.y + (Math.random() - 0.5) * render.height * 0.8
            ),
            size: new Vector(1, 1),
            rotation: 0
        });


        boid.addComponent(new RenderComponent({ zIndex: 200, color: "lightblue", type: "rat" }));

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


        boid.addComponent(new BoidComponent());
        boid.addComponent(new CollisionComponent({ isStatic: false, mask: ['wall', 'snake'], dungeonBound: true }));
        boid.addComponent(new ShapeComponent({ type: 'rect', width: 30, height: 30 }));
    }
}