import { RESOURCES, STARTING_RESOURCES } from '../config/game-data';
import levelManager from './LevelManager';

export default class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        // Get level-specific starting resources or fall back to default
        const levelResources = levelManager.getStartingResourcesForCurrentLevel();
        this.resources = levelResources || { ...STARTING_RESOURCES };
        
        // Apply testing mode resources if enabled
        this.applyTestingModeResources();
        
        // Resources that don't accumulate between turns (e.g., energy)
        this.nonAccumulatingResources = [];
        
        // For UI updates
        this.onResourceChange = null;
        
        // For specific resource monitoring (e.g., launch resources)
        this.resourceChangeListeners = {};
        
        // Flag to disable victory checking during rewards screen
        this.victoryCheckEnabled = true;
    }
    
    // Apply testing mode resources if testing mode is enabled
    applyTestingModeResources() {
        if (levelManager.LEVEL_PROGRESS.testingMode) {
            // Add 100 of each resource for testing
            this.resources[RESOURCES.DRONES] = (this.resources[RESOURCES.DRONES] || 0) + 100;
            this.resources[RESOURCES.ENERGY] = (this.resources[RESOURCES.ENERGY] || 0) + 100;
            this.resources[RESOURCES.CONCRETE] = (this.resources[RESOURCES.CONCRETE] || 0) + 100;
            this.resources[RESOURCES.IRON] = (this.resources[RESOURCES.IRON] || 0) + 100;
            this.resources[RESOURCES.WATER] = (this.resources[RESOURCES.WATER] || 0) + 100;
            this.resources[RESOURCES.STEEL] = (this.resources[RESOURCES.STEEL] || 0) + 100;
            this.resources[RESOURCES.FUEL] = (this.resources[RESOURCES.FUEL] || 0) + 100;
            
            console.log('Testing mode enabled: Added 100 of each resource');
        }
    }
    
    // Add a listener for changes to a specific resource
    addResourceChangeListener(resourceType, callback) {
        if (!this.resourceChangeListeners[resourceType]) {
            this.resourceChangeListeners[resourceType] = [];
        }
        this.resourceChangeListeners[resourceType].push(callback);
    }
    
    // Remove a listener
    removeResourceChangeListener(resourceType, callback) {
        if (!this.resourceChangeListeners[resourceType]) return;
        const index = this.resourceChangeListeners[resourceType].indexOf(callback);
        if (index !== -1) {
            this.resourceChangeListeners[resourceType].splice(index, 1);
        }
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
        
        const oldAmount = this.resources[resourceType];
        this.resources[resourceType] += amount;
        const newAmount = this.resources[resourceType];
        
        // Notify UI for updates
        if (this.onResourceChange) {
            this.onResourceChange(resourceType, newAmount);
        }
        
        // Notify any specific listeners for this resource
        if (this.resourceChangeListeners[resourceType] && this.resourceChangeListeners[resourceType].length > 0) {
            this.resourceChangeListeners[resourceType].forEach(callback => {
                callback(resourceType, oldAmount, newAmount);
            });
        }
        
        // Check for victory condition when reputation increases - only if enabled
        if (resourceType === RESOURCES.REPUTATION && this.victoryCheckEnabled) {
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
        // Skip if victory checking is disabled
        if (!this.victoryCheckEnabled) return;
        
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
    
    // Enable or disable victory checking
    setVictoryCheckEnabled(enabled) {
        this.victoryCheckEnabled = enabled;
    }
} 