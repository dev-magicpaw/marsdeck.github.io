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
        
        // Initialize testing mode flag (default: false)
        if (levelManager.LEVEL_PROGRESS.testingMode === undefined) {
            levelManager.LEVEL_PROGRESS.testingMode = false;
        }
        
        // Setup keyboard inputs for testing mode toggle
        this.input.keyboard.on('keydown-J', (event) => {
            // Check if Command (metaKey) and Shift are also pressed
            if (event.shiftKey && event.metaKey) {
                // Toggle testing mode
                levelManager.LEVEL_PROGRESS.testingMode = !levelManager.LEVEL_PROGRESS.testingMode;
                // Save the setting
                levelManager.saveLevelProgress();
                // Show feedback to the player
                this.showTestingModeStatus(levelManager.LEVEL_PROGRESS.testingMode);
            }
        });
    }

    create() {
        this.createLevelSelectionUI();
    }
    
    // Show testing mode status message
    showTestingModeStatus(isEnabled) {
        // Create or update the testing mode indicator
        const statusText = isEnabled ? 'TESTING MODE: ON' : 'TESTING MODE: OFF';
        const statusColor = isEnabled ? '#00FF00' : '#FF0000';
        
        // Remove existing status text if it exists
        if (this.testingModeText) {
            this.testingModeText.destroy();
        }
        
        // Show the new status
        this.testingModeText = this.add.text(
            this.cameras.main.width / 2,
            30,
            statusText,
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: statusColor,
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.testingModeText.setOrigin(0.5);
        
        // Show temporary notification in the center
        const notificationText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Testing Mode ${isEnabled ? 'Enabled' : 'Disabled'}`,
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: statusColor,
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        notificationText.setOrigin(0.5);
        notificationText.setDepth(1000);
        
        // Make notification disappear after 1.5 seconds
        this.tweens.add({
            targets: notificationText,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                notificationText.destroy();
            }
        });
    }
    
    createLevelSelectionUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        
        // Add title
        const title = this.add.text(width / 2, 50, 'MARS DECK COLONY', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        
        // Display testing mode status if enabled
        if (levelManager.LEVEL_PROGRESS.testingMode) {
            this.testingModeText = this.add.text(
                width / 2,
                30,
                'TESTING MODE: ON',
                {
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#00FF00',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            );
            this.testingModeText.setOrigin(0.5);
        }
        
        // Create level buttons
        const buttonSpacing = 100;
        const startY = 145;
        const levelsPerRow = 3;
        const buttonWidth = 220;
        const buttonHeight = 80;
        
        GAME_LEVELS.forEach((level, index) => {
            const row = Math.floor(index / levelsPerRow);
            const col = index % levelsPerRow;
            
            const x = width / 2 + (col - 1) * (buttonWidth + 20);
            const y = startY + row * buttonSpacing;
            
            // Check if level is unlocked
            const isUnlocked = levelManager.LEVEL_PROGRESS.unlockedLevels.includes(level.id);
            const isCompleted = levelManager.LEVEL_PROGRESS.completedLevels[level.id];
            const isCurrentPlayable = isUnlocked && !isCompleted;
            
            // Create button background - use image for current playable level
            let button;
            if (isCurrentPlayable) {
                // Use the blueSquareButton image with nine-slice for current playable level
                button = this.add.nineslice(
                    x, y,
                    'blueSquareButton',
                    null,
                    buttonWidth, buttonHeight,
                    15, 15, 15, 15  // Left, right, top, bottom slice points
                );
                button.setOrigin(0.5);
                
                // Add a simple glow effect (pulsing alpha)
                this.tweens.add({
                    targets: button,
                    alpha: 0.8,
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });
            } else if (isCompleted) {
                // Use greenSquareButton with nine-slice for completed levels
                button = this.add.nineslice(
                    x, y,
                    'greenSquareButton',
                    null,
                    buttonWidth, buttonHeight,
                    15, 15, 15, 15  // Left, right, top, bottom slice points
                );
                button.setTint(0x555555);
                button.setOrigin(0.5);
            } else {
                // Use greySquareButton for locked levels
                button = this.add.nineslice(
                    x, y,
                    'greySquareButton',
                    null,
                    buttonWidth, buttonHeight,
                    15, 15, 15, 15  // Left, right, top, bottom slice points
                );
                button.setTint(0x333333); // Light grey tint
                button.setOrigin(0.5);
            }
            
            // Add button text
            const buttonText = this.add.text(x, y , level.name, {
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
            
            // Add "completed" text for completed levels
            if (isCompleted) {
                const completedText = this.add.text(x, y + 20, 'COMPLETED', {
                    fontSize: '12px',
                    color: '#FFFFFF',
                    fontStyle: 'bold'
                });
                completedText.setOrigin(0.5);
            }
            
            // Only make unlocked and not completed levels interactive
            if (isUnlocked && !isCompleted) {
                button.setInteractive({ useHandCursor: true });
                
                // Add hover effect
                button.on('pointerover', () => {
                    if (typeof button.setFillStyle === 'function') {
                        // Rectangle objects have setFillStyle
                        button.setFillStyle(0x66BBFF);
                    } else {
                        // Sprite or NineSlice objects use setTint
                        button.setTint(0xbbbbff);
                    }
                });
                
                button.on('pointerout', () => {
                    if (typeof button.setFillStyle === 'function') {
                        // Rectangle objects have setFillStyle
                        button.setFillStyle(0x0088FF);
                    } else {
                        // Sprite or NineSlice objects use clearTint
                        button.clearTint();
                    }
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
        
        // Add reset progress button
        const resetButtonWidth = 220;
        const resetButtonHeight = 40;
        
        // Use redSquareButton with nine-slice for reset button
        const resetButton = this.add.nineslice(
            width / 2,
            height - 60,
            'redSquareButton',
            null,
            resetButtonWidth, resetButtonHeight,
            15, 15, 15, 15  // Left, right, top, bottom slice points
        );
        resetButton.setOrigin(0.5);
        resetButton.setInteractive({ useHandCursor: true });
        
        const resetText = this.add.text(width / 2, height - 60, 'RESET PROGRESS', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        resetText.setOrigin(0.5);
        
        // Add hover effect for reset button
        resetButton.on('pointerover', () => {
            resetButton.setTint(0xdddddd);
        });
        
        resetButton.on('pointerout', () => {
            resetButton.clearTint();
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
        const slotWidth = 175; // 5
        const slotHeight = 245; // 7
        const slotSpacing = 20;
        const slotsY = rewardsY + 50;
        
        // TODO: calculate dimentions with maximased width and maximized height. Compare and take smaller of the two.

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
                    const descBgYOffset = slotHeight - 120;
                    const descBgHeight = 110;
                    descBg.fillStyle(0x000000, 0.6);
                    descBg.fillRoundedRect(slotX + 10, slotsY + descBgYOffset, slotWidth - 20, descBgHeight, 8);
                    
                    // Reward name
                    const nameYOffset = 20;
                    const nameText = this.add.text(
                        slotX + slotWidth/2, 
                        slotsY + nameYOffset, 
                        reward.name, 
                        { 
                            fontSize: '14px', 
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
                        const imageHeight = 80;
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
                    const descriptionYOffset = slotHeight - 110;
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
                }
            } else {
                // Empty slot - just a simple background
                const emptySlotBg = this.add.rectangle(
                    slotX + slotWidth/2,
                    slotsY + slotHeight/2,
                    slotWidth, slotHeight,
                    0x333333, 0.6
                );
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