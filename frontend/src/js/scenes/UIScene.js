import Phaser from 'phaser';
import { BUILDINGS, MAX_CARD_SLOTS, MAX_HAND_SIZE, RESOURCES, TERRAIN_FEATURES, TERRAIN_TYPES, VICTORY_GOAL } from '../config/game-data';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        // References to other scenes
        this.gameScene = null;
        
        // Card dimensions
        this.cardWidth = 80;
        this.cardHeight = 140;
        this.cardSpacing = 5;
        
        this.buttonHeight = 30;
        
        // Selected card tracking
        this.selectedCardIndex = undefined;
        
        // References to game managers
        this.resourceManager = null;
        this.cardManager = null;
        
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
        
        // Create reputation display with goal
        const reputationText = this.add.text(
            panelX + margin, 
            height - panelHeight/2, 
            `Reputation: 0/${VICTORY_GOAL}`, 
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
                this.resourceTexts[resourceType].setText(`${label}: ${resources[resourceType]}/${VICTORY_GOAL}`);
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
        const textureKey = card.type === 'building' ? 'cardBackground' : 'cardTemplate';
        
        if (card.type === 'building') {
            // Use NineSlice for building cards with adjusted slice sizes
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
        } else {
            // Use regular sprite for other card types
            cardBg = this.add.sprite(0, 0, textureKey);
            cardBg.setDisplaySize(this.cardWidth, this.cardHeight);
            cardBg.setOrigin(0, 0);
        }
        
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
        
        // Card content (if it's a building card)
        if (card.type === 'building') {
            // Building name - use short name for card display
            const nameText = this.add.text(
                this.cardWidth / 2, 
                10, 
                card.building.shortName, 
                { fontSize: '12px', fontFamily: 'Arial', color: '#000000', align: 'center' }
            );
            nameText.setOrigin(0.5, 0);
            cardContainer.add(nameText);
            
            // Building icon
            const icon = this.add.sprite(this.cardWidth / 2, 45, card.building.texture);
            icon.setDisplaySize(40, 40);
            icon.setOrigin(0.5);
            cardContainer.add(icon);
            
            // Cost text
            let costY = 75;
            for (const resource in card.building.cost) {
                if (card.building.cost[resource] > 0) {
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    
                    // Check if player has enough of this resource
                    const requiredAmount = card.building.cost[resource];
                    const playerAmount = this.resourceManager.getResource(resource);
                    const hasEnough = playerAmount >= requiredAmount;
                    
                    // Set color based on resource availability
                    const textColor = hasEnough ? '#000000' : '#ff0000';
                    
                    const costText = this.add.text(
                        5, 
                        costY, 
                        `${resourceName}: ${card.building.cost[resource]}`, 
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
                
                // Production
                if (Object.keys(building.production).length > 0) {
                    content += "Production:\n";
                    for (const resource in building.production) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        content += `${resourceName}: +${building.production[resource]}\n`;
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
        
        if (card.type === 'building') {
            this.infoTitle.setText(`${card.building.name} (Card)`);
            
            // Building description
            let content = card.building.description + "\n\n";
            
            // Construction Cost
            if (Object.keys(card.building.cost).length > 0) {
                content += "Construction Cost:\n";
                
                // Create a container for the colored cost text elements
                this.costTexts = this.costTexts || [];
                
                // Clear any existing cost texts
                this.costTexts.forEach(text => text.destroy());
                this.costTexts = [];
                
                // Add all other information to the main content text
                this.infoContent.setText(card.building.description + "\n\nConstruction Cost:");
                
                // Position for cost texts - now relative to the info panel container
                let yOffset = this.infoContent.y + this.infoContent.height + 5;
                let xOffset = this.infoContent.x;
                
                // Add each resource cost with appropriate color
                for (const resource in card.building.cost) {
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    const requiredAmount = card.building.cost[resource];
                    const playerAmount = this.resourceManager.getResource(resource);
                    const hasEnough = playerAmount >= requiredAmount;
                    
                    // Set color based on resource availability
                    const textColor = hasEnough ? '#ffffff' : '#ff0000';
                    
                    const costText = this.add.text(
                        xOffset,
                        yOffset, 
                        `${resourceName}: ${card.building.cost[resource]}`, 
                        { fontSize: '14px', fontFamily: 'Arial', color: textColor }
                    );
                    
                    // Add to the info panel container
                    this.infoPanelContainer.add(costText);
                    
                    // Store text for later cleanup
                    this.costTexts.push(costText);
                    
                    yOffset += costText.height;
                }
                
                // Position for the additional content after the costs
                this.additionalContent = this.add.text(
                    xOffset,
                    yOffset + 10, // Add 10px spacing after costs
                    "",
                    { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: 410 } }
                );
                
                // Add to the info panel container
                this.infoPanelContainer.add(this.additionalContent);
                
                // Add to cost texts for cleanup
                this.costTexts.push(this.additionalContent);
                
                // Continue with the rest of the information
                let additionalText = "";
                
                // Terrain requirement
                if (card.building.terrainRequirement) {
                    const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === card.building.terrainRequirement);
                    if (terrain) {
                        additionalText += `Requires: ${terrain.name}\n\n`;
                    }
                }
                
                // Production
                if (Object.keys(card.building.production).length > 0) {
                    additionalText += "Production:\n";
                    for (const resource in card.building.production) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        additionalText += `${resourceName}: +${card.building.production[resource]}\n`;
                    }
                }
                
                // Consumption
                if (Object.keys(card.building.consumption).length > 0) {
                    additionalText += "\nConsumption:\n";
                    for (const resource in card.building.consumption) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        additionalText += `${resourceName}: -${card.building.consumption[resource]}\n`;
                    }
                }
                
                // Set the additional content text
                this.additionalContent.setText(additionalText);
            } else {
                // If no costs, just display regular content
                
                // Terrain requirement
                if (card.building.terrainRequirement) {
                    const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === card.building.terrainRequirement);
                    if (terrain) {
                        content += `Requires: ${terrain.name}\n\n`;
                    }
                }
                
                // Production
                if (Object.keys(card.building.production).length > 0) {
                    content += "Production:\n";
                    for (const resource in card.building.production) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        content += `${resourceName}: +${card.building.production[resource]}\n`;
                    }
                }
                
                // Consumption
                if (Object.keys(card.building.consumption).length > 0) {
                    content += "\nConsumption:\n";
                    for (const resource in card.building.consumption) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        content += `${resourceName}: -${card.building.consumption[resource]}\n`;
                    }
                }
                
                this.infoContent.setText(content);
            }
            
            // Show building sprite
            this.infoSprite.setTexture(card.building.texture);
            this.infoSprite.setVisible(true);
            
            // Update actions panel
            this.updateActionsPanel();
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
    showGameOver(finalScore, victoryPoints, bonusPoints) {
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
        
        this.add.text(
            width / 2, 
            height / 2 - 20, 
            `Resource Bonus: ${bonusPoints}`, 
            { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        this.add.text(
            width / 2, 
            height / 2 + 20, 
            `FINAL SCORE: ${finalScore}`, 
            { fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', align: 'center', fontWeight: 'bold' }
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
    
    // Show victory screen when player reaches reputation goal
    showVictory(reputation, goal) {
        // Clear existing UI
        this.handContainer.removeAll(true);
        
        // Create victory panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Use nine-slice for the victory panel background with blue tint
        const panelWidth = 400;
        const panelHeight = 300;
        const panelX = width / 2;
        const panelY = height / 2;
        
        // Create the victory panel background with nine-slice
        const panel = this.add.nineslice(
            panelX, panelY,                     // position
            'victoryPanelBackground',           // texture key
            null,                               // frame (null for default)
            panelWidth, panelHeight,            // size
            15, 15, 15, 15                      // slice sizes: left, right, top, bottom
        );
        
        // Apply blue tint
        panel.setTint(0x0055aa);
        
        // Title
        this.add.text(
            width / 2, 
            height / 2 - 120, 
            'VICTORY!', 
            { fontSize: '36px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Score info
        this.add.text(
            width / 2, 
            height / 2 - 50, 
            `You've reached the reputation goal!`, 
            { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        this.add.text(
            width / 2, 
            height / 2 - 10, 
            `Reputation: ${reputation}/${goal}`, 
            { fontSize: '24px', fontFamily: 'Arial', color: '#ffff00', align: 'center' }
        ).setOrigin(0.5);
        
        this.add.text(
            width / 2, 
            height / 2 + 40, 
            'Your Mars colony is thriving!', 
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Rewards button
        const rewardsButton = this.add.container(width / 2, height / 2 + 100);
        
        // Use nine-slice for the button with blueGlossSquareButton texture
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonBg = this.add.nineslice(
            0,0,
            'blueGlossSquareButton',              // texture key
            null,                                 // frame (null for default)
            buttonWidth, buttonHeight,            // size
            10, 10, 10, 10                        // slice sizes: left, right, top, bottom
        );
        
        const buttonText = this.add.text(
            0, 
            0, 
            'REWARDS', 
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        rewardsButton.add(buttonBg);
        rewardsButton.add(buttonText);
        
        rewardsButton.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        rewardsButton.on('pointerdown', () => {
            this.showRewards();
        });
        
        rewardsButton.on('pointerover', () => {
            buttonBg.setTint(0xaaccff); // Light blue tint for hover
        });
        
        rewardsButton.on('pointerout', () => {
            buttonBg.clearTint(); // Clear tint on pointer out
        });
    }
    
    // Show rewards panel with selectable rewards
    showRewards() {
        // Create rewards panel
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel that covers most of the screen as specified (25px from each edge)
        const panelX = 25;
        const panelY = 25;
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
        
        // Create container for all reward elements
        const rewardsContainer = this.add.container(0, 0);
        
        // Create 3 reward slots
        const slotWidth = 250;
        const slotHeight = 350;
        const slotSpacing = 50;
        const slotsY = panelY + 120;
        
        // Calculate total width of all slots with spacing
        const totalSlotsWidth = (slotWidth * 3) + (slotSpacing * 2);
        // Calculate starting X position to center all slots
        const startX = (width - totalSlotsWidth) / 2;
        
        // Sample reward data with actual effects
        const rewards = [
            {
                name: "Resource Boost",
                image: "steelworks",
                description: "Get +50 Steel, +20 Concrete, and +30 Fuel to boost your economy",
                effect: () => {
                    this.resourceManager.modifyResource(RESOURCES.STEEL, 50);
                    this.resourceManager.modifyResource(RESOURCES.CONCRETE, 20);
                    this.resourceManager.modifyResource(RESOURCES.FUEL, 30);
                    this.selectReward("Resource Boost");
                }
            },
            {
                name: "Drone Army",
                image: "droneDepo",
                description: "Receive 15 additional drones and 10 energy to power your expansion",
                effect: () => {
                    this.resourceManager.modifyResource(RESOURCES.DRONES, 15);
                    this.resourceManager.modifyResource(RESOURCES.ENERGY, 10);
                    this.selectReward("Drone Army");
                }
            },
            {
                name: "Production Boost",
                image: "rocketFueled",
                description: "Get +5 reputation and draw 3 cards to accelerate your colony growth",
                effect: () => {
                    this.resourceManager.modifyResource(RESOURCES.REPUTATION, 5);
                    // Draw 3 cards - this would need to be implemented in CardManager
                    // For now, we'll just apply the reputation boost
                    this.selectReward("Production Boost");
                }
            }
        ];
        
        // Create each reward slot
        rewards.forEach((reward, index) => {
            const slotX = startX + (index * (slotWidth + slotSpacing));
            
            // Slot background
            const slotBg = this.add.nineslice(
                slotX + slotWidth/2, slotsY + slotHeight/2,
                'cardBackground',
                null,
                slotWidth, slotHeight,
                15, 15, 35, 15
            );
            slotBg.setTint(0x3366aa);
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
            rewardImage.setDisplaySize(120, 120);
            rewardsContainer.add(rewardImage);
            
            // Reward description
            const descriptionText = this.add.text(
                slotX + slotWidth/2, 
                slotsY + 220, 
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
            
            // Select button
            const selectButton = this.createActionButton(
                "SELECT", 
                reward.effect, 
                0x33cc33, 
                120, 
                40, 
                'blueGlossSquareButton'
            );
            selectButton.x = slotX + slotWidth/2 - 60;
            selectButton.y = slotsY + slotHeight - 60;
            
            rewardsContainer.add(selectButton);
        });
        
        // Close button is not needed
    }
    
    // Handle reward selection
    selectReward(rewardName) {
        // Display a message about the selected reward
        this.showMessage(`Selected reward: ${rewardName}`);
        
        // Create a confirmation box
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create the confirmation panel
        const confirmPanel = this.add.graphics();
        confirmPanel.fillStyle(0x000000, 0.8);
        confirmPanel.fillRect(width/2 - 200, height/2 - 100, 400, 200);
        confirmPanel.lineStyle(2, 0xffffff, 1);
        confirmPanel.strokeRect(width/2 - 200, height/2 - 100, 400, 200);
        
        // Confirmation text
        const confirmText = this.add.text(
            width/2,
            height/2 - 50,
            `You selected: ${rewardName}`,
            { fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Subtext
        const subText = this.add.text(
            width/2,
            height/2,
            'Your reward has been applied!',
            { fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);
        
        // Continue button
        const continueButton = this.createActionButton(
            "CONTINUE", 
            () => {
                // Clean up UI
                confirmPanel.destroy();
                confirmText.destroy();
                subText.destroy();
                continueButton.destroy();
                
                // Restart the game with new rewards applied
                this.scene.stop('UIScene');
                this.scene.stop('GameScene');
                this.scene.start('GameScene');
            }, 
            0x0066aa, 
            150, 
            40, 
            'blueGlossSquareButton'
        );
        
        continueButton.x = width/2 - 75; // Center the button
        continueButton.y = height/2 + 50;
    }
    
    // Update the actions panel based on selected entity
    updateActionsPanel() {
        // Clear existing buttons
        this.actionsContainer.removeAll(true);
        
        let hasActions = false;
        let buttonY = 0; // Track vertical position for multiple buttons
        const buttonSpacing = 10; // Spacing between buttons
        
        // If we have a selected card, show discard action
        if (this.selectedCardIndex !== null) {
            hasActions = true;
            
            // Create discard button using texture
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
        // If we have a selected Launch Pad with a rocket, show launch action
        else if (this.selectedCell && 
                 this.selectedCell.building === 'launchPad' && 
                 this.selectedCell.hasRocket) {
            hasActions = true;
            
            // Get cost and reward information from BUILDINGS definition
            const building = Object.values(BUILDINGS).find(b => b.id === 'launchPad');
            const fuelCost = building.launchCost[RESOURCES.FUEL];
            const steelCost = building.launchCost[RESOURCES.STEEL];
            const reputationReward = building.launchReward;
            
            // Create button text with costs and benefits
            const launchText = `Launch: -${fuelCost} Fuel, -${steelCost} Steel, +${reputationReward} Rep`;
            
            // Check if the rocket is fueled
            const isFueled = this.selectedCell.rocketState === 'fueled';
            
            // Create launch button (enabled or disabled based on state)
            if (isFueled) {
                // Enabled launch button
                const launchButton = this.createActionButton(launchText, () => {
                    // Launch rocket from the launch pad
                    this.gameScene.launchRocket(this.selectedCell.x, this.selectedCell.y);
                    
                    // Clear selection and refresh UI
                    this.clearInfoPanel();
                    this.refreshUI();
                }, 0x0066cc, 300, this.buttonHeight, 'blueGlossSquareButton'); // Use blue texture with larger width and consistent height
                
                // Position the button
                launchButton.y = buttonY;
                this.actionsContainer.add(launchButton);
                
                // Update vertical position for next button
                buttonY += this.buttonHeight + buttonSpacing;
            } else {
                // Disabled launch button - now we'll use a grayed-out version of the texture
                const launchButton = this.createDisabledButton(launchText, 'Need fuel to launch rocket', 300, this.buttonHeight, 'blueGlossSquareButton');
                
                // Position the button
                launchButton.y = buttonY;
                this.actionsContainer.add(launchButton);
                
                // Update vertical position for next button
                buttonY += this.buttonHeight + buttonSpacing;
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
        
        return button;
    }
    
    // Helper to create disabled action buttons
    createDisabledButton(text, tooltipText, buttonWidth = 100, buttonHeight = 30, textureName = null) {
        const button = this.add.container(0, 0);
        
        // Button background - either use texture or graphics
        let bg;
        if (textureName) {
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
            
            // Use NineSlice for better scaling with adjusted slice sizes
            cardBg = this.add.nineslice(
                0, 0,                // position
                'cardBackground',    // texture key
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
            
            // Card content (if it's a building card)
            if (card.type === 'building') {
                // Building name
                const nameText = this.add.text(
                    this.cardWidth / 2, 
                    10, 
                    card.building.shortName, 
                    { fontSize: '12px', fontFamily: 'Arial', color: '#000000', align: 'center' }
                );
                nameText.setOrigin(0.5, 0);
                cardContainer.add(nameText);
                
                // Building icon
                const icon = this.add.sprite(this.cardWidth / 2, 45, card.building.texture);
                icon.setDisplaySize(40, 40);
                icon.setOrigin(0.5);
                cardContainer.add(icon);
                
                // Cost text
                let costY = 75;
                for (const resource in card.building.cost) {
                    if (card.building.cost[resource] > 0) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        
                        // Check if player has enough of this resource
                        const requiredAmount = card.building.cost[resource];
                        const playerAmount = this.resourceManager.getResource(resource);
                        const hasEnough = playerAmount >= requiredAmount;
                        
                        // Set color based on resource availability
                        const textColor = hasEnough ? '#000000' : '#ff0000';
                        
                        const costText = this.add.text(
                            5, 
                            costY, 
                            `${resourceName}: ${card.building.cost[resource]}`, 
                            { fontSize: '10px', fontFamily: 'Arial', color: textColor }
                        );
                        cardContainer.add(costText);
                        costY += 12;
                    }
                }
            }
            
            this.choiceContainer.add(cardContainer);
        });
    }
    
    // Handle card choice click
    onCardChoiceClick(choiceIndex) {
        // Tell the game scene which card was chosen
        this.gameScene.selectCardChoice(choiceIndex);
        
        // Hide the choice panel
        this.choicePanelContainer.setVisible(false);
        this.choicePanelBg.visible = false;
    }
} 