import { CellComponent } from "../components/cell.component";


export class SpatialGrid {

    private _cellSize = 100;
    private _cells: CellComponent[];
    private map = new Map<string, CellComponent[]>();

    get cellSize() {
        return this._cellSize;
    }
    get cells() {
        return this._cells
    }


    /**
     * 
     * @param {CellComponent} root 
     */
    constructor(private root: CellComponent) {
        this._cellSize = 100;
        this._cells = [];
        /**
         * @type {Map<string,CellComponent>}
         */
        this.map = new Map();
        this.getCells(root, this._cells);
        this.buildMap(this._cells);
        // console.log(this._cells);
    }


    getCells(cell: CellComponent, bucket: CellComponent[]) {

        if (cell.left && cell.right) {
            this.getCells(cell.left, bucket);
            this.getCells(cell.right, bucket)
        } else {
            bucket.push(cell);
        }
    }

    /**
     * 
     * @param {CellComponent[]} _cells 
     */
    buildMap(_cells: CellComponent[]) {
        // We map X and Y coordinates to the _cells that touch them
        const map = new Map();

        for (const cell of _cells) {
            // Use (coordinate - 1) for the max bounds so perfectly aligned _cells don't overflow into the next bucket
            const minX = Math.floor(cell.topLeft.x / this._cellSize);
            const maxX = Math.floor((cell.bottomRight.x - 1) / this._cellSize);
            const minY = Math.floor(cell.topLeft.y / this._cellSize);
            const maxY = Math.floor((cell.bottomRight.y - 1) / this._cellSize);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = `${x},${y}`;
                    if (!map.has(key)) {
                        map.set(key, []);
                    }
                    map.get(key).push(cell);
                }
            }
        }
        this.map = map;
    }

    getPotentialsCells(x: number, y: number) {
        const dx = Math.floor(x / this._cellSize);
        const dy = Math.floor(y / this._cellSize);
        const key = `${dx},${dy}`;
        return this.map.get(key) || []
    }


}