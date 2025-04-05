import Phaser from 'phaser';
import { BUILDINGS, RESOURCES, TERRAIN_FEATURES, TERRAIN_TYPES } from '../config/game-data';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.selectedCardIndex = null;
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
    }

    create() {
        // Create UI panels layout
        this.createLayout();
        
        // Create resources panel
        this.createResourcesPanel();
        
        // Create info panel
        this.createInfoPanel();
        
        // Create hand panel
        this.createHandPanel();
        
        // Create message box for notifications
        this.createMessageBox();
        
        // Create end turn button
        this.createEndTurnButton();
        
        // Initial UI update
        this.refreshUI();
    }
    
    createLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel backgrounds
        this.createPanel(width - 350, 0, 350, 100, 0x222222, 0.8); // Resources panel
        this.createPanel(width - 350, 110, 350, 300, 0x222222, 0.8); // Info panel
        
        // Calculate card panel width for 8 cards (each card is 80px wide with 5px spacing)
        const cardWidth = 80;
        const cardSpacing = 5;
        const cardsWidth = (cardWidth + cardSpacing) * 8;
        
        // Position cards panel under the map (map is offset at 50,50 in GameScene)
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const mapOffset = 50;
        
        // Add margins around the cards panel (10px on each side)
        const margin = 10;
        
        // Space between map and cards panel
        const verticalSpacing = 20;
        
        // Create cards panel under the map spanning most of the width (with margin)
        // Align left border with the game map and add vertical spacing
        this.createPanel(
            mapOffset, 
            mapOffset + mapSize + verticalSpacing - margin, 
            cardsWidth + margin * 2, 
            130 + margin * 2, 
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
        const x = this.cameras.main.width - 340;
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
        
        // Create text for each resource type
        let xOffset = 0;
        let yOffset = 30;
        
        resourceTypes.forEach((resourceType, index) => {
            // Start a new row after 4 items
            if (index > 0 && index % 4 === 0) {
                xOffset = 0;
                yOffset += 25;
            }
            
            // Create readable label from resource type
            const label = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
            
            this.resourceTexts[resourceType] = this.add.text(
                x + xOffset, 
                y + yOffset, 
                `${label}: 0`, 
                { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff' }
            );
            
            xOffset += 85;
        });
        
        // Turn counter
        this.turnText = this.add.text(
            x + 260, 
            y, 
            `Turn: 1`, 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }
        );
    }
    
    createInfoPanel() {
        const x = this.cameras.main.width - 340;
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
            { fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: 330 } }
        );
        
        // Create a sprite placeholder for selected entity
        this.infoSprite = this.add.sprite(x + 175, y + 170, 'gridTile');
        this.infoSprite.setVisible(false);
    }
    
    createHandPanel() {
        // Calculate position for cards panel under the map
        const mapOffset = 50;
        const mapSize = 9 * 64; // 9 tiles of 64px each
        const margin = 10; // Same margin as in createLayout
        const verticalSpacing = 20; // Same spacing as in createLayout
        
        // Position cards with consistent margin from the panel edges
        // Add margin to x position to create space from the left edge of the panel
        const x = mapOffset + margin;
        const y = mapOffset + mapSize + verticalSpacing; // Add space between map and cards
        
        // Create container for cards
        this.handContainer = this.add.container(x, y);
        
        // No title or deck info as requested
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
    
    createEndTurnButton() {
        // Keep the END TURN button in the bottom right corner
        const x = this.cameras.main.width - 120;
        const y = this.cameras.main.height - 30;
        
        const button = this.add.graphics();
        button.fillStyle(0x994500, 1);
        button.fillRoundedRect(0, 0, 100, 40, 5);
        
        const buttonText = this.add.text(
            50, 
            20, 
            'END TURN', 
            { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }
        );
        buttonText.setOrigin(0.5);
        
        const endTurnButton = this.add.container(x, y);
        endTurnButton.add(button);
        endTurnButton.add(buttonText);
        
        endTurnButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 40), Phaser.Geom.Rectangle.Contains);
        
        endTurnButton.on('pointerdown', () => {
            this.gameScene.endTurn();
        });
        
        endTurnButton.on('pointerover', () => {
            button.clear();
            button.fillStyle(0xcc6600, 1);
            button.fillRoundedRect(0, 0, 100, 40, 5);
        });
        
        endTurnButton.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x994500, 1);
            button.fillRoundedRect(0, 0, 100, 40, 5);
        });
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
        this.turnText.setText(`Turn: ${this.gameScene.currentTurn}`);
    }
    
    // Create a card sprite
    createCardSprite(card, index) {
        const cardWidth = 80;
        const cardHeight = 120;
        const cardSpacing = 5;
        const xPos = index * (cardWidth + cardSpacing);
        
        const cardContainer = this.add.container(xPos, 0);
        
        // Card background
        const cardBg = this.add.sprite(0, 0, card.type === 'building' ? 'cardBackground' : 'cardTemplate');
        cardBg.setDisplaySize(cardWidth, cardHeight);
        cardBg.setOrigin(0, 0);
        
        // Add highlight for selected card
        if (index === this.selectedCardIndex) {
            const highlight = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffff00, 0.3);
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
                cardWidth / 2, 
                10, 
                card.building.shortName, 
                { fontSize: '12px', fontFamily: 'Arial', color: '#000000', align: 'center' }
            );
            nameText.setOrigin(0.5, 0);
            cardContainer.add(nameText);
            
            // Building icon
            const icon = this.add.sprite(cardWidth / 2, 45, card.building.texture);
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
    }
    
    // Show cell info in the info panel
    showCellInfo(cell) {
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
                
                // Building description
                this.infoContent.setText(building.description + "\n\nConstruction Cost:");
                
                // Construction Cost
                if (Object.keys(building.cost).length > 0) {
                    // Create a container for the colored cost text elements
                    this.costTexts = this.costTexts || [];
                    
                    // Clear any existing cost texts
                    this.costTexts.forEach(text => text.destroy());
                    this.costTexts = [];
                    
                    // Position for cost texts
                    let yOffset = this.infoContent.y + this.infoContent.height + 5;
                    
                    // Add each resource cost with appropriate color
                    for (const resource in building.cost) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        const requiredAmount = building.cost[resource];
                        const playerAmount = this.resourceManager.getResource(resource);
                        const hasEnough = playerAmount >= requiredAmount;
                        
                        // Set color based on resource availability
                        const textColor = hasEnough ? '#ffffff' : '#ff0000';
                        
                        const costText = this.add.text(
                            this.infoContent.x, 
                            yOffset, 
                            `${resourceName}: ${building.cost[resource]}`, 
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
                    
                    // Production
                    if (Object.keys(building.production).length > 0) {
                        additionalText += "Production:\n";
                        for (const resource in building.production) {
                            const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                            additionalText += `${resourceName}: +${building.production[resource]}\n`;
                        }
                    }
                    
                    // Consumption
                    if (Object.keys(building.consumption).length > 0) {
                        additionalText += "\nConsumption:\n";
                        for (const resource in building.consumption) {
                            const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                            additionalText += `${resourceName}: -${building.consumption[resource]}\n`;
                        }
                    }
                    
                    // Set the additional content text
                    this.additionalContent.setText(additionalText);
                } else {
                    // If no costs, show regular content text directly
                    let content = building.description + "\n\n";
                    
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
                }
                
                // Show building sprite
                this.infoSprite.setTexture(building.texture);
                this.infoSprite.setVisible(true);
            }
        }
    }
    
    // Show selected card info in the info panel
    showSelectedCard(card) {
        // Clear current info
        this.clearInfoPanel();
        
        if (card.type === 'building') {
            this.infoTitle.setText(`${card.building.name} (Selected)`);
            
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
        }
    }
    
    // Clear the info panel
    clearInfoPanel() {
        this.infoTitle.setText('');
        this.infoContent.setText('');
        this.infoSprite.setVisible(false);
        
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
            `Victory Points: ${victoryPoints}`, 
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
} 