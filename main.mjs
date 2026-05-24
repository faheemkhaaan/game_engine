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
import { DungeonSystem } from "./src/systems/dungeon.system.mjs";
import { COMPONENTS } from "./src/utils/constants.mjs";
import { BoidSpawnSystem } from "./src/systems/boid.spawn.system.mjs";
import { MinimapSystem } from "./src/systems/minimap.system.mjs";
import { BoidSystem } from "./src/systems/boid.system.mjs";
import { SnakeComponent } from "./src/components/snake.component.mjs";
import { SnakeSkeletonSystem } from "./src/systems/snake-skeleton.system.mjs";
import { BoidComponent } from "./src/components/boid.component.mjs";
import { SnakeSkinSystem } from "./src/systems/snake-skin.system.mjs";
import { Prefabs } from "./src/utils/prefabs.mjs";
import { EntityBuilder } from "./src/core/entity-builder.mjs";


const engine = new GameEngine()
const physicsSystem = new PhysicsSystem(engine.world)

engine.inputs.mapActions('attack', 'Space');

const dungen = Prefabs.dungeon(engine.world, engine.canvas.width, engine.canvas.height);
const player = Prefabs.player(engine.world)



console.log(dungen)
const snake2 = engine.world.createEntity('snake2');

snake2.addComponent(new RenderComponent({ color: 'green', type: 'circle', radius: 20 }));
snake2.addComponent(new PhysicsComponent({
    maxSpeed: 800,
    mass: 1,
    velocity: new Vector(
        (Math.random() - 0.5) * 1300,
        (Math.random() - 0.5) * 1300
    ),
    aceleration: new Vector(1, 1),
    drag: 1,

}));
snake2.addComponent(new SnakeComponent());
snake2.addComponent(new BoidComponent());


engine.inputs.mapActions('move_up', 'KeyW')
engine.inputs.mapActions('move_right', 'KeyD')
engine.inputs.mapActions('move_left', 'KeyA')
engine.inputs.mapActions('move_down', 'KeyS');
engine.inputs.mapActions('enableDebug', 'KeyP');
engine.inputs.mapActions('enableMinMap', 'KeyM');
// engine.inputs.mapActions('selectedTarget',)


engine.addSystem(new DungeonSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSpawnSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSystem(engine.world, engine.eventBus))
engine.addSystem(new CollisionSystem(engine.world, engine.eventBus))
engine.addSystem(physicsSystem);
player.transform = new Transform({ pos: new Vector(100, 100), size: new Vector(1, 1) });


engine.inputs.mapActions('jump', "Space");

engine.eventBus.on('jump', () => {
    const force = new Vector(0, -35000);
    physicsSystem.applyForce(player, force);
});

engine.eventBus.on('selectedTarget', (code, e) => {
    console.log(e);
    // engine.camera.follow(target);
});


engine.eventBus.on('dungeonGenerated', () => {
    const dungeonComponent = dungen.getComponent('DungeonComponent')

    const firstCell = dungeonComponent.cells[0];

    const firstRoom = engine.world.getEntity('room_floor_' + firstCell.id);
    const pos = firstRoom.transform.pos;
    console.log(pos)
    player.transform = new Transform({ pos: new Vector(pos.x, pos.y), size: new Vector(1, 1) });
    snake2.transform = new Transform({ pos: new Vector(pos.x + 30, pos.y + 30), size: new Vector(1, 1) });
    engine.camera.follow(player);
})

engine.addSystem({

    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");

        if (force.mag() > 0) {


            physicsSystem.applyForce(player, force.normalize().scale(1500));

        }
    }
});

engine.addSystem(new SnakeSkeletonSystem(engine.world, engine.eventBus))
engine.addSystem(new SnakeSkinSystem(engine.world, engine.eventBus))
engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera));
engine.addSystem(new MinimapSystem(engine.world, engine.eventBus, engine.ctx));
engine.addSystem(new CollisionDebugSystem(engine.world, engine.eventBus, engine.ctx, engine.camera, engine.clock))
engine.start();
// console.log(engine.world.entities);