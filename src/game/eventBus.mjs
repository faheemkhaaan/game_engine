


export class EventBus {
    constructor() {

        this.listeners = new Map();
    };


    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push({ callback });
    }
    emit(event, ...args) {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(listener => {
            listener.callback(...args);
        });
    }
}