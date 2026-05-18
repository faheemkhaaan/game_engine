



export class BoidComponent {

    constructor({
        maxForce = 0.2,
        separationRadius = 25,
        alignmentRadius = 50,
        cohesionRadius = 50,
        seperationWeight = 1.5,
        alignmentWeight = 1,
        cohesionWeight = 1
    } = {}) {
        this.maxForce = maxForce;
        this.separationRadius = separationRadius;
        this.alignmentRadius = alignmentRadius;
        this.cohesionRadius = cohesionRadius;
        this.seperationWeight = seperationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
    }
}