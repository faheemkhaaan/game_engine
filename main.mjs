import { Transform } from "./src/components/transform.mjs";
import { GameEngine } from "./src/game/game.mjs";
import { CollisionSystem } from "./src/systems/collision.system.mjs";
import { PhysicsSystem } from "./src/systems/physics.system.mjs";
import { RendererSystem } from "./src/systems/renderer.system.mjs";
import { Vector } from "./src/utils/vector.mjs";
import { CollisionDebugSystem } from "./src/systems/debug.system.mjs";
import { DungeonSystem } from "./src/systems/dungeon.system.mjs";
import { BoidSpawnSystem } from "./src/systems/boid.spawn.system.mjs";
import { MinimapSystem } from "./src/systems/minimap.system.mjs";
import { BoidSystem } from "./src/systems/boid.system.mjs";
import { SnakeSkeletonSystem } from "./src/systems/snake-skeleton.system.mjs";
import { SnakeSkinSystem } from "./src/systems/snake-skin.system.mjs";
import { Prefabs } from "./src/utils/prefabs.mjs";
import { EntityBuilder } from "./src/core/entity-builder.mjs";
import { randomColor } from "./src/utils/random-color-generator.mjs";


const engine = new GameEngine()
const physicsSystem = new PhysicsSystem(engine.world)

engine.inputs.mapActions('attack', 'Space');

const dungen = Prefabs.dungeon(engine.world, engine.canvas.width, engine.canvas.height);
const player = new EntityBuilder(engine.world, 'player')
    .at(150, 150)
    .asCircle(12)
    .withRender({ color: randomColor() })
    .withPhysics({ maxSpeed: 700, mass: 1, restitution: 0.1, gravity: new Vector(0, 0), velocity: new Vector(0, 0) })
    .withCollision({ dungeonBound: true })
    .withSnake()
    .build()


engine.eventBus.on('mousedown', (loc) => {
    const dungenComponent = dungen.getComponent('DungeonComponent');

    const worldPos = engine.camera.canvasToWorld(loc);
});

const snakes = Prefabs.enemySnakes(engine.world, 'snakeEnemy', null, 10);


console.log(snakes.length)
engine.inputs.mapActions('move_up', 'KeyW')
engine.inputs.mapActions('move_right', 'KeyD')
engine.inputs.mapActions('move_left', 'KeyA')
engine.inputs.mapActions('move_down', 'KeyS');
engine.inputs.mapActions('enableDebug', 'KeyP');
engine.inputs.mapActions('enableMinMap', 'KeyM');
engine.inputs.mapActions('enableDungeonGeneration', 'KeyG');
engine.inputs.mapActions('enableCollision', "KeyC");
engine.inputs.mapActions('respawnBoids', "KeyR");
// engine.inputs.mapActions('selectedTarget',)


engine.addSystem(new DungeonSystem(engine.world, engine.eventBus, engine.canvas.width, engine.canvas.height))
engine.addSystem(physicsSystem);
engine.addSystem(new CollisionSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSpawnSystem(engine.world, engine.eventBus))
engine.addSystem(new BoidSystem(engine.world, engine.eventBus))
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

engine.camera.follow(player)
engine.eventBus.on('dungeonGenerated', () => {
    const dungeonComponent = dungen.getComponent('DungeonComponent')

    const firstCell = dungeonComponent.cells[0];

    const firstRoom = engine.world.getEntity('room_floor_' + firstCell.id);
    if (!firstRoom) return;
    const pos = firstRoom.transform.pos;
    player.transform = new Transform({ pos: new Vector(pos.x, pos.y), size: new Vector(1, 1) });
    snakes.forEach((snake, index) => {
        const p = new Vector(pos.x + (index * 30), pos.y + (index * 30));
        snake.transform = new Transform({ pos: p, size: new Vector(1, 1) });
    });
    console.log(snakes)
    engine.camera.follow(player);
})

engine.addSystem({

    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");
        const snakeComponent = player.getComponent('SnakeComponent');
        const physicsComponent = player.getComponent('PhysicsComponent');
        const playerVelocity = physicsComponent.velocity;

        if (playerVelocity.mag() < 1) {
            // console.log('setting player velocity to 0')
            physicsComponent.velocity.set(0, 0);
        }
        if (force.mag() > 0) {
            if (snakeComponent) snakeComponent.isSnakeMoving = true;
            physicsSystem.applyForce(player, force.normalize().scale(1500));
        } else {
            if (snakeComponent) snakeComponent.isSnakeMoving = false;
        }
    }
});



engine.addSystem(new SnakeSkeletonSystem(engine.world, engine.eventBus))
engine.addSystem(new SnakeSkinSystem(engine.world, engine.eventBus))
engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera));
engine.addSystem(new MinimapSystem(engine.world, engine.eventBus, engine.ctx));
engine.addSystem(new CollisionDebugSystem(engine.world, engine.eventBus, engine.ctx, engine.camera, engine.clock))
engine.start();
console.log(engine.world.entities.size)