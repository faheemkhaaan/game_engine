import { Entity } from "../core/entity";


export type BoidCOmponentProps = {
    maxForce: number;
    separationRadius: number;
    alignmentRadius: number;
    cohesionRadius: number;
    playerAvoidRadius: number;
    seperationWeight: number;
    alignmentWeight: number;
    cohesionWeight: number;
    playerAvoidWeight: number
}

export class BoidComponent {
    public entity: Entity | null = null;
    public maxForce: number;
    public separationRadius: number;
    public alignmentRadius: number;
    public cohesionRadius: number;
    public playerAvoidRadius: number;
    public seperationWeight: number;
    public alignmentWeight: number;
    public cohesionWeight: number;
    public playerAvoidWeight: number


    constructor({
        maxForce = 0.4,
        separationRadius = 600,
        alignmentRadius = 600,
        cohesionRadius = 600,
        playerAvoidRadius = 300,
        seperationWeight = 1400,
        alignmentWeight = 1200,
        cohesionWeight = 1300,
        playerAvoidWeight = 3500
    }: Partial<BoidCOmponentProps>) {
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