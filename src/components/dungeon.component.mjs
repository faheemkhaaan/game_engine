


export class DungeonComponent {

    static scaler = 6;

    constructor({ root } = {}) {
        this.minRooms = 5;
        this.minDimensions = 130 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}