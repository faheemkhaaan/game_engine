import { CellComponent } from "../components/cell.component.mjs";


export class SpatialGrid {
    /**
     * 
     * @param {CellComponent} root 
     */
    constructor(root) {
        this.cellSize = 100;
        this.root = root;
        this.cells = [];
        /**
         * @type {Map<string,CellComponent>}
         */
        this.map = new Map();
        this.getCells(root, this.cells);
        this.buildMap(this.cells);
        // console.log(this.cells);
    }


    getCells(cell, bucket) {

        if (cell.left && cell.right) {
            this.getCells(cell.left, bucket);
            this.getCells(cell.right, bucket)
        } else {
            bucket.push(cell);
        }
    }

    /**
     * 
     * @param {CellComponent[]} cells 
     */
    buildMap(cells) {
        // We map X and Y coordinates to the cells that touch them
        const map = new Map();

        for (const cell of cells) {
            // Use (coordinate - 1) for the max bounds so perfectly aligned cells don't overflow into the next bucket
            const minX = Math.floor(cell.topLeft.x / this.cellSize);
            const maxX = Math.floor((cell.bottomRight.x - 1) / this.cellSize);
            const minY = Math.floor(cell.topLeft.y / this.cellSize);
            const maxY = Math.floor((cell.bottomRight.y - 1) / this.cellSize);

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

    getPotentialsCells(x, y) {
        const dx = Math.floor(x / this.cellSize);
        const dy = Math.floor(y / this.cellSize);
        const key = `${dx},${dy}`;
        return this.map.get(key) || []
    }


}