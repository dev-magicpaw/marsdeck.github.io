import Phaser from 'phaser';
import { BUILDINGS, CELL_SIZE, MAX_CARD_SLOTS, RESOURCES, TERRAIN_FEATURES } from '../config/game-data';
import BuildingActionManager from '../objects/BuildingActionManager';
import CardManager from '../objects/CardManager';
import GridManager from '../objects/GridManager';
import levelManager from '../objects/LevelManager';
import ResourceManager from '../objects/ResourceManager';
import RewardsManager from '../objects/RewardsManager';
import { trackLevelCompleted, trackLevelFailed, trackLevelStarted } from '../utils/analytics';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.selectedCard = null;
        this.currentTurn = 1;
        this.illegalTileSprites = []; // Store references to illegal tile shading sprites
        this.developerMode = false; // Flag for developer mode
        this.coordinateTexts = []; // Store references to coordinate text objects
        this.repeatableCards = []; // Repeatable cards tracker - stores cards waiting to return to hand
    }

    init() {
        // Initialize game state
        this.gridManager = new GridManager(this);
        this.resourceManager = new ResourceManager(this);
        this.rewardsManager = new RewardsManager(this);
        this.cardManager = new CardManager(this);
        this.buildingActionManager = new BuildingActionManager(this);
        
        // Ensure victory checking is enabled for new levels
        this.resourceManager.setVictoryCheckEnabled(true);
        
        // Get current level information
        this.currentLevel = levelManager.getCurrentLevel();
        
        // Track level started
        if (this.currentLevel) {
            trackLevelStarted(this.currentLevel.id);
        }
        
        // Get turn limit from level config
        this.maxTurns = levelManager.getCurrentTurnLimit();
        
        // Load the map configuration for current level
        const mapConfig = levelManager.getMapForCurrentLevel();
        if (mapConfig) {
            this.gridManager.loadMapConfig(mapConfig);
        } else {
            // Fallback to random map generation if no map config found
            this.gridManager.generateRandomMap();
        }
        
        // Initialize turn counter
        this.currentTurn = 1;
        
        // Ensure player starts with specific cards
        this.cardManager.setupStartingHand();
        
        // Card choice options
        this.cardChoices = [];
        
        // Event card mechanics tracking
        this.extraCardAddedThisTurn = false;
        this.eventCardSelectedThisTurn = false;
        this.pendingSecondChoice = false;
        
        // Store launch cost for easier access - will be deprecated after refactoring
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
            cardManager: this.cardManager,
            rewardsManager: this.rewardsManager
        });
        
        // Set up input handling
        this.setupInput();
        
        // Register resource listeners for rocket fueling
        this.setupResourceListeners();
        
        // Show testing mode indicator if enabled
        if (levelManager.LEVEL_PROGRESS.testingMode) {
            this.createTestingModeIndicator();
        }
        
        // Present initial card choice for first turn
        this.time.delayedCall(500, () => {
            this.showCardChoices();
        });
        
        // Set up refresh for rocket sprites
        this.refreshRocketSprites();
    }
    
    // Create the visual grid
    createGrid() {
        this.gridContainer = this.add.container(50, 80); // Offset from top-left
        
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
                terrainSprite.setData('gridX', x); // Store grid X coordinate properly
                terrainSprite.setData('gridY', y); // Store grid Y coordinate properly
                
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
                
                // Create coordinate text (initially hidden)
                const coordText = this.add.text(
                    xPos + CELL_SIZE / 2, 
                    yPos + CELL_SIZE / 2, 
                    `${x},${y}`, 
                    { 
                        fontSize: '14px', 
                        fontFamily: 'Arial', 
                        color: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 3,
                        fontWeight: 'bold'
                    }
                );
                coordText.setOrigin(0.5, 0.5);
                coordText.setVisible(false);
                this.gridContainer.add(coordText);
                this.coordinateTexts.push(coordText);
            }
        }
        
        // Initialize developer mode visibility
        this.updateCoordinateDisplay();
    }
    
    // Set up input handling for game interactions
    setupInput() {
        // Handle grid cell clicks
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // Check if we clicked on a grid cell
            if (gameObject.getData('gridX') !== undefined) {
                const x = gameObject.getData('gridX');
                const y = gameObject.getData('gridY');
                
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
        
        // Set up keyboard input for developer mode
        this.input.keyboard.on('keydown-D', () => {
            this.toggleDeveloperMode();
        });
    }
    
    // Clear any current selection
    clearSelection() {
        // Clear selected card
        if (this.selectedCard !== null) {
            this.selectedCard = null;
            this.selectedCardIndex = undefined;
            
            // Clear illegal tile shading
            this.clearIllegalTileShading();
        }
        
        // Clear info panel and refresh UI regardless of what was selected
        if (this.uiScene) {
            // Clear any card choice selection if available
            if (this.uiScene.clearCardChoiceSelection) {
                this.uiScene.clearCardChoiceSelection();
            }
            
            this.uiScene.clearInfoPanel();
            this.uiScene.refreshUI();
        }
    }
    
    // Calculate card cost with adjustments from rewards
    calculateCardCost(card) {
        // Get base cost from card type
        let displayCost = {...card.cardType.cost};
        
        // Apply cost adjustments from rewards if available and it's a building card
        if (this.rewardsManager && card.type === 'building' && card.building) {
            const costAdjustments = this.rewardsManager.getCardCostAdjustments(card.building.id);
            
            // Apply adjustments
            for (const resource in costAdjustments) {
                if (displayCost[resource]) {
                    displayCost[resource] += costAdjustments[resource];
                    // Ensure cost doesn't go below zero
                    if (displayCost[resource] < 0) {
                        displayCost[resource] = 0;
                    }
                } else {
                    displayCost[resource] = costAdjustments[resource];
                }
            }
        }
        
        return displayCost;
    }
    
    // Try to place a building from a card
    tryPlaceBuilding(x, y, building) {
        const cell = this.gridManager.getCell(x, y);
        
        if (!cell) return;
        
        // Check placement requirements
        if (!this.gridManager.canPlaceBuilding(x, y, building)) {
            // Show UI error message
            if (this.uiScene) {
                this.uiScene.showMessage('Cannot place building here.');
            }
            return;
        }
        
        // Get the cost from the selected card with adjustments
        const cost = this.selectedCard ? this.calculateCardCost(this.selectedCard) : {};
        
        // Check resource requirements
        if (!this.resourceManager.hasSufficientResources(cost)) {
            // Show UI error message
            if (this.uiScene) {
                this.uiScene.showMessage('Not enough resources to build this.');
            }
            return;
        }
        
        // Consume resources
        this.resourceManager.consumeResources(cost);
        
        // Remove feature sprite
        if (cell.featureSprite) {
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
        
        // Special case for Wind Turbine - place surrounding buildings
        if (building.id === 'windTurbine') {
            const adjacentCells = this.gridManager.getAdjacentCells(x, y);
            const surroundingBuilding = BUILDINGS.WIND_TURBINE_SURROUNDING;
            
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
        }
        
        // Handle immediate production for buildings that produce ENERGY or DRONES
        if (building.production) {
            // Apply building upgrades to the production values
            let upgradedProduction = this.applyBuildingUpgrades(building.id, {...building.production}, x, y);
            
            // Extract only ENERGY and DRONES for immediate production
            const immediateResources = {
                [RESOURCES.ENERGY]: upgradedProduction[RESOURCES.ENERGY],
                [RESOURCES.DRONES]: upgradedProduction[RESOURCES.DRONES]
            };
            
            // Remove undefined values
            Object.keys(immediateResources).forEach(key => {
                if (immediateResources[key] === undefined) {
                    delete immediateResources[key];
                }
            });
            
            // If there are immediate resources to produce
            if (Object.keys(immediateResources).length > 0) {
                for (const resource in immediateResources) {
                    this.resourceManager.modifyResource(resource, immediateResources[resource]);
                    
                    // Show message about production
                    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    this.uiScene.showMessage(`${building.name} produced ${immediateResources[resource]} ${resourceName}`);
                }
            }
        }
        
        // Check for adjacent solar panels that should gain energy when this building is placed
        // Only applies if:
        // 1. The improved electric generation reward is unlocked
        // 2. This building is not a surroundings type building
        if (this.rewardsManager && 
            this.rewardsManager.isRewardUnlocked('improvedElectricGenerationReward') &&
            building.id !== 'launchPadSurrounding' && 
            building.id !== 'windTurbineSurrounding') {
            
            // Get adjacent cells to check for solar panels
            const adjacentCells = this.gridManager.getAdjacentCells(x, y);
            let totalBonusEnergy = 0;
            
            // Check each adjacent cell for solar panels
            for (const adjCell of adjacentCells) {
                if (adjCell.building === 'solarPanel') {
                    // Find the reward effect
                    const reward = this.rewardsManager.findRewardById('improvedElectricGenerationReward');
                    if (reward && reward.effects) {
                        const solarEffect = reward.effects.find(effect => 
                            effect.buildingId === 'solarPanel' && effect.adjacencyBonus);
                        
                        // If found, add the energy bonus
                        if (solarEffect && solarEffect.adjacencyBonus.energy) {
                            const energyBonus = solarEffect.adjacencyBonus.energy;
                            totalBonusEnergy += energyBonus;
                        }
                    }
                }
            }
            
            // If any bonus energy was generated, add it and show message
            if (totalBonusEnergy > 0) {
                this.resourceManager.addResource(RESOURCES.ENERGY, totalBonusEnergy);
                this.uiScene.showMessage(`Adjacent Solar Panels generated ${totalBonusEnergy} Energy`);
            }
        }
        
        // Remove the card from hand now that it's actually been used
        if (this.selectedCardIndex !== undefined) {
            this.cardManager.playCard(this.selectedCardIndex);
        }
        
        // Clear the selection and illegal tile shading
        this.selectedCard = null;
        this.selectedCardIndex = undefined;
        this.clearIllegalTileShading();
        
        // Update UI
        if (this.uiScene) {
            this.uiScene.clearInfoPanel();
            this.uiScene.refreshUI();
            
            // If card choices are currently shown, update them to reflect new resource availability
            if (this.cardChoices.length > 0 && this.uiScene.choicePanelContainer.visible) {
                this.uiScene.updateCardChoices(this.cardChoices);
            }
        }
    }
    
    // Select a cell to view info
    selectCell(x, y) {
        const cell = this.gridManager.getCell(x, y);
        
        if (!cell) return;
        
        // Clear any previously selected card
        this.selectedCard = null;
        this.selectedCardIndex = undefined;
        
        // Clear illegal tile shading if any
        this.clearIllegalTileShading();
        
        // Show cell info in UI
        if (this.uiScene) {
            // Clear any card choice selection first
            if (this.uiScene.clearCardChoiceSelection) {
                this.uiScene.clearCardChoiceSelection();
            }
            
            this.uiScene.showCellInfo(cell, this);
            this.uiScene.selectedCardIndex = null; // Clear selected card in UI too
        }
    }
    
    // Select a card from hand for placement
    selectCard(cardIndex) {
        // Clear any existing illegal tile shading
        this.clearIllegalTileShading();
        
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
            
            // If it's a building card - show illegal tiles
            if (card.type === 'building') {
                this.showIllegalTiles(card.building);
            }
            // If it's an event card - don't show illegal tiles, just select it
            // Event cards are handled by the "Apply" button in UIScene
        }
    }
    
    // Apply an event card from the hand
    applyEvent(cardIndex) {
        const card = this.cardManager.getCardFromHand(cardIndex);
        
        if (!card || card.type !== 'event') {
            return false;
        }
        
        // Check if player has enough resources
        const cardCost = this.calculateCardCost(card);
        if (!this.resourceManager.hasSufficientResources(cardCost)) {
            this.uiScene.showMessage('Not enough resources');
            return false;
        }
        
        // Apply the cost
        for (const resource in cardCost) {
            this.resourceManager.spendResource(resource, cardCost[resource]);
        }
        
        // Support backward compatibility for old cards with a single effect
        const effects = card.cardType.effects || (card.cardType.effect ? [card.cardType.effect] : []);
        
        // Initialize message about resources added
        let resourceMessages = [];
        
        // Apply all effects
        for (const effect of effects) {
            if (effect.type === 'addResource') {
                this.resourceManager.modifyResource(effect.resource, effect.amount);
                const resourceName = effect.resource.charAt(0).toUpperCase() + effect.resource.slice(1);
                resourceMessages.push(`${effect.amount} ${resourceName}`);
            }
            // In the future, more effect types can be handled here
        }
        
        // Show message about all resources added
        if (resourceMessages.length > 0) {
            this.uiScene.showMessage(`Added ${resourceMessages.join(', ')}`);
        }
        
        // Check if this card is repeatable
        if (card.cardType.repeatable) {
            // Remove the card from hand but don't discard it
            const playedCard = this.cardManager.playCard(cardIndex);
            
            // Add to the repeatable cards list with its cooldown
            this.repeatableCards.push({
                card: playedCard,
                cooldown: card.cardType.repeatable.cooldown
            });
            
            // Show a message that the card will return
            this.uiScene.showMessage(`${card.cardType.name} will return in ${card.cardType.repeatable.cooldown} turn${card.cardType.repeatable.cooldown > 1 ? 's' : ''}`);
        } else {
            // Discard the card from hand (non-repeatable event)
            this.cardManager.playCard(cardIndex);
        }
        
        // Clear selection and update UI
        this.selectedCard = null;
        this.selectedCardIndex = undefined;
        
        if (this.uiScene) {
            this.uiScene.clearInfoPanel();
            this.uiScene.refreshUI();
            
            // If card choices are currently shown, update them to reflect new resource availability
            if (this.cardChoices.length > 0 && this.uiScene.choicePanelContainer.visible) {
                this.uiScene.updateCardChoices(this.cardChoices);
            }
        }
        
        return true;
    }
    
    // End the current turn
    endTurn() {
        // Process building production first
        this.processProduction();
        
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
        
        // Process repeatable cards cooldowns
        if (this.repeatableCards.length > 0) {
            const cardsToReturn = [];
            
            // Decrease cooldown for each card
            this.repeatableCards.forEach((item, index) => {
                item.cooldown--;
                
                // If cooldown is over, card should return to hand
                if (item.cooldown <= 0) {
                    cardsToReturn.push({
                        index: index,
                        card: item.card
                    });
                }
            });
            
            // Sort in reverse order to avoid index issues when removing
            cardsToReturn.sort((a, b) => b.index - a.index);
            
            // Return cards that are ready (if hand has space)
            cardsToReturn.forEach(returnItem => {
                // Remove from repeatable cards list
                this.repeatableCards.splice(returnItem.index, 1);
                
                // Check if hand has space for the card
                if (this.cardManager.hand.length < MAX_CARD_SLOTS) {
                    // Add card back to hand
                    this.cardManager.hand.push(returnItem.card);
                    
                    // Show message
                    this.uiScene.showMessage(`${returnItem.card.cardType.name} returned to your hand`);
                } else {
                    // Hand is full, delay the card return
                    this.repeatableCards.push({
                        card: returnItem.card,
                        cooldown: 1 // Try again next turn
                    });
                    
                    // Show message
                    this.uiScene.showMessage(`${returnItem.card.cardType.name} delayed (hand full)`);
                }
            });
        }
        
        // Increment turn counter
        this.currentTurn++;
        
        // Reset event card mechanics tracking for the new turn
        this.extraCardAddedThisTurn = false;
        this.eventCardSelectedThisTurn = false;
        this.pendingSecondChoice = false;
        
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
        // Use the action-based approach instead
        return this.executeAction(x, y, 'launchRocket');
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
    
    // Process building production for all buildings on the grid
    processProduction() {
        // Track which cells have buildings with production
        const buildingsWithProduction = [];
        
        // Collect all buildings on the map
        for (let y = 0; y < this.gridManager.gridSize; y++) {
            for (let x = 0; x < this.gridManager.gridSize; x++) {
                const cell = this.gridManager.getCell(x, y);
                if (cell && cell.building && !cell.processing) {
                    // Get building definition
                    const buildingId = cell.building;
                    const building = Object.values(BUILDINGS).find(b => b.id === buildingId);
                    
                    if (building) {
                        buildingsWithProduction.push({ x, y, building });
                    }
                }
            }
        }
        
        // Process production in two waves: first producers, then consumers
        this.processFirstWaveProduction(buildingsWithProduction);
        this.processSecondWaveProduction(buildingsWithProduction);
    }
    
    // First wave: Process buildings that only produce (no consumption)
    processFirstWaveProduction(buildings) {
        buildings.forEach(({ x, y, building }) => {
            const cell = this.gridManager.getCell(x, y);
            
            // Skip if this building has consumption requirements
            if (Object.keys(building.consumption || {}).length > 0) {
                return;
            }
            
            // Apply production
            let produced = false;
            if (building.production) {
                // Get production values with any building upgrades applied
                let productionValues = this.applyBuildingUpgrades(building.id, {...building.production}, x, y);
                
                // Filter out ENERGY and DRONES which should only be produced on construction
                const filteredProduction = {};
                Object.entries(productionValues).forEach(([resource, amount]) => {
                    if (resource !== RESOURCES.ENERGY && resource !== RESOURCES.DRONES) {
                        filteredProduction[resource] = amount;
                    }
                });
                
                // Apply production for each resource
                Object.entries(filteredProduction).forEach(([resource, amount]) => {
                    this.resourceManager.addResource(resource, amount);
                    produced = true;
                });
            }
            
            // Mark as processed
            if (produced) {
                cell.processing = true;
            }
        });
    }
    
    // Second wave: Process buildings that consume resources
    processSecondWaveProduction(buildings) {
        buildings.forEach(({ x, y, building }) => {
            const cell = this.gridManager.getCell(x, y);
            
            // Skip if already processed
            if (cell.processing) {
                // Reset the processing flag for next turn
                cell.processing = false;
                return;
            }
            
            // Check if this building has consumption requirements
            const hasConsumption = Object.keys(building.consumption || {}).length > 0;
            if (!hasConsumption) {
                return;
            }
            
            // Check if we have enough resources to consume
            const canConsume = this.resourceManager.hasSufficientResources(building.consumption);
            if (canConsume) {
                // Consume resources
                Object.entries(building.consumption).forEach(([resource, amount]) => {
                    this.resourceManager.spendResource(resource, amount);
                });
                
                // Apply production
                if (building.production) {
                    // Get production values with any building upgrades applied
                    let productionValues = this.applyBuildingUpgrades(building.id, {...building.production}, x, y);
                    
                    // Filter out ENERGY and DRONES which should only be produced on construction
                    const filteredProduction = {};
                    Object.entries(productionValues).forEach(([resource, amount]) => {
                        if (resource !== RESOURCES.ENERGY && resource !== RESOURCES.DRONES) {
                            filteredProduction[resource] = amount;
                        }
                    });
                    
                    // Apply production for each resource
                    Object.entries(filteredProduction).forEach(([resource, amount]) => {
                        this.resourceManager.addResource(resource, amount);
                    });
                }
            }
        });
    }
    
    // Apply building upgrades from level progression rewards
    applyBuildingUpgrades(buildingId, productionValues, x, y) {
        if (this.rewardsManager) {
            productionValues = this.rewardsManager.applyBuildingUpgrades(buildingId, productionValues, x, y);
        }
        return productionValues;
    }
    
    gameOver() {
        trackLevelFailed(this.currentLevel.id);
        
        if (this.uiScene) {
            const reputation = this.resourceManager.getResource(RESOURCES.REPUTATION);
            this.uiScene.showGameOver(reputation);
        }
    }
    
    // Player victory when reputation goal is reached
    playerVictory() {
        trackLevelCompleted(this.currentLevel.id);

        const reputation = this.resourceManager.getResource(RESOURCES.REPUTATION);

        // Don't advance the level immediately - that will happen after viewing rewards
        
        // Stop game input
        this.input.enabled = false;
        
        this.uiScene.showMessage(`VICTORY! You've reached ${reputation} reputation points`);
        if (this.uiScene) {
            const isRandomLevel = this.currentLevel.isRandom;
            this.uiScene.showVictory(reputation, this.currentLevel.reputationGoal, isRandomLevel);
        }
    }

    // Show card choices to the player
    showCardChoices() {
        // Draw 3 cards as choices (default)
        this.cardChoices = [];
        let numChoices = 3;
        
        // Check if we need to pull the cards first to check for events
        let tempCards = [];
        
        // Get cards from the deck
        for (let i = 0; i < numChoices; i++) {
            if (this.cardManager.deck.length === 0) {
                if (this.cardManager.discardPile.length === 0) {
                    break; // No more cards
                }
                // Reshuffle discard pile into deck
                this.cardManager.shuffleDiscardIntoDeck();
            }
            
            if (this.cardManager.deck.length > 0) {
                // Draw from the end of the deck to avoid shifting indices
                const card = this.cardManager.deck.pop();
                tempCards.push(card);
            }
        }
        
        // Check if any of the cards is an event card
        const hasEventCard = tempCards.some(card => card.type === 'event');
        
        // If there's an event card and we haven't added an extra card this turn, add one more
        if (hasEventCard && !this.extraCardAddedThisTurn && this.cardManager.deck.length > 0) {
            if (this.cardManager.deck.length === 0) {
                this.cardManager.shuffleDiscardIntoDeck();
            }
            const extraCard = this.cardManager.deck.pop();
            tempCards.push(extraCard);
            this.extraCardAddedThisTurn = true;
        }
        
        // Add all the cards to the choices
        this.cardChoices = tempCards;
        
        // Show choices in UI
        if (this.uiScene && this.cardChoices.length > 0) {
            this.uiScene.showCardChoices(this.cardChoices);
        }
    }
    
    // Handle card choice selection
    selectCardChoice(choiceIndex) {
        if (choiceIndex >= 0 && choiceIndex < this.cardChoices.length) {
            // Get the selected card
            const selectedCard = this.cardChoices[choiceIndex];
            
            // Always add to hand, even if over the limit
            this.cardManager.hand.push(selectedCard);

            // Update the hand display to show the new card immediately
            this.uiScene.updateHandDisplay();
            
            // Get card name from cardType if available, otherwise fallback to building name
            const cardName = selectedCard.cardType ? 
                selectedCard.cardType.name : 
                (selectedCard.building ? selectedCard.building.name : 'Card');
                
            this.uiScene.showMessage(`Added ${cardName} to your hand`);
            
            // Check if this is an event card and we haven't selected an event card yet this turn
            const isEventCard = selectedCard.type === 'event';
            
            if (isEventCard && !this.eventCardSelectedThisTurn && !this.pendingSecondChoice) {
                // First event card selected this turn - allow a second choice
                this.eventCardSelectedThisTurn = true;
                this.pendingSecondChoice = true;
                
                // Remove the selected card from choices
                this.cardChoices.splice(choiceIndex, 1);
                
                // If there are still cards to choose from
                if (this.cardChoices.length > 0) {
                    // Show a message that player can choose again
                    this.uiScene.showMessage('You can choose one more card');
                    
                    // Update the card choice display
                    this.uiScene.updateCardChoices(this.cardChoices);
                    
                    // No need to hide panel - player will make another choice
                    return;
                }
            }
            
            // For non-event cards or second choices, discard the other choices
            const remainingCards = [...this.cardChoices];
            remainingCards.splice(choiceIndex, 1);
            
            // Add remaining cards to discard pile
            for (const card of remainingCards) {
                this.cardManager.discardPile.push(card);
            }
            
            // Clear choices and reset pending second choice flag
            this.cardChoices = [];
            this.pendingSecondChoice = false;
            
            // Hide the choice panel in UI
            this.uiScene.hideCardChoices();
            
            // Update UI
            this.uiScene.refreshUI();
            
            // Check if hand is over the limit and update end turn button
            this.uiScene.updateEndTurnButton();
        }
    }
    
    // Show shading on illegal tiles for the selected building
    showIllegalTiles(building) {
        // Clear any existing shading first
        this.clearIllegalTileShading();
        
        // Loop through all grid cells
        for (let y = 0; y < this.gridManager.gridSize; y++) {
            for (let x = 0; x < this.gridManager.gridSize; x++) {
                // Check if this is an illegal placement
                if (!this.gridManager.canPlaceBuilding(x, y, building)) {
                    const xPos = x * CELL_SIZE;
                    const yPos = y * CELL_SIZE;
                    
                    // Create shading sprite
                    const shadingSprite = this.add.sprite(xPos, yPos, 'illegalTileShade');
                    shadingSprite.setOrigin(0, 0);
                    shadingSprite.displayWidth = CELL_SIZE;
                    shadingSprite.displayHeight = CELL_SIZE;
                    shadingSprite.setAlpha(0.5); // Set transparency
                    
                    // Add to grid container at the top level so it overlays other sprites
                    this.gridContainer.add(shadingSprite);
                    
                    // Store reference to remove later
                    this.illegalTileSprites.push(shadingSprite);
                }
            }
        }
    }
    
    // Clear all illegal tile shading sprites
    clearIllegalTileShading() {
        // Destroy all shading sprites and clear the array
        if (this.illegalTileSprites.length > 0) {
            this.illegalTileSprites.forEach(sprite => {
                if (sprite && sprite.active) {
                    sprite.destroy();
                }
            });
            this.illegalTileSprites = [];
        }
    }
    
    // Toggle developer mode
    toggleDeveloperMode() {
        this.developerMode = !this.developerMode;
        this.updateCoordinateDisplay();
        
        // Show message about developer mode status
        const message = this.developerMode ? 'Developer Mode: ON' : 'Developer Mode: OFF';
        this.uiScene.showMessage(message);
    }
    
    // Update coordinate display based on developer mode
    updateCoordinateDisplay() {
        this.coordinateTexts.forEach(text => {
            text.setVisible(this.developerMode);
        });
    }

    setupResourceListeners() {
        // Get the resources needed for launching
        const launchResources = Object.keys(this.launchCost);
        
        // Create a handler that updates rocket states when launch resources change
        const updateRocketsOnResourceChange = (resourceType, oldValue, newValue) => {    
            this.updateRocketStates();
            if (this.uiScene) {
                this.uiScene.updateLaunchButtonState();
            }
        };
        
        // Register listeners for each launch resource
        launchResources.forEach(resourceType => {
            this.resourceManager.addResourceChangeListener(resourceType, updateRocketsOnResourceChange);
        });
    }

    // Execute a building action
    executeAction(x, y, actionId) {
        const cell = this.gridManager.getCell(x, y);
        if (!cell || !cell.building) return false;
        
        // Find the action configuration
        const actions = this.buildingActionManager.getBuildingActions(cell.building);
        const action = actions.find(a => a.action === actionId);
        
        // Perform the action
        return this.buildingActionManager.performAction(x, y, action);
    }

    // Animate rocket launching from a launch pad
    animateRocketLaunch(x, y, launchType = 'regular') {
        const cell = this.gridManager.getCell(x, y);
        
        // Reference for later use
        const rocketSprite = cell.rocketSprite;
        if (!rocketSprite) return;
        
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
        let flickerSequence = []
        if (launchType === 'regular') {
            flickerSequence = [
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 200 }
            ];
        } else if (launchType === 'fast') {
            flickerSequence = [
                { key: 'rocketInFlight', duration: 120 },
                { key: 'rocketFueled', duration: 30 },
                { key: 'rocketInFlight', duration: 120 },
                { key: 'rocketFueled', duration: 30 },
                { key: 'rocketInFlight', duration: 120 },
                { key: 'rocketFueled', duration: 30 },
                { key: 'rocketInFlight', duration: 120 }
            ];
        } else if (launchType === 'heavy') {
            flickerSequence = [
                { key: 'rocketInFlight', duration: 300 },
                { key: 'rocketFueled', duration: 300 },
                { key: 'rocketInFlight', duration: 200 },
                { key: 'rocketFueled', duration: 200 },
                { key: 'rocketInFlight', duration: 100 },
                { key: 'rocketFueled', duration: 100 },
                { key: 'rocketInFlight', duration: 50 },
                { key: 'rocketFueled', duration: 50 },
                { key: 'rocketInFlight', duration: 50 }
            ];
        }
        
        // Initialize sequence counter
        let sequenceIndex = 0;
        
        // Create a timer for flickering effect
        const flickerTimer = this.time.addEvent({
            delay: flickerSequence[sequenceIndex].duration,
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
                    const extraDistance = 100; // Go a bit beyond the edge

                    // Set flight duration based on launch type
                    let flightDuration = 2000; // Default for regular launch
                    if (launchType === 'fast') {
                        flightDuration = 1000;
                    } else if (launchType === 'heavy') {
                        flightDuration = 3000;
                    }
                    
                    // Launch the rocket animation - fly straight up at constant size
                    this.tweens.add({
                        targets: launchSprite,
                        y: -extraDistance, // Go beyond the top edge
                        duration: flightDuration,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            launchSprite.destroy();
                        }
                    });
                }
            },
            repeat: flickerSequence.length - 1
        });
    }

    // Create a small indicator for testing mode
    createTestingModeIndicator() {
        const testingText = this.add.text(10, 10, '🧪 TESTING MODE', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00FF00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 3 }
        });
        testingText.setDepth(1000); // Ensure it's visible above other elements
        testingText.setScrollFactor(0); // Fix to camera
    }
} 