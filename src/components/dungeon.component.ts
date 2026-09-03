import { Entity } from "../core/entity";
import { CellComponent } from "./cell.component";



type DungeonComponentType = {
    root: CellComponent;
    minRooms: number;
    minDimensions: number;
}

export class DungeonComponent {

    public entity: Entity | null = null;
    static scaler = 20;
    public root: CellComponent;
    public minDimensions: number;
    public cells: CellComponent[];
    public minRooms: number;

    /**
     * minDimensions is in the same "raw" units the rest of the dungeon math
     * uses pre-scale (historically hardcoded to 130); it gets multiplied by
     * DungeonComponent.scaler here, same as before.
     */
    constructor({ root, minRooms = 20, minDimensions = 130 }: DungeonComponentType) {
        this.minRooms = minRooms;
        this.minDimensions = minDimensions * DungeonComponent.scaler;
        this.root = root;
        this.cells = [];
    }
}