


export type Listeners = {
    callback: (...args: any[]) => void;
    once?: boolean;
}
export class EventBus {
    private listeners = new Map<string, Array<Listeners>>();
    constructor() {

        this.listeners = new Map();
    };


    on(eventName: string, callback: Listeners['callback']) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        const events = this.listeners.get(eventName);
        if (events) events.push({ callback });
    }
    once(eventName: string, callback: Listeners['callback']) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        const events = this.listeners.get(eventName);
        if (events) events.push({ callback, once: true });
    }
    emit(event: string, ...args: any[]) {
        if (!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event);
        if (!listeners) return;
        listeners.forEach((listener, i) => {
            listener.callback(...args);
            if (listener.once) {
                listeners.splice(i, 1);
            }
        });

        if (listeners.length === 0) {
            this.listeners.delete(event);
        }
    }
}