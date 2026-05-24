import { Vector } from "../utils/vector.mjs";
import { EventBus } from "./eventBus.mjs";



export class InputSystem {
    /**
     * 
     * @param {EventBus} events 
     */
    constructor(events) {

        this.keys = new Map();
        this.actions = new Map();
        this.events = events;


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

        })
    }

    /**
     * 
     * @param {string} name - Name of the actions 
     * @param {string} key - Key code of the actions
     */
    mapActions(name, key) {
        this.actions.set(name, key);
    }
    getActions(name) {
        const keyCode = this.actions.get(name);
        return keyCode ? this.keys.get(keyCode) : false
    }
    isKeyPressed(key) {
        return this.keys.get(key) || false
    }


    getAxis(up, down, left, right) {
        const horizontal = (this.getActions(right) ? 1 : 0) - (this.getActions(left) ? 1 : 0);
        const vertical = (this.getActions(down) ? 1 : 0) - (this.getActions(up) ? 1 : 0);

        return new Vector(horizontal, vertical);
    }


}