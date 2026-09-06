/**
 * progress-store.mjs
 *
 * Persists player progress (points earned, unlocked animals, unlocked/completed
 * levels) to localStorage so it survives page reloads.
 *
 * This is intentionally decoupled from any gameplay system. Nothing currently
 * calls `addPoints()` automatically — once mouse-eating scoring exists, have
 * that system `engine.eventBus.emit('mouseEaten', points)`; main.mjs already
 * listens for that event and forwards it here (see main.mjs).
 */

export type GameData = {

    points: number;
    unlockedAnimals: string[];
    highestUnlockedLevel: number;
    completedLevels: any[]
}

const STORAGE_KEY = 'snakeGame:progress';

const DEFAULT_PROGRESS = {
    points: 0,
    unlockedAnimals: ['snake', 'lizard', 'centipede'],
    highestUnlockedLevel: 0,
    completedLevels: [],
};

function clone(obj: GameData) {
    return JSON.parse(JSON.stringify(obj));
}


export class ProgressStore {
    private data: GameData
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return clone(DEFAULT_PROGRESS);
            const parsed = JSON.parse(raw);
            return { ...clone(DEFAULT_PROGRESS), ...parsed };
        } catch (e) {
            console.warn('[ProgressStore] Failed to load saved progress, starting fresh.', e);
            return clone(DEFAULT_PROGRESS);
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('[ProgressStore] Failed to save progress.', e);
        }
    }

    getPoints() {
        return this.data.points;
    }

    addPoints(amount: number) {
        this.data.points = Math.max(0, this.data.points + amount);
        this.save();
        return this.data.points;
    }

    isAnimalUnlocked(animalId: string) {
        return this.data.unlockedAnimals.includes(animalId);
    }

    unlockAnimal(animalId: string) {
        if (!this.data.unlockedAnimals.includes(animalId)) {
            this.data.unlockedAnimals.push(animalId);
            this.save();
            return true;
        }
        return false;
    }

    isLevelUnlocked(levelIndex: number) {
        return levelIndex <= this.data.highestUnlockedLevel;
    }

    isLevelCompleted(levelIndex: number) {
        return this.data.completedLevels.includes(levelIndex);
    }

    completeLevel(levelIndex: number) {
        if (!this.data.completedLevels.includes(levelIndex)) {
            this.data.completedLevels.push(levelIndex);
        }
        if (levelIndex + 1 > this.data.highestUnlockedLevel) {
            this.data.highestUnlockedLevel = levelIndex + 1;
        }
        this.save();
    }

    reset() {
        this.data = clone(DEFAULT_PROGRESS);
        this.save();
    }
}