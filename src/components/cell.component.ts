

import { Vector } from "../utils/vector";




export class CellComponent {

    public id: string = crypto.randomUUID();
    public topLeft: Vector;
    public bottomRight: Vector;
    public width: number;
    public height: number;
    public left: null | CellComponent;
    public right: null | CellComponent;
    public vNeighbours: CellComponent[];
    public hNeighbours: CellComponent[];


    constructor(topLeft: Vector, bottomRight: Vector) {


        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        this.width = this.bottomRight.x - this.topLeft.x;
        this.height = this.bottomRight.y - this.topLeft.y;


        this.left = null;
        this.right = null;

        this.vNeighbours = [];
        this.hNeighbours = [];

        // this.vHalls = [];
        // this.hHalls = [];
    }
}