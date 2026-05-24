import { PhysicsComponent } from "../components/physics.component.mjs";
import { RenderComponent } from "../components/render.component.mjs";
import { ShapeComponent } from "../components/shape.component.mjs";
import { CollisionComponent } from "../components/collision.component.mjs";
import { SnakeComponent } from "../components/snake.component.mjs";
import { BoidComponent } from "../components/boid.component.mjs";
import { Transform } from "../components/transform.mjs";
import { Vector } from "../utils/vector.mjs";
import { DungeonComponent } from "../components/dungeon.component.mjs";
import { CellComponent } from "../components/cell.component.mjs";

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
    constructor(world, id) {
        this.#world = world;
        this.#entity = world.createEntity(id);
    }

    // ─── Transform ────────────────────────────────────────────────────────────

    /** Set position (and optionally rotation) */
    at(x, y, rotation = 0) {
        this.#entity.transform = new Transform({
            pos: new Vector(x, y),
            size: new Vector(1, 1),
            rotation,
        });
        return this;
    }

    // ─── Shape (single source of truth for geometry) ──────────────────────────

    asCircle(radius) {
        this.#entity.addComponent(new ShapeComponent({ type: 'circle', radius }));
        return this;
    }

    asRect(width, height) {
        this.#entity.addComponent(new ShapeComponent({ type: 'rect', width, height }));
        return this;
    }



    // ─── Render ───────────────────────────────────────────────────────────────

    /**
     * @param {{ color?: string, zIndex?: number }} [options]
     */
    withRender(options = {}) {
        // ShapeComponent is the geometry source; RenderComponent is purely visual.
        // We still accept legacy 'type' / 'radius' / 'width' / 'height' in options
        // so existing call-sites don't break immediately, but they are ignored for
        // geometry – use asCircle() / asRect() instead.
        this.#entity.addComponent(new RenderComponent(options));
        return this;
    }

    withDungeon(width, height) {
        this.#entity.addComponent(new DungeonComponent({ root: new CellComponent(new Vector(0, 0), new Vector(width * DungeonComponent.scaler, height * DungeonComponent.scaler)) }))
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
    withCollision(options = {}) {
        this.#entity.addComponent(new CollisionComponent({ static: false, enabled: true, ...options }));
        return this;
    }

    /** Static collision (walls/terrain – only blocks, never moves). */
    withStaticCollision(options = {}) {
        this.#entity.addComponent(new CollisionComponent({ static: true, enabled: true, ...options }));
        return this;
    }

    // ─── Behaviour components ─────────────────────────────────────────────────

    withSnake() {
        this.#entity.addComponent(new SnakeComponent());
        return this;
    }

    withBoid() {
        this.#entity.addComponent(new BoidComponent());
        return this;
    }

    // ─── Escape hatch – add any arbitrary component ───────────────────────────

    with(component) {
        this.#entity.addComponent(component);
        return this;
    }

    // ─── Build ────────────────────────────────────────────────────────────────

    build() {
        return this.#entity;
    }
}