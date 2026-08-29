import { Character, CHARACTERS, isCharacterPlayable } from "../game/character-config";
import { ProgressStore } from "../game/progress-store";

/**
 * createMainMenu
 *
 * Builds the character-select screen. Only animals that are both point-unlocked
 * AND have real gameplay behind them (`implemented: true`) are selectable —
 * see character-config.mjs. Everything else renders as a sealed medallion with
 * its point requirement.
 *
 * @param {{
 *   progressStore: import('../game/progress-store.mjs').ProgressStore,
 *   onPlay: (characterId: string) => void,
 * }} options
 * @returns {{ element: HTMLElement, refresh: () => void }}
 */

type CreateMainMenuProps = {
    progressStore: ProgressStore;
    onPlay: (id: string) => void;
}
export function createMainMenu({ progressStore, onPlay }: CreateMainMenuProps) {
    const screen = document.createElement('div');
    screen.className = 'ui-screen';

    let selectedId = 'snake';

    function renderCard(character: Character) {
        const playable = isCharacterPlayable(character, progressStore);
        const points = progressStore.getPoints();
        const card = document.createElement('div');
        card.className = 'character-card' + (playable ? '' : ' locked') + (selectedId === character.id && playable ? ' selected' : '');
        card.dataset.characterId = character.id;

        const medallion = document.createElement('div');
        medallion.className = 'character-medallion';
        medallion.style.color = playable ? character.color : '';
        medallion.textContent = playable ? character.name[0] : '🔒';
        card.appendChild(medallion);

        const name = document.createElement('div');
        name.className = 'character-name';
        name.textContent = character.name;
        card.appendChild(name);

        const tagline = document.createElement('div');
        tagline.className = 'character-tagline';
        tagline.textContent = character.tagline;
        card.appendChild(tagline);

        const seal = document.createElement('div');
        seal.className = 'character-lock-seal';
        if (playable) {
            seal.textContent = 'READY';
        } else if (!character.implemented) {
            seal.textContent = 'COMING SOON';
        } else {
            seal.textContent = `${points} / ${character.pointsRequired} PTS`;
        }
        card.appendChild(seal);

        if (playable) {
            card.addEventListener('click', () => {
                selectedId = character.id;
                render();
            });
        }

        return card;
    }

    function render() {
        screen.innerHTML = '';

        const eyebrow = document.createElement('div');
        eyebrow.className = 'ui-eyebrow';
        eyebrow.textContent = 'A Dungeon Feeding Ground';
        screen.appendChild(eyebrow);

        const title = document.createElement('h1');
        title.className = 'ui-title';
        title.textContent = 'UNDERGROUND';
        screen.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.className = 'ui-subtitle';
        subtitle.textContent = 'Choose your hunter. Eat mice, grow long, unlock the rest of the burrow.';
        screen.appendChild(subtitle);

        const roster = document.createElement('div');
        roster.className = 'character-roster';
        for (const character of CHARACTERS) {
            roster.appendChild(renderCard(character));
        }
        screen.appendChild(roster);

        const playButton = document.createElement('button');
        playButton.className = 'ui-button';
        playButton.textContent = 'Begin the Hunt';
        playButton.addEventListener('click', () => onPlay(selectedId));
        screen.appendChild(playButton);

        const pointsLine = document.createElement('div');
        pointsLine.className = 'ui-eyebrow';
        pointsLine.style.opacity = '0.7';
        pointsLine.textContent = `${progressStore.getPoints()} points banked`;
        screen.appendChild(pointsLine);
    }

    render();

    return {
        element: screen,
        refresh: render,
        show() { screen.classList.remove('ui-hidden'); render(); },
        hide() { screen.classList.add('ui-hidden'); },
    };
}