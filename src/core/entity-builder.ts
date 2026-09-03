import { PhysicsComponent } from "../components/physics.component";
import { RenderComponent, RenderComponentType } from "../components/render.component";
import { ShapeComponent } from "../components/shape.component";
import { CollisionComponent, CollisionComponentType } from "../components/collision.component";
import { SnakeComponent } from "../components/snake.component";
import { BoidComponent } from "../components/boid.component";
import { Transform } from "../components/transform";
import { Vector } from "../utils/vector";
import { DungeonComponent } from "../components/dungeon.component";
import { CellComponent } from "../components/cell.component";
import { Entity } from "./entity.js";
import { World } from "./world.js";

/**
 * Fluent builder for creating entities.
 * Centralises component wiring so adding a new required component
 * only requires a change here, not across every system.
 *
 * Usage:
 *   const wall = new EntityBuilder(world, 'wall_top_1')
 *       .at(100, 50)
 *       .asRect(200, 20)
 *       .withRender({ color: '#5a5a5a' })
 *       .withStaticPhysics()
 *       .build();
 */
export class EntityBuilder {
    /**@type {import('../core/world.mjs').World} */
    #world
    /**@type {import('../core/entity.mjs').Entity} */
    #entity
    /**
     * @param {import('../core/world.mjs').World} world
     * @param {string} [id]
     */
    constructor(world: World, id: string) {
        this.#world = world;
        this.#entity = world.createEntity(id);
    }

    // ─── Transform ────────────────────────────────────────────────────────────

    /** Set position (and optionally rotation) */
    at(x: number, y: number, rotation = 0) {
        this.#entity.transform = new Transform({
            pos: new Vector(x, y),
            size: new Vector(1, 1),
            rotation,
        });
        return this;
    }

    // ─── Shape (single source of truth for geometry) ──────────────────────────

    asCircle(radius: number) {
        this.#entity.addComponent(new ShapeComponent({ type: 'circle', radius }));
        return this;
    }

    asRect(width: number, height: number) {
        this.#entity.addComponent(new ShapeComponent({ type: 'rect', width, height }));
        return this;
    }



    // ─── Render ───────────────────────────────────────────────────────────────

    /**
     * @param {{ color?: string, zIndex?: number }} [options]
     */
    withRender(options: Partial<RenderComponentType>) {
        // ShapeComponent is the geometry source; RenderComponent is purely visual.
        // We still accept legacy 'type' / 'radius' / 'width' / 'height' in options
        // so existing call-sites don't break immediately, but they are ignored for
        // geometry – use asCircle() / asRect() instead.
        this.#entity.addComponent(new RenderComponent(options as RenderComponentType));
        return this;
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {{ minRooms?: number, minDimensions?: number }} [options] level-driven dungeon sizing
     */
    withDungeon(width: number, height: number, options = {}) {
        this.#entity.addComponent(new DungeonComponent({
            root: new CellComponent(new Vector(0, 0), new Vector(width * DungeonComponent.scaler, height * DungeonComponent.scaler)),
            minDimensions: 130,
            minRooms: 20
        }))
        return this;
    }
    // ─── Physics ──────────────────────────────────────────────────────────────

    /**
     * Dynamic physics body.
     * @param {{ maxSpeed?: number, mass?: number, drag?: number, restitution?: number, velocity?: Vector, gravity?: Vector }} [options]
     */
    withPhysics(options = {}) {
        this.#entity.addComponent(new PhysicsComponent({ isStatic: false, ...options }));
        return this;
    }

    /** Static physics body (immovable walls, floors, etc.) */
    withStaticPhysics(options = {}) {
        this.#entity.addComponent(new PhysicsComponent({ isStatic: true, restitution: 1, ...options }));
        return this;
    }

    // ─── Collision ────────────────────────────────────────────────────────────

    /** Dynamic collision (participates in resolution). */
    withCollision(options: Pick<CollisionComponent, 'mask' | 'layers'>) {
        this.#entity.addComponent(new CollisionComponent({ isStatic: false, enabled: true, mask: options.mask, layers: options.layers, broadphaseRadius: 5, isTrigger: false }));
        return this;
    }

    withShape(shape: { type: string, width: number, height: number, radius?: number }) {
        this.#entity.addComponent(new ShapeComponent({ type: shape.type, width: shape.width, radius: shape.radius }))
        return this;
    }

    /** Static collision (walls/terrain – only blocks, never moves). */
    withStaticCollision(options: Partial<CollisionComponentType>) {
        this.#entity.addComponent(new CollisionComponent({ isStatic: true, enabled: true, broadphaseRadius: options.broadphaseRadius ?? 0, isTrigger: options.isTrigger ?? false, layers: options.layers ?? [], mask: options.mask ?? [] }));
        return this;
    }

    // ─── Behaviour components ─────────────────────────────────────────────────

    withSnake() {
        this.#entity.addComponent(new SnakeComponent());
        return this;
    }

    withBoid() {
        this.#entity.addComponent(new BoidComponent({}));
        return this;
    }

    // ─── Escape hatch – add any arbitrary component ───────────────────────────

    with<T extends { entity: Entity | null }>(component: T) {
        this.#entity.addComponent(component);
        return this;
    }



    // ─── Build ────────────────────────────────────────────────────────────────

    build(): Entity {
        return this.#entity;
    }
}