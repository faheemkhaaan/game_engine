import { BoidComponent } from "../components/boid.component.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { Transform } from "../components/transform.mjs";
import { Entity } from "../core/entity.mjs";
import { World } from "../core/world.mjs";
import { Vector } from "../utils/vector.mjs";




export class BoidSpawnSystem {
    /**
     * 
     * @param {World} world 
     */
    constructor(world) {
        this.world = world;
        this.spawned = false;
    }



    update(dt) {

        const dungeon = this.world.query('DungeonComponent');

        if (!this.spawned && dungeon.length > 0) {
            console.log(dungeon[0])
            this.spawnBoidsInRooms(dungeon[0]);
            this.spawned = true;
        }
    }


    /**
     * 
     * @param {DungeonComponent} dungeon 
     */
    spawnBoidsInRooms(dungeon) {


        const dungeonComponent = dungeon.getComponent('DungeonComponent')

        for (const cell of dungeonComponent.cells) {

            // if (Math.random() > 0.4) continue;

            const floor = this.world.getEntity('room_floor_' + cell.id);

            if (!floor) continue;


            const render = floor.getComponent('RenderComponent');

            // const count = Math.floor(Math.random() * 20) + 10;
            const count = 40

            for (let i = 0; i < count; i++) {
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


        boid.addComponent(new RenderComponent({ type: 'rect', width: 30, height: 30, zIndex: 200, color: "lightblue" }));

        boid.addComponent(new PhysicsComponent({
            velocity: new Vector(
                (Math.random() - 0.5) * 1300,
                (Math.random() - 0.5) * 1300
            ),
            aceleration: new Vector(1, 1),
            mass: 1,
            maxSpeed: 150,
            drag: 1,
            isStatic: false
        }));


        boid.addComponent(new BoidComponent());

    }
}