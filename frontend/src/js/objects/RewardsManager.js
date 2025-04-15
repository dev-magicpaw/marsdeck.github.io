import { REWARDS, STARTING_REWARDS } from '../config/game-data';
import levelManager from './LevelManager';

export default class RewardsManager {
    constructor(scene) {
        this.scene = scene;
        
        // Track unlocked rewards by their IDs
        this.unlockedRewards = {
            startingHand: [],  // IDs of unlocked starting hand rewards
            deckCards: [],     // IDs of unlocked deck cards rewards
            buildingUpgrade: [] // IDs of unlocked building upgrade rewards
        };
        
        // Load already unlocked rewards from levelManager if available
        this.loadUnlockedRewardsFromLevelManager();
        
        // Apply starting rewards if none exist from previous plays
        this.loadStartingRewards();
    }
    
    // Load unlocked rewards from level manager persistent rewards
    loadUnlockedRewardsFromLevelManager() {
        if (levelManager && levelManager.LEVEL_PROGRESS && levelManager.LEVEL_PROGRESS.persistentRewards) {
            const persistentRewardIds = levelManager.LEVEL_PROGRESS.persistentRewards.rewardIds || [];
            
            // Categorize each reward into the appropriate list based on its application type
            persistentRewardIds.forEach(rewardId => {
                this.addRewardById(rewardId);
            });
            
            // Load resource bonuses
            if (levelManager.LEVEL_PROGRESS.persistentRewards.resourceBonuses) {
                this.resourceBonuses = { ...levelManager.LEVEL_PROGRESS.persistentRewards.resourceBonuses };
            }
        }
    }
    
    loadStartingRewards() {
        // Unlock each starting reward
        STARTING_REWARDS.forEach(rewardId => {
            const reward = this.findRewardById(rewardId);
            if (reward) {
                this.addRewardById(rewardId);
            } else {
                console.warn(`Starting reward with ID ${rewardId} not found in rewards configuration`);
            }
        });
        
        // Save to level manager so they persist
        this.saveRewardsToLevelManager();
    }
    
    // Add a reward by its ID - categorize it and add to the appropriate list
    addRewardById(rewardId) {
        const reward = this.findRewardById(rewardId);
        if (!reward) {
            console.warn(`Reward ${rewardId} not found in rewards configuration`);
            return false;
        }
        
        // Check if already unlocked
        if (this.isRewardUnlocked(rewardId)) {
            return false;
        }
        
        // Add to appropriate unlocked rewards lists based on application type and effects
        let added = false;
        
        // Add to the list based on the main application type
        if (reward.applicationType) {
            switch (reward.applicationType) {
                case 'startingHand':
                    this.unlockedRewards.startingHand.push(rewardId);
                    added = true;
                    break;
                case 'deckCards':
                    this.unlockedRewards.deckCards.push(rewardId);
                    added = true;
                    break;
                case 'buildingUpgrade':
                    this.unlockedRewards.buildingUpgrade.push(rewardId);
                    added = true;
                    break;
                default:
                    console.error(`Unknown application type: ${reward.applicationType}`);
                    break;
            }
        }
        
        // Check for secondary effects that might need additional categorization
        if (reward.effects) {
            for (const effect of reward.effects) {
                // If there's a cardId but no count, it's likely a starting hand card
                if (effect.cardId && !effect.count && !this.unlockedRewards.startingHand.includes(rewardId)) {
                    this.unlockedRewards.startingHand.push(rewardId);
                    added = true;
                }
                
                // If there's a cardId with a count, it's likely a deck card
                if (effect.cardId && effect.count && !this.unlockedRewards.deckCards.includes(rewardId)) {
                    this.unlockedRewards.deckCards.push(rewardId);
                    added = true;
                }
                
                // If there's a buildingId and resourceBonus, it's a building upgrade
                if (effect.buildingId && effect.resourceBonus && !this.unlockedRewards.buildingUpgrade.includes(rewardId)) {
                    this.unlockedRewards.buildingUpgrade.push(rewardId);
                    added = true;
                }
            }
        }
        
        return added;
    }
    
    // Save all rewards to the level manager's persistent rewards
    saveRewardsToLevelManager() {
        if (!levelManager.LEVEL_PROGRESS.persistentRewards) {
            levelManager.LEVEL_PROGRESS.persistentRewards = {
                rewardIds: [],
                resourceBonuses: {}
            };
        }
        
        // Create a flat list of all reward IDs
        const allRewardIds = [
            ...this.unlockedRewards.startingHand,
            ...this.unlockedRewards.deckCards,
            ...this.unlockedRewards.buildingUpgrade
        ];
        
        // Update the level manager's persistent rewards
        levelManager.LEVEL_PROGRESS.persistentRewards.rewardIds = [...allRewardIds];
        
        // Save the level progress to persist the changes
        levelManager.saveLevelProgress();
    }
    
