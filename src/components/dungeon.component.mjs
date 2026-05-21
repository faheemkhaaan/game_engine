


export class DungeonComponent {

    static scaler = 10;

    constructor({ root } = {}) {
        this.minRooms = 50;
        this.minDimensions = 130 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}