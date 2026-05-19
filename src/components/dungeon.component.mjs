


export class DungeonComponent {

    static scaler = 7;

    constructor({ root } = {}) {
        this.minRooms = 30;
        this.minDimensions = 130 * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}