import { CellComponent } from "./cell.component";



export class DungeonComponent {

    static scaler = 20;
    public root: CellComponent;
    public minDimensions: number;
    public cells: CellComponent[];
    public minRooms: number;

    /**
     * @param {{ root?: import('./cell.component.mjs').CellComponent, minRooms?: number, minDimensions?: number }} [options]
     * minDimensions is in the same "raw" units the rest of the dungeon math
     * uses pre-scale (historically hardcoded to 130); it gets multiplied by
     * DungeonComponent.scaler here, same as before.
     */
    constructor({ root, minRooms = 20, minDimensions = 130 } = {}) {
        this.minRooms = minRooms;
        this.minDimensions = minDimensions * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}