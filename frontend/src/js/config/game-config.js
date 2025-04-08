import Phaser from 'phaser';
import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';
import LevelSelectScene from '../scenes/LevelSelectScene';
import UIScene from '../scenes/UIScene';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#333333',
    scene: [BootScene, LevelSelectScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

export default config; 