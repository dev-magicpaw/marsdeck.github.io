import { RESOURCES } from '../config/game-data';

export default class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        this.resources = {
            [RESOURCES.IRON]: 0,
            [RESOURCES.STEEL]: 10, // Starting resources
            [RESOURCES.CONCRETE]: 10,
            [RESOURCES.WATER]: 0,
            [RESOURCES.FUEL]: 0,
            [RESOURCES.DRONES]: 10,
            [RESOURCES.ENERGY]: 0,
            [RESOURCES.REPUTATION]: 0
        };
        
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
        
        return true;
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
            this.modifyResource(resourceType, -costObject[resourceType]);
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