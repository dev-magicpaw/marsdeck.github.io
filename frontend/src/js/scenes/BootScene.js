import Phaser from 'phaser';
// Import the terrain tileset directly
import terrainTileset from '../../assets/images/terrain.png';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Loading screen 
        this.createLoadingBar();

        // Load tile spritesheet with imported path
        this.load.spritesheet('terrain', terrainTileset, { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Load building assets (using placeholders for now, can be replaced later)
        this.load.image('cardTemplate', 'https://via.placeholder.com/120x180/888/fff?text=Card');
        this.load.image('gridTile', 'https://via.placeholder.com/64x64/555/fff?text=Tile');
        
        // Load sci-fi terrain tiles
        this.load.image('terrainPlain1', require('../../assets/images/rts_sci_fi/Tile/scifiTile_41.png'));
        this.load.image('terrainPlain2', require('../../assets/images/rts_sci_fi/Tile/scifiTile_42.png'));
        
        // Load iron deposit textures
        this.load.image('ironDeposit1', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_11.png'));
        this.load.image('ironDeposit2', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_09.png'));
        this.load.image('ironDeposit3', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_10.png'));
        
        // Load water texture
        this.load.image('waterDeposit', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_06.png'));
        
        // Load mountain textures (use environment assets that look like rocky formations)
        this.load.image('mountainTile1', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_03.png'));
        this.load.image('mountainTile2', require('../../assets/images/rts_sci_fi/Environment/scifiEnvironment_04.png'));
        
        // Load building textures
        this.load.image('concreteMixer', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_09.png'));
        this.load.image('droneDepo', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_06.png'));
        this.load.image('fuelRefinery', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_15.png'));
        this.load.image('ironMine', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_07.png'));
        this.load.image('launchPad', require('../../assets/images/ui_pack_space/Extra/Double/button_square_depth.png'));
        this.load.image('launchPadSurrounding', require('../../assets/images/ui_pack_space/Extra/Double/button_square_depth.png'));
        this.load.image('solarPanel', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_12.png'));
        this.load.image('steelworks', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_08.png'));
        this.load.image('waterPump', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_11.png'));
        this.load.image('windTurbine', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_01.png'));
        
        // Load rocket sprites
        this.load.image('rocketUnFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_008.png'));
        this.load.image('rocketFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_009.png'));
        this.load.image('rocketInFlight', require('../../assets/images/space_rockets/Missiles/spaceMissiles_007.png'));
        
        // Terrain types
        this.load.image('terrainMetal', 'https://via.placeholder.com/64x64/CD853F/fff?text=Metal');
        this.load.image('terrainWater', 'https://via.placeholder.com/64x64/ADD8E6/fff?text=Water');
        this.load.image('terrainMountain', 'https://via.placeholder.com/64x64/A0522D/fff?text=Mount');
        
        // Load card background
        this.load.image('cardBackground', require('../../assets/images/ui_pack_space/Blue/Default/button_square_header_large_rectangle.png'));
        
        // Load card slot background
        this.load.image('cardSlotBackground', require('../../assets/images/ui_pack_space/Extra/Double/bar_shadow_square_outline_large.png'));
        
        // Load hand limit indicator
        this.load.image('handLimitIndicator', require('../../assets/images/ui_pack_space/Red/Double/bar_square_gloss_small_square.png'));
    }

    create() {
        // Debug: Log when assets are loaded
        console.log('Assets loaded successfully');
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