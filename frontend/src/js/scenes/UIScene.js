import Phaser from 'phaser';
import { BUILDINGS, CARD_TYPES, MAX_CARD_SLOTS, MAX_HAND_SIZE, RESOURCES, TERRAIN_FEATURES, TERRAIN_TYPES } from '../config/game-data';
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
        
        // Initial UI update
        this.refreshUI();
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
            
            for (const resource in displayCost) {
                if (displayCost[resource] > 0) {
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
        }
        
        return cardContainer;
    }
    
    // Handle card click
    onCardClick(cardIndex) {
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
                                                     resource !== RESOURCES.DRONES;
                            
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
                
                // Show adjusted cost
                for (const resource in displayCost) {
                    if (displayCost[resource] > 0) {
                        // Check if we have enough resources
                        const required = displayCost[resource];
                        const available = this.resourceManager.getResource(resource);
                        const hasEnough = available >= required;
                        
                        // Format resource names with proper capitalization
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);                        
                        content += `${resourceName}: ${required}\n`;
                    }
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
            content += "Cost:\n";

            // Get costs with adjustments
            let displayCost = this.gameScene.calculateCardCost(card);
            
            // Show cost
            for (const resource in displayCost) {
                if (displayCost[resource] > 0) {
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
    showVictory(reputation, goal) {
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
        
        // Victory description
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
    
    // Show rewards panel with selectable rewards
    showRewards() {
        // Disable victory checking while in rewards screen
        this.resourceManager.setVictoryCheckEnabled(false);
        
        // Create rewards panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel that covers most of the screen as specified (Keep it 10px from each edge!)
        const panelX = 10;
        const panelY = 10;
        const panelWidth = width - 2 * panelX;
        const panelHeight = height - 2 * panelY;
        
        // Create the panel background using nine-slice with the requested texture
        const panel = this.add.nineslice(
            panelX + panelWidth/2, panelY + panelHeight/2, // center position
            'panelGlassScrews',                            // texture key
            null,                                          // frame (null for default)
            panelWidth, panelHeight,                       // size
            30, 30, 30, 30                                 // slice sizes: left, right, top, bottom
        );
        panel.setOrigin(0.5);
        panel.setTint(0x999999); // Apply a blue tint to match the game theme
        
        // Title
        this.add.text(
            width / 2, 
            panelY + 40, 
            'SELECT YOUR REWARD', 
            { fontSize: '32px', fontFamily: 'Arial', color: '#0b5394', align: 'center' }
        ).setOrigin(0.5);
        
        // Available reputation display
        const currentReputation = this.resourceManager.getResource(RESOURCES.REPUTATION);
        this.add.text(
            width / 2, 
            panelY + 75, 
            `Available reputation: ${currentReputation}`, 
            { fontSize: '20px', fontFamily: 'Arial', color: '#ffcc00', align: 'center' }
        ).setOrigin(0.5);
        
        // Create container for all reward elements
        const rewardsContainer = this.add.container(0, 0);
        rewardsContainer.name = 'rewardsContainer';
        
        // Create 3 reward slots
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const slotsY = panelY + 120;
        
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
                reputationCost: reward.reputationCost,
                effect: () => {
                    const unlocked = this.rewardsManager.unlockReward(reward.id);
                    if (unlocked) {
                        // Show message
                        this.showMessage(`Unlocked: ${reward.name}`);
                        
                        // Update available reputation display
                        const updatedReputation = this.resourceManager.getResource(RESOURCES.REPUTATION);
                        this.updateReputationDisplay(updatedReputation);
                        
                        // Replace the button with "UNLOCKED" label for this specific reward
                        this.replaceUnlockButtonWithLabel(mapIndex, reward.name);
                        
                        // Update other reward buttons that might be affected by new reputation amount
                        this.updateRewardButtons(rewards, mapIndex);
                    } else {
                        this.showMessage(`Not enough reputation to unlock ${reward.name}`);
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
                slotX + slotWidth/2, slotsY + slotHeight/2,
                textureKey,
                null,
                slotWidth, slotHeight,
                15, 15, 35, 15
            );
            // slotBg.setTint(0x3366aa);
            rewardsContainer.add(slotBg);
            
            // Reward name
            const nameText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + 18, 
                reward.name, 
                { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', align: 'center', fontWeight: 'bold' } // Keep 20px font size
            ).setOrigin(0.5);
            rewardsContainer.add(nameText);
            
            // Reward image
            const rewardImage = this.add.sprite(
                slotX + slotWidth/2,
                slotsY + 120,
                reward.image
            );

            // Set fixed height of 120px and calculate width based on aspect ratio
            const imageTexture = this.textures.get(reward.image);
            if (imageTexture && imageTexture.get()) {
                const sourceWidth = imageTexture.get().width;
                const sourceHeight = imageTexture.get().height;
                
                if (sourceWidth && sourceHeight) {
                    const aspectRatio = sourceWidth / sourceHeight;
                    const displayHeight = 120;
                    const displayWidth = displayHeight * aspectRatio;
                    
                    // Apply the calculated dimensions
                    rewardImage.setDisplaySize(displayWidth, displayHeight);
                } else {
                    // Fallback to square if dimensions can't be determined
                    rewardImage.setDisplaySize(120, 120);
                }
            } else {
                // Fallback to square if texture can't be found
                rewardImage.setDisplaySize(120, 120);
            }

            rewardsContainer.add(rewardImage);
            
            // Reward description
            const descriptionText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + 200, 
                reward.description, 
                { 
                    fontSize: '16px', 
                    fontFamily: 'Arial', 
                    color: '#ffffff', 
                    align: 'center',
                    wordWrap: { width: slotWidth - 30 } 
                }
            ).setOrigin(0.5);
            rewardsContainer.add(descriptionText);
            
            // Cost display
            const costText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + 260, 
                `Cost: ${reward.reputationCost} Reputation`, 
                { 
                    fontSize: '16px', 
                    fontFamily: 'Arial', 
                    color: '#ffcc00', 
                    align: 'center'
                }
            ).setOrigin(0.5);
            rewardsContainer.add(costText);
            
            // Select button
            const isUnlocked = reward.isUnlocked;
            const canAfford = !isUnlocked && this.resourceManager.getResource(RESOURCES.REPUTATION) >= reward.reputationCost;
            const unlockButtonVerticalShift = 45;
            const unlockButtonHorizontalShift = 60;

            if (isUnlocked) {
                // If already unlocked, show an "UNLOCKED" label
                const unlockedLabel = this.add.text(
                    slotX + slotWidth/2, 
                    slotsY + slotHeight - 40,
                    "UNLOCKED", 
                    { 
                        fontSize: '16px', 
                        fontFamily: 'Arial', 
                        color: '#ffcc00', 
                        align: 'center',
                        fontWeight: 'bold'
                    }
                ).setOrigin(0.5);
                rewardsContainer.add(unlockedLabel);
            } else if (canAfford) {
                const selectButton = this.createActionButton(
                    "UNLOCK", 
                    reward.effect, 
                    0x33cc33, 
                    120, 
                    40, 
                    'blueGlossSquareButton'
                );
                selectButton.x = slotX + slotWidth/2 - unlockButtonHorizontalShift;
                selectButton.y = slotsY + slotHeight - unlockButtonVerticalShift;
                // Store the button reference in the reward object for later updates
                reward.button = selectButton;
                rewardsContainer.add(selectButton);
            } else {
                const disabledButton = this.createDisabledButton(
                    "UNLOCK", 
                    "Not enough reputation", 
                    120, 
                    40, 
                    'blueGlossSquareButton'
                );
                disabledButton.x = slotX + slotWidth/2 - unlockButtonHorizontalShift;
                disabledButton.y = slotsY + slotHeight - unlockButtonVerticalShift;
                rewardsContainer.add(disabledButton);
            }
        });
        
        // TO NEXT MISSION button at the bottom center
        const nextMissionButton = this.createActionButton(
            "TO NEXT MISSION", 
            () => {
                // Clean up UI elements
                panel.destroy();
                rewardsContainer.destroy();
                nextMissionButton.destroy();
                
                // Reset player's reputation for the next level
                this.resourceManager.resources[RESOURCES.REPUTATION] = 0;
                
                // Re-enable victory checking for the next level
                this.resourceManager.setVictoryCheckEnabled(true);
                
                // Start a new game
                this.scene.stop('UIScene');
                this.scene.stop('GameScene');
                this.scene.start('GameScene');
            }, 
            0x0066aa, 
            200, 
            50, 
            'blueGlossSquareButton'
        );
        nextMissionButton.x = width / 2 - 100; // Center horizontally
        nextMissionButton.y = height - panelY - 60; // Position at bottom of panel
    }
    
    // Handle reward selection - replacing the old selectReward method with these new helper methods
    updateReputationDisplay(reputation) {
        // Find and update the reputation text in the rewards panel
        const reputationText = this.children.list.find(child => 
            child.type === 'Text' && 
            child.text && 
            child.text.startsWith('Available reputation')
        );
        
        if (reputationText) {
            reputationText.setText(`Available reputation: ${reputation}`);
        }
    }

    replaceUnlockButtonWithLabel(rewardIndex, rewardName) {
        // Find the container that holds the reward slot
        const rewardsContainer = this.children.list.find(child => 
            child.type === 'Container' && 
            child.name === 'rewardsContainer'
        );
        
        if (!rewardsContainer) return;
        
        // Calculate the position where the button should be (same calculation as in the original code)
        const width = this.cameras.main.width;
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const totalSlotsWidth = (slotWidth * 3) + (slotSpacing * 2);
        const startX = (width - totalSlotsWidth) / 2;
        const slotX = startX + (rewardIndex * (slotWidth + slotSpacing));
        const slotsY = this.children.list.find(child => 
            child.type === 'Text' && 
            child.text && 
            child.text.startsWith('SELECT YOUR REWARD')
        ).y + 80; // Approximate value to position properly
        
        // Find the button by checking all container children and identifying the matching button
        // This is more reliable than position-based lookup
        const buttonToRemove = rewardsContainer.list.find(child => 
            child.type === 'Container' && 
            child.list && 
            child.list[1] && // Check if it has a text element
            child.list[1].text === 'UNLOCK' &&
            child.x >= slotX && // Check if it's in the approximate horizontal range for this slot
            child.x < slotX + slotWidth
        );
        
        if (buttonToRemove) {
            rewardsContainer.remove(buttonToRemove, true);
            
            // Create and add the "UNLOCKED" label
            const unlockedLabel = this.add.text(
                slotX + slotWidth/2, 
                slotsY + slotHeight - 40,
                "UNLOCKED", 
                { 
                    fontSize: '16px', 
                    fontFamily: 'Arial', 
                    color: '#ffcc00', 
                    align: 'center',
                    fontWeight: 'bold'
                }
            ).setOrigin(0.5);
            
            rewardsContainer.add(unlockedLabel);
        } else {
            console.warn(`Could not find UNLOCK button for reward index ${rewardIndex}`);
        }
    }

    updateRewardButtons(rewards, excludeIndex) {
        // Current reputation after unlocking
        const currentReputation = this.resourceManager.getResource(RESOURCES.REPUTATION);
        
        // Find the rewards container
        const rewardsContainer = this.children.list.find(child => 
            child.type === 'Container' && 
            child.name === 'rewardsContainer'
        );
        
        if (!rewardsContainer) return;
        
        // Update buttons for other rewards based on new reputation
        rewards.forEach((reward, index) => {
            // Skip the one we just unlocked
            if (index === excludeIndex || reward.isUnlocked) return;
            
            const canAfford = currentReputation >= reward.reputationCost;
            
            // If this reward has a button reference
            if (reward.button) {
                const buttonX = reward.button.x;
                const buttonY = reward.button.y;
                
                // Remove the old button
                rewardsContainer.remove(reward.button, true);
                
                // Add appropriate new button
                if (canAfford) {
                    const newButton = this.createActionButton(
                        "UNLOCK", 
                        reward.effect, 
                        0x33cc33, 
                        120, 
                        40, 
                        'blueGlossSquareButton'
                    );
                    newButton.x = buttonX;
                    newButton.y = buttonY;
                    reward.button = newButton;
                    rewardsContainer.add(newButton);
                } else {
                    const disabledButton = this.createDisabledButton(
                        "UNLOCK", 
                        "Not enough reputation", 
                        120, 
                        40, 
                        'blueGlossSquareButton'
                    );
                    disabledButton.x = buttonX;
                    disabledButton.y = buttonY;
                    reward.button = null;
                    rewardsContainer.add(disabledButton);
                }
            }
        });
    }
    
    // Show card choices for player selection
    showCardChoices(cards) {
        // Clear any previous choices
        this.choiceContainer.removeAll(true);
        
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
            
            cardBg = this.add.nineslice(
                0, 0,                // position
                textureKey,          // texture key
                null,                // frame (null for default)
                this.cardWidth, this.cardHeight, // size
                10, 10, 35, 15       // slice sizes: left, right, top, bottom
            );
            cardBg.setOrigin(0, 0);
            
            cardContainer.add(cardBg);
            
            // Make card interactive
            cardBg.setInteractive();
            cardBg.on('pointerdown', () => {
                this.onCardChoiceClick(index);
            });
            
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
                    
                    for (const resource in displayCost) {
                        if (displayCost[resource] > 0) {
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
                    
                    for (const resource in displayCost) {
                        if (displayCost[resource] > 0) {
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
                }
            }
            
            this.choiceContainer.add(cardContainer);
        });
    }
    
    // Update card choices after removing a card
    updateCardChoices(cards) {
        // Clear existing choices
        this.choiceContainer.removeAll(true);
        
        // Show remaining cards
        this.showCardChoices(cards);
    }
    
    // Hide card choices panel
    hideCardChoices() {
        this.choicePanelContainer.setVisible(false);
        this.choicePanelBg.visible = false;
    }
    
    // Handle card choice click
    onCardChoiceClick(choiceIndex) {
        // Tell the game scene which card was chosen
        this.gameScene.selectCardChoice(choiceIndex);
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
} 