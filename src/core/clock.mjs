


export class Clock {
    constructor() {

        this.time = null
    }


    start() {
        this.time = performance.now();
    }

    getDelta() {
        const current = performance.now();

        const delta = (current - this.time) / 1000;

        this.time = current;

        return delta;
    }


}