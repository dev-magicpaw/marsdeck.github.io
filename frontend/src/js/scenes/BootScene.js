import Phaser from 'phaser';
import { GAME_LEVELS, getCurrentLevel, LEVEL_PROGRESS, loadLevelProgress, saveLevelProgress } from '../config/level-configs';

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
        this.load.image('windTurbineSurrounding', require('../../assets/images/ui_pack_space/Extra/Double/panel_square_screws_upside_down.png'));
        
        // Load illegal tile shading sprite
        this.load.image('illegalTileShade', require('../../assets/images/ui_pack_space/Extra/Double/bar_shadow_square_large_square.png'));

        // Load rocket sprites
        this.load.image('rocketUnFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_008.png'));
        this.load.image('rocketFueled', require('../../assets/images/space_rockets/Missiles/spaceMissiles_009.png'));
        this.load.image('rocketInFlight', require('../../assets/images/space_rockets/Missiles/spaceMissiles_007.png'));
        
        // Terrain types
        this.load.image('terrainMetal', 'https://via.placeholder.com/64x64/CD853F/fff?text=Metal');
        this.load.image('terrainWater', 'https://via.placeholder.com/64x64/ADD8E6/fff?text=Water');
        this.load.image('terrainMountain', 'https://via.placeholder.com/64x64/A0522D/fff?text=Mount');
        
        // Load card background
        // Using NineSlice for proper UI scaling
        this.load.image('cardBackground', require('../../assets/images/ui_pack_space/Blue/Default/button_square_header_large_rectangle.png'));
        
        // Load card slot background
        this.load.image('cardSlotBackground', require('../../assets/images/ui_pack_space/Extra/Double/bar_shadow_square_outline_large.png'));
        
        // Load hand limit indicator
        this.load.image('handLimitIndicator', require('../../assets/images/ui_pack_space/Red/Double/bar_square_gloss_small_square.png'));
        
        // Load end turn button texture
        this.load.image('blueGlossSquareButton', require('../../assets/images/ui_pack_space/Blue/Double/bar_square_gloss_large.png'));
        
        // Load discard button texture
        this.load.image('discardButton', require('../../assets/images/ui_pack_space/Red/Double/bar_square_gloss_large.png'));
        
        // Load victory panel background texture
        this.load.image('victoryPanelBackground', require('../../assets/images/ui_pack_space/Blue/Double/bar_square_large_square.png'));
        this.load.image('panelGlassScrews', require('../../assets/images/ui_pack_space/Extra/Double/panel_glass_screws.png'));
    }

    create() {
        // Try to load saved level progress
        loadLevelProgress();
        
        // Show level selection screen
        this.createLevelSelectionUI();
    }
    
    createLevelSelectionUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        
        // Add title
        const title = this.add.text(width / 2, 50, 'CARD CITY: SELECT LEVEL', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        
        // Create current level info
        const currentLevel = getCurrentLevel();
        const currentLevelInfo = this.add.text(width / 2, 100, 
            `Current Level: ${currentLevel.name}`, {
            fontSize: '18px',
            color: '#FFFFFF'
        });
        currentLevelInfo.setOrigin(0.5, 0);
        
        // Create level buttons
        const buttonSpacing = 80;
        const startY = 180;
        const levelsPerRow = 3;
        const buttonWidth = 200;
        const buttonHeight = 60;
        
        GAME_LEVELS.forEach((level, index) => {
            const row = Math.floor(index / levelsPerRow);
            const col = index % levelsPerRow;
            
            const x = width / 2 + (col - 1) * (buttonWidth + 20);
            const y = startY + row * buttonSpacing;
            
            // Check if level is unlocked
            const isUnlocked = LEVEL_PROGRESS.unlockedLevels.includes(level.id);
            const isCompleted = LEVEL_PROGRESS.completedLevels[level.id];
            
            // Create button background
            const buttonColor = isCompleted ? 0x00FF00 : (isUnlocked ? 0x0088FF : 0x555555);
            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, buttonColor, 0.8);
            button.setStrokeStyle(2, 0xFFFFFF);
            
            // Add button text
            const buttonText = this.add.text(x, y, level.name, {
                fontSize: '18px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            });
            buttonText.setOrigin(0.5);
            
            // Add lock icon for locked levels
            if (!isUnlocked) {
                const lockText = this.add.text(x, y + 20, '🔒', {
                    fontSize: '16px'
                });
                lockText.setOrigin(0.5);
            }
            
            // Only make unlocked levels interactive
            if (isUnlocked) {
                button.setInteractive({ useHandCursor: true });
                
                // Add hover effect
                button.on('pointerover', () => {
                    button.setFillStyle(0x66BBFF);
                });
                
                button.on('pointerout', () => {
                    button.setFillStyle(isCompleted ? 0x00FF00 : 0x0088FF);
                });
                
                // Add click event
                button.on('pointerdown', () => {
                    // Set this level as current level
                    LEVEL_PROGRESS.currentLevelId = level.id;
                    
                    // Start the game
                    this.scene.start('GameScene');
                });
            }
        });
        
        // Add start game button (using current level)
        const startButton = this.add.rectangle(width / 2, height - 80, 250, 60, 0x22CC22, 0.8);
        startButton.setStrokeStyle(2, 0xFFFFFF);
        startButton.setInteractive({ useHandCursor: true });
        
        const startText = this.add.text(width / 2, height - 80, 'START GAME', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        startText.setOrigin(0.5);
        
        // Add hover effect
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x44EE44);
        });
        
        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x22CC22);
        });
        
        // Start game when clicked
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Add reset progress button
        const resetButton = this.add.rectangle(width / 2, height - 20, 220, 40, 0xCC2222, 0.8);
        resetButton.setStrokeStyle(2, 0xFFFFFF);
        resetButton.setInteractive({ useHandCursor: true });
        
        const resetText = this.add.text(width / 2, height - 20, 'RESET ALL PROGRESS', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        resetText.setOrigin(0.5);
        
        // Add hover effect for reset button
        resetButton.on('pointerover', () => {
            resetButton.setFillStyle(0xEE4444);
        });
        
        resetButton.on('pointerout', () => {
            resetButton.setFillStyle(0xCC2222);
        });
        
        // Reset game progress when clicked
        resetButton.on('pointerdown', () => {
            this.resetGameProgress();
        });
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

    // New method to reset all game progress
    resetGameProgress() {
        // Reset all progress
        LEVEL_PROGRESS.completedLevels = {};
        LEVEL_PROGRESS.unlockedLevels = ['level1'];
        LEVEL_PROGRESS.currentLevelId = 'level1';
        LEVEL_PROGRESS.persistentRewards = {
            cards: [],
            resourceBonuses: {}
        };
        
        // Save the reset progress
        saveLevelProgress();
        
        // Show confirmation message
        const confirmText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2,
            'Progress Reset!',
            {
                fontSize: '32px',
                color: '#FFFFFF',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        confirmText.setOrigin(0.5);
        
        // Make the message disappear after 1.5 seconds
        this.time.delayedCall(1500, () => {
            confirmText.destroy();
            // Refresh the level selection UI
            this.scene.restart();
        });
    }
} 