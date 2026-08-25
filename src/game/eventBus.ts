


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
    once(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, once: true });
    }
    emit(event, ...args) {
        if (!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event);

        listeners.forEach((listener, i) => {
            listener.callback(...args);
            if (listener.once) {
                listener.splice(i, 1);
            }
        });

        if (listeners.length === 0) {
            this.listeners.delete(event);
        }
    }
}