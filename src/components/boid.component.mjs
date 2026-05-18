



export class BoidComponent {

    constructor({
        maxForce = 0.4,
        separationRadius = 100,
        alignmentRadius = 100,
        cohesionRadius = 100,
        seperationWeight = 1400,
        alignmentWeight = 1000,
        cohesionWeight = 1000
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