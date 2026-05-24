/**
 * @typedef ShapeComponentOptionType
 * @property {'circle'|'rect'|'snake'} [type] - type of the entity
 * @property {number} [width] - width
 * @property {number} [height] - height
 * @property {number} [radius] - radius
 */

export class ShapeComponent {

    /**
     * 
     * @param {ShapeComponentOptionType} param0 
     */
    constructor(
        {
            type = 'circle',
            width = 0,
            height = 0,
            radius = 0
        } = {}
    ) {
        /**@type {'circle'|'rect'|'snake'} */
        this.type = type;
        this.width = width;
        this.height = height;
        this.radius = radius;

    }

}