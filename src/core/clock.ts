


export class Clock {
    private _time: null | number = null;
    private _fps = 0;

    get time() {
        return this._time;
    }
    get fps() {
        return this._fps
    }
    constructor() { }


    start() {
        this._time = performance.now();
    }

    getDelta() {

        const current = performance.now();
        const delta = (current - (this._time ?? 0)) / 1000;
        this._time = current;

        // Calculate FPS (1 / delta seconds)
        // We use a simple smoothing to avoid jittery numbers
        if (delta > 0) {
            const currentFps = 1 / delta;
            const smoothing = 0.9; // Higher = smoother, lower = faster updates
            this._fps = (this.fps * smoothing) + (currentFps * (1 - smoothing));
        }

        return delta;
    }


}