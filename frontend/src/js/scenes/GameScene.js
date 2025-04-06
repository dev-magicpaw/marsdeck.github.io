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
        this.debug = false; // Debug mode flag
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
        this.maxTurns = MAX_TURNS;
        
        // Ensure player starts with specific cards
        this.setupStartingHand();
        
        // Card choice options
        this.cardChoices = [];
        
        // Store launch cost for easier access
        this.launchCost = BUILDINGS.LAUNCH_PAD.launchCost;
        this.launchReward = BUILDINGS.LAUNCH_PAD.launchReward;
    }

    preload() {
        // Load building sprites
        this.load.image('droneDepo', 'assets/buildings/drone_depo.png');
        this.load.image('ironMine', 'assets/buildings/iron_mine.png');
        this.load.image('concreteMixer', 'assets/buildings/concrete_mixer.png');
        this.load.image('solarPanel', 'assets/buildings/solar_panel.png');
        this.load.image('windTurbine', 'assets/buildings/wind_turbine.png');
        this.load.image('waterPump', 'assets/buildings/water_pump.png');
        this.load.image('steelworks', 'assets/buildings/steelworks.png');
        this.load.image('fuelRefinery', 'assets/buildings/fuel_refinery.png');
        this.load.image('launchPad', 'assets/buildings/launch_pad.png');
        this.load.image('launchPadSurrounding', 'assets/buildings/launch_pad_surrounding.png');
        
        // Rocket sprites are already loaded in BootScene
        
        // Load terrain and terrain feature sprites
        // ... existing code ...
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
        
        // Set up refresh for rocket sprites
        this.refreshRocketSprites();
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
                
                // Create the terrain sprite using the frame from our tileset
                const terrainSprite = this.add.sprite(xPos, yPos, 'terrain', tileIndex);
                terrainSprite.setOrigin(0, 0);
                // Scale sprite to fill the cell size
                terrainSprite.displayWidth = CELL_SIZE;
                terrainSprite.displayHeight = CELL_SIZE;
                terrainSprite.setInteractive();
                terrainSprite.data = { x, y }; // Store grid coordinates
                
                // Add debug text to show tile index if in debug mode
                const debugText = this.add.text(
                    xPos + CELL_SIZE/2, 
                    yPos + CELL_SIZE/2, 
                    `${tileIndex}`, 
                    { fontSize: '10px', fontFamily: 'Arial', color: '#ffffff', backgroundColor: '#000000' }
                );
                debugText.setOrigin(0.5);
                debugText.setVisible(false); // Hidden by default
                terrainSprite.debugText = debugText; // Store reference for toggling visibility
                
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
                
                // If we're in debug mode, show tile info
                if (this.debug && gameObject.debugText) {
                    gameObject.debugText.setVisible(!gameObject.debugText.visible);
                    return;
                }
                
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
        
        // Special case for Launch Pad - place surrounding buildings
        if (building.id === 'launchPad') {
            const adjacentCells = this.gridManager.getAdjacentCells(x, y);
            const surroundingBuilding = BUILDINGS.LAUNCH_PAD_SURROUNDING;
            
            // Place surroundings on all adjacent cells
            for (const adjCell of adjacentCells) {
                // Remove feature sprite if it exists (surrounding buildings never require features)
                if (adjCell.featureSprite) {
                    adjCell.featureSprite.destroy();
                    adjCell.featureSprite = null;
                }
                
                // Place the surrounding building 
                this.gridManager.placeBuilding(adjCell.x, adjCell.y, surroundingBuilding);
                
                // Add surrounding building sprite
                const surroundingXPos = adjCell.x * CELL_SIZE;
                const surroundingYPos = adjCell.y * CELL_SIZE;
                const surroundingSprite = this.add.sprite(surroundingXPos, surroundingYPos, surroundingBuilding.texture);
                surroundingSprite.setOrigin(0, 0);
                surroundingSprite.displayWidth = CELL_SIZE;
                surroundingSprite.displayHeight = CELL_SIZE;
                surroundingSprite.setAlpha(0.7); // Make it slightly transparent to distinguish it
                this.gridContainer.add(surroundingSprite);
                adjCell.buildingSprite = surroundingSprite;
            }
            
            // Make sure the rocket appears immediately
            this.refreshRocketSprites();
        }
        
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
            this.uiScene.showCellInfo(cell, this);
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
        // Process building production first
        this.processProduction();
        
        // Reset resources (if needed)
        
        // Process end game condition
        if (this.currentTurn >= this.maxTurns) {
            this.gameOver();
            return;
        }
        
        // Process rocket returns
        const returningRockets = this.gridManager.processRocketReturns();
        if (returningRockets > 0) {
            this.uiScene.showMessage(`${returningRockets} rocket${returningRockets > 1 ? 's' : ''} returned to launch pad${returningRockets > 1 ? 's' : ''}`);
            
            // Find launch pads that got rockets back and animate their landing
            for (let y = 0; y < this.gridManager.gridSize; y++) {
                for (let x = 0; x < this.gridManager.gridSize; x++) {
                    const cell = this.gridManager.getCell(x, y);
                    if (cell && cell.building === 'launchPad' && cell.hasRocket && 
                        cell.justLanded === true) {
                        this.animateRocketLanding(x, y);
                    }
                }
            }
        }
        
        // Increment turn counter
        this.currentTurn++;
        
        // Update rocket states since resources may have changed
        this.updateRocketStates();
        
        // Give the player a card choice
        this.showCardChoices();
        
        // Update UI - refreshUI will update turn counter and resources
        this.uiScene.refreshUI();
    }
    
    // Refresh all rocket sprites
    refreshRocketSprites() {
        // Loop through grid and update rocket sprites based on state
        for (let y = 0; y < this.gridManager.gridSize; y++) {
            for (let x = 0; x < this.gridManager.gridSize; x++) {
                const cell = this.gridManager.getCell(x, y);
                if (cell && cell.building === 'launchPad') {
                    // Skip rockets that just landed - they'll get their sprites after animation
                    if (cell.justLanded) {
                        continue;
                    }
                    
                    // Check if we need to add or update a rocket sprite
                    if (cell.hasRocket) {
                        // Determine texture based on state
                        const texture = cell.rocketState === 'fueled' ? 'rocketFueled' : 'rocketUnFueled';
                        
                        // Create or update sprite
                        if (!cell.rocketSprite) {
                            // Create new sprite
                            const xPos = x * CELL_SIZE + (CELL_SIZE / 2);
                            const yPos = y * CELL_SIZE + (CELL_SIZE / 2);
                            cell.rocketSprite = this.add.sprite(xPos, yPos, texture);
                            cell.rocketSprite.setOrigin(0.5, 1.0); // Set origin to bottom center
                            
                            // Scale rocket proportionally to fit in the cell
                            const rocketScale = (CELL_SIZE * 0.7) / Math.max(cell.rocketSprite.width, cell.rocketSprite.height);
                            cell.rocketSprite.setScale(rocketScale);
                            
                            this.gridContainer.add(cell.rocketSprite);
                        } else {
                            // Update existing sprite
                            cell.rocketSprite.setTexture(texture);
                            cell.rocketSprite.setVisible(true);
                        }
                    } else if (cell.rocketSprite) {
                        // Hide rocket sprite if no rocket
                        cell.rocketSprite.setVisible(false);
                    }
                }
            }
        }
    }
    
    // Launch a rocket from a launch pad
    launchRocket(x, y) {
        const cell = this.gridManager.getCell(x, y);
        
        // Check if valid
        if (!cell || cell.building !== 'launchPad' || !cell.hasRocket || cell.rocketState !== 'fueled') {
            return false;
        }
        
        // Check if player has enough resources
        if (!this.resourceManager.hasSufficientResources(this.launchCost)) {
            this.uiScene.showMessage("Not enough resources to launch rocket");
            return false;
        }
        
        // Deduct resources
        for (const resource in this.launchCost) {
            this.resourceManager.modifyResource(resource, -this.launchCost[resource]);
        }
        
        // Award reputation
        this.resourceManager.modifyResource(RESOURCES.REPUTATION, this.launchReward);
        
        // Create flickering effect
        if (cell.rocketSprite) {
            // Reference for later use
            const rocketSprite = cell.rocketSprite;
            const xPos = rocketSprite.x;
            const yPos = rocketSprite.y;
            const rocketScale = rocketSprite.scaleX;
            
            // Hide the original sprite
            rocketSprite.setVisible(false);
            
            // Create a new sprite for the pre-launch flickering
            const flickerSprite = this.add.sprite(xPos, yPos, 'rocketFueled');
            flickerSprite.setOrigin(0.5, 1.0);
            flickerSprite.setScale(rocketScale);
            this.gridContainer.add(flickerSprite);
            
            // Define the flickering sequence
            const flickerSequence = [
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 }
            ];
            
            // Initialize sequence counter
            let sequenceIndex = 0;
            
            // Create a timer for flickering effect
            const flickerTimer = this.time.addEvent({
                delay: 200,
                callback: () => {
                    sequenceIndex++;
                    if (sequenceIndex < flickerSequence.length) {
                        // Update texture for next flicker
                        flickerSprite.setTexture(flickerSequence[sequenceIndex].key);
                    } else {
                        // Flickering complete, start the launch
                        flickerTimer.remove();
                        
                        // Create the launch animation sprite
                        const launchSprite = this.add.sprite(xPos, yPos, 'rocketInFlight');
                        launchSprite.setOrigin(0.5, 1.0);
                        launchSprite.setScale(rocketScale);
                        this.gridContainer.add(launchSprite);
                        
                        // Remove the flicker sprite
                        flickerSprite.destroy();
                        
                        // Calculate the distance to fly off the screen
                        const mapHeight = this.gridManager.gridSize * CELL_SIZE;
                        const distanceToTop = yPos;
                        const extraDistance = 100; // Go a bit beyond the edge
                        
                        // Launch the rocket animation - fly straight up at constant size
                        this.tweens.add({
                            targets: launchSprite,
                            y: -extraDistance, // Go beyond the top edge
                            duration: 2000,
                            ease: 'Quad.easeIn',
                            onComplete: () => {
                                launchSprite.destroy();
                                
                                // Apply the state change in grid manager after the animation
                                this.gridManager.launchRocket(x, y);
                            }
                        });
                    }
                },
                repeat: flickerSequence.length - 1
            });
        } else {
            // If no sprite exists, just update the state
            this.gridManager.launchRocket(x, y);
        }
        
        // Show message
        this.uiScene.showMessage(`Rocket launched! +${this.launchReward} Reputation`);
        
        // Update UI
            this.uiScene.refreshUI();
        
        return true;
    }
    
    // Animate rocket landing on a launch pad
    animateRocketLanding(x, y) {
        const cell = this.gridManager.getCell(x, y);
        if (!cell || cell.building !== 'launchPad' || !cell.hasRocket) {
            return;
        }
        
        // Calculate position at center of cell
        const xPos = x * CELL_SIZE + (CELL_SIZE / 2);
        const yPos = y * CELL_SIZE + (CELL_SIZE / 2);
        
        // If there's already a rocket sprite, hide it until landing completes
        if (cell.rocketSprite) {
            cell.rocketSprite.setVisible(false);
        }
        
        // Scale for the rocket (70% of cell size)
        const rocketScale = (CELL_SIZE * 0.7) / Math.max(
            this.textures.get('rocketInFlight').get().width,
            this.textures.get('rocketInFlight').get().height
        );
        
        // Create landing animation sprite starting from above the screen
        const extraDistance = 100; // Start beyond the top edge
        const landingSprite = this.add.sprite(xPos, -extraDistance, 'rocketInFlight');
        landingSprite.setOrigin(0.5, 1.0); // Set origin to bottom center
        landingSprite.setScale(rocketScale);
        this.gridContainer.add(landingSprite);
        
        // Create landing animation - fly down at constant size
        this.tweens.add({
            targets: landingSprite,
            y: yPos,
            duration: 2000,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Start flickering effect upon landing
                
                // Define the flickering sequence
                const flickerSequence = [
                    { key: 'rocketUnFueled', duration: 200 },
                    { key: 'rocketInFlight', duration: 200 },
                    { key: 'rocketUnFueled', duration: 200 },
                    { key: 'rocketInFlight', duration: 200 },
                    { key: 'rocketUnFueled', duration: 200 },
                    { key: 'rocketInFlight', duration: 200 },
                    { key: 'rocketUnFueled', duration: 300 }
                ];
                
                // Initialize sequence counter
                let sequenceIndex = 0;
                
                // Create a timer for flickering effect
                const flickerTimer = this.time.addEvent({
                    delay: 200,
                    callback: () => {
                        sequenceIndex++;
                        if (sequenceIndex < flickerSequence.length) {
                            // Update texture for next flicker
                            landingSprite.setTexture(flickerSequence[sequenceIndex].key);
                        } else {
                            // Flickering complete, show the final rocket state
                            flickerTimer.remove();
                            landingSprite.destroy();
                            
                            // Show the real rocket sprite after landing and flickering
                            if (cell.rocketSprite) {
                                // Determine texture based on state (fuel status)
                                const texture = cell.rocketState === 'fueled' ? 'rocketFueled' : 'rocketUnFueled';
                                cell.rocketSprite.setTexture(texture);
                                cell.rocketSprite.setVisible(true);
                            } else {
                                // Create a new rocket sprite
                                const texture = cell.rocketState === 'fueled' ? 'rocketFueled' : 'rocketUnFueled';
                                cell.rocketSprite = this.add.sprite(xPos, yPos, texture);
                                cell.rocketSprite.setOrigin(0.5, 1.0); // Set origin to bottom center
                                cell.rocketSprite.setScale(rocketScale);
                                this.gridContainer.add(cell.rocketSprite);
                            }
                            
                            // Mark the rocket as no longer just landed
                            cell.justLanded = false;
                        }
                    },
                    repeat: flickerSequence.length - 1
                });
            }
        });
    }
    
    // Update all rocket states based on available resources
    updateRocketStates() {
        // Loop through grid and update all rockets
        for (let y = 0; y < this.gridManager.gridSize; y++) {
            for (let x = 0; x < this.gridManager.gridSize; x++) {
                const cell = this.gridManager.getCell(x, y);
                if (cell && cell.building === 'launchPad' && cell.hasRocket) {
                    this.gridManager.updateRocketState(x, y);
                }
            }
        }
        
        // Refresh rocket sprites to match state
        this.refreshRocketSprites();
    }
    
    // Process building production for all buildings
    processProduction() {
        const buildings = this.gridManager.getAllBuildings();
        
        // First wave: resource extraction (iron, water, concrete)
        this.processFirstWaveProduction(buildings);
        
        // Second wave: resource transformation (steelworks, fuel refinery)
        this.processSecondWaveProduction(buildings);
        
        // Update rocket states after processing production
        this.updateRocketStates();
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