    // Add rewards from level completion
    addLevelRewards(levelRewards) {
        if (!levelRewards) return;
        
        // Add reward IDs
        if (levelRewards.rewardIds && levelRewards.rewardIds.length > 0) {
            levelRewards.rewardIds.forEach(rewardId => {
                this.addRewardById(rewardId);
            });
        }
        
        // Save the updated rewards to level manager
        this.saveRewardsToLevelManager();
    }
    
    // Get all available rewards grouped by type
    getAllRewards() {
        return REWARDS;
    }
    
    // Get all unlocked rewards
    getUnlockedRewards() {
        return this.unlockedRewards;
    }
    
    // Check if a specific reward is unlocked
    isRewardUnlocked(rewardId) {
        // Check in all reward categories
        return this.unlockedRewards.startingHand.includes(rewardId) ||
               this.unlockedRewards.deckCards.includes(rewardId) ||
               this.unlockedRewards.buildingUpgrade.includes(rewardId);
    }
    
    // Find a reward by ID across all categories
    findRewardById(rewardId) {
        // Search in all reward categories
        const allCategories = [
            REWARDS.STARTING_HAND_REWARDS,
            REWARDS.DECK_CARDS_REWARDS,
            REWARDS.BUILDING_UPGRADE_REWARDS
        ];
        
        for (const category of allCategories) {
            for (const key in category) {
                if (category[key].id === rewardId) {
                    return category[key];
                }
            }
        }
        
        return null;
    }
    
    unlockReward(rewardId) {
        const reward = this.findRewardById(rewardId);
        
        if (!reward) {
            console.error(`Reward with ID ${rewardId} not found`);
            return false;
        }
        
        // Check if already unlocked
        if (this.isRewardUnlocked(rewardId)) {
            return false;
        }
        
        // Add to appropriate unlocked rewards list
        const added = this.addRewardById(rewardId);
        
        if (added) {
            // Save to level manager's persistent rewards
            this.saveRewardsToLevelManager();
            return true;
        }
        
        return false;
    }
    
    // Get additional starting hand cards from unlocked rewards
    getStartingHandRewardCards() {
        const rewardCards = [];
        
        // Find all unlocked starting hand rewards
        for (const rewardId of this.unlockedRewards.startingHand) {
            const reward = this.findRewardById(rewardId);
            if (reward && reward.effects) {
                // Loop through all effects
                for (const effect of reward.effects) {
                    if (effect.cardId) {
                        rewardCards.push(effect.cardId);
                    }
                }
            }
        }
        
        return rewardCards;
    }
    
    // Get additional cards to add to the deck from unlocked rewards
    getDeckRewardCards() {
        const rewardCards = {};
        
        // Find all unlocked deck cards rewards
        for (const rewardId of this.unlockedRewards.deckCards) {
            const reward = this.findRewardById(rewardId);
            if (reward && reward.effects) {
                // Loop through all effects
                for (const effect of reward.effects) {
                    if (effect.cardId) {
                        const cardId = effect.cardId;
                        const count = effect.count || 1;
                        
                        // Add the card to the rewardCards object
                        if (rewardCards[cardId]) {
                            rewardCards[cardId] += count;
                        } else {
                            rewardCards[cardId] = count;
                        }
                    }
                }
            }
        }
        
        return rewardCards;
    }
    
