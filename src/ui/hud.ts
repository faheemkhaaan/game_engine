/**
 * createHud
 *
 * Lightweight in-level overlay: current points, current level name, a way
 * back to the level select (pause), and a dev-only "Finish Level" button.
 *
 * That dev button exists because there's no real win condition yet — nothing
 * currently emits points for eating a mouse. Once that collision/eating
 * logic exists, have it `engine.eventBus.emit('mouseEaten', points)` (main.mjs
 * already listens for that and calls `hud.setPoints`), and swap the dev
 * button for a real "reach N points" check.
 *
 * @param {{
 *   onExitToLevelSelect: () => void,
 *   onDevFinishLevel: () => void,
 * }} options
 * @returns {{ element: HTMLElement, show: () => void, hide: () => void, setPoints: (n:number) => void, setLevelName: (name:string) => void }}
 */
export function createHud({ onExitToLevelSelect, onDevFinishLevel }: { onExitToLevelSelect: () => void; onDevFinishLevel: () => void }) {
    const root = document.createElement('div');
    root.className = 'hud-root ui-hidden';

    const left = document.createElement('div');
    left.className = 'hud-panel';
    const levelName = document.createElement('div');
    levelName.className = 'hud-level-name';
    left.appendChild(levelName);
    root.appendChild(left);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.alignItems = 'flex-end';
    right.style.gap = '0.5rem';

    const pointsPanel = document.createElement('div');
    pointsPanel.className = 'hud-panel';
    pointsPanel.style.textAlign = 'right';
    const pointsLabel = document.createElement('div');
    pointsLabel.className = 'hud-points-label';
    pointsLabel.textContent = 'Points';
    const pointsValue = document.createElement('div');
    pointsValue.className = 'hud-points-value';
    pointsValue.textContent = '0';
    pointsPanel.appendChild(pointsLabel);
    pointsPanel.appendChild(pointsValue);
    right.appendChild(pointsPanel);

    const exitButton = document.createElement('button');
    exitButton.className = 'ui-button-ghost';
    exitButton.textContent = 'Pause · Trail';
    exitButton.addEventListener('click', onExitToLevelSelect);
    right.appendChild(exitButton);

    const devButton = document.createElement('button');
    devButton.className = 'ui-button-ghost';
    devButton.textContent = 'Finish Level (dev)';
    devButton.title = 'Placeholder until mouse-eating scoring exists';
    devButton.addEventListener('click', onDevFinishLevel);
    right.appendChild(devButton);

    root.appendChild(right);

    return {
        element: root,
        show() { root.classList.remove('ui-hidden'); },
        hide() { root.classList.add('ui-hidden'); },
        setPoints(n: number) { pointsValue.textContent = String(n); },
        setLevelName(name: string) { levelName.textContent = name; },
    };
}