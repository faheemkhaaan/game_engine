
// import crypto from 'node:crypto'

export class CellComponent {
    constructor(topLeft, bottomRight) {

        this.id = crypto.randomUUID()

        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        this.width = this.bottomRight.x - this.topLeft.x;
        this.height = this.bottomRight.y - this.topLeft.y;


        this.left = null;
        this.right = null;

        this.vNeighbours = [];
        this.hNeighbours = [];

        this.vHalls = [];
        this.hHalls = [];
    }
}