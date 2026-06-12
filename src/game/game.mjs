import { Clock } from "../core/clock.mjs";
import { World } from "../core/world.mjs";
import { Camera } from "./camera.mjs";
import { EventBus } from "./eventBus.mjs";
import { InputSystem } from "./input.system.mjs";


export class GameEngine {
    constructor() {

        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.eventBus = new EventBus()
        this.inputs = new InputSystem(this.eventBus);
        this.world = new World();
        this.clock = new Clock()
        this.systems = new Set();


    }


    start() {
        this.clock.start();
        this.gameLoop();
    }


    startSingleSteps() {

        const simulation = this.startGenerator();

        window.addEventListener("keydown", (e) => {
            if (e.code === 'KeyL') {
                simulation.next();
            }
        })
    }

    *startGenerator() {
        while (true) {

            this.clock.start();
            this.gameLoopSteps();

            yield "Next Step";
        }
    }

    gameLoopSteps() {
        const delta = this.clock.getDelta();

        // console.log(this.inputs.isKeyPressed('Space'));
        // console.log(this.inputs.keys);
        this.camera.update(delta)
        // this.camera.apply(this.ctx);
        this.systems.forEach(system => {
            if (system && system.update) {
                system.update(delta);
            }
        });
        // this.camera.restore(this.ctx);
        // requestAnimationFrame(() => this.gameLoop())
    }
    gameLoop() {
        const delta = this.clock.getDelta();

        // console.log(this.inputs.isKeyPressed('Space'));
        // console.log(this.inputs.keys);
        this.camera.update(delta)
        // this.camera.apply(this.ctx);
        this.systems.forEach(system => {
            if (system && system.update) {
                system.update(delta);
            }
        });
        // this.camera.restore(this.ctx);
        requestAnimationFrame(() => this.gameLoop())
    }


    addSystem(system) {
        this.systems.add(system);
    }

    getSystem(systemName) {
        for (const system of this.systems) {
            if (system.construtor.name === systemName) {
                return system
            }
        }
        return null;
    }

}