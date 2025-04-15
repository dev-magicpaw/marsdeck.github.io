import Phaser from 'phaser';
import { CARD_TYPES } from '../config/game-data';
import { GAME_LEVELS } from '../config/level-configs';
import levelManager from '../objects/LevelManager';
import RewardsManager from '../objects/RewardsManager';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    init() {
        // Try to load saved level progress
        levelManager.loadLevelProgress();
        
        // Create rewards manager to access unlocked rewards
        this.rewardsManager = new RewardsManager(this);
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
        
        // // Create current level info
        // const currentLevel = levelManager.getCurrentLevel();
        // const currentLevelInfo = this.add.text(width / 2, 100, 
        //     `Current Level: ${currentLevel.name}`, {
        //     fontSize: '18px',
        //     color: '#FFFFFF'
        // });
        // currentLevelInfo.setOrigin(0.5, 0);
        
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
            const isUnlocked = levelManager.LEVEL_PROGRESS.unlockedLevels.includes(level.id);
            const isCompleted = levelManager.LEVEL_PROGRESS.completedLevels[level.id];
            
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
                    levelManager.LEVEL_PROGRESS.currentLevelId = level.id;
                    
                    // Start the game
                    this.scene.start('GameScene');
                });
            }
        });
        
        // Display unlocked rewards
        this.createRewardsDisplay();
        
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
    
    // Create display for unlocked rewards
    createRewardsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Position for rewards section (between level buttons and start button)
        const rewardsY = 350;
        
        // Add title for rewards section
        const rewardsTitle = this.add.text(width / 2, rewardsY, 'UNLOCKED REWARDS', {
            fontSize: '24px',
            color: '#FFDD00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        rewardsTitle.setOrigin(0.5, 0);
        
        // Create 6 reward slots
        const slotWidth = 150;
        const slotHeight = 210;
        const slotSpacing = 20;
        const slotsY = rewardsY + 50;
        
        // Calculate total width of all slots with spacing
        const totalSlotsWidth = (slotWidth * 6) + (slotSpacing * 5);
        // Calculate starting X position to center all slots
        const startX = (width - totalSlotsWidth) / 2;
        
        // Get all unlocked rewards from levelManager through the rewards manager
        const persistentRewardIds = levelManager.LEVEL_PROGRESS.persistentRewards.rewardIds || [];
        
        // Create each reward slot
        for (let i = 0; i < 6; i++) {
            const slotX = startX + (i * (slotWidth + slotSpacing));
            
            // Check if we have a reward for this slot
            if (i < persistentRewardIds.length) {
                const rewardId = persistentRewardIds[i];
                const reward = this.rewardsManager.findRewardById(rewardId);
                
                if (reward) {
                    // Determine background texture based on card type
                    let textureKey = 'cardBackground';
                    
                    // Get the card ID from the reward object
                    let rewardCardId = null;
                    if (reward.effects) {
                        // Look for the first effect with a cardId
                        for (const effect of reward.effects) {
                            if (effect.cardId) {
                                rewardCardId = effect.cardId;
                                break;
                            }
                        }
                    }
                    
                    if (rewardCardId) {
                        // Find the card type directly from CARD_TYPES
                        const rewardCard = Object.values(CARD_TYPES).find(ct => ct.id === rewardCardId);
                        // Check if it's a prefab or event
                        if (rewardCard && rewardCard.cardType === 'prefab') {
                            textureKey = 'cardPrefabBackground';
                        } else if (rewardCard && rewardCard.cardType === 'event') {
                            textureKey = 'cardEventBackground';
                        }
                    }
                    
                    // Slot background with nineslice
                    const slotBg = this.add.nineslice(
                        slotX + slotWidth/2,
                        slotsY + slotHeight/2,
                        textureKey,
                        null,
                        slotWidth, slotHeight,
                        15, 15, 35, 15
                    );
                    slotBg.setOrigin(0.5);
                    
                    // Dark background for the description to improve readability
                    const descBg = this.add.graphics();
                    const descBgYOffset = slotHeight - 80;
                    const descBgHeight = 75;
                    descBg.fillStyle(0x000000, 0.6);
                    descBg.fillRoundedRect(slotX + 10, slotsY + descBgYOffset, slotWidth - 20, descBgHeight, 8);
                    
                    // Reward name
                    const nameYOffset = 20;
                    const nameText = this.add.text(
                        slotX + slotWidth/2, 
                        slotsY + nameYOffset, 
                        reward.name, 
                        { 
                            fontSize: '16px', 
                            fontFamily: 'Arial', 
                            color: '#ffffff', 
                            align: 'center', 
                            fontWeight: 'bold',
                            stroke: '#000000',
                            strokeThickness: 2,
                            wordWrap: { width: slotWidth - 20 }
                        }
                    ).setOrigin(0.5);
                    
                    // Reward image
                    const imageYOffset = 80;
                    if (reward.image) {
                        const rewardImage = this.add.sprite(
                            slotX + slotWidth/2,
                            slotsY + imageYOffset,
                            reward.image
                        );
                        
                        // Set fixed height and calculate width based on aspect ratio
                        const imageHeight = 70;
                        let displayWidth = imageHeight;
                        const imageTexture = this.textures.get(reward.image);
                        if (imageTexture && imageTexture.get()) {
                            const sourceWidth = imageTexture.get().width;
                            const sourceHeight = imageTexture.get().height;
                            
                            if (sourceWidth && sourceHeight) {
                                const aspectRatio = sourceWidth / sourceHeight;
                                displayWidth = imageHeight * aspectRatio;
                            }
                        }
                        rewardImage.setDisplaySize(displayWidth, imageHeight);
                    }
                    
                    // Reward description (shortened)
                    const descriptionYOffset = slotHeight - 50;
                    const descriptionText = this.add.text(
                        slotX + slotWidth/2, 
                        slotsY + descriptionYOffset, 
                        reward.description, 
                        { 
                            fontSize: '11px', 
                            fontFamily: 'Arial', 
                            color: '#ffffff', 
                            align: 'center',
                            wordWrap: { width: slotWidth - 30 },
                            lineSpacing: 2
                        }
                    ).setOrigin(0.5, 0);
                    
                    // Add "UNLOCKED" label at the bottom
                    const unlockedLabel = this.add.text(
                        slotX + slotWidth/2, 
                        slotsY + slotHeight + 15,
                        "UNLOCKED", 
                        { 
                            fontSize: '14px', 
                            fontFamily: 'Arial', 
                            color: '#ffcc00', 
                            align: 'center',
                            fontWeight: 'bold',
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5);
                }
            } else {
                // Empty slot - just a simple background
                const emptySlotBg = this.add.rectangle(
                    slotX + slotWidth/2,
                    slotsY + slotHeight/2,
                    slotWidth, slotHeight,
                    0x333333, 0.6
                );
                emptySlotBg.setStrokeStyle(2, 0x777777);
                
                // Empty text
                const emptyText = this.add.text(
                    slotX + slotWidth/2,
                    slotsY + slotHeight/2,
                    'Empty',
                    { 
                        fontSize: '16px', 
                        fontFamily: 'Arial', 
                        color: '#777777'
                    }
                ).setOrigin(0.5);
            }
        }
    }
    
    // Reset all game progress
    resetGameProgress() {
        // Reset all progress
        levelManager.LEVEL_PROGRESS.completedLevels = {};
        levelManager.LEVEL_PROGRESS.unlockedLevels = ['level1'];
        levelManager.LEVEL_PROGRESS.currentLevelId = 'level1';
        levelManager.LEVEL_PROGRESS.persistentRewards = {
            rewardIds: [],
            resourceBonuses: {}
        };
        
        // Save the reset progress
        levelManager.saveLevelProgress();
        
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
        
        // Make the message disappear after 0.5 seconds
        this.time.delayedCall(500, () => {
            confirmText.destroy();
            // Refresh the level selection UI
            this.scene.restart();
        });
    }
} 