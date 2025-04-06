import Phaser from 'phaser';
import { BUILDINGS, MAX_CARD_SLOTS, MAX_HAND_SIZE, RESOURCES, TERRAIN_FEATURES, TERRAIN_TYPES } from '../config/game-data';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        // References to other scenes
        this.gameScene = null;
        
        // Card dimensions
        this.cardWidth = 80;
        this.cardHeight = 140;
        this.cardSpacing = 5;
        
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
        
        // Create panel backgrounds
        this.createPanel(width - 450, 0, 450, 100, 0x222222, 0.8); // Resources panel
        this.createPanel(width - 450, 110, 450, 300, 0x222222, 0.8); // Info panel
        this.createPanel(width - 450, 420, 450, 80, 0x222222, 0.8); // Actions panel
        this.choicePanelBg = this.createPanel(width - 450, 510, 450, 200, 0x222222, 0.8); // Choice panel
        
        // Create bottom panel with same width as right panels
        this.bottomPanelBg = this.createPanel(width - 450, height - 50, 450, 50, 0x222222, 0.8);
        
        // Calculate card panel width for MAX_CARD_SLOTS cards
        const cardsWidth = (this.cardWidth + this.cardSpacing) * MAX_CARD_SLOTS;
        
        // Position cards panel under the map (map is offset at 50,50 in GameScene)
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const mapOffset = 50;
        
        // Add margins around the cards panel (10px on each side)
        const margin = 10;
        
        // Space between map and cards panel
        const verticalSpacing = 20;
        
        // Create cards panel under the map starting from the left edge of the screen
        this.createPanel(
            0, 
            mapOffset + mapSize + verticalSpacing - margin, 
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
        const x = this.cameras.main.width - 440;
        const y = 10;
        
        // Header
        this.add.text(x, y, 'RESOURCES', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Resource counters
        const resourceTypes = Object.values(RESOURCES);
        this.resourceTexts = {};
        
        // Custom resource display order in column-based layout
        const displayOrder = [
            // First column
            RESOURCES.ENERGY,
            RESOURCES.DRONES,
            
            // Second column
            RESOURCES.IRON,
            RESOURCES.STEEL,
            
            // Third column
            RESOURCES.WATER,
            RESOURCES.FUEL,
            
            // Fourth column
            RESOURCES.CONCRETE
        ];
        
        // Create text for each resource type in the specified order
        const columns = 4;
        const columnSpacing = 105; // Increased spacing for wider panel
        const rowSpacing = 25;
        
        displayOrder.forEach((resourceType, index) => {
            // Calculate column and row position
            const column = Math.floor(index / 2);
            const row = index % 2;
            
            // Calculate x and y offsets
            const xOffset = column * columnSpacing;
            const yOffset = 30 + row * rowSpacing;
            
            // Create readable label from resource type
            const label = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
            
            this.resourceTexts[resourceType] = this.add.text(
                x + xOffset, 
                y + yOffset, 
                `${label}: 0`, 
                { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff' }
            );
        });        
    }
    
    createInfoPanel() {
        const x = this.cameras.main.width - 440;
        const y = 120;
        
        // Header
        this.add.text(x, y, 'INFORMATION', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Create info content
        this.infoTitle = this.add.text(
            x, 
            y + 30, 
            '', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff', fontWeight: 'bold' }
        );
        
        this.infoContent = this.add.text(
            x, 
            y + 55, 
            '', 
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: 430 } }
        );
        
        // Create a sprite placeholder for selected entity
        this.infoSprite = this.add.sprite(x + 225, y + 170, 'gridTile');
        this.infoSprite.setVisible(false);
    }
    
    createActionsPanel() {
        const x = this.cameras.main.width - 440;
        const y = 430;
        
        // Header
        this.actionsTitle = this.add.text(x, y, 'ACTIONS', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Container for action buttons
        this.actionsContainer = this.add.container(x, y + 30);
        
        // Only hide the container initially, keep title visible
        this.actionsContainer.setVisible(false);
    }
    
    createChoicePanel() {
        const x = this.cameras.main.width - 440;
        const y = 520;
        
        // Header
        this.choiceTitle = this.add.text(x, y, 'CHOOSE A CARD', { 
            fontSize: '20px', 
            fontFamily: 'Arial', 
            color: '#ffffff'
        });
        
        // Container for card choices
        this.choiceContainer = this.add.container(x, y + 30);
        
        // Hide choice panel initially
        this.choiceTitle.setVisible(false);
        this.choiceContainer.setVisible(false);
        this.choicePanelBg.visible = false; // Hide background too
    }
    
    createHandPanel() {
        // Calculate position for cards panel under the map
        const mapOffset = 50;
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const margin = 10; // Same margin as in createLayout
        const verticalSpacing = 20; // Add space between map and cards
   
        const x = margin; // Start from the left edge plus margin
        const y = mapOffset + mapSize + verticalSpacing;
        
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
        
        // Create slots for max card slots
        for (let i = 0; i < MAX_CARD_SLOTS; i++) {
            const xPos = i * (this.cardWidth + this.cardSpacing);
            
            // Add slot background
            const slotBg = this.add.sprite(xPos, 0, 'cardSlotBackground');
            slotBg.setDisplaySize(this.cardWidth, this.cardHeight);
            slotBg.setOrigin(0, 0);
            slotBg.setAlpha(0.7); // Make it slightly transparent
            
            this.cardSlotsContainer.add(slotBg);
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
        
        // Create reputation display
        const reputationText = this.add.text(
            panelX + margin, 
            height - panelHeight/2, 
            `Reputation: 0`, 
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
        
        const button = this.add.graphics();
        button.fillStyle(0x0066cc, 1);
        button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        
        const buttonText = this.add.text(
            buttonWidth / 2, 
            buttonHeight / 2, 
            'END TURN', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }
        );
        buttonText.setOrigin(0.5);
        
        this.endTurnButton = this.add.container(panelX + panelWidth - buttonWidth - margin, height - panelHeight/2);
        this.endTurnButton.setY(this.endTurnButton.y - buttonHeight/2); // Center vertically
        this.endTurnButton.add(button);
        this.endTurnButton.add(buttonText);
        
        this.endTurnButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        this.endTurnButton.on('pointerdown', () => {
            this.gameScene.endTurn();
        });
        
        this.endTurnButton.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x0088ff, 1); // Lighter blue for hover
            button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        });
        
        this.endTurnButton.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x0066cc, 1); // Back to blue
            button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        });
        
        // Store the button graphics for enabling/disabling
        this.endTurnButtonGraphics = button;
        
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
            this.endTurnButtonGraphics.clear();
            this.endTurnButtonGraphics.fillStyle(0x666666, 1); // Gray when disabled
            this.endTurnButtonGraphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
            
            // Show message to inform player
            this.showMessage(`Hand over limit! Discard ${handSize - MAX_HAND_SIZE} card(s)`);
        } else {
            // Enable button
            this.endTurnButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
            this.endTurnButtonGraphics.clear();
            this.endTurnButtonGraphics.fillStyle(0x0066cc, 1); // Blue when enabled
            this.endTurnButtonGraphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
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
            this.resourceTexts[resourceType].setText(`${label}: ${resources[resourceType]}`);
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
        const xPos = index * (this.cardWidth + this.cardSpacing);
        
        const cardContainer = this.add.container(xPos, 0);
        
        // Card background
        const cardBg = this.add.sprite(0, 0, card.type === 'building' ? 'cardBackground' : 'cardTemplate');
        cardBg.setDisplaySize(this.cardWidth, this.cardHeight);
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
                
                // Position for cost texts
                let yOffset = this.infoContent.y + this.infoContent.height + 5;
                
                // Add each resource cost with appropriate color
                for (const resource in card.building.cost) {
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    const requiredAmount = card.building.cost[resource];
                    const playerAmount = this.resourceManager.getResource(resource);
                    const hasEnough = playerAmount >= requiredAmount;
                    
                    // Set color based on resource availability
                    const textColor = hasEnough ? '#ffffff' : '#ff0000';
                    
                    const costText = this.add.text(
                        this.infoContent.x, 
                        yOffset, 
                        `${resourceName}: ${card.building.cost[resource]}`, 
                        { fontSize: '14px', fontFamily: 'Arial', color: textColor }
                    );
                    
                    // Store text for later cleanup
                    this.costTexts.push(costText);
                    
                    yOffset += costText.height;
                }
                
                // Position for the additional content after the costs
                this.additionalContent = this.add.text(
                    this.infoContent.x,
                    yOffset + 10, // Add 10px spacing after costs
                    "",
                    { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: 330 } }
                );
                this.costTexts.push(this.additionalContent); // Add to cost texts for cleanup
                
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
    
    // Update the actions panel based on selected entity
    updateActionsPanel() {
        // Clear existing buttons
        this.actionsContainer.removeAll(true);
        
        let hasActions = false;
        
        // If we have a selected card, show discard action
        if (this.selectedCardIndex !== null) {
            hasActions = true;
            
            // Create discard button
            const discardButton = this.createActionButton('Discard', () => {
                // Discard the selected card
                this.cardManager.discardCard(this.selectedCardIndex);
                
                // Clear selection
                this.selectedCardIndex = null;
                this.gameScene.selectedCard = null;
                this.gameScene.selectedCardIndex = undefined;
                
                // Update UI
                this.clearInfoPanel();
                this.refreshUI();
                
                // Check if we're now under the hand limit
                this.updateEndTurnButton();
                
                // Show message
                this.showMessage('Card discarded');
            }, 0xcc0000); // Use red color for discard button
            
            this.actionsContainer.add(discardButton);
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
                }, 0x0066cc, 300); // Blue color for launch button with larger size
                
                this.actionsContainer.add(launchButton);
            } else {
                // Disabled launch button
                const launchButton = this.createDisabledButton(launchText, 'Need fuel to launch rocket', 180, 45);
                this.actionsContainer.add(launchButton);
            }
        }
        
        // Only toggle visibility of the container, not the title
        this.actionsContainer.setVisible(hasActions);
    }
    
    // Helper to create action buttons
    createActionButton(text, callback, buttonColor = 0x994500, buttonWidth = 100, buttonHeight = 30) {
        const button = this.add.container(0, 0);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(buttonColor, 1);
        bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        button.add(bg);
        
        // Button text
        const buttonText = this.add.text(
            buttonWidth / 2, 
            buttonHeight / 2, 
            text, 
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', align: 'center' }
        );
        buttonText.setOrigin(0.5);
        button.add(buttonText);
        
        // Make button interactive
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effect
        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(buttonColor === 0x994500 ? 0xcc6600 : buttonColor * 1.2, 1);
            bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        });
        
        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(buttonColor, 1);
            bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        });
        
        // Add click handler
        button.on('pointerdown', callback);
        
        return button;
    }
    
    // Helper to create disabled action buttons
    createDisabledButton(text, tooltipText, buttonWidth = 100, buttonHeight = 30) {
        const button = this.add.container(0, 0);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x666666, 1); // Gray color for disabled button
        bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
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
            this.choiceTitle.setVisible(false);
            this.choiceContainer.setVisible(false);
            this.choicePanelBg.visible = false; // Hide background when no cards
            return;
        }
        
        // Show title and background
        this.choiceTitle.setVisible(true);
        this.choiceContainer.setVisible(true);
        this.choicePanelBg.visible = true; // Show background when cards are shown
        
        cards.forEach((card, index) => {
            const xPos = index * (this.cardWidth + this.cardSpacing);
            
            // Create card container
            const cardContainer = this.add.container(xPos, 0);
            
            // Card background
            const cardBg = this.add.sprite(0, 0, 'cardBackground');
            cardBg.setDisplaySize(this.cardWidth, this.cardHeight);
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
                icon.setDisplaySize(40, 40); // Match the size in hand cards
                icon.setOrigin(0.5);
                cardContainer.add(icon);
                
                // Cost text
                let costY = 75; // Adjusted to match hand cards
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
        this.choiceTitle.setVisible(false);
        this.choiceContainer.setVisible(false);
        this.choicePanelBg.visible = false; // Hide background when choice is made
    }
} 