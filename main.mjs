import { PhysicsComponent } from "./src/components/physics.component.mjs";
import { RenderComponent } from "./src/components/render.component.mjs";
import { Transform } from "./src/components/transform.mjs";
import { GameEngine } from "./src/game/game.mjs";
import { CollisionSystem } from "./src/systems/collision.system.mjs";
import { PhysicsSystem } from "./src/systems/physics.system.mjs";
import { RendererSystem } from "./src/systems/renderer.system.mjs";
import { RenderStratagies } from "./src/utils/render.stratagies.mjs";
import { Vector } from "./src/utils/vector.mjs";
import { CollisionDebugSystem } from "./src/systems/debug.system.mjs";
import { DungeonComponent } from "./src/components/dungeon.component.mjs";
import { CellComponent } from "./src/components/cell.component.mjs";
import { DungeonSystem } from "./src/systems/dungeon.system.mjs";
import { COMPONENTS } from "./src/utils/constants.mjs";
import { BoidSpawnSystem } from "./src/systems/boid.spawn.system.mjs";
import { MinimapSystem } from "./src/systems/minimap.system.mjs";
import { BoidSystem } from "./src/systems/boid.system.mjs";
const gravityVector = new Vector(0, 0)


const engine = new GameEngine()
const physicsSystem = new PhysicsSystem(engine.world)

engine.inputs.mapActions('attack', 'Space');

const dungen = engine.world.createEntity('dungen');
const player = engine.world.createEntity('player');


dungen.addComponent(new DungeonComponent({ root: new CellComponent(new Vector(0, 0), new Vector(engine.canvas.width * DungeonComponent.scaler, engine.canvas.height * DungeonComponent.scaler)) }));
dungen.transform = new Transform({ pos: new Vector(0, 0), size: new Vector(1, 1), rotation: 0 })
dungen.addComponent(new PhysicsComponent({ isStatic: true }));

player.addComponent(new RenderComponent({ color: "blue", type: "circle", radius: 40 }));
player.addComponent(new PhysicsComponent({ maxSpeed: 1000, gravity: gravityVector }));






engine.inputs.mapActions('move_up', 'KeyW')
engine.inputs.mapActions('move_right', 'KeyD')
engine.inputs.mapActions('move_left', 'KeyA')
engine.inputs.mapActions('move_down', 'KeyS');


RenderStratagies.register('circle', (ctx, component) => {
    const pos = component.entity.transform.pos;
    ctx.beginPath();
    ctx.fillStyle = component.color ?? 'blue';
    ctx.arc(pos.x, pos.y, component.radius, 0, Math.PI * 2);
    ctx.fill();
})

engine.camera.follow(player);


engine.addSystem(new DungeonSystem(engine.world, engine.eventBus))
engine.addSystem(new CollisionSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSpawnSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSystem(engine.world, engine.eventBus))
engine.addSystem(physicsSystem);
player.transform = new Transform({ pos: new Vector(100, 100), size: new Vector(1, 1) });

let spawned = false;

engine.inputs.mapActions('jump', "Space");

engine.eventBus.on('jump', () => {
    const force = new Vector(0, -35000);
    physicsSystem.applyForce(player, force);
});


engine.addSystem(new CollisionDebugSystem(engine.world, engine.eventBus, engine.ctx, engine.camera, engine.clock))

engine.addSystem({
    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");

        physicsSystem.applyForce(player, force.normalize().scale(1500));



        if (!spawned) {

            const dungeonComponent = dungen.getComponent('DungeonComponent')

            const firstCell = dungeonComponent.cells[0];
            const firstRoom = engine.world.getEntity('room_floor_' + firstCell.id);
            const pos = firstRoom.transform.pos;
            console.log(pos)
            player.transform = new Transform({ pos: new Vector(pos.x, pos.y), size: new Vector(1, 1) });
            spawned = true;
        }
    }
});

engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera));
engine.addSystem(new MinimapSystem(engine.world, engine.ctx));
engine.start();
console.log(engine.world.query('BoidComponent'))