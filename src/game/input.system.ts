import { Vector } from "../utils/vector";
import { EventBus } from "./eventBus";



export class InputSystem {

    private actions = new Map<string, string>();
    private keys = new Map<string, boolean>();

    /**
     * 
     * @param {EventBus} events 
     */
    constructor(private events: EventBus) {



        this.#addEventListeners();
    }

    #addEventListeners() {
        window.addEventListener("keydown", (e) => {
            this.keys.set(e.code, true);

            this.events.emit('keydown', e.code, true);

            this.actions.forEach((keyCode, name) => {
                if (keyCode === e.code) {
                    this.events.emit(name)
                }
                // console.log(name, keyCode)
            })
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.events.emit('keydown', e.code, false);
        });

        window.addEventListener('mousedown', (e) => {
            const loc = { x: e.offsetX, y: e.offsetY }
            this.events.emit('mousedown', loc);
        })
    }

    /**
     * 
     * @param {string} name - Name of the actions 
     * @param {string} key - Key code of the actions
     */
    mapActions(name: string, key: string) {
        this.actions.set(name, key);
    }
    getActions(name: string) {
        const keyCode = this.actions.get(name);
        return keyCode ? this.keys.get(keyCode) : false
    }
    isKeyPressed(key: string) {
        return this.keys.get(key) || false
    }


    getAxis(up: string, down: string, left: string, right: string) {
        const horizontal = (this.getActions(right) ? 1 : 0) - (this.getActions(left) ? 1 : 0);
        const vertical = (this.getActions(down) ? 1 : 0) - (this.getActions(up) ? 1 : 0);

        return new Vector(horizontal, vertical);
    }


}