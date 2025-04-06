import Phaser from 'phaser';
import { BUILDINGS, CELL_SIZE, MAX_TURNS, RESOURCES, TERRAIN_FEATURES } from '../config/game-data';
import CardManager from '../objects/CardManager';
import GridManager from '../objects/GridManager';
import ResourceManager from '../objects/ResourceManager';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.selectedCard = null;
        this.currentTurn = 1;
    }

    init() {
        // Initialize game state
        this.gridManager = new GridManager(this);
        this.resourceManager = new ResourceManager(this);
        this.cardManager = new CardManager(this);
        
        // Generate random map
        this.gridManager.generateRandomMap();
        
        // Initialize turn counter
        this.currentTurn = 1;
        
        // Ensure player starts with specific cards
        this.setupStartingHand();
        
        // Card choice options
        this.cardChoices = [];
    }

    create() {
        // Create the grid visuals
        this.createGrid();
        
        // Create reference to UI scene
        this.uiScene = this.scene.get('UIScene');
        
        // Start UI scene and pass references
        this.scene.launch('UIScene', { 
            gameScene: this,
            gridManager: this.gridManager,
            resourceManager: this.resourceManager,
            cardManager: this.cardManager
        });
        
        // Set up input handling
        this.setupInput();
        
        // Present initial card choice for first turn
        this.time.delayedCall(500, () => {
            this.showCardChoices();
        });
    }
    
    // Create the visual grid
    createGrid() {
        this.gridContainer = this.add.container(50, 50); // Offset from top-left
        
        // Create cells
        for (let y = 0; y < this.gridManager.gridSize; y++) {
            for (let x = 0; x < this.gridManager.gridSize; x++) {
                const cell = this.gridManager.getCell(x, y);
                const xPos = x * CELL_SIZE;
                const yPos = y * CELL_SIZE;
                
                // Create base terrain (always PLAIN)
                // Use alternating sci-fi tiles for plain terrain to create visual variety
                const tileTexture = (x + y) % 2 === 0 ? 'terrainPlain1' : 'terrainPlain2';
                const terrainSprite = this.add.sprite(xPos, yPos, tileTexture);
                
                terrainSprite.setOrigin(0, 0);
                // Scale sprite to fill the cell size
                terrainSprite.displayWidth = CELL_SIZE;
                terrainSprite.displayHeight = CELL_SIZE;
                terrainSprite.setInteractive();
                terrainSprite.data = { x, y }; // Store grid coordinates
                
                this.gridContainer.add(terrainSprite);
                cell.terrainSprite = terrainSprite;
                
                // Add terrain feature if present
                if (cell.feature) {
                    let featureTexture;
                    if (cell.feature === TERRAIN_FEATURES.METAL.id) {
                        // Choose an iron deposit texture based on position to create visual variety
                        const ironTextures = TERRAIN_FEATURES.METAL.textures;
                        const textureIndex = (x + y * 3) % ironTextures.length;
                        featureTexture = ironTextures[textureIndex];
                    } else if (cell.feature === TERRAIN_FEATURES.WATER.id) {
                        // Use the single water texture
                        featureTexture = TERRAIN_FEATURES.WATER.texture;
                    } else if (cell.feature === TERRAIN_FEATURES.MOUNTAIN.id) {
                        // Choose a mountain texture based on position
                        const mountainTextures = TERRAIN_FEATURES.MOUNTAIN.textures;
                        const textureIndex = (x + y) % mountainTextures.length;
                        featureTexture = mountainTextures[textureIndex];
                    }
                    
                    if (featureTexture) {
                        const featureSprite = this.add.sprite(xPos, yPos, featureTexture);
                        featureSprite.setOrigin(0, 0);
                        // Scale feature sprite to fill the cell size
                        featureSprite.displayWidth = CELL_SIZE;
                        featureSprite.displayHeight = CELL_SIZE;
                        this.gridContainer.add(featureSprite);
                        cell.featureSprite = featureSprite;
                    }
                }
                
                // If the cell has a building, add its sprite
                if (cell.building) {
                    const buildingSprite = this.add.sprite(xPos, yPos, cell.building);
                    buildingSprite.setOrigin(0, 0);
                    // Scale building sprite to fill the cell size
                    buildingSprite.displayWidth = CELL_SIZE;
                    buildingSprite.displayHeight = CELL_SIZE;
                    this.gridContainer.add(buildingSprite);
                    cell.buildingSprite = buildingSprite;
                }
            }
        }
    }
    
    // Set up input handling for game interactions
    setupInput() {
        // Handle grid cell clicks
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // Check if we clicked on a grid cell
            if (gameObject.data && gameObject.data.x !== undefined) {
                const x = gameObject.data.x;
                const y = gameObject.data.y;
                
                // If we have a card selected, try to place it
                if (this.selectedCard && this.selectedCard.type === 'building') {
                    this.tryPlaceBuilding(x, y, this.selectedCard.building);
                } else {
                    // Otherwise just select the cell to view info
                    this.selectCell(x, y);
                }
            }
        });

        // Handle clicks on empty area (background)
        this.input.on('pointerdown', (pointer) => {
            // Check if the click was not on any game object
            if (pointer.downElement.nodeName === 'CANVAS' && !this.input.hitTestPointer(pointer).length) {
                // Clear any existing selection
                this.clearSelection();
            }
        });
    }
    
    // Clear any current selection
    clearSelection() {
        // Clear selected card
        if (this.selectedCard !== null) {
            this.selectedCard = null;
            this.selectedCardIndex = undefined;
        }
        
        // Clear info panel and refresh UI regardless of what was selected
        if (this.uiScene) {
            this.uiScene.clearInfoPanel();
            this.uiScene.refreshUI();
        }
    }
    
    // Try to place a building from a card
    tryPlaceBuilding(x, y, building) {
        const cell = this.gridManager.getCell(x, y);
        
        if (!cell) return;
        
        // Check placement requirements
        if (!this.gridManager.canPlaceBuilding(x, y, building)) {
            console.log('Cannot place building here');
            // Show UI error message
            if (this.uiScene) {
                this.uiScene.showMessage('Cannot place building here.');
            }
            return;
        }
        
        // Check resource requirements
        if (!this.resourceManager.hasSufficientResources(building.cost)) {
            console.log('Not enough resources');
            // Show UI error message
            if (this.uiScene) {
                this.uiScene.showMessage('Not enough resources to build this.');
            }
            return;
        }
        
        // Consume resources
        this.resourceManager.consumeResources(building.cost);
        
        // Remove feature sprite if it exists and the building doesn't require it
        if (cell.featureSprite && !building.terrainRequirement) {
            cell.featureSprite.destroy();
            cell.featureSprite = null;
        }
        
        // Place building on grid
        this.gridManager.placeBuilding(x, y, building);
        
        // Add building sprite
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;
        const buildingSprite = this.add.sprite(xPos, yPos, building.texture);
        buildingSprite.setOrigin(0, 0);
        // Scale building sprite to fill the cell size
        buildingSprite.displayWidth = CELL_SIZE;
        buildingSprite.displayHeight = CELL_SIZE;
        this.gridContainer.add(buildingSprite);
        cell.buildingSprite = buildingSprite;
        
        // Immediate production for certain buildings
        if (building.id === 'droneDepo' || building.id === 'solarPanel' || building.id === 'windTurbine') {
            for (const resource in building.production) {
                this.resourceManager.modifyResource(resource, building.production[resource]);
                
                // Show message about production
                const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                this.uiScene.showMessage(`${building.name} produced ${building.production[resource]} ${resourceName}`);
            }
        }
        
        // Remove the card from hand now that it's actually been used
        if (this.selectedCardIndex !== undefined) {
            this.cardManager.playCard(this.selectedCardIndex);
        }
        
        // Clear the selection
        this.selectedCard = null;
        this.selectedCardIndex = undefined;
        
        // Update UI
        if (this.uiScene) {
            this.uiScene.clearInfoPanel();
            this.uiScene.refreshUI();
        }
    }
    
    // Select a cell to view info
    selectCell(x, y) {
        const cell = this.gridManager.getCell(x, y);
        
        if (!cell) return;
        
        // Show cell info in UI
        if (this.uiScene) {
            this.uiScene.showCellInfo(cell);
        }
    }
    
    // Select a card from hand for placement
    selectCard(cardIndex) {
        // If we already have this card selected, deselect it
        if (this.selectedCardIndex === cardIndex && this.selectedCard !== null) {
            this.selectedCard = null;
            this.selectedCardIndex = undefined;
            
            // Clear info panel
            if (this.uiScene) {
                this.uiScene.clearInfoPanel();
                this.uiScene.refreshUI();
            }
            return;
        }
        
        const card = this.cardManager.getCardFromHand(cardIndex);
        if (card) {
            this.selectedCard = card;
            this.selectedCardIndex = cardIndex;
            
            // Update UI to show the selected card
            if (this.uiScene) {
                this.uiScene.showSelectedCard(card);
            }
        }
    }
    
    // End the current turn
    endTurn() {
        // Process production from all buildings
        this.processProduction();
        
        // Reset non-accumulating resources
        this.resourceManager.resetNonAccumulatingResources();
        
        // Increment turn counter
        this.currentTurn++;
        
        // Check for game end condition
        if (this.currentTurn > MAX_TURNS) {
            this.gameOver();
            return;
        }
        
        // Show card choices for the next turn
        this.showCardChoices();
        
        // Update UI
        if (this.uiScene) {
            this.uiScene.refreshUI();
        }
    }
    
    // Process production from all buildings on the grid
    processProduction() {
        const buildings = this.gridManager.getAllBuildings();
        
        // First wave: resource extraction (iron, water, concrete)
        this.processFirstWaveProduction(buildings);
        
        // Second wave: resource transformation (steelworks, fuel refinery)
        this.processSecondWaveProduction(buildings);
    }
    
    // Process first wave - resource extraction buildings
    processFirstWaveProduction(buildings) {
        const firstWaveBuildings = ['ironMine', 'waterPump', 'concreteMixer'];
        
        buildings.forEach(building => {
            const buildingData = Object.values(BUILDINGS).find(b => b.id === building.buildingId);
            
            if (buildingData && firstWaveBuildings.includes(buildingData.id)) {
                // Add production without consuming energy
                for (const resource in buildingData.production) {
                    this.resourceManager.modifyResource(resource, buildingData.production[resource]);
                    
                    // Show message
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    this.uiScene.showMessage(`${buildingData.name} produced ${buildingData.production[resource]} ${resourceName}`);
                }
            }
        });
    }
    
    // Process second wave - resource transformation buildings
    processSecondWaveProduction(buildings) {
        const secondWaveBuildings = ['steelworks', 'fuelRefinery'];
        
        buildings.forEach(building => {
            const buildingData = Object.values(BUILDINGS).find(b => b.id === building.buildingId);
            
            if (buildingData && secondWaveBuildings.includes(buildingData.id)) {
                // Create a consumption object without energy requirement
                const resourceConsumption = {};
                for (const resource in buildingData.consumption) {
                    if (resource !== RESOURCES.ENERGY) {
                        resourceConsumption[resource] = buildingData.consumption[resource];
                    }
                }
                
                // Check if we have resources for consumption (excluding energy)
                const canConsume = this.resourceManager.hasSufficientResources(resourceConsumption);
                
                if (canConsume) {
                    // Consume resources (excluding energy)
                    this.resourceManager.consumeResources(resourceConsumption);
                    
                    // Add production
                    for (const resource in buildingData.production) {
                        this.resourceManager.modifyResource(resource, buildingData.production[resource]);
                        
                        // Show message
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        this.uiScene.showMessage(`${buildingData.name} produced ${buildingData.production[resource]} ${resourceName}`);
                    }
                }
            }
        });
        
        // Special case for Launch Pad - process after all production
        buildings.forEach(building => {
            if (building.buildingId === 'launchPad') {
                this.tryLaunchRocket(building.x, building.y);
            }
        });
    }
    
    // Try to launch a rocket from launch pad for victory points
    tryLaunchRocket(x, y) {
        const launchCost = {
            [RESOURCES.FUEL]: 5,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.WATER]: 1
        };
        
        if (this.resourceManager.hasSufficientResources(launchCost)) {
            // Consume resources
            this.resourceManager.consumeResources(launchCost);
            
            // Add reputation
            this.resourceManager.modifyResource(RESOURCES.REPUTATION, 10);
            
            // Show launch animation
            // TODO: Add rocket launch animation
            
            // Update UI
            if (this.uiScene) {
                this.uiScene.showMessage('Rocket launched successfully! +10 Reputation');
            }
        }
    }
    
    // Game over - calculate final score
    gameOver() {
        // Calculate final score (reputation + resource bonuses)
        const resources = this.resourceManager.getAllResources();
        const reputation = resources[RESOURCES.REPUTATION];

        const resourcesBringVictoryPoints = false;
        
        // Add bonus points for leftover resources
        if (resourcesBringVictoryPoints) {
            bonusPoints = Math.floor(
                resources[RESOURCES.STEEL] / 2 +
                resources[RESOURCES.CONCRETE] / 2 +
                resources[RESOURCES.WATER] / 2 +
                resources[RESOURCES.FUEL] * 2
            );
        }
        
        const finalScore = reputation + bonusPoints;
        
        // Show game over screen in UI
        if (this.uiScene) {
            this.uiScene.showGameOver(finalScore, reputation, bonusPoints);
        }
    }

    // Show card choices to the player
    showCardChoices() {
        // Draw 3 cards as choices
        this.cardChoices = [];
        const numChoices = 3;
        
        // Get cards from the deck
        for (let i = 0; i < numChoices; i++) {
            if (this.cardManager.deck.length === 0) {
                if (this.cardManager.discardPile.length === 0) {
                    break; // No more cards
                }
                // Reshuffle discard pile into deck
                this.cardManager.deck = [...this.cardManager.discardPile];
                this.cardManager.discardPile = [];
                this.cardManager.shuffleDeck();
            }
            
            if (this.cardManager.deck.length > 0) {
                // Draw from the end of the deck to avoid shifting indices
                const card = this.cardManager.deck.pop();
                this.cardChoices.push(card);
            }
        }
        
        // Show choices in UI
        if (this.uiScene && this.cardChoices.length > 0) {
            this.uiScene.showCardChoices(this.cardChoices);
        }
    }
    
    // Handle card choice selection
    selectCardChoice(choiceIndex) {
        if (choiceIndex >= 0 && choiceIndex < this.cardChoices.length) {
            // Add the selected card to hand
            const selectedCard = this.cardChoices[choiceIndex];
            
            // Always add to hand, even if over the limit
            this.cardManager.hand.push(selectedCard);
            this.uiScene.showMessage(`Added ${selectedCard.building.name} to your hand`);
            
            // Discard the other choices
            for (let i = 0; i < this.cardChoices.length; i++) {
                if (i !== choiceIndex) {
                    this.cardManager.discardPile.push(this.cardChoices[i]);
                }
            }
            
            // Clear choices
            this.cardChoices = [];
            
            // Update UI
            this.uiScene.refreshUI();
            
            // Check if hand is over the limit and update end turn button
            this.uiScene.updateEndTurnButton();
        }
    }
    
    // Set up specific starting cards for the player
    setupStartingHand() {
        // Clear any cards that might be in the hand
        this.cardManager.hand = [];
        const startingHandSize = 4;
        const startingCards = [BUILDINGS.DRONE_DEPO, BUILDINGS.WIND_TURBINE, BUILDINGS.LAUNCH_PAD];
        
        startingCards.forEach(card => {
            this.cardManager.hand.push({
                type: 'building',
                building: card
            });
        });
        
        // Draw 2 more random cards to complete starting hand
        this.cardManager.drawCards(startingHandSize - startingCards.length);
    }
} 