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
const box2 = engine.world.createEntity('box2');

player.addComponent(new RenderComponent({ color: "blue", type: "circle", radius: 50 }));
player.addComponent(new PhysicsComponent({ maxSpeed: 500 }));
player.transform = new Transform({ pos: new Vector(800, 200) });

box.transform = new Transform({ pos: new Vector(400, 400) })
box.addComponent(new RenderComponent({ color: "red", type: 'circle', radius: 80 }))
box.addComponent(new PhysicsComponent())


box2.transform = new Transform({ pos: new Vector(300, 500) })
box2.addComponent(new RenderComponent({ color: 'green', type: 'rect', width: 100, height: 200 }))

engine.inputs.mapActions('move_up', 'KeyW')
engine.inputs.mapActions('move_right', 'KeyD')
engine.inputs.mapActions('move_left', 'KeyA')
engine.inputs.mapActions('move_down', 'KeyS')


RenderStratagies.register('circle', (ctx, component) => {
    const pos = component.entity.transform.pos;
    ctx.beginPath();
    ctx.fillStyle = component.color;
    ctx.arc(pos.x, pos.y, component.radius, 0, Math.PI * 2);
    ctx.fill();
})

engine.camera.follow(player);

engine.addSystem(physicsSystem);
engine.addSystem(new CollisionSystem(engine.world))
engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera))


engine.addSystem({
    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");

        physicsSystem.applyForce(player, force.scale(1000));
    }
})



engine.start();
// console.log(engine)