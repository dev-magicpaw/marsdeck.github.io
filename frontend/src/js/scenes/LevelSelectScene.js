import Phaser from 'phaser';
import { GAME_LEVELS, getCurrentLevel, LEVEL_PROGRESS, loadLevelProgress, saveLevelProgress } from '../config/level-configs';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    init() {
        // Try to load saved level progress
        loadLevelProgress();
    }

    create() {
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
    
    // Reset all game progress
    resetGameProgress() {
        // Reset all progress
        LEVEL_PROGRESS.completedLevels = {};
        LEVEL_PROGRESS.unlockedLevels = ['level1'];
        LEVEL_PROGRESS.currentLevelId = 'level1';
        LEVEL_PROGRESS.persistentRewards = {
            rewardIds: [],
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