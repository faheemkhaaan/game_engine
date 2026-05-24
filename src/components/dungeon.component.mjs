


export class DungeonComponent {

    static scaler = 5;

    constructor({ root } = {}) {
        this.minRooms = 10;
        this.minDimensions = 130 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}