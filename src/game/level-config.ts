/**
 * level-config.mjs
 *
 * Data-only list of levels. `minRooms` / `minDimensions` feed directly into
 * DungeonComponent (via Prefabs.dungeon -> EntityBuilder.withDungeon), and
 * `mouseCountPerRoom` / `enemySnakeCount` feed into BoidSpawnSystem. See
 * LevelManager for how these get wired into the running game.
 *
 * `minDimensions` is the same "raw" unit DungeonComponent used to hardcode
 * (130) — it gets multiplied by DungeonComponent.scaler internally. Smaller
 * minDimensions means rooms can be subdivided further, i.e. more, smaller
 * rooms for the same minRooms target.
 */

export type Level = {
    id: number;
    name: string;
    description: string;
    minRooms: number;
    minDimensions: number;
    mouseCountPerRoom: number;
    enemySnakeCount: number;
}

export const LEVELS: Level[] = [
    {
        id: 0,
        name: 'The Burrow',
        description: 'A small den. A handful of mice, nobody else around.',
        minRooms: 8,
        minDimensions: 130,
        mouseCountPerRoom: 15,
        enemySnakeCount: 5,
    },
    {
        id: 1,
        name: 'The Warren',
        description: 'More rooms, more mice — and some competition.',
        minRooms: 14,
        minDimensions: 120,
        mouseCountPerRoom: 25,
        enemySnakeCount: 6,
    },
    {
        id: 2,
        name: 'The Nest',
        description: 'A sprawling dungeon, crawling with rival snakes.',
        minRooms: 20,
        minDimensions: 110,
        mouseCountPerRoom: 40,
        enemySnakeCount: 7,
    },
    {
        id: 3,
        name: 'The Hive',
        description: 'Huge and hostile. Only the fattest snakes survive.',
        minRooms: 28,
        minDimensions: 100,
        mouseCountPerRoom: 60,
        enemySnakeCount: 8,
    },
];
export type LevelConfig = {
    id: number;
    name: string;
    description: string;
    minRooms: number;
    minDimensions: number;
    mouseCountPerRoom: number;
    enemySnakeCount: number;
}
export function getLevel(index: number) {
    return LEVELS[index] ?? null;
}