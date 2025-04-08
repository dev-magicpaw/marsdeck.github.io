import { GAME_LEVELS } from '../config/level-configs';
import { LEVEL_2_MAP, RESOURCE_RICH_MAP, SAMPLE_MAP, TUTORIAL_MAP } from '../config/map-configs';

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
  }

  // Helper function to get current level configuration
  getCurrentLevel() {
    const currentLevelId = this.LEVEL_PROGRESS.currentLevelId;
    return GAME_LEVELS.find(level => level.id === currentLevelId);
  }

  // Helper function to get map configuration for current level
  getMapForCurrentLevel() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return null;
    
    // Return the actual map configuration based on the mapId
    switch (currentLevel.mapId) {
      case 'SAMPLE_MAP':
        return SAMPLE_MAP;
      case 'LEVEL_2_MAP':
        return LEVEL_2_MAP;
      case 'RESOURCE_RICH_MAP':
        return RESOURCE_RICH_MAP;
      case 'TUTORIAL_MAP':
        return TUTORIAL_MAP;
      default:
        return SAMPLE_MAP;
    }
  }

  // Helper function to advance to the next level
  advanceToNextLevel() {
    const currentLevel = this.getCurrentLevel();
    if (currentLevel && currentLevel.nextLevelId) {
      // Mark current level as completed
      this.LEVEL_PROGRESS.completedLevels[currentLevel.id] = true;
      
      // Add rewards to persistent rewards
      if (currentLevel.rewards) {
        // Initialize rewardIds array if it doesn't exist
        if (!this.LEVEL_PROGRESS.persistentRewards.rewardIds) {
          this.LEVEL_PROGRESS.persistentRewards.rewardIds = [];
        }
        
        // Add reward IDs
        if (currentLevel.rewards.rewardIds) {
          this.LEVEL_PROGRESS.persistentRewards.rewardIds.push(...currentLevel.rewards.rewardIds);
        }
        
        // Add resource rewards
        if (currentLevel.rewards.resources) {
          if (!this.LEVEL_PROGRESS.persistentRewards.resourceBonuses) {
            this.LEVEL_PROGRESS.persistentRewards.resourceBonuses = {};
          }
          
          for (const [resource, amount] of Object.entries(currentLevel.rewards.resources)) {
            this.LEVEL_PROGRESS.persistentRewards.resourceBonuses[resource] = 
              (this.LEVEL_PROGRESS.persistentRewards.resourceBonuses[resource] || 0) + amount;
          }
        }
      }
      
      // Unlock and set next level as current
      this.LEVEL_PROGRESS.unlockedLevels.push(currentLevel.nextLevelId);
      this.LEVEL_PROGRESS.currentLevelId = currentLevel.nextLevelId;
      
      return true;
    }
    return false;
  }

  // Helper function to get starting resources with persistent bonuses applied
  getStartingResourcesForCurrentLevel() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return null;
    
    const startingResources = {...currentLevel.startingResources};
    
    // Apply persistent resource bonuses
    for (const [resource, bonus] of Object.entries(this.LEVEL_PROGRESS.persistentRewards.resourceBonuses)) {
      if (startingResources[resource] !== undefined) {
        startingResources[resource] += bonus;
      }
    }
    
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