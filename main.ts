import { GameEngine } from "./src/game/game";
import { LevelManager } from "./src/game/level-manager";
import { ProgressStore } from "./src/game/progress-store";
import { refreshAnimalUnlocks } from "./src/game/character-config";
import { LEVELS } from "./src/game/level-config";
import { createMainMenu } from "./src/ui/main-menu";
import { createLevelSelect } from "./src/ui/level-select";
import { createHud } from "./src/ui/hud";
import { Prefabs } from "./src/utils/prefabs";
import { World } from "./src/core/world";
import { Vector } from "./src/utils/vector";
import { sounds } from "./src/game/sound-manager";


// ─── Engine + systems ────────────────────────────────────────────────────
// Built once at boot. No dungeon/player/mice exist yet — LevelManager
// populates the world the first time a level is started from the UI.

const engine = new GameEngine();
const levelManager = new LevelManager(engine);


// ─── Progression ─────────────────────────────────────────────────────────

const progressStore = new ProgressStore();
let sessionPoints = 0;

// Nothing emits this yet — it's the hook point for whatever eating/collision
// logic ends up detecting "player ate a mouse". Once that exists, just:
//   engine.eventBus.emit('mouseEaten', 10)
// and the HUD + unlock system below react automatically.
engine.eventBus.on('mouseEaten', (points = 10) => {
    sessionPoints += points;
    const total = progressStore.addPoints(points);
    refreshAnimalUnlocks(progressStore);
    hud.setPoints(sessionPoints);
    mainMenu.refresh();
    sounds.playerAttack()
});


// ─── UI ─────────────────────────────────────────────────────────────────

const uiRoot = document.getElementById('ui-root');

let selectedCharacterId = 'snake';

const mainMenu = createMainMenu({
    progressStore,
    onPlay(characterId: string) {
        selectedCharacterId = characterId;
        levelManager.onPlayerSelected = (world: World, pos: Vector) => {
            console.log(selectedCharacterId)
            switch (selectedCharacterId) {
                case 'centipede':
                    return Prefabs.playerCentipede(world, pos);
                case "lizard":
                    return Prefabs.playerLizard(world, pos);
                case "spider":
                    return Prefabs.playerSpider(world, pos)
                default:
                    return Prefabs.playerSnake(world, pos);
            }
        }
        mainMenu.hide();
        levelSelect.show();

        sounds.selectionSound()

    },
});

const levelSelect = createLevelSelect({
    progressStore,
    onSelectLevel(levelIndex: number) {
        startLevel(levelIndex);
        sounds.selectionSound()
    },
    onBack() {
        levelSelect.hide();
        mainMenu.show();
        sounds.selectionSound()
    },
});

const hud = createHud({
    onExitToLevelSelect() {
        exitToLevelSelect();
    },
    onDevFinishLevel() {
        finishCurrentLevel();
    },
});

if (uiRoot) {
    uiRoot.appendChild(mainMenu.element);
    uiRoot.appendChild(levelSelect.element);
    uiRoot.appendChild(hud.element);
}


function startLevel(levelIndex: number) {
    levelSelect.hide();
    sessionPoints = 0;

    levelManager.onLevelReady = () => {
        engine.showCanvas();
        hud.show();
        hud.setLevelName(LEVELS[levelIndex].name);
        hud.setPoints(sessionPoints);
    };

    levelManager.startLevel(levelIndex);
}

function exitToLevelSelect() {
    engine.hideCanvas();
    hud.hide();
    levelSelect.show();
}

function finishCurrentLevel() {
    if (levelManager.currentLevelIndex === null) return;
    progressStore.completeLevel(levelManager.currentLevelIndex);
    exitToLevelSelect();
}