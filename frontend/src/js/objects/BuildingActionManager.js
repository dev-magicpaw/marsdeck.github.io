import { BUILDINGS, CARD_TYPES } from '../config/game-data';

export default class BuildingActionManager {
    constructor(scene) {
        this.scene = scene;
        this.rocketInFlight = {}; // Format: {cellId: true/false}
    }
    
    // Get building actions from the building configuration
    getBuildingActions(buildingId) {
        const building = Object.values(BUILDINGS).find(b => b.id === buildingId);
        if (!building) return [];
        
        let actions = [];
        
        // Look for actions in the card definition (since that's where they're defined)
        const card = Object.values(CARD_TYPES).find(c => c.buildingId === buildingId);
        if (card && card.effects) {
            actions = [...actions, ...card.effects.filter(effect => effect.type === 'action')];
        }
        
        // Also get additional actions from reward upgrades
        if (this.scene.rewardsManager) {
            const upgradeActions = this.scene.rewardsManager.getBuildingActions(buildingId);
            if (upgradeActions.length > 0) {
                actions = [...actions, ...upgradeActions];
            }
        }
        
        return actions;
    }
    
    // Check if an action is on cooldown - for launch actions, this just checks if the rocket is in flight
    isActionOnCooldown(x, y, actionId) {
        const cellId = `${x},${y}`;
        
        // If this is a launch action and there's a rocket in flight from this pad
        if (actionId === 'launchRocket' || actionId === 'FastLaunch') {
            // Log diagnostics to check the state
            console.log(`Launch action check for ${cellId}:`, {
                rocketInFlight: this.rocketInFlight[cellId],
                cell: this.scene.gridManager.getCell(x, y)
            });
            
            // The bug may be that rocketInFlight state isn't being properly cleared
            // Let's make sure it's in sync with the cell's hasRocket state
            const cell = this.scene.gridManager.getCell(x, y);
            if (cell && cell.hasRocket && this.rocketInFlight[cellId]) {
                // If the cell has a rocket but we still think it's in flight, fix the state
                console.warn("Found inconsistent rocket state for", cellId);
            }
            
            return this.rocketInFlight[cellId] === true;
        }
        
        return false;
    }
    
    // Get remaining cooldown turns - for launch actions, this is handled by GridManager
    getActionCooldown(x, y, actionId) {
        // For launch actions, we don't directly track cooldown here
        // Instead we check if there's a rocket in flight
        if (actionId === 'launchRocket' || actionId === 'FastLaunch') {
            const cellId = `${x},${y}`;
            if (this.rocketInFlight[cellId]) {
                // Check the GridManager to see when the rocket will return
                const rocketsInFlight = this.scene.gridManager.rocketsInFlight;
                for (const rocket of rocketsInFlight) {
                    if (rocket.x === x && rocket.y === y) {
                        console.log(`Rocket in flight for ${cellId}, returns in ${rocket.returnsAtTurn - this.scene.currentTurn} turns`);
                        return rocket.returnsAtTurn - this.scene.currentTurn;
                    }
                }
                return 1; // Default if we can't find the rocket
            }
        }
        
        return 0;
    }
    
    // Perform an action
    performAction(x, y, action) {
        // Check if valid action
        if (!action || action.type !== 'action') return false;
        
        // Check if on cooldown (rocket in flight for launch actions)
        if (this.isActionOnCooldown(x, y, action.action)) {
            const cooldownTurns = this.getActionCooldown(x, y, action.action);
            const message = action.action === 'FastLaunch' || action.action === 'launchRocket' 
                ? `Rocket in flight. Returns in ${cooldownTurns} turn${cooldownTurns > 1 ? 's' : ''}.`
                : `Action is on cooldown for ${cooldownTurns} more turns`;
            
            this.scene.uiScene.showMessage(message);
            return false;
        }
        
        // Check resource requirements
        if (!this.scene.resourceManager.hasSufficientResources(action.cost)) {
            this.scene.uiScene.showMessage("Not enough resources for this action");
            return false;
        }
        
        // Mark rocket as in flight for launch actions
        if (action.action === 'launchRocket' || action.action === 'FastLaunch') {
            const cellId = `${x},${y}`;
            this.rocketInFlight[cellId] = true;
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
        this.scene.gridManager.launchRocket(x, y, action.cooldown);
        const launchType = action.action === 'FastLaunch' ? 'fast' : 'regular';
        this.scene.animateRocketLaunch(x, y, launchType);
        
        // Show message about the action
        this.scene.uiScene.showMessage(`${action.name} action executed!`);
        
        // Update UI
        this.scene.uiScene.refreshUI();
        
        return true;
    }
    
    // Track when a rocket has returned to the pad
    clearRocketInFlight(x, y) {
        const cellId = `${x},${y}`;
        delete this.rocketInFlight[cellId];
    }
} 