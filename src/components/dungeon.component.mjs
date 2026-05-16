


export class DungeonComponent {

    static scaler = 20;

    constructor({ root } = {}) {
        this.minRooms = 20;
        this.minDimensions = 120 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}