    // Apply building upgrades to a building's production values
    applyBuildingUpgrades(buildingId, productionValues, x, y) {
        const upgradedValues = { ...productionValues };
        
        // Find all unlocked building upgrade rewards that affect this building
        for (const rewardId of this.unlockedRewards.buildingUpgrade) {
            const reward = this.findRewardById(rewardId);
            
            if (reward && reward.effects) {
                // Loop through all effects
                for (const effect of reward.effects) {
                    // Apply direct resource bonuses to this building
                    if ((effect.buildingId === buildingId || effect.buildingId === 'any') && effect.resourceBonus) {
                        // Apply the resource bonuses
                        for (const resourceType in effect.resourceBonus) {
                            const bonus = effect.resourceBonus[resourceType];
                            
                            if (upgradedValues[resourceType]) {
                                upgradedValues[resourceType] += bonus;
                            } else {
                                upgradedValues[resourceType] = bonus;
                            }
                        }
                    }
                    
                    // Apply adjacency bonuses if coordinates are provided
                    if ((effect.buildingId === buildingId || effect.buildingId === 'any') && effect.adjacencyBonus && x !== undefined && y !== undefined) {
                        // Special handling for solar panels - they get bonus per adjacent building
                        if (buildingId === 'solarPanel' && effect.adjacentBuildingId === 'any') {
                            const adjacentCells = this.scene.gridManager.getAdjacentCells(x, y);
                            let adjacentBuildingCount = 0;
                            
                            // Count valid adjacent buildings
                            for (const cell of adjacentCells) {
                                if (!cell.building) continue;
                                
                                // Skip excluded building types
                                if (effect.excludeBuildingTypes && effect.excludeBuildingTypes.includes(cell.building)) {
                                    continue;
                                }
                                
                                adjacentBuildingCount++;
                            }
                            
                            // Apply bonus for each adjacent building
                            if (adjacentBuildingCount > 0) {
                                for (const resourceType in effect.adjacencyBonus) {
                                    const bonusPerAdjacent = effect.adjacencyBonus[resourceType];
                                    const totalBonus = bonusPerAdjacent * adjacentBuildingCount;
                                    
                                    if (upgradedValues[resourceType]) {
                                        upgradedValues[resourceType] += totalBonus;
                                    } else {
                                        upgradedValues[resourceType] = totalBonus;
                                    }
                                }
                            }
                        } else {
                            // Standard adjacency check for other buildings
                            let isAdjacent = false;
                            if (effect.adjacentBuildingId === 'any') {
                                // Custom handling for 'any' to exclude specific building types
                                const adjacentCells = this.scene.gridManager.getAdjacentCells(x, y);
                                isAdjacent = adjacentCells.some(cell => {
                                    if (!cell.building) return false;
                                    
                                    // Check if this building type should be excluded
                                    if (effect.excludeBuildingTypes && effect.excludeBuildingTypes.includes(cell.building)) {
                                        return false;
                                    }
                                    
                                    return true;
                                });
                            } else {
                                // Standard check for specific building type
                                isAdjacent = this.scene.gridManager.isAdjacentToBuildingType(x, y, effect.adjacentBuildingId);
                            }
                            
                            if (isAdjacent) {
                                // Apply the adjacency bonuses
                                for (const resourceType in effect.adjacencyBonus) {
                                    const bonus = effect.adjacencyBonus[resourceType];
                                    
                                    if (upgradedValues[resourceType]) {
                                        upgradedValues[resourceType] += bonus;
                                    } else {
                                        upgradedValues[resourceType] = bonus;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Handle adjacentBuildingBonus property (used by drone support reward)
                    if ((effect.buildingId === buildingId || effect.buildingId === 'any') && 
                        effect.adjacentBuildingBonus && x !== undefined && y !== undefined) {
                        
                        // Check if adjacent to the specified building type
                        const isAdjacent = this.scene.gridManager.isAdjacentToBuildingType(x, y, effect.adjacentBuildingId);
                        
                        if (isAdjacent) {
                            // Apply bonuses to resources
                            for (const resourceType in effect.adjacentBuildingBonus) {
                                const bonus = effect.adjacentBuildingBonus[resourceType];
                                
                                if (resourceType === 'any') {
                                    // Apply bonus to all production resources except energy and drones
                                    Object.keys(upgradedValues).forEach(res => {
                                        if (res !== 'energy' && res !== 'drones') {
                                            upgradedValues[res] += bonus;
                                        }
                                    });
                                } else {
                                    // Apply to specific resource
                                    if (upgradedValues[resourceType]) {
                                        upgradedValues[resourceType] += bonus;
                                    } else {
                                        upgradedValues[resourceType] = bonus;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return upgradedValues;
    }
    
    // Get additional actions for a building from upgrades
    getBuildingActions(buildingId) {
        const actions = [];
        
        // Find all unlocked building upgrade rewards that affect this building
        for (const rewardId of this.unlockedRewards.buildingUpgrade) {
            const reward = this.findRewardById(rewardId);
            
            if (reward && reward.effects) {
                // Loop through all effects
                for (const effect of reward.effects) {
                    // Check if this effect adds a new action to this building
                    if (effect.buildingId === buildingId && effect.newAction) {
                        // Create the action object with required properties
                        const action = {
                            type: 'action',
                            action: `${effect.newAction.name.replace(/\s+/g, '')}`, // Convert name to ID by removing spaces
                            name: effect.newAction.name,
                            cost: effect.newAction.cost,
                            cooldown: effect.newAction.cooldown,
                            effects: effect.newAction.effects
                        };
                        
                        actions.push(action);
                    }
                }
            }
        }
        
        return actions;
    }
    
    // Get cost adjustments for a building from rewards
    // Positive values increase cost, negative values decrease cost
    getCardCostAdjustments(buildingId) {
        const costAdjustments = {};
        
        // Find all unlocked building upgrade rewards that affect this building
        for (const rewardId of this.unlockedRewards.buildingUpgrade) {
            const reward = this.findRewardById(rewardId);
            
            if (reward && reward.effects) {
                for (const effect of reward.effects) {
                    if (effect.buildingId === buildingId && effect.cardCost) {
                        for (const resourceType in effect.cardCost) {
                            const adjustment = effect.cardCost[resourceType];
                            
                            if (costAdjustments[resourceType]) {
                                costAdjustments[resourceType] += adjustment;
                            } else {
                                costAdjustments[resourceType] = adjustment;
                            }
                        }
                    }
                }
            }
        }
        
        return costAdjustments;
    }
} 