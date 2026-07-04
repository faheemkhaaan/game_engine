


export class DungeonComponent {

    static scaler = 20;

    constructor({ root } = {}) {
        this.minRooms = 15;
        this.minDimensions = 130 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}