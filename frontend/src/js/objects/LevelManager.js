import { GAME_LEVELS } from '../config/level-configs';
import * as MapConfigs from '../config/map-configs';

class LevelManager {
  constructor() {
    // Progress tracking
    this.LEVEL_PROGRESS = {
      completedLevels: {},
      unlockedLevels: ['level1'],
      currentLevelId: 'level1',
      persistentRewards: {
        rewardIds: [], // Array of reward IDs that player has permanently unlocked
        resourceBonuses: {} // Permanently increased starting resources
      }
    };
    
    // Store all available maps from the imported MapConfigs
    this.availableMaps = {};
    
    // Extract all exported maps from MapConfigs
    for (const key in MapConfigs) {
      if (key !== '__esModule') {  // Skip the __esModule flag
        // Convert export name to expected mapId format
        // For example: SAMPLE_MAP export becomes 'SAMPLE_MAP' mapId
        const mapId = key;
        this.availableMaps[mapId] = MapConfigs[key];
      }
    }
  }

  // Helper function to get current level configuration
  getCurrentLevel() {
    const currentLevelId = this.LEVEL_PROGRESS.currentLevelId;
    
    // First check if this is a custom random level
    if (currentLevelId.startsWith('random_') && this.LEVEL_PROGRESS.customLevel) {
      return this.LEVEL_PROGRESS.customLevel;
    }
    
    // Otherwise, find the level in the predefined levels
    return GAME_LEVELS.find(level => level.id === currentLevelId);
  }

  // Helper function to get map configuration for current level
  getMapForCurrentLevel() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return null;
    
    const mapId = currentLevel.mapId;
    
    // Look up the map by ID directly in our dynamic collection
    const map = this.availableMaps[mapId];
    
    // If the map doesn't exist, log a warning and return a default map
    if (!map) {
      console.warn(`Map with ID "${mapId}" not found. Using default map.`);
      return this.availableMaps['SAMPLE_MAP']; // Return default map
    }
    
    return map;
  }

  // Helper function to advance to the next level or handle random levels
  advanceToNextLevel() {
    const currentLevel = this.getCurrentLevel();
    
    // Special handling for random levels
    if (currentLevel && currentLevel.isRandom) {
      // Mark the current random level as completed
      this.LEVEL_PROGRESS.completedLevels[currentLevel.id] = true;
      
      // Increment the counter for random levels completed
      if (!this.LEVEL_PROGRESS.randomLevelsCompleted) {
        this.LEVEL_PROGRESS.randomLevelsCompleted = 1;
      } else {
        this.LEVEL_PROGRESS.randomLevelsCompleted++;
      }
      
      // Don't set nextLevelId since player will return to level select
      return true;
    }
    
    // Handle standard levels
    if (currentLevel && currentLevel.nextLevelId) {
      // Mark current level as completed
      this.LEVEL_PROGRESS.completedLevels[currentLevel.id] = true;
      
      // Unlock and set next level as current
      this.LEVEL_PROGRESS.unlockedLevels.push(currentLevel.nextLevelId);
      this.LEVEL_PROGRESS.currentLevelId = currentLevel.nextLevelId;
      
      return true;
    }
    return false;
  }
  
  // Get the available rewards for the most recently completed level
  getAvailableRewards() {
    // Find the most recently completed level
    const completedLevelIds = Object.keys(this.LEVEL_PROGRESS.completedLevels);
    if (completedLevelIds.length === 0) {
      return null;
    }
    
    // Get the level that was completed just before the current level
    const previousLevelId = completedLevelIds.find(levelId => {
      const level = GAME_LEVELS.find(l => l.id === levelId);
      return level && level.nextLevelId === this.LEVEL_PROGRESS.currentLevelId;
    });
    
    if (!previousLevelId) {
      return null;
    }
    
    // Return the rewards from that level
    const previousLevel = GAME_LEVELS.find(level => level.id === previousLevelId);
    return previousLevel ? previousLevel.rewards : null;
  }

  // Helper function to get starting resources with persistent bonuses applied
  getStartingResourcesForCurrentLevel() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return null;
    
    const startingResources = {...currentLevel.startingResources};
    return startingResources;
  }

  // Helper function to get current victory goal (reputation needed)
  getCurrentVictoryGoal() {
    const currentLevel = this.getCurrentLevel();
    return currentLevel.reputationGoal;
  }

  // Helper function to get current turn limit
  getCurrentTurnLimit() {
    const currentLevel = this.getCurrentLevel();
    return currentLevel.turnLimit;
  }

  // Helper function to check if a specific reward ID is part of persistent rewards
  isRewardPersistentlyUnlocked(rewardId) {
    return this.LEVEL_PROGRESS.persistentRewards.rewardIds.includes(rewardId);
  }

  // Save level progress to localStorage
  saveLevelProgress() {
    localStorage.setItem('levelProgress', JSON.stringify(this.LEVEL_PROGRESS));
  }

  // Load level progress from localStorage
  loadLevelProgress() {
    const savedProgress = localStorage.getItem('levelProgress');
    if (savedProgress) {
      Object.assign(this.LEVEL_PROGRESS, JSON.parse(savedProgress));
      return true;
    }
    return false;
  }
}

// Create and export a singleton instance
const levelManager = new LevelManager();
export default levelManager; 