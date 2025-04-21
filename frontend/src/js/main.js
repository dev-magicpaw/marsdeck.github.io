import Phaser from 'phaser';
import '../css/style.css';
import config from './config/game-config';
import { initializeDataLayer } from './utils/analytics';

class MarsColonyGame {
    constructor() {
        // Initialize analytics
        initializeDataLayer();
        
        // Initialize game
        this.game = new Phaser.Game(config);
    }
}

window.onload = () => {
    new MarsColonyGame();
};
