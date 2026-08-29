import { Clock } from "../core/clock";
import { World } from "../core/world";
import { Camera } from "./camera";
import { EventBus } from "./eventBus";
import { InputSystem } from "./input.system";


export interface ISystem {
    update: (dt: number) => void;
}

export class GameEngine {
    public camera: Camera;
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D | null;
    public eventBus: EventBus;
    public inputs: InputSystem;
    public world: World;
    public clock: Clock;
    public systems = new Set<ISystem>();
    constructor() {

        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext('2d');
        // Stays hidden behind the menu/level-select overlay until a level is started.
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.eventBus = new EventBus()
        this.inputs = new InputSystem(this.eventBus);
        this.world = new World();
        this.clock = new Clock()


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
        if (!delta) return;
        this.camera.update(delta)
        for (const system of this.systems) {
            if (system && system.update) {
                system.update(delta)
            }
        }

    }
    gameLoop() {

        const delta = this.clock.getDelta();

        this.camera.update(delta);

        for (const system of this.systems) {
            if (system && system.update) {
                system.update(delta)
            }
        }
        requestAnimationFrame(() => this.gameLoop())
    }


    showCanvas() {
        this.canvas.style.display = 'block';
    }

    hideCanvas() {
        this.canvas.style.display = 'none';
    }

    addSystem(system: ISystem) {
        this.systems.add(system);
    }

    getSystem<T extends ISystem>(SystemClass: new (...args: any[]) => T): T | null {
        for (const system of this.systems) {
            if (system instanceof SystemClass) {
                return system as T;
            }
        }
        return null;
    }

}