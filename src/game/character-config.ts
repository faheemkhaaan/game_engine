/**
 * character-config.mjs
 *
 * Data-only roster of playable animals. Each animal has:
 *  - pointsRequired: how many total points (mice eaten, once that scoring
 *    exists) unlock it
 *  - implemented: whether the animal actually has gameplay behind it yet.
 *    Unimplemented animals stay locked/"coming soon" in the UI even if the
 *    player has enough points, so we don't let people select a character
 *    with no movement/render logic behind it.
 *
 * Only 'snake' is implemented right now. Add the rest here as their systems
 * land (a Lizard/Centipede/Fish EntityBuilder + skin/movement system), then
 * flip `implemented: true`.
 */

import { ProgressStore } from "./progress-store";

export type Character = {
    id: string;
    name: string;
    tagline: string;
    pointsRequired: number;
    implemented: boolean;
    color: string;
}
export const CHARACTERS: Character[] = [
    {
        id: 'snake',
        name: 'Snake',
        tagline: 'The original hunter. Grows longer with every mouse.',
        pointsRequired: 0,
        implemented: true,
        color: '#7fbf6a',
    },
    {
        id: 'lizard',
        name: 'Lizard',
        tagline: 'Quick bursts of speed, short attention span.',
        pointsRequired: 50,
        implemented: false,
        color: '#d9b23f',
    },
    {
        id: 'centipede',
        name: 'Centipede',
        tagline: 'Many segments, many ways to corner you.',
        pointsRequired: 150,
        implemented: false,
        color: '#c96b2e',
    },
    {
        id: 'fish',
        name: 'Fish',
        tagline: 'Rules the flooded rooms. Everywhere else, it struggles.',
        pointsRequired: 300,
        implemented: false,
        color: '#4a9bd9',
    },
];

export function getCharacter(id: string) {
    return CHARACTERS.find((c) => c.id === id) ?? null;
}

/** True only when the animal both has enough points banked AND has real gameplay behind it. */
export function isCharacterPlayable(character: Character, progressStore: ProgressStore) {
    if (!character || !character.implemented) return false;
    return progressStore.isAnimalUnlocked(character.id);
}

/** Call after points change to promote any newly-affordable animals into unlockedAnimals. */
export function refreshAnimalUnlocks(progressStore: ProgressStore) {
    const newlyUnlocked = [];
    for (const character of CHARACTERS) {
        if (progressStore.getPoints() >= character.pointsRequired && !progressStore.isAnimalUnlocked(character.id)) {
            progressStore.unlockAnimal(character.id);
            newlyUnlocked.push(character);
        }
    }
    return newlyUnlocked;
}