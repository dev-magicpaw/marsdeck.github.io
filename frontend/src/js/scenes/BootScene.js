import Phaser from 'phaser';
import levelManager from '../objects/LevelManager';
import { trackGameFirstOpen } from '../utils/analytics';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Loading screen 
        this.createLoadingBar();
        
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
        this.load.image('launchPad', require('../../assets/images/hud/extra_button_square_depth.png'));
        this.load.image('launchPadIcon', require('../../assets/images/game_icons/launch_pad.png'));
        this.load.image('launchPadSurrounding', require('../../assets/images/hud/extra_button_square_depth.png'));
        this.load.image('solarPanel', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_12.png'));
        this.load.image('steelworks', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_08.png'));
        this.load.image('waterPump', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_11.png'));
        this.load.image('teslaCoil', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_16.png'));
        this.load.image('windTurbine', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_01.png'));
        this.load.image('windTurbineSurrounding', require('../../assets/images/hud/extra_panel_square_screws_upside_down.png'));
        this.load.image('artificialLights', require('../../assets/images/rts_sci_fi/Structure/scifiStructure_13.png'));
        // Load unit icons
        this.load.image('droneIcon', require('../../assets/images/rts_sci_fi/Unit/scifiUnit_29.png'));
        this.load.image('resourceSupplyIcon', require('../../assets/images/rts_sci_fi/Unit/scifiUnit_30.png'));

        // Load icons
        this.load.image('barterIcon', require('../../assets/images/game_icons/trade_green.png'));
        this.load.image('supplyChainIcon', require('../../assets/images/game_icons/mine_truck_blue.png'));
        this.load.image('waterIcon', require('../../assets/images/game_icons/water.png'));
        this.load.image('ironIcon', require('../../assets/images/game_icons/iron.png'));
        this.load.image('rawExportIcon', require('../../assets/images/game_icons/raw_trade.png'));
        this.load.image('charityIcon', require('../../assets/images/game_icons/present_green.png'));
        this.load.image('fuelPumpIcon', require('../../assets/images/game_icons/gas_pump_blue.png'));
        this.load.image('mechIcon', require('../../assets/images/game_icons/battle_mech_blue.png'));
        this.load.image('improvedElectricGeneration', require('../../assets/images/game_icons/electricity_upgrade_blue.png'));


        // Load illegal tile shading sprite
        this.load.image('illegalTileShade', require('../../assets/images/hud/extra_bar_shadow_square_large_square.png'));

        // Load rocket sprites
        this.load.image('rocketUnFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_008.png'));
        this.load.image('rocketFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_009.png'));
        this.load.image('rocketInFlight', require('../../assets/images/space_rockets/Missiles/spaceMissiles_007.png'));
        
        // Load card background
        this.load.image('cardBackground', require('../../assets/images/hud/blue_button_square_header_large_rectangle.png'));
        this.load.image('cardPrefabBackground', require('../../assets/images/hud/yellow_button_square_header_large_rectangle.png'));
        this.load.image('cardEventBackground', require('../../assets/images/hud/green_button_square_header_large_rectangle.png'));

        // Load card slot background
        this.load.image('cardSlotBackground', require('../../assets/images/hud/extra_bar_shadow_square_outline_large.png'));
        
        // Load hand limit indicator
        this.load.image('handLimitIndicator', require('../../assets/images/hud/red_bar_square_gloss_small_square.png'));
        
        // Load end turn button texture
        this.load.image('blueGlossSquareButton', require('../../assets/images/hud/blue_bar_square_gloss_large.png'));
        this.load.image('blueSquareButton', require('../../assets/images/hud/blue_bar_square_large.png'));
        this.load.image('greenSquareButton', require('../../assets/images/hud/green_bar_square_large.png'));
        this.load.image('redSquareButton', require('../../assets/images/hud/red_bar_square_large.png'));
        this.load.image('greySquareButton', require('../../assets/images/hud/grey_bar_square_large_square.png'));
        
        // Load discard button texture
        this.load.image('discardButton', require('../../assets/images/hud/red_bar_square_gloss_large.png'));
        
        // Load victory panel background texture
        this.load.image('victoryPanelBackground', require('../../assets/images/hud/blue_bar_square_large_square.png'));
        this.load.image('panelGlassScrews', require('../../assets/images/hud/extra_panel_glass_screws.png'));
        this.load.image('barRoundLargeSquare', require('../../assets/images/hud/blue_bar_round_large_square.png'));

        // Load tutorial
        this.load.image('tutorialPanel', require('../../assets/images/tutorial.png'));
        this.load.image('tutorialPanel2', require('../../assets/images/tutorial2.png'));
        
        // Use existing texture for particle effects
        this.load.image('particleGlow', require('../../assets/images/hud/blue_bar_round_large_square.png'));
        this.load.image('magicPaw', require('../../assets/images/game_icons/magic_paw.png'));
        this.load.image('magicPawStudio', require('../../assets/images/game_icons/magic_paw_magic_circle_small.png'));
    }

    create() {
        // Try to load progress from localStorage
        const isFirstTimeUser = !levelManager.loadLevelProgress();
        
        if (isFirstTimeUser) {
            // For first time users, go directly to the tutorial level (level1)
            levelManager.LEVEL_PROGRESS.currentLevelId = 'level1';
            levelManager.saveLevelProgress();
            
            trackGameFirstOpen();

            // Start the game scene directly with the tutorial level
            this.scene.start('GameScene');
        } else {
            // For returning users, go to level selection
            this.scene.start('LevelSelectScene');
        }
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