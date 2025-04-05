import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Loading screen 
        this.createLoadingBar();

        // Load assets here
        // this.load.image('cardTemplate', 'assets/images/card_template.png');
        // this.load.image('gridTile', 'assets/images/grid_tile.png');
        // Placeholder assets for now
        this.load.image('cardTemplate', 'https://via.placeholder.com/120x180/888/fff?text=Card');
        this.load.image('gridTile', 'https://via.placeholder.com/64x64/555/fff?text=Tile');
        
        // Load sci-fi terrain tiles
        this.load.image('terrainPlain1', require('../../assets/images/rts_sci_fi/Tile/scifiTile_41.png'));
        this.load.image('terrainPlain2', require('../../assets/images/rts_sci_fi/Tile/scifiTile_42.png'));
        
        this.load.image('ironMine', 'https://via.placeholder.com/64x64/8B4513/fff?text=Mine');
        this.load.image('droneDepo', 'https://via.placeholder.com/64x64/7CFC00/fff?text=Drone');
        this.load.image('steelworks', 'https://via.placeholder.com/64x64/B0C4DE/fff?text=Steel');
        this.load.image('concreteMixer', 'https://via.placeholder.com/64x64/A9A9A9/fff?text=Cement');
        this.load.image('waterPump', 'https://via.placeholder.com/64x64/1E90FF/fff?text=Water');
        this.load.image('fuelRefinery', 'https://via.placeholder.com/64x64/FF4500/fff?text=Fuel');
        this.load.image('windTurbine', 'https://via.placeholder.com/64x64/00FFFF/fff?text=Wind');
        this.load.image('solarPanel', 'https://via.placeholder.com/64x64/FFD700/fff?text=Solar');
        this.load.image('launchPad', 'https://via.placeholder.com/64x64/9370DB/fff?text=Rocket');
        
        // Terrain types
        this.load.image('terrainMetal', 'https://via.placeholder.com/64x64/CD853F/fff?text=Metal');
        this.load.image('terrainWater', 'https://via.placeholder.com/64x64/ADD8E6/fff?text=Water');
        this.load.image('terrainMountain', 'https://via.placeholder.com/64x64/A0522D/fff?text=Mount');
    }

    create() {
        this.scene.start('GameScene');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }
} 