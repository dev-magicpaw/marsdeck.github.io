import { RESOURCES, STARTING_RESOURCES } from '../config/game-data';
import levelManager from './LevelManager';

export default class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        // Get level-specific starting resources or fall back to default
        const levelResources = levelManager.getStartingResourcesForCurrentLevel(scene.rewardsManager);
        this.resources = levelResources || { ...STARTING_RESOURCES };
        
        // Resources that don't accumulate between turns (e.g., energy)
        this.nonAccumulatingResources = [];
        
        // For UI updates
        this.onResourceChange = null;
    }
    
    // Get current resource amount
    getResource(resourceType) {
        return this.resources[resourceType] || 0;
    }
    
    // Add resources (positive amount) or consume them (negative amount)
    modifyResource(resourceType, amount) {
        if (!this.resources.hasOwnProperty(resourceType)) {
            console.warn(`Resource type ${resourceType} not found`);
            return false;
        }
        
        // Cannot go below zero
        if (this.resources[resourceType] + amount < 0) {
            console.warn(`Not enough ${resourceType} resources`);
            return false;
        }
        
        this.resources[resourceType] += amount;
        
        // Notify UI for updates
        if (this.onResourceChange) {
            this.onResourceChange(resourceType, this.resources[resourceType]);
        }
        
        // Check for victory condition when reputation increases
        if (resourceType === RESOURCES.REPUTATION) {
            this.checkVictoryCondition();
        }
        
        return true;
    }
    
    // Add resources (positive amount only)
    addResource(resourceType, amount) {
        if (amount < 0) {
            console.warn('Cannot add negative resources. Use spendResource instead.');
            return false;
        }
        
        return this.modifyResource(resourceType, amount);
    }
    
    // Spend resources (positive amount to spend)
    spendResource(resourceType, amount) {
        if (amount < 0) {
            console.warn('Cannot spend negative resources. Use addResource instead.');
            return false;
        }
        
        return this.modifyResource(resourceType, -amount);
    }
    
    // Check if the player has reached the victory goal
    checkVictoryCondition() {
        // Get current level's victory goal
        const victoryGoal = levelManager.getCurrentVictoryGoal();
        
        if (this.resources[RESOURCES.REPUTATION] >= victoryGoal) {
            // Trigger victory in the game scene
            this.scene.playerVictory();
        }
    }
    
    // Check if resources are sufficient for a cost object
    hasSufficientResources(costObject) {
        for (const resourceType in costObject) {
            if (this.getResource(resourceType) < costObject[resourceType]) {
                return false;
            }
        }
        return true;
    }
    
    // Consume resources based on a cost object
    consumeResources(costObject) {
        // First check if we have enough
        if (!this.hasSufficientResources(costObject)) {
            return false;
        }
        
        // Then consume each resource
        for (const resourceType in costObject) {
            this.spendResource(resourceType, costObject[resourceType]);
        }
        
        return true;
    }
    
    // Reset non-accumulating resources at end of turn
    resetNonAccumulatingResources() {
        this.nonAccumulatingResources.forEach(resourceType => {
            this.resources[resourceType] = 0;
            
            if (this.onResourceChange) {
                this.onResourceChange(resourceType, 0);
            }
        });
    }
    
    // Get all current resource values
    getAllResources() {
        return { ...this.resources };
    }
} 