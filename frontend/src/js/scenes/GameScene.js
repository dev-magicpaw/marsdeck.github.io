import Phaser from 'phaser';
import { BUILDINGS, CELL_SIZE, MAX_TURNS, RESOURCES, TERRAIN_TYPES } from '../config/game-data';
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
        
        // Draw initial hand
        this.cardManager.drawCards(4);
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
                
                // Create cell background based on terrain
                let terrainSprite;
                if (cell.terrain === TERRAIN_TYPES.METAL.id) {
                    terrainSprite = this.add.sprite(xPos, yPos, 'terrainMetal');
                } else if (cell.terrain === TERRAIN_TYPES.WATER.id) {
                    terrainSprite = this.add.sprite(xPos, yPos, 'terrainWater');
                } else if (cell.terrain === TERRAIN_TYPES.MOUNTAIN.id) {
                    terrainSprite = this.add.sprite(xPos, yPos, 'terrainMountain');
                } else {
                    terrainSprite = this.add.sprite(xPos, yPos, 'gridTile');
                }
                
                terrainSprite.setOrigin(0, 0);
                terrainSprite.setInteractive();
                terrainSprite.data = { x, y }; // Store grid coordinates
                
                this.gridContainer.add(terrainSprite);
                
                // If the cell has a building, add its sprite
                if (cell.building) {
                    const buildingSprite = this.add.sprite(xPos, yPos, cell.building);
                    buildingSprite.setOrigin(0, 0);
                    this.gridContainer.add(buildingSprite);
                    cell.sprite = buildingSprite;
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
                this.uiScene.showMessage('Cannot place building here. Check terrain requirements.');
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
        
        // Place building on grid
        this.gridManager.placeBuilding(x, y, building);
        
        // Add building sprite
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;
        const buildingSprite = this.add.sprite(xPos, yPos, building.texture);
        buildingSprite.setOrigin(0, 0);
        this.gridContainer.add(buildingSprite);
        cell.sprite = buildingSprite;
        
        // Remove card from hand (already done in UI when selecting card)
        this.selectedCard = null;
        
        // Update UI
        if (this.uiScene) {
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
        const card = this.cardManager.playCard(cardIndex);
        if (card) {
            this.selectedCard = card;
            
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
        
        // Draw new cards
        const drawnCards = this.cardManager.drawCards(2);
        
        // Increment turn counter
        this.currentTurn++;
        
        // Check for game end condition
        if (this.currentTurn > MAX_TURNS) {
            this.gameOver();
        }
        
        // Update UI
        if (this.uiScene) {
            this.uiScene.refreshUI();
            this.uiScene.showNewCards(drawnCards);
        }
    }
    
    // Process production from all buildings on the grid
    processProduction() {
        const buildings = this.gridManager.getAllBuildings();
        
        // First process consumption requirements
        const buildingsToProcess = [];
        
        buildings.forEach(building => {
            const buildingData = Object.values(BUILDINGS).find(b => b.id === building.buildingId);
            
            if (buildingData) {
                // Check if we have resources for consumption
                const canConsume = this.resourceManager.hasSufficientResources(buildingData.consumption);
                
                if (canConsume) {
                    buildingsToProcess.push({
                        building: buildingData,
                        x: building.x,
                        y: building.y
                    });
                }
            }
        });
        
        // Now process production for eligible buildings
        buildingsToProcess.forEach(item => {
            // Consume resources
            this.resourceManager.consumeResources(item.building.consumption);
            
            // Add production
            for (const resource in item.building.production) {
                this.resourceManager.modifyResource(resource, item.building.production[resource]);
            }
            
            // Special case for Launch Pad - launch rocket if enough fuel
            if (item.building.id === 'launchPad') {
                this.tryLaunchRocket(item.x, item.y);
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
            
            // Add victory points
            this.resourceManager.modifyResource(RESOURCES.VICTORY_POINTS, 10);
            
            // Show launch animation
            // TODO: Add rocket launch animation
            
            // Update UI
            if (this.uiScene) {
                this.uiScene.showMessage('Rocket launched successfully! +10 Victory Points');
            }
        }
    }
    
    // Game over - calculate final score
    gameOver() {
        // Calculate final score (victory points + resource bonuses)
        const resources = this.resourceManager.getAllResources();
        const vp = resources[RESOURCES.VICTORY_POINTS];
        
        // Add bonus points for leftover resources
        const bonusPoints = Math.floor(
            resources[RESOURCES.STEEL] / 2 +
            resources[RESOURCES.CONCRETE] / 2 +
            resources[RESOURCES.WATER] / 2 +
            resources[RESOURCES.FUEL] * 2
        );
        
        const finalScore = vp + bonusPoints;
        
        // Show game over screen in UI
        if (this.uiScene) {
            this.uiScene.showGameOver(finalScore, vp, bonusPoints);
        }
    }
} 