import { BUILDINGS, CARD_TYPES } from '../config/game-data';

export default class BuildingActionManager {
    constructor(scene) {
        this.scene = scene;
        this.actionCooldowns = {}; // Format: {cellId: {actionId: turnsRemaining}}
    }
    
    // Get building actions from the building configuration
    getBuildingActions(buildingId) {
        const building = Object.values(BUILDINGS).find(b => b.id === buildingId);
        if (!building) return [];
        
        // Look for actions in the card definition instead (since that's where they're defined)
        const card = Object.values(CARD_TYPES).find(c => c.buildingId === buildingId);
        if (!card || !card.effects) return [];
        
        return card.effects.filter(effect => effect.type === 'action');
    }
    
    // Check if an action is on cooldown
    isActionOnCooldown(x, y, actionId) {
        const cellId = `${x},${y}`;
        return this.actionCooldowns[cellId]?.[actionId] > 0;
    }
    
    // Get remaining cooldown turns
    getActionCooldown(x, y, actionId) {
        const cellId = `${x},${y}`;
        return this.actionCooldowns[cellId]?.[actionId] || 0;
    }
    
    // Perform an action
    performAction(x, y, action) {
        // Check if valid action
        if (!action || action.type !== 'action') return false;
        
        // Check if on cooldown
        if (this.isActionOnCooldown(x, y, action.action)) {
            this.scene.uiScene.showMessage(`Action is on cooldown for ${this.getActionCooldown(x, y, action.action)} more turns`);
            return false;
        }
        
        // Check resource requirements
        if (!this.scene.resourceManager.hasSufficientResources(action.cost)) {
            this.scene.uiScene.showMessage("Not enough resources for this action");
            return false;
        }
        
        // Apply action cooldown
        if (action.cooldown) {
            const cellId = `${x},${y}`;
            if (!this.actionCooldowns[cellId]) this.actionCooldowns[cellId] = {};
            this.actionCooldowns[cellId][action.action] = action.cooldown;
        }
        
        // Consume resources
        for (const resource in action.cost) {
            this.scene.resourceManager.modifyResource(resource, -action.cost[resource]);
        }
        
        // Apply action effects
        for (const effect of action.effects || []) {
            if (effect.type === 'addResource') {
                this.scene.resourceManager.modifyResource(effect.resource, effect.amount);
            }
            // Add other effect types as needed
        }
        
        // Trigger specific action handling (like animations)
        if (action.action === 'launchRocket') {
            this.scene.gridManager.launchRocket(x, y);
            // We'll trigger the rocket animation
            this.scene.animateRocketLaunch(x, y);
        }
        
        // Show message about the action
        this.scene.uiScene.showMessage(`${action.name} action executed!`);
        
        // Update UI
        this.scene.uiScene.refreshUI();
        
        return true;
    }
    
    // Process end of turn for cooldowns
    processTurnEnd() {
        // Reduce all cooldowns by 1
        for (const cellId in this.actionCooldowns) {
            for (const actionId in this.actionCooldowns[cellId]) {
                this.actionCooldowns[cellId][actionId]--;
                if (this.actionCooldowns[cellId][actionId] <= 0) {
                    delete this.actionCooldowns[cellId][actionId];
                }
            }
            // Clean up empty entries
            if (Object.keys(this.actionCooldowns[cellId]).length === 0) {
                delete this.actionCooldowns[cellId];
            }
        }
    }
} 