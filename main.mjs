import { PhysicsComponent } from "./src/components/physics.component.mjs";
import { RenderComponent } from "./src/components/render.component.mjs";
import { Transform } from "./src/components/transform.mjs";
import { GameEngine } from "./src/game/game.mjs";
import { CollisionSystem } from "./src/systems/collision.system.mjs";
import { PhysicsSystem } from "./src/systems/physics.system.mjs";
import { RendererSystem } from "./src/systems/renderer.system.mjs";
import { RenderStratagies } from "./src/utils/render.stratagies.mjs";
import { Vector } from "./src/utils/vector.mjs";



const engine = new GameEngine()
const physicsSystem = new PhysicsSystem(engine.world)

engine.inputs.mapActions('attack', 'Space');

const player = engine.world.createEntity('player');
const box = engine.world.createEntity('box');

player.addComponent(new RenderComponent({ color: "blue", type: "rect", width: 50, height: 50, }));
player.addComponent(new PhysicsComponent());
player.transform = new Transform({ pos: new Vector(800, 200) });

box.transform = new Transform({ pos: new Vector(400, 400) })
box.addComponent(new RenderComponent({ color: "red", type: 'rect', width: 60, height: 30 }))

engine.inputs.mapActions('move_up', 'KeyW')
engine.inputs.mapActions('move_right', 'KeyD')
engine.inputs.mapActions('move_left', 'KeyA')
engine.inputs.mapActions('move_down', 'KeyS')




engine.camera.follow(player);

engine.addSystem(physicsSystem);
engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera))
engine.addSystem(new CollisionSystem())


engine.addSystem({
    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");

        physicsSystem.applyForce(player, force.scale(1000000));
    }
})



engine.start();
// console.log(engine)