import Phaser from 'phaser';
import '../css/style.css';
import config from './config/game-config';

class MarsColonyGame {
    constructor() {
        this.game = new Phaser.Game(config);
    }
}

window.onload = () => {
    new MarsColonyGame();
};
