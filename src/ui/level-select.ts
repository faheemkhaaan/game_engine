import { LEVELS } from "../game/level-config";

/**
 * createLevelSelect
 *
 * Builds the level-select screen: a horizontal "expedition trail" of level
 * nodes. A level is selectable once `progressStore.isLevelUnlocked(index)`
 * is true — by default that's sequential (level N unlocks when N-1 is
 * completed via progressStore.completeLevel), see progress-store.mjs.
 *
 * @param {{
 *   progressStore: import('../game/progress-store.mjs').ProgressStore,
 *   onSelectLevel: (levelIndex: number) => void,
 *   onBack: () => void,
 * }} options
 * @returns {{ element: HTMLElement, refresh: () => void }}
 */
export function createLevelSelect({ progressStore, onSelectLevel, onBack }) {
    const screen = document.createElement('div');
    screen.className = 'ui-screen ui-hidden';

    function renderNode(level, index) {
        const unlocked = progressStore.isLevelUnlocked(index);
        const completed = progressStore.isLevelCompleted(index);

        const node = document.createElement('div');
        node.className = 'level-node' + (unlocked ? '' : ' locked') + (completed ? ' completed' : '');

        const torch = document.createElement('div');
        torch.className = 'level-torch';
        torch.textContent = unlocked ? String(index + 1).padStart(2, '0') : '🔒';
        node.appendChild(torch);

        const name = document.createElement('div');
        name.className = 'level-name';
        name.textContent = level.name;
        node.appendChild(name);

        const description = document.createElement('div');
        description.className = 'level-description';
        description.textContent = level.description;
        node.appendChild(description);

        if (unlocked) {
            const stats = document.createElement('div');
            stats.className = 'level-stats';
            stats.innerHTML = `<span>${level.minRooms} rooms</span><span>${level.enemySnakeCount} rivals</span>`;
            node.appendChild(stats);

            node.addEventListener('click', () => onSelectLevel(index));
        } else {
            const lockLabel = document.createElement('div');
            lockLabel.className = 'level-lock-label';
            lockLabel.textContent = 'Complete previous level';
            node.appendChild(lockLabel);
        }

        return node;
    }

    function render() {
        screen.innerHTML = '';

        const eyebrow = document.createElement('div');
        eyebrow.className = 'ui-eyebrow';
        eyebrow.textContent = 'Choose Your Expedition';
        screen.appendChild(eyebrow);

        const title = document.createElement('h1');
        title.className = 'ui-title';
        title.textContent = 'THE TRAIL';
        screen.appendChild(title);

        const trail = document.createElement('div');
        trail.className = 'expedition-trail';

        LEVELS.forEach((level, index) => {
            if (index > 0) {
                const connector = document.createElement('div');
                connector.className = 'trail-connector' + (progressStore.isLevelUnlocked(index) ? ' unlocked' : '');
                trail.appendChild(connector);
            }
            const wrap = document.createElement('div');
            wrap.className = 'trail-node-wrap';
            wrap.appendChild(renderNode(level, index));
            trail.appendChild(wrap);
        });

        screen.appendChild(trail);

        const backButton = document.createElement('button');
        backButton.className = 'ui-button-ghost';
        backButton.textContent = '← Back to Menu';
        backButton.addEventListener('click', onBack);
        screen.appendChild(backButton);
    }

    render();

    return {
        element: screen,
        refresh: render,
        show() { screen.classList.remove('ui-hidden'); render(); },
        hide() { screen.classList.add('ui-hidden'); },
    };
}