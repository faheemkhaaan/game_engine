import selectionSound from '@assets/ui_sound.mp3'
import playerAttack from '@assets/player_attack.wav'
export class SoundManager {


    private soundSource: string[] = []
    constructor() {

    }

    selectionSound() {

        const audio = new Audio(selectionSound);
        audio.play();
    }

    playerAttack() {
        const audio = new Audio(playerAttack);
        audio.play()
    }
}

export const sounds = new SoundManager();