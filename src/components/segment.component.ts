


export class SegmentComponent {

    public radius: number;
    public parentId: string;
    /**
     * 
     * @param {Transform} pointA 
     * @param {Transform} pointB 
     */
    constructor(radius: number, parentId: string) {

        this.radius = radius;
        this.parentId = parentId;
    }

}