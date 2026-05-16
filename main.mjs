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
const gravityVector = new Vector(0, 0)


const engine = new GameEngine()
const physicsSystem = new PhysicsSystem(engine.world)

engine.inputs.mapActions('attack', 'Space');

const dungen = engine.world.createEntity('dungen');
const player = engine.world.createEntity('player');
const box = engine.world.createEntity('box');
const circle = engine.world.createEntity('circle');



dungen.addComponent(new DungeonComponent({ root: new CellComponent(new Vector(0, 0), new Vector(engine.canvas.width * DungeonComponent.scaler, engine.canvas.height * DungeonComponent.scaler)) }));
dungen.transform = new Transform({ pos: new Vector(0, 0), size: new Vector(1, 1), rotation: 0 })
dungen.addComponent(new PhysicsComponent({ isStatic: true }));
dungen.addComponent(new RenderComponent())

player.addComponent(new RenderComponent({ color: "blue", type: "circle", radius: 40 }));
player.addComponent(new PhysicsComponent({ maxSpeed: 1000 }));
player.transform = new Transform({ pos: new Vector(200, 800), size: new Vector(1, 1) });


box.transform = new Transform({ pos: new Vector(400, -300), size: new Vector(1, 1) })
box.addComponent(new RenderComponent({ color: "red", type: 'rect', width: 60, height: 100 }))
box.addComponent(new PhysicsComponent({ gravity: gravityVector }))



circle.transform = new Transform({ pos: new Vector(150, 450), size: new Vector(1, 1) })
circle.addComponent(new RenderComponent({ color: 'orange', type: 'circle', radius: 60 }))
circle.addComponent(new PhysicsComponent({ gravity: gravityVector, restitution: 0.1 }));



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

engine.addSystem(physicsSystem);
engine.addSystem(new CollisionSystem(engine.world, engine.eventBus))
engine.addSystem(new DungeonSystem(engine.world, engine.eventBus))
engine.addSystem(new RendererSystem(engine.world, engine.ctx, engine.camera))
// engine.addSystem({
//     update: () => {
//         engine.camera.apply(engine.ctx);
//         const dungenComponent = dungen.getComponent('DungeonComponent');
//         if (dungenComponent) {

//             RenderStratagies.cell.render(engine.ctx, dungenComponent)
//         }
//         engine.camera.restore(engine.ctx);
//     }
// });
// engine.addSystem(new CollisionDebugSystem(engine.world, engine.eventBus, engine.ctx, engine.camera, engine.clock));


engine.addSystem({
    update: () => {
        const force = engine.inputs.getAxis('move_up', "move_down", "move_left", "move_right");

        physicsSystem.applyForce(player, force.normalize().scale(2000));
    }
});


engine.start();
// console.log(engine)