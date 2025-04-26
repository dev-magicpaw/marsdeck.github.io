import Phaser from 'phaser';
import { CARD_TYPES } from '../config/game-data';
import { GAME_LEVELS } from '../config/level-configs';
import levelManager from '../objects/LevelManager';
import RewardsManager from '../objects/RewardsManager';
import { trackCreditsViewed } from '../utils/analytics';

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
        
        // Add contacts button in the bottom left corner
        this.createContactsButton();
        
        // Check if we should show the random level tutorial
        const isFinalLevelCompleted = levelManager.LEVEL_PROGRESS.completedLevels['level5'];
        const tutorialShown = levelManager.LEVEL_PROGRESS.randomLevelTutorialShown;
        
        if (isFinalLevelCompleted && !tutorialShown) {
            this.showRandomLevelTutorial();
            
            // Mark tutorial as shown
            levelManager.LEVEL_PROGRESS.randomLevelTutorialShown = true;
            levelManager.saveLevelProgress();
        }
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
        
        // Check if level5 is completed to show random level button
        const isLevel5Completed = levelManager.LEVEL_PROGRESS.completedLevels['level5'];
        
        // First create the main level buttons
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
        
        // Add "Somewhere on Mars" button if level5 is completed
        if (isLevel5Completed) {
            // Position in 2nd row, 3rd column (6th position)
            const row = 1;
            const col = 2;
            const x = width / 2 + (col - 1) * (buttonWidth + 20);
            const y = startY + row * buttonSpacing;
            
            // Create special button for random levels with purple color
            const randomButton = this.add.nineslice(
                x, y,
                'blueSquareButton',
                null,
                buttonWidth, buttonHeight,
                15, 15, 15, 15  // Left, right, top, bottom slice points
            );
            randomButton.setOrigin(0.5);
            randomButton.setInteractive({ useHandCursor: true });
            
            // Add a pulsing glow effect
            this.tweens.add({
                targets: randomButton,
                alpha: 0.8,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            
            // Add button title text
            const buttonText = this.add.text(x, y - 15, 'SOMEWHERE', {
                fontSize: '18px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            });
            buttonText.setOrigin(0.5);
            
            // Add descriptive subtext
            const subText = this.add.text(x, y + 15, 'ON MARS', {
                fontSize: '18px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            });
            subText.setOrigin(0.5);
            
            // Handle hover effects
            randomButton.on('pointerover', () => {
                randomButton.setTint(0xCC77FF); // Lighter purple on hover
            });
            
            randomButton.on('pointerout', () => {
                randomButton.setTint(0xAA55FF); // Return to original purple
            });
            
            // Add click event
            randomButton.on('pointerdown', () => {
                // Generate random level with increasing difficulty using LevelManager
                levelManager.generateRandomLevel();
                
                // Start the game
                this.scene.start('GameScene');
            });
        }
        
        // Display unlocked rewards
        this.createRewardsDisplay();
        
        // Add reset progress button
        const resetButtonWidth = 220;
        const resetButtonHeight = 40;
        const resetButtonX = resetButtonWidth / 2 + 10;
        const resetButtonY = resetButtonHeight / 2 + 10;
        const resetButtonTint = 0x555555;
        
        // Use redSquareButton with nine-slice for reset button
        const resetButton = this.add.nineslice(
            resetButtonX,
            resetButtonY,
            'redSquareButton',
            null,
            resetButtonWidth, resetButtonHeight,
            15, 15, 15, 15  // Left, right, top, bottom slice points
        );
        resetButton.setOrigin(0.5);
        resetButton.setInteractive({ useHandCursor: true });
        resetButton.setTint(resetButtonTint);

        
        const resetText = this.add.text(resetButtonX, resetButtonY, 'RESET PROGRESS', {
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
            resetButton.setTint(resetButtonTint);
        });
        
        // Reset game progress when clicked
        resetButton.on('pointerdown', () => {
            this.resetGameProgress();
        });
        
        // Add Credits button to the bottom right
        const creditsButtonWidth = 120;
        const creditsButtonHeight = 40;
        const creditsButtonX = width - creditsButtonWidth / 2 - 10;
        const creditsButtonY = height - creditsButtonHeight / 2 - 10;
        
        // Use blueSquareButton with nine-slice for credits button
        const creditsButton = this.add.nineslice(
            creditsButtonX,
            creditsButtonY,
            'blueSquareButton',
            null,
            creditsButtonWidth, creditsButtonHeight,
            15, 15, 15, 15  // Left, right, top, bottom slice points
        );
        creditsButton.setOrigin(0.5);
        creditsButton.setInteractive({ useHandCursor: true });
        creditsButton.setTint(0x444455);
        
        const creditsText = this.add.text(creditsButtonX, creditsButtonY, 'CREDITS', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        creditsText.setOrigin(0.5);
        
        // Add hover effect for credits button
        creditsButton.on('pointerover', () => {
            creditsButton.setTint(0x555566);
        });
        
        creditsButton.on('pointerout', () => {
            creditsButton.setTint(0x444455);
        });
        
        // Show credits panel when clicked
        creditsButton.on('pointerdown', () => {
            this.showCreditsPanel();
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
        
        // Reset random level progress and tutorial flags
        levelManager.LEVEL_PROGRESS.randomLevelsCompleted = 0;
        levelManager.LEVEL_PROGRESS.randomLevelTutorialShown = false;
        
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
    
    // Show a tutorial panel explaining the random level feature
    showRandomLevelTutorial() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel covering the left half of the screen
        const panelWidth = width / 2 - 40; // Slightly less than half to provide margins
        const panelHeight = height / 2;
        const panelX = 20; // Left margin
        const panelY = height / 4; // Centered vertically
        
        // Create dark overlay for the left half of the screen
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.7);
        darkOverlay.fillRect(0, 0, width / 2, height);
        
        // Create the panel background
        const panel = this.add.nineslice(
            panelX + panelWidth/2, 
            panelY + panelHeight/2,
            'panelGlassScrews',
            null,
            panelWidth, 
            panelHeight,
            30, 30, 30, 30
        );
        panel.setOrigin(0.5);
        panel.setTint(0x3388dd); // Blue tint
        
        // Add title
        const titleText = this.add.text(
            panelX + panelWidth/2,
            panelY + 50,
            'NEW FEATURE UNLOCKED!',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffdd00',
                align: 'center',
                fontWeight: 'bold'
            }
        );
        titleText.setOrigin(0.5);
        
        // Add subtitle highlighting "Somewhere on Mars"
        const subtitleText = this.add.text(
            panelX + panelWidth/2,
            panelY + 90,
            'SOMEWHERE ON MARS',
            {
                fontSize: '22px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                fontWeight: 'bold'
            }
        );
        subtitleText.setOrigin(0.5);
        
        // Add explanation text
        const explanationText = this.add.text(
            panelX + panelWidth/2,
            panelY + 150,
            'You can now play a sequence of progressively harder random generated levels. See how far you can manage to get!',
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: panelWidth - 60 }
            }
        );
        explanationText.setOrigin(0.5, 0);
        
        // Add an arrow pointing to the random level button's position
        const arrowX = width / 2 + 50;
        const arrowY = panelY + 35;
        const arrow = this.add.text(
            arrowX,
            arrowY,
            '→',
            {
                fontSize: '120px',
                fontFamily: 'Arial',
                color: '#ffdd00'
            }
        );
        arrow.setOrigin(0.5);
        
        // Create "GOT IT" button
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = panelX + panelWidth/2 - buttonWidth/2;
        const buttonY = panelY + panelHeight - 60;
        
        const gotItButton = this.add.nineslice(
            buttonX + buttonWidth/2,
            buttonY + buttonHeight/2,
            'blueGlossSquareButton',
            null,
            buttonWidth,
            buttonHeight,
            15, 15, 15, 15
        );
        gotItButton.setOrigin(0.5);
        gotItButton.setInteractive({ useHandCursor: true });
        
        // Button text
        const buttonText = this.add.text(
            buttonX + buttonWidth/2,
            buttonY + buttonHeight/2,
            'GOT IT',
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontWeight: 'bold'
            }
        );
        buttonText.setOrigin(0.5);
        
        // Add hover effect
        gotItButton.on('pointerover', () => {
            gotItButton.setTint(0xaaddff);
        });
        
        gotItButton.on('pointerout', () => {
            gotItButton.clearTint();
        });
        
        // Close the tutorial panel when clicked
        gotItButton.on('pointerdown', () => {
            // Create a container with all the elements to animate them together
            const container = this.add.container(0, 0);
            container.add([darkOverlay, panel, titleText, subtitleText, explanationText, arrow, gotItButton, buttonText]);
            
            // Fade out animation
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    container.destroy();
                }
            });
        });
        
        // Add a pulsing animation to the arrow to draw attention
        this.tweens.add({
            targets: arrow,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    // Show credits panel
    showCreditsPanel() {
        // Track analytics event
        trackCreditsViewed();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create container for all credits elements
        this.creditsContainer = this.add.container(0, 0);
        this.creditsContainer.setDepth(100); // Ensure it appears above everything else
        
        // Add dark overlay for better readability
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.8);
        darkOverlay.fillRect(0, 0, width, height);
        
        // Make the dark overlay interactive to block clicks on elements behind
        const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        darkOverlay.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Prevent click-through by consuming all pointer events on the overlay
        darkOverlay.on('pointerdown', function(pointer, localX, localY, event) {
            // Stop event propagation to prevent clicks on elements behind
            event.stopPropagation();
        });
        
        // Also block other pointer events
        darkOverlay.on('pointerup', function(pointer, localX, localY, event) {
            event.stopPropagation();
        });
        
        darkOverlay.on('pointermove', function(pointer, localX, localY, event) {
            event.stopPropagation();
        });
        
        darkOverlay.on('pointerover', function(pointer, localX, localY, event) {
            event.stopPropagation();
        });
        
        this.creditsContainer.add(darkOverlay);
        
        // Calculate panel dimensions
        const panelWidth = 800;
        const panelHeight = 800;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        // Create panel background using panelGlassScrews texture
        const panelBg = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2,
            'panelGlassScrews',
            null,
            panelWidth, panelHeight,
            30, 30, 30, 30
        );
        panelBg.setOrigin(0.5);
        panelBg.setTint(0x222222);
        this.creditsContainer.add(panelBg);
        
        // Add title
        const titleText = this.add.text(
            width / 2, 
            panelY + 40, 
            'CREDITS', 
            { fontSize: '32px', fontFamily: 'Arial', color: '#ffffff', align: 'center', fontWeight: 'bold' }
        );
        titleText.setOrigin(0.5);
        this.creditsContainer.add(titleText);
        
        // Credits content
        const creditsContent = [
            "Mars Deck Colony",
            "",
            "Game Design & Development",
            "Magic Paw",
            "",
            "Special Thanks",
            "To all the beta testers for their feedback and suggestions!",
            "And my wife for her patience and support",
            "",
            "Art Assets",
            "UI pack: https://kenney.nl/assets/ui-pack-sci-fi",
            "Sci-fi RTS: https://kenney.nl/assets/sci-fi-rts",
            "Rockets pack: https://kenney.nl/assets/space-shooter-extension",
            "Mine wagon icon: https://game-icons.net/1x1/delapouite/mine-wagon.html",
            "Mine truck icon: https://game-icons.net/1x1/delapouite/mine-truck.html",
            "Battle Mech icon: https://game-icons.net/1x1/delapouite/battle-mech.html",
            "Electrical resistance icon: https://game-icons.net/1x1/delapouite/electrical-resistance.html",
            "Gas pump icon: https://game-icons.net/1x1/delapouite/gas-pump.html",
            "Drop icon: https://game-icons.net/1x1/lorc/drop.html",
            "Flat paw print icon: https://game-icons.net/1x1/lorc/flat-paw-print.html",
        ];
        
        // Add credits text with proper formatting
        const creditsText = this.add.text(
            width / 2,
            panelY + 100,
            creditsContent,
            { 
                fontSize: '18px', 
                fontFamily: 'Arial', 
                color: '#ffffff', 
                align: 'center',
                lineSpacing: 10
            }
        );
        creditsText.setOrigin(0.5, 0);
        this.creditsContainer.add(creditsText);
        
        // Create Back button
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonY = panelY + panelHeight - buttonHeight - 30; // 30px from bottom of panel
        
        // Create "BACK" button
        const backButton = this.add.nineslice(
            width / 2,
            buttonY,
            'blueGlossSquareButton',
            null,
            buttonWidth, buttonHeight,
            15, 15, 15, 15
        );
        backButton.setOrigin(0.5);
        backButton.setInteractive({ useHandCursor: true });
        this.creditsContainer.add(backButton);
        
        const backText = this.add.text(
            width / 2,
            buttonY,
            'BACK',
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
        );
        backText.setOrigin(0.5);
        this.creditsContainer.add(backText);
        
        // Add hover effect
        backButton.on('pointerover', () => {
            backButton.setTint(0xdddddd);
        });
        
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
        
        // Close credits panel when Back is clicked
        backButton.on('pointerdown', () => {
            this.creditsContainer.destroy();
        });
    }

    // Create a contacts button in the bottom left corner
    createContactsButton() {
        const buttonSize = 48;
        const paddingX = 10;
        const paddingY = 10;
        // Position in bottom-left corner
        const x = paddingX + buttonSize/2;
        const y = this.cameras.main.height - paddingY - buttonSize/2;
        
        const contactsButton = this.add.container(x, y);        
        const buttonBg = this.add.nineslice(
            0, 0,                        // center position within container
            'blueSquareButton',          // texture key - square instead of round
            null,                        // frame (null for default)
            buttonSize, buttonSize,      // size
            5, 5, 5, 5                   // slice sizes: left, right, top, bottom
        );
        buttonBg.setOrigin(0.5);
        buttonBg.setTint(0x444455);
        contactsButton.add(buttonBg);
        
        // Add magic paw icon
        const icon = this.add.image(0, 0, 'magicPaw');
        icon.setScale(buttonSize / icon.width * 0.6); // Scale to fit the button
        icon.setOrigin(0.5);
        icon.setTint(0xFFA500); // Orange
        contactsButton.add(icon);
        
        // Make interactive
        contactsButton.setInteractive(new Phaser.Geom.Rectangle(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effects
        contactsButton.on('pointerover', () => {
            buttonBg.setTint(0x555566);
        });
        
        contactsButton.on('pointerout', () => {
            buttonBg.setTint(0x444455);
        });
        
        // Show contacts panel on click
        contactsButton.on('pointerdown', () => {
            this.showContactsPanel();
        });
        
        // Set depth to ensure it's visible
        contactsButton.setDepth(100);
        
        // Store reference
        this.contactsButton = contactsButton;
    }
    
    // Show contacts panel
    showContactsPanel() {
        // If contacts panel already exists, destroy it first
        if (this.contactsContainer) {
            this.contactsContainer.destroy();
            this.contactsContainer = null;
            return; // Toggle off if already visible
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create container for all contacts elements
        this.contactsContainer = this.add.container(0, 0);
        
        // Add semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7); 
        overlay.fillRect(0, 0, width, height);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        overlay.on('pointerdown', () => {
            // Click outside panel closes it
            this.contactsContainer.destroy();
            this.contactsContainer = null;
        });
        this.contactsContainer.add(overlay);
        
        // Calculate panel dimensions
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        // Create panel background using panelGlassScrews texture with nine-slice
        const panelBg = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2, // center position
            'panelGlassScrews',                            // texture key
            null,                                          // frame (null for default)
            panelWidth, panelHeight,                       // size
            30, 30, 30, 30                                 // slice sizes: left, right, top, bottom
        );
        panelBg.setOrigin(0.5);
        panelBg.setTint(0x333344); // Dark blue-gray tint
        
        // Make panel interactive to stop event propagation
        panelBg.setInteractive(new Phaser.Geom.Rectangle(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains);
        panelBg.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
        });
        
        this.contactsContainer.add(panelBg);
        
        // Add title
        const title = this.add.text(
            panelX + panelWidth/2, 
            panelY + 30, 
            'Magic Paw studio', 
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#ffffff'
            }
        );
        title.setOrigin(0.5, 0.5);
        this.contactsContainer.add(title);
        
        // Close button
        const closeButtonX = panelX + panelWidth/2;
        const closeButtonY = panelY + panelHeight - 30;
        
        // Create button background
        const buttonBg = this.add.nineslice(
            closeButtonX, closeButtonY,
            'blueSquareButton',
            null,
            100, 30,
            5, 5, 5, 5
        );
        buttonBg.setOrigin(0.5);
        this.contactsContainer.add(buttonBg);
        
        // Add text to button
        const closeText = this.add.text(
            closeButtonX, 
            closeButtonY, 
            'CLOSE', 
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#ffffff'
            }
        );
        closeText.setOrigin(0.5, 0.5);
        this.contactsContainer.add(closeText);
        
        // Make button interactive
        buttonBg.setInteractive();
        buttonBg.on('pointerover', () => {
            buttonBg.setTint(0x3366cc);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.clearTint();
        });
        buttonBg.on('pointerdown', () => {
            this.contactsContainer.destroy();
            this.contactsContainer = null;
        });
        
        // Set depth to ensure it's visible
        this.contactsContainer.setDepth(200);
    }
} 