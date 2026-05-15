


export class Clock {
    constructor() {
        this.time = null;
        this.fps = 0;
    }


    start() {
        this.time = performance.now();
    }

    getDelta() {
        const current = performance.now();
        const delta = (current - this.time) / 1000;
        this.time = current;

        // Calculate FPS (1 / delta seconds)
        // We use a simple smoothing to avoid jittery numbers
        if (delta > 0) {
            const currentFps = 1 / delta;
            const smoothing = 0.9; // Higher = smoother, lower = faster updates
            this.fps = (this.fps * smoothing) + (currentFps * (1 - smoothing));
        }

        return delta;
    }


}