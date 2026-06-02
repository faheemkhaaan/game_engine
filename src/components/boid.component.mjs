



export class BoidComponent {

    constructor({
        maxForce = 0.4,
        separationRadius = 100,
        alignmentRadius = 100,
        cohesionRadius = 100,
        playerAvoidRadius = 200,
        seperationWeight = 1400,
        alignmentWeight = 1200,
        cohesionWeight = 1300,
        playerAvoidWeight = 3500
    } = {}) {
        this.maxForce = maxForce;
        this.separationRadius = separationRadius;
        this.alignmentRadius = alignmentRadius;
        this.cohesionRadius = cohesionRadius;
        this.playerAvoidRadius = playerAvoidRadius;

        this.seperationWeight = seperationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.playerAvoidWeight = playerAvoidWeight;

    }
}