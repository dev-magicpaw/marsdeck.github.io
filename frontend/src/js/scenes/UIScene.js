import Phaser from 'phaser';
import { BUILDINGS, CARD_TYPES, MAX_CARD_SLOTS, MAX_HAND_SIZE, RESOURCES, TERRAIN_FEATURES, TERRAIN_TYPES } from '../config/game-data';
import { FINAL_LEVEL_MAP } from '../config/level-configs';
import levelManager from '../objects/LevelManager';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        // References to other scenes
        this.gameScene = null;
        
        // Card dimensions
        this.cardWidth = 80;
        this.cardHeight = 140;
        this.cardSpacing = 5;
        
        // UI constants
        this.INFO_SPRITE_SIZE = 80;
        this.buttonHeight = 30;
        
        // Selected card tracking
        this.selectedCardIndex = undefined;
        
        // References to game managers
        this.resourceManager = null;
        this.cardManager = null;
        this.rewardsManager = null;
        
        // UI components
        this.handContainer = null;
        this.cardSlotsContainer = null;
        this.infoPanel = null;
        this.actionsPanel = null;
        this.messageText = null;
        
        // Timers and animations
        this.messageTimer = null;
        this.messageDisplayTime = 3000; // 3 seconds
        this.panelHeight = 150;
        
        // End turn button effect configuration
        this.buttonEffectConfig = {
            color: 0x4488ff,      // Light blue color
            alpha: { start: 0.8, end: 0 },
            scale: { start: 0.3, end: 1.5 },
            speed: 150,           // Particles speed
            lifespan: 600,        // Duration in milliseconds
            quantity: 15,         // Number of particles per emission
            blendMode: 'ADD'      // ADD for glow effect
        };
    }

    init(data) {
        // Reference to game scene and managers
        this.gameScene = data.gameScene;
        this.gridManager = data.gridManager;
        this.resourceManager = data.resourceManager;
        this.cardManager = data.cardManager;
        this.rewardsManager = data.rewardsManager;
        
        // UI elements
        this.resourcesPanel = null;
        this.infoPanel = null;
        this.handPanel = null;
        this.messageBox = null;
        this.actionsPanel = null;
    }

    create() {
        // Create UI panels layout
        this.createLayout();
        
        // Create resources panel
        this.createResourcesPanel();
        
        // Create info panel
        this.createInfoPanel();
        
        // Create actions panel
        this.createActionsPanel();
        
        // Create choice panel
        this.createChoicePanel();
        
        // Create hand panel
        this.createHandPanel();
        
        // Create message box for notifications
        this.createMessageBox();
        
        // Create bottom panel with turn, reputation and end turn button
        this.createBottomPanel();
        
        // Create help/tutorial button
        this.createHelpButton();
        
        // Create contacts button
        this.createContactsButton();
        
        // Initial UI update
        this.refreshUI();
        
        // Show tutorial panel if this is level 1
        if (levelManager.getCurrentLevel().id === 'level1') {
            this.showTutorialPanel();
        }
        
        // Initialize the selected choice index
        this.selectedChoiceIndex = null;
        
        // Add listener for clicks outside cards to deselect card choice
        this.input.on('pointerdown', (pointer) => {
            // Only process if we have a selected card choice
            if (this.selectedChoiceIndex !== null && this.grabButton) {
                // Check if the click was on the GRAB button (don't deselect in that case)
                if (this.grabButton) {
                    const buttonBounds = this.grabButton.getBounds();
                    if (buttonBounds.contains(pointer.x, pointer.y)) {
                        return;
                    }
                }
                
                // Check if the click was on a card choice (don't deselect in that case)
                let clickedOnCard = false;
                if (this.choiceContainer && this.choiceContainer.visible && this.choiceContainer.list.length > 0) {
                    for (let i = 0; i < this.choiceContainer.list.length; i++) {
                        const cardContainer = this.choiceContainer.list[i];
                        if (cardContainer) {
                            const cardBounds = cardContainer.getBounds();
                            // Transform to world coordinates
                            const worldBounds = new Phaser.Geom.Rectangle(
                                cardBounds.x,
                                cardBounds.y,
                                cardBounds.width,
                                cardBounds.height
                            );
                            
                            if (worldBounds.contains(pointer.x, pointer.y)) {
                                clickedOnCard = true;
                                break;
                            }
                        }
                    }
                }
                
                if (!clickedOnCard) {
                    // Clear selection and info panel
                    this.clearCardChoiceSelection();
                    this.clearInfoPanel();
                }
            }
        });
    }
    
    createLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Define consistent spacing
        const verticalSpacing = 10; // Space between major elements, keep it at 10 px
        
        // Define panel heights
        const resourcePanelHeight = 50;
        const infoPanelHeight = 300;
        const choicePanelHeight = 200;
        const bottomPanelHeight = 50;
        
        // Calculate action panel height to fill remaining space
        const totalFixedHeight = resourcePanelHeight + infoPanelHeight + choicePanelHeight + bottomPanelHeight + (4 * verticalSpacing);
        const actionsPanelHeight = height - totalFixedHeight;
        
        // Map dimensions (from GameScene)
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const mapOffset = resourcePanelHeight + verticalSpacing; // Start map right after resources panel + spacing
        
        // Create panel backgrounds
        // Resources panel spans full width at the top
        this.createPanel(0, 0, width, resourcePanelHeight, 0x222222, 0.8); // Resources panel
        
        // Right side panels - calculate positions from top and bottom
        const rightPanelWidth = 450;
        const rightPanelX = width - rightPanelWidth;
        
        // Info panel starts right after resources panel
        this.createPanel(rightPanelX, resourcePanelHeight + verticalSpacing, 
                        rightPanelWidth, infoPanelHeight, 0x222222, 0.8); // Info panel
        
        // Actions panel fills space between Info and Choice panels
        const actionsPanelY = resourcePanelHeight + verticalSpacing + infoPanelHeight + verticalSpacing;
        this.createPanel(rightPanelX, actionsPanelY,
                        rightPanelWidth, actionsPanelHeight, 0x222222, 0.8); // Actions panel
        
        // Choice panel sits above bottom panel
        const choicePanelY = height - bottomPanelHeight - verticalSpacing - choicePanelHeight;
        this.choicePanelBg = this.createPanel(rightPanelX, choicePanelY,
                                             rightPanelWidth, choicePanelHeight, 0x222222, 0.8); // Choice panel
        
        // Bottom panel at the very bottom
        this.bottomPanelBg = this.createPanel(rightPanelX, height - bottomPanelHeight,
                                             rightPanelWidth, bottomPanelHeight, 0x222222, 0.8);
        
        // Calculate card panel width for MAX_CARD_SLOTS cards
        const cardsWidth = (this.cardWidth + this.cardSpacing) * MAX_CARD_SLOTS;
        
        // Add margins around the cards panel (10px on each side)
        const margin = 10;
        
        // Position cards panel under the map with consistent spacing
        this.createPanel(
            0, 
            mapOffset + mapSize,// + verticalSpacing, // Position after map + spacing
            cardsWidth + margin * 2, 
            this.cardHeight + margin * 2,
            0x222222, 
            0.8
        ); // Cards panel
    }
    
    createPanel(x, y, width, height, color, alpha) {
        const panel = this.add.graphics();
        panel.fillStyle(color, alpha);
        panel.fillRect(x, y, width, height);
        return panel;
    }
    
    createResourcesPanel() {
        const width = this.cameras.main.width;
        
        // Resource counters
        const resourceTypes = Object.values(RESOURCES);
        this.resourceTexts = {};
        
        // Custom resource display order in a single row
        const displayOrder = [
            RESOURCES.ENERGY,
            RESOURCES.DRONES,
            RESOURCES.IRON,
            RESOURCES.STEEL,
            RESOURCES.WATER,
            RESOURCES.FUEL,
            RESOURCES.CONCRETE
        ];
        
        // Calculate spacing between resources
        const totalResources = displayOrder.length;
        const spacing = width / (totalResources + 1); // +1 to add margins on sides
        
        // Create text for each resource type in a single row
        displayOrder.forEach((resourceType, index) => {
            // Calculate x position to spread resources evenly
            const xPos = spacing * (index + 1); // +1 to start after left margin
            
            // Create readable label from resource type
            const label = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
            
            this.resourceTexts[resourceType] = this.add.text(
                xPos, 
                25, // Vertically center in the 50px high panel
                `${label}: 0`, 
                { 
                    fontSize: '16px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0.5); // Center both horizontally and vertically
        });
    }
    
    createInfoPanel() {
        const width = this.cameras.main.width;
        const resourcePanelHeight = 50;
        const horizontalSpacing = 20;
        const verticalSpacing = 10;
        const contentHorizontalSpacing = horizontalSpacing;
        const contenVerticalSpacing = verticalSpacing + 40; 
        const rightPanelWidth = 450;
        const rightPanelX = width - rightPanelWidth;
        
        // Calculate panel position
        const panelY = resourcePanelHeight + verticalSpacing;
        
        // Create main container for the panel
        this.infoPanelContainer = this.add.container(rightPanelX, panelY);
        
        // Header with left padding
        const headerText = this.add.text(horizontalSpacing, verticalSpacing, 'INFORMATION', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Create info content with padding
        this.infoTitle = this.add.text(
            contentHorizontalSpacing, 
            contenVerticalSpacing, 
            '', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
        );
        
        this.infoContent = this.add.text(
            contentHorizontalSpacing, 
            contenVerticalSpacing + 15, 
            '', 
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: 410 } }
        );
        
        // Create a sprite placeholder for selected entity - centered horizontally
        this.infoSprite = this.add.sprite(rightPanelWidth / 2, 190, 'gridTile');
        this.infoSprite.setDisplaySize(this.INFO_SPRITE_SIZE, this.INFO_SPRITE_SIZE); // Use constant for standard size
        this.infoSprite.setVisible(false);
        
        // Add all to container
        this.infoPanelContainer.add(headerText);
        this.infoPanelContainer.add(this.infoTitle);
        this.infoPanelContainer.add(this.infoContent);
        this.infoPanelContainer.add(this.infoSprite);
    }
    
    createActionsPanel() {
        const width = this.cameras.main.width;
        const resourcePanelHeight = 50;
        const infoPanelHeight = 300;
        const verticalSpacing = 10;
        const horizontalSpacing = 20;
        const firstButtonVerticalSpacing = verticalSpacing + 30;
        const firstButtonHorizontalSpacing = horizontalSpacing;
        const rightPanelWidth = 450;
        const rightPanelX = width - rightPanelWidth;
        
        // Calculate panel position (same as in createLayout)
        const panelY = resourcePanelHeight + verticalSpacing + infoPanelHeight + verticalSpacing;
        
        // Create main container for the panel (positioned at the panel's top-left corner)
        this.actionsPanelContainer = this.add.container(rightPanelX, panelY);
        
        // Header with left padding
        this.actionsTitle = this.add.text(horizontalSpacing, verticalSpacing, 'ACTIONS', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Container for action buttons
        this.actionsContainer = this.add.container(firstButtonHorizontalSpacing, firstButtonVerticalSpacing); // Changed from 60 to 45
        
        // Add to panel container
        this.actionsPanelContainer.add(this.actionsTitle);
        this.actionsPanelContainer.add(this.actionsContainer);
        
        // Only hide the container initially, keep title visible
        this.actionsContainer.setVisible(false);
    }
    
    createChoicePanel() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const bottomPanelHeight = 50;
        const choicePanelHeight = 200;
        const verticalSpacing = 10;
        const horizontalSpacing = 20;
        const cardsVerticalSpacing = verticalSpacing + 30;
        const cardsHorizontalSpacing = horizontalSpacing;
        const rightPanelWidth = 450;
        const rightPanelX = width - rightPanelWidth;
        
        // Calculate panel position (same as in createLayout)
        const panelY = height - bottomPanelHeight - verticalSpacing - choicePanelHeight;
        
        // Create main container for the panel
        this.choicePanelContainer = this.add.container(rightPanelX, panelY);
        
        // Header - positioned relative to container with padding
        this.choiceTitle = this.add.text(horizontalSpacing, verticalSpacing, 'CHOOSE A CARD', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Container for card choices - positioned below title with padding
        this.choiceContainer = this.add.container(cardsHorizontalSpacing, cardsVerticalSpacing);
        
        // Add both to the panel container
        this.choicePanelContainer.add(this.choiceTitle);
        this.choicePanelContainer.add(this.choiceContainer);
        
        // Hide choice panel initially
        this.choicePanelContainer.setVisible(false);
        this.choicePanelBg.visible = false;
    }
    
    createHandPanel() {
        // Calculate position for cards panel under the map
        const resourcePanelHeight = 50;
        const verticalSpacing = 10;
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const mapOffset = resourcePanelHeight + verticalSpacing; // Start map right after resources panel + spacing
        const margin = 10;
        
        const x = margin; // Start from the left edge plus margin
        const y = mapOffset + mapSize + verticalSpacing; // Position after map + spacing
        
        // Create container for card slots (backgrounds)
        this.cardSlotsContainer = this.add.container(x, y);
        
        // Create container for cards
        this.handContainer = this.add.container(x, y);
        
        // Create the initial empty card slots (MAX_CARD_SLOTS slots)
        this.createCardSlots();
    }
    
    // Create placeholder backgrounds for card slots
    createCardSlots() {
        // Clear existing slots
        this.cardSlotsContainer.removeAll(true);
        
        // Width of the hand limit indicator
        const indicatorWidth = 5;
        
        // Create slots for max card slots
        for (let i = 0; i < MAX_CARD_SLOTS; i++) {
            // Adjust position for slots after the hand limit indicator
            let xPos;
            if (i < MAX_HAND_SIZE) {
                // Normal position for slots before the limit
                xPos = i * (this.cardWidth + this.cardSpacing);
            } else {
                // Add extra spacing (same as cardSpacing) for slots after the limit
                // Add 2*cardSpacing to account for the indicator width and ensure equal spacing on both sides.
                xPos = i * (this.cardWidth + this.cardSpacing) + 2* this.cardSpacing;
            }
            
            // Add slot background using NineSlice for better UI scaling
            const slotBg = this.add.nineslice(
                xPos, 0,                     // position
                'cardSlotBackground',        // texture key
                null,                        // frame (null for default)
                this.cardWidth, this.cardHeight, // size
                10, 10, 10, 10               // slice sizes: left, right, top, bottom (uniform corners)
            );
            slotBg.setOrigin(0, 0);
            slotBg.setAlpha(0.7); // Make it slightly transparent
            
            this.cardSlotsContainer.add(slotBg);
            
            // Add hand limit indicator after the MAX_HAND_SIZE slot
            if (i === MAX_HAND_SIZE - 1) {
                // Position right after this card slot with full card spacing
                const indicatorX = xPos + this.cardWidth + this.cardSpacing;
                
                // Create the hand limit indicator
                const handLimitIndicator = this.add.sprite(indicatorX, 0, 'handLimitIndicator');
                handLimitIndicator.setDisplaySize(indicatorWidth, this.cardHeight); // 5px width, same height as cards
                handLimitIndicator.setOrigin(0, 0);
                handLimitIndicator.setAlpha(0.9);
                
                this.cardSlotsContainer.add(handLimitIndicator);
            }
        }
    }
    
    createMessageBox() {
        const x = this.cameras.main.width / 2 - 150;
        const y = 20;
        
        this.messageBox = this.add.container(x, y);
        this.messageBox.setVisible(false);
        
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, 300, 50);
        this.messageBox.add(bg);
        
        // Message text
        this.messageText = this.add.text(
            150, 
            25, 
            '', 
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        );
        this.messageText.setOrigin(0.5);
        this.messageBox.add(this.messageText);
    }
    
    createBottomPanel() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const panelHeight = 50;
        const panelWidth = 450;
        const margin = 20;
        const panelX = width - panelWidth;
        
        // Get the current level's reputation goal
        const reputationGoal = levelManager.getCurrentVictoryGoal();
        
        // Create reputation display with goal
        const reputationText = this.add.text(
            panelX + margin, 
            height - panelHeight/2, 
            `Reputation: 0/${reputationGoal}`, 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }
        );
        reputationText.setOrigin(0, 0.5);
        this.resourceTexts[RESOURCES.REPUTATION] = reputationText;
        
        // Create turn counter
        this.turnText = this.add.text(
            panelX + panelWidth/2, 
            height - panelHeight/2, 
            `Turn: 1/30`, 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }
        );
        this.turnText.setOrigin(0.5, 0.5);
        
        // Create end turn button
        const buttonWidth = 100;
        const buttonHeight = 30;
        
        // Create end turn button using the texture
        const buttonBg = this.add.sprite(0, 0, 'blueGlossSquareButton');
        buttonBg.setDisplaySize(buttonWidth, buttonHeight);
        buttonBg.setOrigin(0, 0);
        
        const buttonText = this.add.text(
            buttonWidth / 2, 
            buttonHeight / 2, 
            'END TURN', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
        );
        buttonText.setOrigin(0.5);
        
        this.endTurnButton = this.add.container(panelX + panelWidth - buttonWidth - margin, height - panelHeight/2);
        this.endTurnButton.setY(this.endTurnButton.y - buttonHeight/2); // Center vertically
        this.endTurnButton.add(buttonBg);
        this.endTurnButton.add(buttonText);
        this.endTurnButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        this.endTurnButton.on('pointerdown', () => {
            // Play the end turn button effect
            this.playEndTurnButtonEffect();
            
            // End the turn
            this.gameScene.endTurn();
        });
        this.endTurnButton.on('pointerover', () => {
            buttonBg.setTint(0xaaccff); // Light blue tint for hover
        });
        this.endTurnButton.on('pointerout', () => {
            buttonBg.clearTint(); // Clear tint on pointer out
        });
        // Store the button background for enabling/disabling
        this.endTurnButtonBg = buttonBg;
        
        // Initial button state check
        this.updateEndTurnButton();
    }
    
    // Check if hand is over limit and update END TURN button accordingly
    updateEndTurnButton() {
        const handSize = this.cardManager.getHand().length;
        const isOverLimit = handSize > MAX_HAND_SIZE;
        const buttonWidth = 100;
        const buttonHeight = 30;
        
        if (isOverLimit) {
            // Disable button
            this.endTurnButton.disableInteractive();
            this.endTurnButtonBg.setTint(0x666666); // Gray tint when disabled
            
            // Show message to inform player
            this.showMessage(`Hand over limit! Discard ${handSize - MAX_HAND_SIZE} card(s)`);
        } else {
            // Enable button
            this.endTurnButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
            this.endTurnButtonBg.clearTint(); // Clear any tint
        }
    }
    
    // Refresh all UI components
    refreshUI() {
        // Save selected card reference from game scene
        if (this.gameScene.selectedCard === null) {
            this.selectedCardIndex = null;
        }
        
        // Check if there are any inconsistencies with launch pads and fix them
        if (this.gameScene.gridManager && this.gameScene.buildingActionManager) {
            // Find all launch pads with rockets
            for (let y = 0; y < this.gameScene.gridManager.gridSize; y++) {
                for (let x = 0; x < this.gameScene.gridManager.gridSize; x++) {
                    const cell = this.gameScene.gridManager.getCell(x, y);
                    if (cell && cell.building === 'launchPad' && cell.hasRocket) {
                        const cellId = `${x},${y}`;
                        if (this.gameScene.buildingActionManager.rocketInFlight[cellId]) {
                            console.warn(`Found inconsistent rocket state during UI refresh, a rocket is in flight but the cell hasRocket is true`);
                        }
                    }
                }
            }
        }
        
        this.updateResourceDisplay();
        this.updateHandDisplay();
        this.updateTurnDisplay();
        this.updateActionsPanel();
        this.updateEndTurnButton();
    }
    
    // Update resource counters
    updateResourceDisplay() {
        const resources = this.resourceManager.getAllResources();
        
        // Update each resource text
        for (const resourceType in this.resourceTexts) {
            const label = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
            
            // Special formatting for reputation to show the goal
            if (resourceType === RESOURCES.REPUTATION) {
                // Get current level's reputation goal
                const reputationGoal = levelManager.getCurrentVictoryGoal();
                this.resourceTexts[resourceType].setText(`${label}: ${resources[resourceType]}/${reputationGoal}`);
            } else {
                this.resourceTexts[resourceType].setText(`${label}: ${resources[resourceType]}`);
            }
        }
    }
    
    // Update hand display
    updateHandDisplay() {
        // Clear existing cards
        this.handContainer.removeAll(true);
        
        // Get current hand
        const hand = this.cardManager.getHand();
        
        // Draw cards
        hand.forEach((card, index) => {
            const cardContainer = this.createCardSprite(card, index);
            this.handContainer.add(cardContainer);
        });
        
        // Deck info has been removed
    }
    
    // Update turn counter
    updateTurnDisplay() {
        this.turnText.setText(`Turn: ${this.gameScene.currentTurn}/${this.gameScene.maxTurns}`);
    }
    
    // Create a card sprite
    createCardSprite(card, index) {
        // Calculate x position accounting for the hand limit indicator
        let xPos;
        if (index < MAX_HAND_SIZE) {
            // Normal position for cards before the limit
            xPos = index * (this.cardWidth + this.cardSpacing);
        } else {
            // Add extra spacing for cards after the limit (same as in createCardSlots)
            xPos = index * (this.cardWidth + this.cardSpacing) + 2 * this.cardSpacing;
        }
        
        const cardContainer = this.add.container(xPos, 0);
        
        // Card background using NineSlice for better UI scaling
        let cardBg;
        let textureKey = 'cardBackground';
        
        // Determine background texture based on card type
        if (card.cardType.cardType === 'prefab') {
            textureKey = 'cardPrefabBackground';
        } else if (card.cardType.cardType === 'event') {
            textureKey = 'cardEventBackground';
        }
        
        // Use NineSlice for cards with adjusted slice sizes
        // Top slice is larger (35px) to account for the header area
        // Bottom slice is 15px for the rounded corner
        // Left and right are 10px for the rounded corners
        cardBg = this.add.nineslice(
            0, 0,               // position
            textureKey,         // texture key
            null,               // frame (null for default)
            this.cardWidth, this.cardHeight, // size
            10, 10, 35, 15      // slice sizes: left, right, top, bottom
        );
        cardBg.setOrigin(0, 0);

        // Add highlight for selected card
        if (index === this.selectedCardIndex) {
            const highlight = this.add.rectangle(0, 0, this.cardWidth, this.cardHeight, 0xffff00, 0.3);
            highlight.setOrigin(0, 0);
            cardContainer.add(highlight);
        }
        
        // Make card interactive
        cardBg.setInteractive();
        cardBg.on('pointerdown', () => {
            this.onCardClick(index);
        });
        
        cardContainer.add(cardBg);
        
        // Add card name
        const cardName = card.cardType.name;
        const nameText = this.add.text(
            this.cardWidth / 2, 
            10, 
            cardName, 
            { fontSize: '12px', fontFamily: 'Arial', color: '#000000', align: 'center' }
        );
        nameText.setOrigin(0.5, 0);
        cardContainer.add(nameText);
        
        let iconTexture = 'placeholderTexture';
        // Handle specific card type content
        if (card.type === 'building') {
            // Building icon - use cardTexture if available, otherwise use building texture
            iconTexture = (card.cardType && card.cardType.cardTexture) ? card.cardType.cardTexture :  card.building.texture;
        } else if (card.type === 'event') {
            iconTexture = card.cardType.cardTexture;
        }
            
        const icon = this.add.sprite(this.cardWidth / 2, 45, iconTexture);
        icon.setDisplaySize(40, 40);
        icon.setOrigin(0.5);
        cardContainer.add(icon);
       
        
        // Show costs from card type if available
        if (card.cardType && card.cardType.cost) {
            // Cost text
            let costY = 75;
            
            // Get base cost from card type with adjustments
            let displayCost = this.gameScene.calculateCardCost(card);
            
            // Check if the card has any costs
            let hasCosts = false;
            for (const resource in displayCost) {
                if (displayCost[resource] > 0) {
                    hasCosts = true;
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    
                    // Check if player has enough of this resource
                    const requiredAmount = displayCost[resource];
                    const playerAmount = this.resourceManager.getResource(resource);
                    const hasEnough = playerAmount >= requiredAmount;
                    
                    // Set color based on resource availability
                    const textColor = hasEnough ? '#000000' : '#ff0000';
                    
                    const costText = this.add.text(
                        5, 
                        costY, 
                        `${resourceName}: ${requiredAmount}`, 
                        { fontSize: '10px', fontFamily: 'Arial', color: textColor }
                    );
                    cardContainer.add(costText);
                    costY += 12;
                }
            }
            
            // If no costs were added, show "No cost" text
            if (!hasCosts) {
                const noCostText = this.add.text(
                    5, 
                    75, 
                    'No cost', 
                    { fontSize: '10px', fontFamily: 'Arial', color: '#000000' }
                );
                cardContainer.add(noCostText);
            }
        }
        
        return cardContainer;
    }
    
    // Handle card click
    onCardClick(cardIndex) {
        // Clear any card choice selection
        this.clearCardChoiceSelection();
        
        // Update selected card index
        this.selectedCardIndex = cardIndex;
        
        // Select card for placement
        this.gameScene.selectCard(cardIndex);
        
        // Update UI
        this.updateHandDisplay();
        this.updateActionsPanel();
    }
    
    // Show cell info in the info panel
    showCellInfo(cell, gameScene) {
        // Clear current info
        this.clearInfoPanel();
        
        // First get terrain info
        const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === cell.terrain);
        
        // Set title based on feature or terrain
        let title = '';
        let description = '';
        let texture = '';
        
        // Check if there's a terrain feature
        if (cell.feature) {
            const feature = Object.values(TERRAIN_FEATURES).find(f => f.id === cell.feature);
            if (feature) {
                title = feature.name;
                description = feature.description;
                texture = feature.texture;
            }
        } else {
            // Just plain terrain
            title = terrain.name;
            description = terrain.description;
            texture = terrain.texture;
        }
        
        this.infoTitle.setText(title);
        this.infoContent.setText(description);
        
        // Show terrain/feature sprite
        if (texture) {
            this.infoSprite.setTexture(texture);
            this.infoSprite.setDisplaySize(this.INFO_SPRITE_SIZE, this.INFO_SPRITE_SIZE);
            this.infoSprite.setVisible(true);
        }
        
        // If there's a building, show building info instead
        if (cell.building) {
            const building = Object.values(BUILDINGS).find(b => b.id === cell.building);
            
            if (building) {
                this.infoTitle.setText(building.name);
                
                // Set the content to just the building description without construction cost
                let content = building.description + "\n\n";
                
                // Special info for Launch Pad
                if (building.id === 'launchPad') {
                    content += "Status:\n";
                    if (cell.hasRocket) {
                        if (cell.rocketState === 'fueled') {
                            content += "Rocket ready\n";
                        } else {
                            content += "Rocket needs fuel\n";
                        }
                    } else {
                        content += "Rocket in flight\n";
                    }
                }
                
                // Production - apply building upgrades
                if (Object.keys(building.production).length > 0) {
                    const upgradedProduction = gameScene.applyBuildingUpgrades(building.id, {...building.production}, cell.x, cell.y);
                    
                    content += "Production:\n";
                    for (const resource in upgradedProduction) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        const baseValue = building.production[resource];
                        const upgradedValue = upgradedProduction[resource];
                        
                        // Show upgraded value with base value in parentheses if different
                        const valueDiff = upgradedValue - baseValue;
                        if (valueDiff > 0) {
                            // Check for different types of bonuses
                            const isDroneDepoBonus = gameScene.gridManager.isAdjacentToBuildingType(cell.x, cell.y, 'droneDepo') && 
                                                     resource !== RESOURCES.ENERGY && 
                                                     resource !== RESOURCES.DRONES &&
                                                     resource !== RESOURCES.REPUTATION &&
                                                     gameScene.rewardsManager && 
                                                     gameScene.rewardsManager.isRewardUnlocked('droneSupportReward');
                            
                            // Check for efficient supply chain bonus
                            const isSupplyChainSteelBonus = building.id === 'steelworks' && resource === RESOURCES.STEEL && 
                                                           gameScene.gridManager.isAdjacentToBuildingType(cell.x, cell.y, 'ironMine');
                            const isSupplyChainFuelBonus = building.id === 'fuelRefinery' && resource === RESOURCES.FUEL && 
                                                          gameScene.gridManager.isAdjacentToBuildingType(cell.x, cell.y, 'waterPump');
                            
                            // Calculate different types of bonuses
                            let droneDepoBonus = isDroneDepoBonus ? 1 : 0;
                            let supplyChainBonus = (isSupplyChainSteelBonus || isSupplyChainFuelBonus) ? 1 : 0;
                            let otherUpgrades = valueDiff - droneDepoBonus - supplyChainBonus;
                            
                            content += `${resourceName}: +${upgradedValue} (`;
                            
                            let bonuses = [];
                            if (otherUpgrades > 0) bonuses.push(`upgrade: +${otherUpgrades}`);
                            if (droneDepoBonus > 0) bonuses.push(`drone depo: +${droneDepoBonus}`);
                            if (supplyChainBonus > 0) bonuses.push(`supply chain: +${supplyChainBonus}`);
                            
                            content += bonuses.join(', ');
                            content += `)\n`;
                        } else {
                            content += `${resourceName}: +${baseValue}\n`;
                        }
                    }
                }
                
                // Consumption
                if (Object.keys(building.consumption).length > 0) {
                    content += "\nConsumption:\n";
                    for (const resource in building.consumption) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        content += `${resourceName}: -${building.consumption[resource]}\n`;
                    }
                }
                
                this.infoContent.setText(content);
                
                // Show building sprite
                this.infoSprite.setTexture(building.texture);
                this.infoSprite.setDisplaySize(this.INFO_SPRITE_SIZE, this.INFO_SPRITE_SIZE);
                this.infoSprite.setVisible(true);
                
                // Store selected cell for actions
                this.selectedCell = cell;
                
                // Update actions for this building (like launch for launch pad)
                this.updateActionsPanel();
            }
        }
    }
    
    // Show selected card info in the info panel
    showSelectedCard(card) {
        // Clear current info
        this.clearInfoPanel();
        
        // Set up title based on card type
        this.infoTitle.setText(card.cardType.name);
        
        // Show card info based on type
        if (card.type === 'building') {
            const building = card.building;
            
            if (building) {
                // Set the content to the building description with construction cost
                let content = card.cardType.description + '\n\n';
                content += "Construction cost:\n";
                
                // Get base cost from card type with adjustments
                let displayCost = this.gameScene.calculateCardCost(card);
                
                // Check if there are any costs
                let hasCosts = false;
                for (const resource in displayCost) {
                    if (displayCost[resource] > 0) {
                        hasCosts = true;
                        // Check if we have enough resources
                        const required = displayCost[resource];
                        const available = this.resourceManager.getResource(resource);
                        const hasEnough = available >= required;
                        
                        // Format resource names with proper capitalization
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);                        
                        content += `${resourceName}: ${required}\n`;
                    }
                }
                
                // If no costs, display "No cost"
                if (!hasCosts) {
                    content += "No cost\n";
                }

                // Add building-specific info
                let additionalText = "\n";
                // additionalText += building.description + "\n\n";
                
                // Special info for Launch Pad
                if (building.id === 'launchPad') {
                    additionalText += "Launch cost:\n";
                    for (const resource in building.launchCost) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        additionalText += `${resourceName}: ${building.launchCost[resource]}\n`;
                    }
                    additionalText += `Reputation reward: +${building.launchReward}\n\n`;
                }
                
                // Production - apply building upgrades
                if (Object.keys(building.production).length > 0) {
                    let upgradedProduction = {...building.production};
                    
                    // Only try to get upgraded values if gameScene is available
                    if (this.scene.manager.getScene('GameScene')) {
                        const gameScene = this.scene.manager.getScene('GameScene');
                        // When showing a card, we don't have coordinates, so we pass undefined
                        // to indicate we can't apply position-based bonuses
                        upgradedProduction = gameScene.applyBuildingUpgrades(building.id, upgradedProduction, undefined, undefined);
                    }
                    
                    additionalText += "Production:\n";
                    for (const resource in upgradedProduction) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        const baseValue = building.production[resource];
                        const upgradedValue = upgradedProduction[resource];
                        
                        // Show upgraded value with base value in parentheses if different
                        const valueDiff = upgradedValue - baseValue;
                        if (valueDiff > 0) {
                            additionalText += `${resourceName}: +${upgradedValue} (upgrade: +${valueDiff})\n`;
                        } else {
                            additionalText += `${resourceName}: +${baseValue}\n`;
                        }
                    }
                    
                    // Add note about drone depo bonus if this is a production building
                    const hasProductionResources = Object.keys(building.production).some(
                        resource => resource !== RESOURCES.ENERGY && resource !== RESOURCES.DRONES
                    );
                }
                
                // Consumption
                if (Object.keys(building.consumption).length > 0) {
                    additionalText += "\nConsumption:\n";
                    for (const resource in building.consumption) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);                        
                        additionalText += `${resourceName}: -${building.consumption[resource]}\n`;
                    }
                }
                
                // Combine all text
                content += additionalText;
                
                this.infoContent.setText(content);

                // Show building sprite
                this.infoSprite.setTexture(building.texture);
                this.infoSprite.setDisplaySize(this.INFO_SPRITE_SIZE, this.INFO_SPRITE_SIZE);
                this.infoSprite.setVisible(true);
            } else {
                this.infoContent.setText('Unknown building card');
            }
        } else if (card.type === 'event') {
            // Handle event card info display
            let content = card.cardType.description + '\n\n';
            
            // If card is repeatable, show that info
            if (card.cardType.repeatable) {
                content += `Can be repeated after ${card.cardType.repeatable.cooldown} turn${card.cardType.repeatable.cooldown > 1 ? 's' : ''}\n\n`;
            }
            
            content += "Cost:\n";

            // Get costs with adjustments
            let displayCost = this.gameScene.calculateCardCost(card);
            
            // Check if there are any costs
            let hasCosts = false;
            for (const resource in displayCost) {
                if (displayCost[resource] > 0) {
                    hasCosts = true;
                    // Check if we have enough resources
                    const required = displayCost[resource];
                    const available = this.resourceManager.getResource(resource);
                    const hasEnough = available >= required;
                    
                    // Format resource names with proper capitalization
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    
                    // Add color coding for resources we don't have enough of
                    if (hasEnough) {
                        content += `${resourceName}: ${required}\n`;
                    } else {
                        content += `${resourceName}: ${required} (have ${available})\n`;
                    }
                }
            }
            
            // If no costs, display "No cost"
            if (!hasCosts) {
                content += "No cost\n";
            }

            // Add effect description
            content += "\nEffect:\n";

            // Support backward compatibility for old cards with a single effect
            const effects = card.cardType.effects || (card.cardType.effect ? [card.cardType.effect] : []);

            if (effects.length === 0) {
                content += "No effects\n";
            } else {
                for (const effect of effects) {
                    if (effect.type === 'addResource') {
                        const resourceName = effect.resource.charAt(0).toUpperCase() + effect.resource.slice(1);
                        content += `• Add ${effect.amount} ${resourceName}\n`;
                    }
                    // Future effect types can be added here
                }
            }

            this.infoContent.setText(content);

            // Use proper card texture if available
            const texture = card.cardType.cardTexture || 'placeholderTexture';
            this.infoSprite.setTexture(texture);
            this.infoSprite.setDisplaySize(this.INFO_SPRITE_SIZE, this.INFO_SPRITE_SIZE);
            this.infoSprite.setVisible(true);
        }
    }
    
    // Clear the info panel
    clearInfoPanel() {
        this.infoTitle.setText('');
        this.infoContent.setText('');
        this.infoSprite.setVisible(false);
        this.selectedCell = null;
        
        // Also clear any cost texts if they exist
        if (this.costTexts) {
            this.costTexts.forEach(text => {
                if (text) text.destroy();
            });
            this.costTexts = [];
        }
        
        // Clear additional content separately
        if (this.additionalContent) {
            this.additionalContent.destroy();
            this.additionalContent = null;
        }
        
        // Only hide action buttons, not the title
        this.actionsContainer.setVisible(false);
    }
    
    // Show message to the player
    showMessage(message) {
        this.messageText.setText(message);
        this.messageBox.setVisible(true);
        
        // Hide after a delay
        this.time.delayedCall(3000, () => {
            this.messageBox.setVisible(false);
        });
    }
    
    // Show notification about new cards
    showNewCards(cards) {
        if (cards.length > 0) {
            this.showMessage(`Drew ${cards.length} new card(s)`);
        }
    }
    
    // Show game over screen
    showGameOver(victoryPoints) {
        // Clear existing UI
        this.handContainer.removeAll(true);
        
        // Create game over panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRect(width / 2 - 200, height / 2 - 150, 400, 300);
        
        // Title
        this.add.text(
            width / 2, 
            height / 2 - 120, 
            'GAME OVER', 
            { fontSize: '32px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Score breakdown
        this.add.text(
            width / 2, 
            height / 2 - 50, 
            `Reputation: ${victoryPoints}`, 
            { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Restart button
        const restartButton = this.add.container(width / 2, height / 2 + 80);
        
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x994500, 1);
        buttonBg.fillRoundedRect(-75, -20, 150, 40, 5);
        
        const buttonText = this.add.text(
            0, 
            0, 
            'PLAY AGAIN', 
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        restartButton.add(buttonBg);
        restartButton.add(buttonText);
        
        restartButton.setInteractive(new Phaser.Geom.Rectangle(-75, -20, 150, 40), Phaser.Geom.Rectangle.Contains);
        
        restartButton.on('pointerdown', () => {
            // Restart the game
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
        });
        
        restartButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0xcc6600, 1);
            buttonBg.fillRoundedRect(-75, -20, 150, 40, 5);
        });
        
        restartButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x994500, 1);
            buttonBg.fillRoundedRect(-75, -20, 150, 40, 5);
        });
    }
    
    // Show victory screen
    showVictory(reputation, goal, isRandomLevel = false) {
        // Create panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel that covers most of the screen (80% of width, 60% of height)
        const panelWidth = 800;
        const panelHeight = 600;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        // Create victory panel with glass and screw texture
        const panel = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2, // center position
            'panelGlassScrews',                            // texture key
            null,                                          // frame (null for default)
            panelWidth, panelHeight,                       // size
            30, 30, 30, 30                                 // slice sizes: left, right, top, bottom
        );
        panel.setOrigin(0.5);
        panel.setTint(0x3388dd); // Blue tint for victory
        
        // Create a container to group all victory elements
        const victoryContainer = this.add.container(0, 0);
        victoryContainer.name = 'victoryContainer';
        
        // Title with glow effect
        const titleText = this.add.text(
            width / 2, 
            panelY + 100, 
            'VICTORY!', 
            { fontSize: '64px', fontFamily: 'Arial', color: '#ffdd00', align: 'center' }
        ).setOrigin(0.5);
        
        // Add glow effect to the title
        titleText.setStroke('#ff8800', 4);
        titleText.setShadow(0, 0, '#ff8800', 20, true);
        
        victoryContainer.add(titleText);
        
        // Reputation achievement
        victoryContainer.add(this.add.text(
            width / 2, 
            panelY + 200, 
            `You reached ${reputation} reputation points!`, 
            { fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5));
        
        // Goal description
        victoryContainer.add(this.add.text(
            width / 2, 
            panelY + 240, 
            `(required: ${goal})`, 
            { fontSize: '18px', fontFamily: 'Arial', color: '#aaddff', align: 'center' }
        ).setOrigin(0.5));
        
        // Check if this is level5 to show special victory message
        const currentLevel = levelManager.getCurrentLevel();
        
        if (isRandomLevel) {
            // Random level victory description
            const randomLevelsCompleted = levelManager.LEVEL_PROGRESS.randomLevelsCompleted || 0;
            const victoryText = `You've successfully established a new colony on Mars! ` +
                                `Your Mars colonization skills continue to improve.` + 
                                `You've completed ${randomLevelsCompleted} challenge missions so far.`;
            
            victoryContainer.add(this.add.text(
                width / 2, 
                panelY + 300, 
                victoryText, 
                { 
                    fontSize: '18px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center',
                    wordWrap: { width: panelWidth - 100 }
                }
            ).setOrigin(0.5));
            
            const continueButtonWidth = 200;
            const continueButtonHeight = 40;
            const continueButtonX = width / 2 - continueButtonWidth / 2;
            const continueButtonY = panelY + 380;
            const continueButton = this.createActionButton(
                'CONTINUE EXPLORING',
                () => {
                    // Mark level as completed - this increments the counter
                    levelManager.advanceToNextLevel();
                    levelManager.saveLevelProgress();
                    
                    // Go directly to level select screen
                    this.scene.stop('UIScene');
                    this.scene.stop('GameScene');
                    this.scene.start('LevelSelectScene');
                },
                0x228833, // Green color for positive action
                continueButtonWidth,
                continueButtonHeight
            );
            
            continueButton.setPosition(continueButtonX, continueButtonY);
            victoryContainer.add(continueButton);
        } else if (currentLevel && currentLevel.id === FINAL_LEVEL_MAP) {
            // Special victory description for level5
            const victoryText = "You have proven yourself and helped build orbital infrastructure! " +
                              "You are now authorized to create colonies all over Mars. " +
                              "The future of humanity's expansion throughout the solar system begins here!";
            
            victoryContainer.add(this.add.text(
                width / 2, 
                panelY + 300, 
                victoryText, 
                { 
                    fontSize: '18px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center',
                    wordWrap: { width: panelWidth - 100 }
                }
            ).setOrigin(0.5));
            
            const forwardButtonWidth = 200;
            const forwardButtonHeight = 40;
            const forwardButtonX = width / 2 - forwardButtonWidth / 2;
            const forwardButtonY = panelY + 380;
            const forwardButton = this.createActionButton(
                'VENTURE FORWARD',
                () => {
                    // Mark level as completed
                    levelManager.LEVEL_PROGRESS.completedLevels[currentLevel.id] = true;
                    levelManager.saveLevelProgress();
                    
                    // Go directly to level select screen
                    this.scene.stop('UIScene');
                    this.scene.stop('GameScene');
                    this.scene.start('LevelSelectScene');
                },
                0x228833, // Green color for positive action
                forwardButtonWidth,
                forwardButtonHeight
            );
            
            forwardButton.setPosition(forwardButtonX, forwardButtonY);
            victoryContainer.add(forwardButton);
        } else {
            // Regular victory description for other levels
            const victoryText = "Your Mars colony is thriving! Your leadership skills have " +
                             "impressed the United Earth Government, and more resources " +
                             "will be provided for your next mission.";
            
            victoryContainer.add(this.add.text(
                width / 2, 
                panelY + 300, 
                victoryText, 
                { 
                    fontSize: '18px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center',
                    wordWrap: { width: panelWidth - 100 }
                }
            ).setOrigin(0.5));
            
            const rewardButtonWidth = 200;
            const rewardButtonHeight = 40;
            const rewardButtonX = width / 2 - rewardButtonWidth / 2;
            const rewardButtonY = panelY + 380;
            const rewardsButton = this.createActionButton(
                'VIEW REWARDS',
                () => {
                    // Advance to next level and save progress before showing rewards
                    levelManager.advanceToNextLevel();
                    levelManager.saveLevelProgress();
                    
                    // Hide victory screen and show rewards
                    victoryContainer.setVisible(false);
                    panel.setVisible(false);
                    this.showRewards();
                },
                0x228833, // Green color for positive action
                rewardButtonWidth,
                rewardButtonHeight
            );
            
            rewardsButton.setPosition(rewardButtonX, rewardButtonY);
            victoryContainer.add(rewardsButton);
        }
    }
    
    // Show rewards panel with selectable rewards
    showRewards() {
        // Disable victory checking while in rewards screen
        this.resourceManager.setVictoryCheckEnabled(false);
        
        // Hide the help button
        if (this.helpButton) {
            this.helpButton.setVisible(false);
        }
        
        // Create rewards panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel that covers most of the screen (Keep it 10px from each edge!)
        const panelX = 10;
        const panelY = 10;
        const panelWidth = width - 2 * panelX;
        const panelHeight = height - 2 * panelY;
        
        // Create a dark overlay for better contrast
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.7);
        darkOverlay.fillRect(0, 0, width, height);
        
        // Create the panel background using nine-slice with the requested texture
        const panel = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2, // center position
            'panelGlassScrews',                            // texture key
            null,                                          // frame (null for default)
            panelWidth, panelHeight,                       // size
            30, 30, 30, 30                                 // slice sizes: left, right, top, bottom
        );
        panel.setOrigin(0.5);
        panel.setTint(0x0b5394); // Deep blue tint for better contrast
        
        // Title
        const titleYOffset = 50;
        const titleText = this.add.text(
            width / 2, 
            panelY + titleYOffset, 
            'SELECT YOUR REWARD', 
            { 
                fontSize: '38px', 
                fontFamily: 'Arial', 
                color: '#ffdd00', 
                align: 'center',
                fontWeight: 'bold',
                stroke: '#ff8800',
                strokeThickness: 5,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, fill: true }
            }
        ).setOrigin(0.5);
        
        // Instructions text
        const instructionsYOffset = 100;
        this.add.text(
            width / 2, 
            panelY + instructionsYOffset, 
            'Choose one enhancement for your colony', 
            { 
                fontSize: '20px', 
                fontFamily: 'Arial', 
                color: '#ffffff', 
                align: 'center',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5);
        
        // Create container for all reward elements
        const rewardsContainer = this.add.container(0, 0);
        rewardsContainer.name = 'rewardsContainer';
        
        // Create 3 reward slots
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const slotYOffset = 150
        const slotsY = panelY + slotYOffset;
        
        // Calculate total width of all slots with spacing
        const totalSlotsWidth = (slotWidth * 3) + (slotSpacing * 2);
        // Calculate starting X position to center all slots
        const startX = (width - totalSlotsWidth) / 2;
        
        // Get the reward IDs from the level manager's available rewards
        const availableRewards = levelManager.getAvailableRewards();
        let rewardIds = [];
        
        if (availableRewards && availableRewards.rewardIds) {
            rewardIds = availableRewards.rewardIds || [];
        }
        
        // Get the requested rewards from the RewardsManager
        const rewards = rewardIds.map((rewardId, mapIndex) => {
            const reward = this.rewardsManager.findRewardById(rewardId);
            
            if (!reward) {
                console.error(`Reward with ID ${rewardId} not found`);
                return null;
            }
            
            return {
                id: reward.id,
                name: reward.name,
                image: reward.image,
                description: reward.description,
                effect: () => {
                    const unlocked = this.rewardsManager.unlockReward(reward.id);
                    if (unlocked) {
                        // Show message
                        this.showMessage(`Unlocked: ${reward.name}`);
                        
                        // Replace the button with "UNLOCKED" label for this specific reward
                        this.replaceUnlockButtonWithLabel(mapIndex, reward.name);
                        
                        // Disable all other reward buttons (can select only one)
                        this.disableAllRewardsExcept(mapIndex);
                    }
                },
                isUnlocked: this.rewardsManager.isRewardUnlocked(reward.id)
            };
        }).filter(reward => reward !== null);
        
        // Create each reward slot
        rewards.forEach((reward, index) => {
            const slotX = startX + (index * (slotWidth + slotSpacing));
            
            // Determine background texture based on card type
            let textureKey = 'cardBackground';
            
            // Get the card ID from the original reward object obtained from RewardsManager
            const originalReward = this.rewardsManager.findRewardById(reward.id);
            // Check if reward has effects and use the first one that has a cardId
            let rewardCardId = null;
            if (originalReward && originalReward.effects) {
                // Look for the first effect with a cardId
                for (const effect of originalReward.effects) {
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
            
            // Slot background
            const slotBg = this.add.nineslice(
                slotX + slotWidth/2,
                slotsY + slotHeight/2,
                textureKey,
                null,
                slotWidth, slotHeight,
                15, 15, 35, 15
            );
            slotBg.setOrigin(0.5);
            rewardsContainer.add(slotBg);
            
            // Dark background for the description to improve readability
            const descBg = this.add.graphics();
            const descBgYOffset = 190;
            const descBgHeight = 140;
            descBg.fillStyle(0x000000, 0.6);
            descBg.fillRoundedRect(slotX + 20, slotsY + descBgYOffset, slotWidth - 40, descBgHeight, 8);
            rewardsContainer.add(descBg);
            
            // Reward name
            const nameYOffset = 20;
            const nameText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + nameYOffset, 
                reward.name, 
                { 
                    fontSize: '20px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center', 
                    fontWeight: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            rewardsContainer.add(nameText);
            
            // Reward image
            const imageYOffset = 120;
            const rewardImage = this.add.sprite(
                slotX + slotWidth/2,
                slotsY + imageYOffset,
                reward.image
            );
            
            // Set fixed height and calculate width based on aspect ratio
            const imageTexture = this.textures.get(reward.image);
            const imageHeight = 130;    
            let displayWidth = imageHeight;
            if (imageTexture && imageTexture.get()) {
                const sourceWidth = imageTexture.get().width;
                const sourceHeight = imageTexture.get().height;
                
                if (sourceWidth && sourceHeight) {
                    const aspectRatio = sourceWidth / sourceHeight;
                    displayWidth = imageHeight * aspectRatio;
                }
            }
            rewardImage.setDisplaySize(displayWidth, imageHeight);
            rewardsContainer.add(rewardImage);
            
            // Reward description
            const descriptionYOffset = 210;
            const descriptionText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + descriptionYOffset, 
                reward.description, 
                { 
                    fontSize: '16px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center',
                    wordWrap: { width: slotWidth - 60 },
                    lineSpacing: 5
                }
            ).setOrigin(0.5, 0); // TODO: try 0.5, 0.5
            rewardsContainer.add(descriptionText);
            
            // Select button
            const isUnlocked = reward.isUnlocked;
            const lableYOffset = 25;
            if (isUnlocked) {
                const unlockedLabel = this.add.text(
                    slotX + slotWidth/2, 
                    slotsY + slotHeight + lableYOffset,
                    "UNLOCKED", 
                    { 
                        fontSize: '18px', 
                        fontFamily: 'Arial', 
                        color: '#ffcc00', 
                        align: 'center',
                        fontWeight: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                rewardsContainer.add(unlockedLabel);
            } else {
                // Create unlock button
                const buttonWidth = 140;
                const buttonHeight = 40;
                const unlockButtonYOffset = 45;
                const buttonBg = this.add.sprite(0, 0, 'blueGlossSquareButton');
                buttonBg.setDisplaySize(buttonWidth, buttonHeight);
                buttonBg.setOrigin(0, 0);
                
                const buttonText = this.add.text(
                    buttonWidth / 2,
                    buttonHeight / 2,
                    "UNLOCK",
                    { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
                );
                buttonText.setOrigin(0.5);
                
                const selectButton = this.add.container(
                    slotX + slotWidth/2 - buttonWidth/2,
                    slotsY + slotHeight - buttonHeight + unlockButtonYOffset
                );
                
                // Give the button a name with index for easier identification
                selectButton.name = `unlock-button-${index}`;
                
                selectButton.add(buttonBg);
                selectButton.add(buttonText);
                
                // Make button interactive
                selectButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
                selectButton.on('pointerdown', reward.effect);
                selectButton.on('pointerover', () => {
                    buttonBg.setTint(0xdddddd);
                });
                selectButton.on('pointerout', () => {
                    buttonBg.clearTint();
                });
                
                rewardsContainer.add(selectButton);
                
                // Store for later reference
                reward.button = selectButton;
            }
        });
        
        // TO NEXT MISSION button at the bottom center
        const nextButtonWidth = 220;
        const nextButtonHeight = 50;
        const nextButtonBg = this.add.sprite(0, 0, 'blueGlossSquareButton');
        nextButtonBg.setDisplaySize(nextButtonWidth, nextButtonHeight);
        nextButtonBg.setOrigin(0, 0);
        
        const nextButtonText = this.add.text(
            nextButtonWidth / 2,
            nextButtonHeight / 2,
            'CONTINUE',
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
        );
        nextButtonText.setOrigin(0.5);
        
        const nextButtonYOffset = 70;
        const nextMissionButton = this.add.container(
            width / 2 - nextButtonWidth/2,
            height - panelY - nextButtonYOffset
        );
        nextMissionButton.add(nextButtonBg);
        nextMissionButton.add(nextButtonText);
        
        // Make button interactive
        nextMissionButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, nextButtonWidth, nextButtonHeight), Phaser.Geom.Rectangle.Contains);
        nextMissionButton.on('pointerdown', () => {
            // Clean up UI elements
            panel.destroy();
            darkOverlay.destroy();
            rewardsContainer.destroy();
            nextMissionButton.destroy();
            
            // Reset player's reputation for the next level
            this.resourceManager.resources[RESOURCES.REPUTATION] = 0;
            
            // Re-enable victory checking for the next level
            this.resourceManager.setVictoryCheckEnabled(true);
            
            // Show the help button again
            if (this.helpButton) {
                this.helpButton.setVisible(true);
            }
            
            // Navigate to level select scene
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('LevelSelectScene');
        });
        nextMissionButton.on('pointerover', () => {
            nextButtonBg.setTint(0xdddddd);
        });
        nextMissionButton.on('pointerout', () => {
            nextButtonBg.clearTint();
        });
    }
    
    // Method to replace unlock button with label for clarity and consistency
    replaceUnlockButtonWithLabel(rewardIndex, rewardName) {
        // Find the rewards container
        const rewardsContainer = this.children.list.find(child => 
            child.type === 'Container' && 
            child.name === 'rewardsContainer'
        );
        
        if (!rewardsContainer) return;
        
        // Calculate position parameters (same as in showRewards)
        const width = this.cameras.main.width;
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const totalSlotsWidth = (slotWidth * 3) + (slotSpacing * 2);
        const startX = (width - totalSlotsWidth) / 2;
        const slotX = startX + (rewardIndex * (slotWidth + slotSpacing));
        const panelY = 10;
        const slotYOffset = 150;
        const slotsY = panelY + slotYOffset;
        
        // Find the button by name instead of position
        const buttonToReplace = rewardsContainer.list.find(child => 
            child.type === 'Container' && 
            child.name === `unlock-button-${rewardIndex}`
        );
        
        if (buttonToReplace) {
            // Remove the button
            rewardsContainer.remove(buttonToReplace, true);
            
            const lableYOffset = 25;
            
            // Create and add the "UNLOCKED" label
            const unlockedLabel = this.add.text(
                slotX + slotWidth/2, 
                slotsY + slotHeight + lableYOffset,
                "UNLOCKED", 
                { 
                    fontSize: '18px', 
                    fontFamily: 'Arial', 
                    color: '#ffcc00', 
                    align: 'center',
                    fontWeight: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            rewardsContainer.add(unlockedLabel);
        } else {
            console.warn(`Could not find UNLOCK button for reward index ${rewardIndex}`);
        }
    }
    
    // Disable all reward buttons except the selected one
    disableAllRewardsExcept(selectedIndex) {
        // Find the rewards container
        const rewardsContainer = this.children.list.find(child => 
            child.type === 'Container' && 
            child.name === 'rewardsContainer'
        );
        
        if (!rewardsContainer) return;
        
        // Get reward data
        const availableRewards = levelManager.getAvailableRewards();
        let rewardIds = availableRewards && availableRewards.rewardIds ? 
                        availableRewards.rewardIds : [];
        
        // Calculate position parameters (same as in showRewards)
        const width = this.cameras.main.width;
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const totalSlotsWidth = (slotWidth * 3) + (slotSpacing * 2);
        const startX = (width - totalSlotsWidth) / 2;
        const panelY = 10;
        const slotYOffset = 150;
        const slotsY = panelY + slotYOffset;
        const lableYOffset = 70;

        
        rewardIds.forEach((rewardId, index) => {
            // Skip the selected reward
            if (index === selectedIndex) return;
            
            const reward = this.rewardsManager.findRewardById(rewardId);
            if (!reward) return;
            
            // Only process rewards that are not already unlocked
            if (this.rewardsManager.isRewardUnlocked(rewardId)) return;
            
            const slotX = startX + (index * (slotWidth + slotSpacing));
            
            // Find the button by name
            const buttonToReplace = rewardsContainer.list.find(child => 
                child.type === 'Container' && 
                child.name === `unlock-button-${index}`
            );
            
            if (buttonToReplace) {
                // Remove the button
                rewardsContainer.remove(buttonToReplace, true);
                
                // Add a semi-transparent overlay to show it's disabled
                const disabledOverlay = this.add.graphics();
                disabledOverlay.fillStyle(0x000000, 0.5);
                disabledOverlay.fillRect(slotX, slotsY, slotWidth, slotHeight);
                rewardsContainer.add(disabledOverlay);
            }
        });
    }
    
    // Update the actions panel based on selected entity
    updateActionsPanel() {
        // Clear existing buttons
        this.actionsContainer.removeAll(true);
        
        let hasActions = false;
        let buttonY = 0; // Track vertical position for multiple buttons
        const buttonSpacing = 10; // Spacing between buttons
        
        // If we have a selected card, show actions based on card type
        if (this.selectedCardIndex !== null) {
            hasActions = true;
            
            const selectedCard = this.gameScene.selectedCard;
            
            // For event cards, show Apply button
            if (selectedCard && selectedCard.type === 'event') {
                // Calculate cost with adjustments
                const cardCost = this.gameScene.calculateCardCost(selectedCard);
                // Check if player has enough resources
                const hasSufficientResources = this.resourceManager.hasSufficientResources(cardCost);
                
                if (hasSufficientResources) {
                    // Create apply button
                    const applyButton = this.createActionButton('Apply Event', () => {
                        // Apply the event card
                        this.gameScene.applyEvent(this.selectedCardIndex);
                    }, 0x008800, 100, 30, 'blueGlossSquareButton'); // Green color for apply
                    
                    // Position the button
                    applyButton.y = buttonY;
                    this.actionsContainer.add(applyButton);
                    
                    // Update vertical position for next button
                    buttonY += this.buttonHeight + buttonSpacing;
                } else {
                    // Disabled apply button
                    const applyButton = this.createDisabledButton('Apply Event', 'Not enough resources', 100, this.buttonHeight);
                    
                    // Position the button
                    applyButton.y = buttonY;
                    this.actionsContainer.add(applyButton);
                    
                    // Update vertical position for next button
                    buttonY += this.buttonHeight + buttonSpacing;
                }
            }
            
            // Always show discard button for any card
            const discardButton = this.createActionButton('Discard', () => {
                // Discard the selected card
                this.cardManager.discardCard(this.selectedCardIndex);
                
                // Clear selection and illegal tile shading
                this.selectedCardIndex = null;
                this.gameScene.selectedCard = null;
                this.gameScene.selectedCardIndex = undefined;
                this.gameScene.clearIllegalTileShading();
                
                // Update UI
                this.clearInfoPanel();
                this.refreshUI();
                
                // Check if we're now under the hand limit
                this.updateEndTurnButton();
                
                // Show message
                this.showMessage('Card discarded');
            }, 0xcc0000, 100, 30, 'discardButton'); // Use red texture for discard button
            
            // Position the button
            discardButton.y = buttonY;
            this.actionsContainer.add(discardButton);
            
            // Update vertical position for next button
            buttonY += this.buttonHeight + buttonSpacing;
        }
        // If we have a selected building, show available actions
        else if (this.selectedCell && this.selectedCell.building) {
            // Get actions for this building type
            const actions = this.gameScene.buildingActionManager.getBuildingActions(this.selectedCell.building);
            
            if (actions && actions.length > 0) {
                hasActions = true;
                
                actions.forEach(action => {
                    // Format button text with costs and benefits
                    let buttonText = action.name;
                    
                    // Add costs if any
                    if (action.cost) {
                        Object.entries(action.cost).forEach(([resource, amount], index) => {
                            buttonText += `${index === 0 ? ': -' : ', -'}${amount} ${resource}`;
                        });
                    }
                    
                    // Add effects if any
                    if (action.effects) {
                        action.effects.forEach(effect => {
                            if (effect.type === 'addResource') {
                                buttonText += `, +${effect.amount} ${effect.resource}`;
                            }
                        });
                    }
                    
                    // Check if action is on cooldown
                    const isOnCooldown = this.gameScene.buildingActionManager.isActionOnCooldown(
                        this.selectedCell.x, this.selectedCell.y, action.action
                    );
                    
                    // Check resource requirements
                    const hasSufficientResources = this.gameScene.resourceManager.hasSufficientResources(action.cost);
                    
                    // Special handling for launch action
                    const isLaunchAction = action.action === 'launchRocket';
                    let canLaunch = true;
                    
                    if (isLaunchAction) {
                        canLaunch = this.selectedCell.hasRocket && this.selectedCell.rocketState === 'fueled';
                    }
                    
                    // Create enabled or disabled button
                    if (!isOnCooldown && hasSufficientResources && (!isLaunchAction || canLaunch)) {
                        // Enabled action button
                        const actionButton = this.createActionButton(buttonText, () => {
                            // Execute the action
                            this.gameScene.executeAction(this.selectedCell.x, this.selectedCell.y, action.action);
                            
                            // Clear selection and refresh UI
                            this.clearInfoPanel();
                            this.refreshUI();
                        }, 0x0066cc, 350, this.buttonHeight, 'blueGlossSquareButton');
                        
                        // Position the button
                        actionButton.y = buttonY;
                        this.actionsContainer.add(actionButton);
                    } else {
                        // Determine disabled reason
                        let disabledReason = 'Action unavailable';
                        if (isOnCooldown) {
                            const cooldownTurns = this.gameScene.buildingActionManager.getActionCooldown(
                                this.selectedCell.x, this.selectedCell.y, action.action
                            );
                            
                            // For launch actions, provide more context
                            if (isLaunchAction) {
                                disabledReason = `Rocket in flight. Returns in ${cooldownTurns} turn${cooldownTurns > 1 ? 's' : ''}.`;
                            } else {
                                disabledReason = `On cooldown (${cooldownTurns} turns)`;
                            }
                        } else if (!hasSufficientResources) {
                            disabledReason = 'Not enough resources';
                        } else if (isLaunchAction && !canLaunch) {
                            disabledReason = 'Need fuel to launch rocket';
                        }
                        
                        // Disabled button
                        const disabledButton = this.createDisabledButton(buttonText, disabledReason, 350, this.buttonHeight, 'blueGlossSquareButton');
                        
                        // Position the button
                        disabledButton.y = buttonY;
                        this.actionsContainer.add(disabledButton);
                    }
                    
                    // Update vertical position for next button
                    buttonY += this.buttonHeight + buttonSpacing;
                });
            }
        }
        
        // Only toggle visibility of the container, not the title
        this.actionsContainer.setVisible(hasActions);
    }
    
    // Helper to create action buttons
    createActionButton(text, callback, buttonColor = 0x994500, buttonWidth = 100, buttonHeight = 30, textureName = null) {
        const button = this.add.container(0, 0);
        
        // Button background - either use texture or graphics
        let bg;
        if (textureName) {
            // Use nine-slice for texture-based buttons for better UI scaling
            bg = this.add.nineslice(
                0, 0,                   // position
                textureName,            // texture key
                null,                   // frame (null for default)
                buttonWidth, buttonHeight, // size
                10, 10, 10, 10          // slice sizes: left, right, top, bottom
            );
            bg.setOrigin(0, 0);
        } else {
            // Use graphics (for backward compatibility)
            bg = this.add.graphics();
            bg.fillStyle(buttonColor, 1);
            bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        }
        button.add(bg);
        
        // Button text
        const buttonText = this.add.text(
            buttonWidth / 2, 
            buttonHeight / 2, 
            text, 
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', align: 'center', fontWeight: 'bold' }
        );
        buttonText.setOrigin(0.5);
        button.add(buttonText);
        
        // Make button interactive
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effect
        button.on('pointerover', () => {
            if (textureName) {
                bg.setTint(0xdddddd); // Light tint for hover
            } else {
                bg.clear();
                bg.fillStyle(buttonColor === 0x994500 ? 0xcc6600 : buttonColor * 1.2, 1);
                bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
            }
        });
        
        button.on('pointerout', () => {
            if (textureName) {
                bg.clearTint(); // Clear tint
            } else {
                bg.clear();
                bg.fillStyle(buttonColor, 1);
                bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
            }
        });
        
        // Add click handler
        button.on('pointerdown', callback);
        
        return button; // Return the button container
    }
    
    // Helper to create disabled action buttons
    createDisabledButton(text, tooltipText, buttonWidth = 100, buttonHeight = 30, textureName = null) {
        const button = this.add.container(0, 0);
        
        // Button background
        let bg;
        if (textureName) {
            // Use nine-slice for texture-based buttons for better UI scaling
            bg = this.add.nineslice(
                0, 0,                   // position
                textureName,            // texture key
                null,                   // frame (null for default)
                buttonWidth, buttonHeight, // size
                10, 10, 10, 10          // slice sizes: left, right, top, bottom
            );
            bg.setOrigin(0, 0);
            bg.setTint(0x888888); // Gray tint for disabled appearance
            bg.setAlpha(0.7);     // Semi-transparent
        } else {
            // Use graphics (for backward compatibility)
            bg = this.add.graphics();
            bg.fillStyle(0x555555, 0.7); // Gray, semi-transparent for disabled look
            bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        }
        button.add(bg);
        
        // Button text
        const buttonText = this.add.text(
            buttonWidth / 2, 
            buttonHeight / 2, 
            text, 
            { fontSize: '14px', fontFamily: 'Arial', color: '#aaaaaa', align: 'center' }
        );
        buttonText.setOrigin(0.5);
        button.add(buttonText);
        
        // Make button interactive for tooltip only
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effect to show tooltip
        button.on('pointerover', () => {
            this.showTooltip(tooltipText, button.x + buttonWidth / 2, button.y - 5);
        });
        
        button.on('pointerout', () => {
            this.hideTooltip();
        });
        
        return button;
    }
    
    // Show tooltip
    showTooltip(text, x, y) {
        // Remove any existing tooltip
        this.hideTooltip();
        
        // Create tooltip container
        this.tooltip = this.add.container(x, y);
        
        // Background
        const tooltipBg = this.add.graphics();
        tooltipBg.fillStyle(0x000000, 0.8);
        
        // Text
        const tooltipText = this.add.text(
            0, 
            0, 
            text, 
            { fontSize: '12px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        );
        tooltipText.setOrigin(0.5, 1);
        
        // Calculate background size based on text
        const padding = 5;
        const width = tooltipText.width + padding * 2;
        const height = tooltipText.height + padding * 2;
        
        // Draw background
        tooltipBg.fillRoundedRect(-width/2, -height, width, height, 3);
        
        // Add to container
        this.tooltip.add(tooltipBg);
        this.tooltip.add(tooltipText);
        
        // Add to scene
        this.add.existing(this.tooltip);
        
        // Make sure tooltip is on top
        this.tooltip.setDepth(1000);
    }
    
    // Hide tooltip
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }
    
    // Update the launch button if a launch pad is selected
    updateLaunchButtonState() {
        // Only proceed if a building with actions is selected
        if (this.selectedCell && this.selectedCell.building) {
            // Get actions for this building
            const actions = this.gameScene.buildingActionManager.getBuildingActions(this.selectedCell.building);
            
            // If there are actions, update the actions panel
            if (actions && actions.length > 0) {
                this.updateActionsPanel();
            }
        }
    }
    
    // Show card choices for player selection
    showCardChoices(cards) {
        // Clear any previous choices
        this.choiceContainer.removeAll(true);
        this.clearCardChoiceSelection();
        
        if (cards.length === 0) {
            this.choicePanelContainer.setVisible(false);
            this.choicePanelBg.visible = false; // Hide background when no cards
            return;
        }
        
        // Show panel and background
        this.choicePanelContainer.setVisible(true);
        this.choicePanelBg.visible = true;
        
        cards.forEach((card, index) => {
            const xPos = index * (this.cardWidth + this.cardSpacing);
            
            // Create card container
            const cardContainer = this.add.container(xPos, 0);
            
            // Card background using NineSlice for better UI scaling
            let cardBg;
            
            // Determine background texture based on card type
            let textureKey = 'cardBackground';
            if (card.cardType.cardType === 'prefab') {
                textureKey = 'cardPrefabBackground';
            } else if (card.cardType.cardType === 'event') {
                textureKey = 'cardEventBackground';
            }
            
            // Create a simpler sprite for better interactivity
            const hitArea = this.add.rectangle(0, 0, this.cardWidth, this.cardHeight, 0xffffff, 0);
            hitArea.setOrigin(0, 0);
            hitArea.setInteractive();
            hitArea.on('pointerdown', () => {
                // Display card info but don't select it yet
                this.onCardChoiceClick(index);
            });
            cardContainer.add(hitArea);
            
            cardBg = this.add.nineslice(
                0, 0,                // position
                textureKey,          // texture key
                null,                // frame (null for default)
                this.cardWidth, this.cardHeight, // size
                10, 10, 35, 15       // slice sizes: left, right, top, bottom
            );
            cardBg.setOrigin(0, 0);
            cardContainer.add(cardBg);
            
            // Add card name
            const cardName = card.cardType ? card.cardType.name : card.building.shortName;
            const nameText = this.add.text(
                this.cardWidth / 2, 
                10, 
                cardName, 
                { fontSize: '12px', fontFamily: 'Arial', color: '#000000', align: 'center' }
            );
            nameText.setOrigin(0.5, 0);
            cardContainer.add(nameText);
            
            // Handle specific card type content
            if (card.type === 'building') {
                // Building icon - use cardTexture if available, otherwise use building texture
                const iconTexture = (card.cardType && card.cardType.cardTexture) ? 
                                   card.cardType.cardTexture : 
                                   (card.building ? card.building.texture : 'placeholderTexture');
                
                const icon = this.add.sprite(this.cardWidth / 2, 45, iconTexture);
                icon.setDisplaySize(40, 40);
                icon.setOrigin(0.5);
                cardContainer.add(icon);
                
                // Show costs from card type if available
                if (card.cardType && card.cardType.cost) {
                    // Cost text
                    let costY = 75;
                    
                    // Get base cost from card type with adjustments
                    let displayCost = this.gameScene.calculateCardCost(card);
                    
                    // Check if the card has any costs
                    let hasCosts = false;
                    for (const resource in displayCost) {
                        if (displayCost[resource] > 0) {
                            hasCosts = true;
                            const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                            
                            // Check if player has enough of this resource
                            const requiredAmount = displayCost[resource];
                            const playerAmount = this.resourceManager.getResource(resource);
                            const hasEnough = playerAmount >= requiredAmount;
                            
                            // Set color based on resource availability
                            const textColor = hasEnough ? '#000000' : '#ff0000';
                            
                            const costText = this.add.text(
                                5, 
                                costY, 
                                `${resourceName}: ${requiredAmount}`, 
                                { fontSize: '10px', fontFamily: 'Arial', color: textColor }
                            );
                            cardContainer.add(costText);
                            costY += 12;
                        }
                    }
                    
                    // If no costs were added, show "No cost" text
                    if (!hasCosts) {
                        const noCostText = this.add.text(
                            5, 
                            75, 
                            'No cost', 
                            { fontSize: '10px', fontFamily: 'Arial', color: '#000000' }
                        );
                        cardContainer.add(noCostText);
                    }
                }
            } else if (card.type === 'event') {
                // For event cards, display card texture if available
                const iconTexture = card.cardType.cardTexture || 'placeholderTexture';
                
                const icon = this.add.sprite(this.cardWidth / 2, 45, iconTexture);
                icon.setDisplaySize(40, 40);
                icon.setOrigin(0.5);
                cardContainer.add(icon);
                
                // Show costs from card type if available
                if (card.cardType && card.cardType.cost) {
                    // Cost text
                    let costY = 75;
                    
                    // Get base cost from card type with adjustments
                    let displayCost = this.gameScene.calculateCardCost(card);
                    
                    // Check if the card has any costs
                    let hasCosts = false;
                    for (const resource in displayCost) {
                        if (displayCost[resource] > 0) {
                            hasCosts = true;
                            const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                            
                            // Check if player has enough of this resource
                            const requiredAmount = displayCost[resource];
                            const playerAmount = this.resourceManager.getResource(resource);
                            const hasEnough = playerAmount >= requiredAmount;
                            
                            // Set color based on resource availability
                            const textColor = hasEnough ? '#000000' : '#ff0000';
                            
                            const costText = this.add.text(
                                5, 
                                costY, 
                                `${resourceName}: ${requiredAmount}`, 
                                { fontSize: '10px', fontFamily: 'Arial', color: textColor }
                            );
                            cardContainer.add(costText);
                            costY += 12;
                        }
                    }
                    
                    // If no costs were added, show "No cost" text
                    if (!hasCosts) {
                        const noCostText = this.add.text(
                            5, 
                            75, 
                            'No cost', 
                            { fontSize: '10px', fontFamily: 'Arial', color: '#000000' }
                        );
                        cardContainer.add(noCostText);
                    }
                }
            }
            
            this.choiceContainer.add(cardContainer);
        });
    }
    
    // Show info for a card choice without selecting it yet
    onCardChoiceClick(choiceIndex) {
        if (this.gameScene && this.gameScene.cardChoices && 
            choiceIndex >= 0 && choiceIndex < this.gameScene.cardChoices.length) {
            
            const selectedCard = this.gameScene.cardChoices[choiceIndex];
            
            // Clear any previous selection
            this.clearCardChoiceSelection();
            
            // Show card info in the info panel
            this.showSelectedCard(selectedCard);
            
            // Store the selected choice index
            this.selectedChoiceIndex = choiceIndex;
            
            // Add GRAB button below the selected card
            this.addGrabButtonToChoice(choiceIndex);
        }
    }
    
    // Update card choices after removing a card
    updateCardChoices(cards) {
        // Store the previously selected choice index
        const previousSelectedIndex = this.selectedChoiceIndex;
        
        // Clear existing choices and grab button
        this.clearCardChoiceSelection();
        this.choiceContainer.removeAll(true);
        
        // Show remaining cards
        this.showCardChoices(cards);
        
        // If there was a previously selected card and it's still valid, reselect it
        if (previousSelectedIndex !== null && previousSelectedIndex < cards.length) {
            // Select the card at this index again
            this.onCardChoiceClick(previousSelectedIndex);
        }
    }
    
    // Hide card choices panel
    hideCardChoices() {
        // Clear any active card choice selection
        this.clearCardChoiceSelection();
        
        this.choicePanelContainer.setVisible(false);
        this.choicePanelBg.visible = false;
    }
    
    // Handle card choice click
    onCardChoiceClick(choiceIndex) {
        // Instead of immediately selecting the card, show its info in the info panel
        if (this.gameScene && this.gameScene.cardChoices && 
            choiceIndex >= 0 && choiceIndex < this.gameScene.cardChoices.length) {
            
            const selectedCard = this.gameScene.cardChoices[choiceIndex];
            
            // Clear any previous selection
            this.clearCardChoiceSelection();
            
            // Show card info in the info panel
            this.showSelectedCard(selectedCard);
            
            // Store the selected choice index
            this.selectedChoiceIndex = choiceIndex;
            
            // Add GRAB button below the selected card
            this.addGrabButtonToChoice(choiceIndex);
        }
    }
    
    // Add GRAB button below a card choice
    addGrabButtonToChoice(choiceIndex) {
        // Remove any existing GRAB buttons
        if (this.grabButton) {
            this.grabButton.destroy();
            this.grabButton = null;
        }
        
        const cardContainer = this.choiceContainer.getAt(choiceIndex);
        if (!cardContainer) return;
        
        // Position the button below the card
        const buttonWidth = 80;
        const buttonHeight = 70;
        
        // Calculate position in global space
        const globalX = cardContainer.x + this.choiceContainer.x + this.choicePanelContainer.x + (this.cardWidth / 2);
        const globalY = cardContainer.y + this.choiceContainer.y + this.choicePanelContainer.y + this.cardHeight - 30;
        
        // Create a standalone button not tied to any container for better visibility
        this.grabButton = this.add.container(globalX, globalY);
        
        // Button background with more vibrant color
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x129510, 1); // Bright green
        buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
        
        // Add border for better visibility
        buttonBg.lineStyle(2, 0xFFFFFF, 1);
        buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
        
        this.grabButton.add(buttonBg);
        
        // Button text
        const buttonText = this.add.text(
            0, 
            0, 
            'GRAB', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center', fontWeight: 'bold' }
        );
        buttonText.setOrigin(0.5);
        this.grabButton.add(buttonText);
        
        // Make button interactive
        this.grabButton.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effect
        this.grabButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x16AE13, 1); // Lighter green
            buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(2, 0xFFFFFF, 1);
            buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
        });
        
        this.grabButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x129510, 1); // Back to original green
            buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(2, 0xFFFFFF, 1);
            buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
        });
        
        // Add click handler
        this.grabButton.on('pointerdown', () => {
            this.onGrabButtonClick(choiceIndex);
        });
        
        // Ensure the button is above everything else
        this.grabButton.setDepth(100);
    }
    
    // Handle GRAB button click
    onGrabButtonClick(choiceIndex) {
        // Make sure we have a valid game scene and choice index
        if (this.gameScene && choiceIndex !== null && 
            choiceIndex >= 0 && choiceIndex < this.gameScene.cardChoices.length) {
            
            // Actually select the card and add it to the player's hand
            this.gameScene.selectCardChoice(choiceIndex);
            
            // Reset the selection
            this.selectedChoiceIndex = null;
            
            // Remove the GRAB button
            if (this.grabButton) {
                this.grabButton.destroy();
                this.grabButton = null;
            }
        }
    }
    
    // Clear any card choice selection (hide GRAB button)
    clearCardChoiceSelection() {
        this.selectedChoiceIndex = null;
        
        // Remove GRAB button if it exists
        if (this.grabButton) {
            this.grabButton.destroy();
            this.grabButton = null;
        }
    }
    
    // Create a small circular help button to bring back the tutorial
    createHelpButton() {
        const buttonSize = 36;  // Slightly larger for the square button
        const paddingX = 10;
        const paddingY = 5;
        // Position in top-right corner
        const x = this.cameras.main.width - buttonSize - paddingX;
        const y = paddingY;
        
        // Create button container
        const helpButton = this.add.container(x, y);
        
        // Create button using barRoundLargeSquare texture with nine-slice
        const buttonBg = this.add.nineslice(
            buttonSize/2, buttonSize/2,  // center position within container
            'barRoundLargeSquare',       // texture key
            null,                        // frame (null for default)
            buttonSize, buttonSize,      // size
            5, 5, 5, 5                   // slice sizes: left, right, top, bottom
        );
        buttonBg.setOrigin(0.5);
        helpButton.add(buttonBg);
        
        // "i" text
        const text = this.add.text(buttonSize/2, buttonSize/2, 'i', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#ffffff'
        });
        text.setOrigin(0.5);
        helpButton.add(text);
        
        // Make interactive
        helpButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effects
        helpButton.on('pointerover', () => {
            buttonBg.setTint(0x4477dd); // Light blue tint for hover
        });
        
        helpButton.on('pointerout', () => {
            buttonBg.clearTint(); // Clear tint on pointer out
        });
        
        // Show tutorial panel on click
        helpButton.on('pointerdown', () => {
            this.showTutorialPanel();
        });
        
        // Set depth to ensure it's visible
        helpButton.setDepth(100);
        
        // Store reference
        this.helpButton = helpButton;
    }
    
    // Show tutorial panel at the beginning of level 1
    showTutorialPanel(secondPanel = false) {
        // If tutorial panel already exists, destroy it first
        if (this.tutorialContainer) {
            this.tutorialContainer.destroy();
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create container for all tutorial elements
        this.tutorialContainer = this.add.container(0, 0);
        
        // Add dark overlay for better readability
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.9); 
        darkOverlay.fillRect(0, 0, width, height);
        this.tutorialContainer.add(darkOverlay);
        
        // Calculate panel dimensions (adjust as needed for the image)
        const panelWidth = 800;
        const panelHeight = 600;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        // Create panel background using panelGlassScrews texture with dark tint
        const panelBg = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2, // center position
            'panelGlassScrews',                            // texture key
            null,                                          // frame (null for default)
            panelWidth, panelHeight,                       // size
            30, 30, 30, 30                                 // slice sizes: left, right, top, bottom
        );
        panelBg.setOrigin(0.5);
        panelBg.setTint(0x222233); // Dark blue-gray tint
        this.tutorialContainer.add(panelBg);
        
        // Add tutorial image based on which panel we're showing
        const tutorialImage = this.add.image(
            width / 2,
            height / 2 - 20, // Shift up slightly to make room for button
            secondPanel ? 'tutorialPanel2' : 'tutorialPanel'
        );
        
        // Scale the image to fit within the panel
        const scale = Math.min(
            (panelWidth - 40) / tutorialImage.width,
            (panelHeight - 80) / tutorialImage.height
        );
        tutorialImage.setScale(scale);
        
        this.tutorialContainer.add(tutorialImage);
        
        // Button configuration
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonY = panelY + panelHeight - buttonHeight - 20; // 20px from bottom of panel
        
        if (secondPanel) {
            // Create "BACK" button (left side)
            const backButtonX = width / 2 - buttonWidth - 10;
            const backButton = this.createActionButton(
                'BACK',
                () => {
                    // Go back to the first panel
                    this.showTutorialPanel(false);
                },
                0x4488cc, // Blue color
                buttonWidth,
                buttonHeight,
                'blueGlossSquareButton'
            );
            
            backButton.setPosition(backButtonX, buttonY);
            this.tutorialContainer.add(backButton);
            
            // Create "GOT IT" button (right side)
            const gotItButtonX = width / 2 + 10;
            const gotItButton = this.createActionButton(
                'GOT IT',
                () => {
                    // Get help button position for tweening target
                    const buttonSize = 36;
                    const paddingX = 10;
                    const paddingY = 5;
                    const helpButtonX = this.cameras.main.width - buttonSize - paddingX + buttonSize/2;
                    const helpButtonY = paddingY + buttonSize/2;
                    
                    // Create a pivot point for the tutorial container at its center
                    const containerCenterX = width / 2;
                    const containerCenterY = height / 2;
                    this.tutorialContainer.setPosition(containerCenterX, containerCenterY);
                    
                    // Move all children to maintain visual position after changing container position
                    this.tutorialContainer.iterate(child => {
                        child.x -= containerCenterX;
                        child.y -= containerCenterY;
                    });
                    
                    // Fade out the buttons immediately
                    this.tweens.add({
                        targets: [backButton, gotItButton],
                        alpha: 0,
                        duration: 200
                    });
                    
                    // Start with the container at scale 1
                    this.tutorialContainer.setScale(1);
                    
                    // Tween the tutorial panel to shrink into the help button
                    this.tweens.add({
                        targets: this.tutorialContainer,
                        x: helpButtonX,
                        y: helpButtonY,
                        scaleX: 0.05,
                        scaleY: 0.05,
                        duration: 300,
                        ease: 'Cubic.easeIn',
                        onComplete: () => {
                            // Destroy the container when animation completes
                            this.tutorialContainer.destroy();
                        }
                    });
                    
                    // Fade out the overlay faster than the panel shrink
                    this.tweens.add({
                        targets: darkOverlay,
                        alpha: 0,
                        duration: 250,
                        ease: 'Cubic.easeOut'
                    });
                },
                0x4488cc, // Blue color
                buttonWidth,
                buttonHeight,
                'blueGlossSquareButton'
            );
            
            gotItButton.setPosition(gotItButtonX, buttonY);
            this.tutorialContainer.add(gotItButton);
        } else {
            // Create "NEXT" button for first panel
            const nextButtonX = width / 2 - buttonWidth / 2;
            const nextButton = this.createActionButton(
                'NEXT',
                () => {
                    // Switch to the second tutorial panel
                    this.showTutorialPanel(true);
                },
                0x4488cc, // Blue color
                buttonWidth,
                buttonHeight,
                'blueGlossSquareButton'
            );
            
            nextButton.setPosition(nextButtonX, buttonY);
            this.tutorialContainer.add(nextButton);
        }
        
        // Make sure tutorial panel is on top
        this.tutorialContainer.setDepth(1000);
    }
    
    // Create particle emitter for the END TURN button effect
    createEndTurnButtonEffect() {
        // We'll create the emitter on demand when it's needed
        // No initialization required here
    }
    
    // Play the END TURN button effect
    playEndTurnButtonEffect() {
        try {
            // Position for the effect (center of the button)
            const buttonX = this.endTurnButton.x + 50; 
            const buttonY = this.endTurnButton.y + 15;
            
            // Create a simple circle particle effect
            for (let i = 0; i < this.buttonEffectConfig.quantity; i++) {
                // Create a sprite for each particle
                const particle = this.add.sprite(buttonX, buttonY, 'particleGlow');
                
                // Apply tint
                particle.setTint(this.buttonEffectConfig.color);
                
                // Set initial scale
                particle.setScale(this.buttonEffectConfig.scale.start);
                
                // Set blend mode
                particle.setBlendMode(this.buttonEffectConfig.blendMode);
                
                // Set initial alpha
                particle.setAlpha(this.buttonEffectConfig.alpha.start);
                
                // Calculate random angle and distance
                const angle = Math.random() * Math.PI * 2;
                const speed = this.buttonEffectConfig.speed * (0.5 + Math.random() * 0.5);
                
                // Animate the particle
                this.tweens.add({
                    targets: particle,
                    x: buttonX + Math.cos(angle) * speed,
                    y: buttonY + Math.sin(angle) * speed,
                    scale: this.buttonEffectConfig.scale.end,
                    alpha: this.buttonEffectConfig.alpha.end,
                    duration: this.buttonEffectConfig.lifespan,
                    ease: 'Power2',
                    onComplete: () => {
                        // Remove particle when animation is done
                        particle.destroy();
                    }
                });
            }
        } catch (error) {
            console.error('Error creating button effect:', error);
        }
    }
} 