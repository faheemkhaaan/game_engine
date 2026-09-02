import { GameEngine } from "./src/game/game";
import { CollisionSystem } from "./src/systems/collision.system";
import { PhysicsSystem } from "./src/systems/physics.system";
import { RendererSystem } from "./src/systems/renderer.system";
import { CollisionDebugSystem } from "./src/systems/debug.system";
import { DungeonSystem } from "./src/systems/dungeon.system";
import { BoidSpawnSystem } from "./src/systems/boid.spawn.system";
import { MinimapSystem } from "./src/systems/minimap.system";
import { BoidSystem } from "./src/systems/boid.system";
import { SnakeSkeletonSystem } from "./src/systems/snake-skeleton.system";
import { SnakeSkinSystem } from "./src/systems/snake-skin.system";
import { PlayerControlSystem } from "./src/systems/player-control.system";

import { LevelManager } from "./src/game/level-manager";
import { ProgressStore } from "./src/game/progress-store";
import { refreshAnimalUnlocks } from "./src/game/character-config";
import { LEVELS } from "./src/game/level-config";

import { createMainMenu } from "./src/ui/main-menu";
import { createLevelSelect } from "./src/ui/level-select";
import { createHud } from "./src/ui/hud";
import { LizardLegSystem } from "./src/systems/lizard-leg.system.js";
import { Vector } from "./src/utils/vector";



// ─── Engine + systems ────────────────────────────────────────────────────
// Built once at boot. No dungeon/player/mice exist yet — LevelManager
// populates the world the first time a level is started from the UI.

const engine = new GameEngine();
const physicsSystem = new PhysicsSystem(engine.world);
const boidSpawnSystem = new BoidSpawnSystem(engine.world, engine.eventBus, { mouseCountPerRoom: 10 });
const playerControlSystem = new PlayerControlSystem(engine.world, engine.eventBus, physicsSystem, engine.inputs);

engine.inputs.mapActions('attack', 'Space');
engine.inputs.mapActions('jump', 'Space');
engine.inputs.mapActions('move_up', 'KeyW');
engine.inputs.mapActions('move_right', 'KeyD');
engine.inputs.mapActions('move_left', 'KeyA');
engine.inputs.mapActions('move_down', 'KeyS');
engine.inputs.mapActions('enableDebug', 'KeyP');
engine.inputs.mapActions('enableMinMap', 'KeyM');
engine.inputs.mapActions('enableDungeonGeneration', 'KeyG');
engine.inputs.mapActions('enableCollision', 'KeyC');
engine.inputs.mapActions('respawnBoids', 'KeyR');

engine.eventBus.on('mousedown', (loc: Vector) => {
    const worldPos = engine.camera.canvasToWorld(loc);
});

engine.addSystem(new DungeonSystem(engine.world, engine.eventBus, engine.canvas.width, engine.canvas.height));
engine.addSystem(physicsSystem);
engine.addSystem(new CollisionSystem(engine.world, engine.eventBus));
engine.addSystem(boidSpawnSystem);
engine.addSystem(new BoidSystem(engine.world, engine.eventBus));
engine.addSystem(playerControlSystem);
engine.addSystem(new SnakeSkeletonSystem(engine.world, engine.eventBus));
engine.addSystem(new SnakeSkinSystem(engine.world, engine.eventBus));
engine.addSystem(new RendererSystem(engine.world, engine.ctx!, engine.camera));
engine.addSystem(new LizardLegSystem(engine.world, engine.eventBus));
engine.addSystem(new MinimapSystem(engine.world, engine.eventBus, engine.ctx as CanvasRenderingContext2D));
engine.addSystem(new CollisionDebugSystem(engine.world, engine.eventBus, engine.ctx as CanvasRenderingContext2D, engine.camera, engine.clock));

engine.start();

const levelManager = new LevelManager(engine, { boidSpawnSystem });


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
});


// ─── UI ─────────────────────────────────────────────────────────────────

const uiRoot = document.getElementById('ui-root');

let selectedCharacterId = 'snake';

const mainMenu = createMainMenu({
    progressStore,
    onPlay(characterId: string) {
        selectedCharacterId = characterId;
        mainMenu.hide();
        levelSelect.show();
    },
});

const levelSelect = createLevelSelect({
    progressStore,
    onSelectLevel(levelIndex: number) {
        startLevel(levelIndex);
    },
    onBack() {
        levelSelect.hide();
        mainMenu.show();
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