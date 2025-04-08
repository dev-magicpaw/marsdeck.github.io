import { RESOURCES, REWARDS } from '../config/game-data';
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
    }
    
    // Load unlocked rewards from level manager persistent rewards
    loadUnlockedRewardsFromLevelManager() {
        if (levelManager && levelManager.LEVEL_PROGRESS && levelManager.LEVEL_PROGRESS.persistentRewards) {
            const persistentRewardIds = levelManager.LEVEL_PROGRESS.persistentRewards.rewardIds || [];
            
            // Categorize each reward into the appropriate list based on its application type
            persistentRewardIds.forEach(rewardId => {
                const reward = this.findRewardById(rewardId);
                if (reward && reward.applicationType) {
                    switch (reward.applicationType) {
                        case 'startingHand':
                            if (!this.unlockedRewards.startingHand.includes(rewardId)) {
                                this.unlockedRewards.startingHand.push(rewardId);
                            }
                            break;
                        case 'deckCards':
                            if (!this.unlockedRewards.deckCards.includes(rewardId)) {
                                this.unlockedRewards.deckCards.push(rewardId);
                            }
                            break;
                        case 'buildingUpgrade':
                            if (!this.unlockedRewards.buildingUpgrade.includes(rewardId)) {
                                this.unlockedRewards.buildingUpgrade.push(rewardId);
                            }
                            break;
                    }
                }
            });
        }
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
    
    // Unlock a reward using reputation points
    unlockReward(rewardId) {
        const reward = this.findRewardById(rewardId);
        
        if (!reward) {
            console.error(`Reward with ID ${rewardId} not found`);
            return false;
        }
        
        // Check if already unlocked
        if (this.isRewardUnlocked(rewardId)) {
            console.log(`Reward ${rewardId} is already unlocked`);
            return false;
        }
        
        // Check if player has enough reputation
        const currentReputation = this.scene.resourceManager.getResource(RESOURCES.REPUTATION);
        if (currentReputation < reward.reputationCost) {
            console.log(`Not enough reputation to unlock reward ${rewardId}`);
            return false;
        }
        
        // Spend reputation points
        this.scene.resourceManager.spendResource(RESOURCES.REPUTATION, reward.reputationCost);
        
        // TODO: add all unlocked rewards to a single list.
        //   When needed, use reward application type to understand what to do with the reward.
        // Add to appropriate unlocked rewards list
        switch (reward.applicationType) {
            case 'startingHand':
                this.unlockedRewards.startingHand.push(rewardId);
                break;
            case 'deckCards':
                this.unlockedRewards.deckCards.push(rewardId);
                break;
            case 'buildingUpgrade':
                this.unlockedRewards.buildingUpgrade.push(rewardId);
                break;
            default:
                console.error(`Unknown application type: ${reward.applicationType}`);
                return false;
        }
        
        console.log(`Unlocked reward: ${reward.name}`);
        return true;
    }
    
    // Get additional starting hand cards from unlocked rewards
    getStartingHandRewardCards() {
        const rewardCards = [];
        
        // Find all unlocked starting hand rewards
        for (const rewardId of this.unlockedRewards.startingHand) {
            const reward = this.findRewardById(rewardId);
            if (reward && reward.effect && reward.effect.cardId) {
                rewardCards.push(reward.effect.cardId);
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
            if (reward && reward.effect && reward.effect.cardId) {
                const cardId = reward.effect.cardId;
                const count = reward.effect.count || 1;
                
                // Add the card to the rewardCards object
                if (rewardCards[cardId]) {
                    rewardCards[cardId] += count;
                } else {
                    rewardCards[cardId] = count;
                }
            }
        }
        
        return rewardCards;
    }
    
    // Apply building upgrades to a building's production values
    applyBuildingUpgrades(buildingId, productionValues) {
        const upgradedValues = { ...productionValues };
        
        // Find all unlocked building upgrade rewards that affect this building
        for (const rewardId of this.unlockedRewards.buildingUpgrade) {
            const reward = this.findRewardById(rewardId);
            
            if (reward && 
                reward.effect && 
                reward.effect.buildingId === buildingId && 
                reward.effect.resourceBonus) {
                
                // Apply the resource bonuses
                for (const resourceType in reward.effect.resourceBonus) {
                    const bonus = reward.effect.resourceBonus[resourceType];
                    
                    if (upgradedValues[resourceType]) {
                        upgradedValues[resourceType] += bonus;
                    } else {
                        upgradedValues[resourceType] = bonus;
                    }
                }
            }
        }
        
        return upgradedValues;
    }
} 