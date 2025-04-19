import { RESOURCES } from '../config/game-data';
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
  
  // Generate a randomly configured level with progressive difficulty
  generateRandomLevel() {
    // Calculate difficulty based on how many random levels have been played
    const randomLevelsPlayed = this.LEVEL_PROGRESS.randomLevelsCompleted || 0;
    const difficulty = Math.min(1 + (randomLevelsPlayed * 0.1), 2); // Scale from 1.0 to 2.0
    
    // Generate random level id
    const randomId = 'random_' + Date.now();
    
    // Select a random map from existing maps
    const mapIds = ['LEVEL_1_MAP', 'LEVEL_2_MAP', 'LEVEL_3_MAP', 'LEVEL_4_MAP', 'LEVEL_5_MAP'];
    const randomMapIndex = Math.floor(Math.random() * mapIds.length);
    const mapId = mapIds[randomMapIndex];
    
    // Generate reputation goal based on difficulty (15-150)
    const reputationGoal = Math.floor(15 + (randomLevelsPlayed * 5) + (Math.random() * 10));
    
    // Generate turn limit (20-30)
    const turnLimit = Math.floor(20 + (Math.random() * 10));
    
    // Create level name
    const locationNames = [
        'Olympus Mons', 'Valles Marineris', 'Syrtis Major', 'Hellas Basin', 
        'Arsia Mons', 'Elysium Planitia', 'Tharsis Ridge', 'Utopia Planitia',
        'Meridiani Planum', 'Arcadia Planitia', 'Terra Cimmeria', 'Amazonis Planitia'
    ];
    const locationIndex = Math.floor(Math.random() * locationNames.length);
    const location = locationNames[locationIndex];
    
    const levelTypes = [
        'Outpost', 'Settlement', 'Mining Colony', 'Research Base', 
        'Habitat Dome', 'Supply Depot', 'Frontier Base', 'Command Center'
    ];
    const typeIndex = Math.floor(Math.random() * levelTypes.length);
    const levelType = levelTypes[typeIndex];
    
    // Create random level config
    const randomLevel = {
        id: randomId,
        name: `${location} ${levelType}`,
        description: `Challenge level: ${randomLevelsPlayed + 1}`,
        mapId: mapId,
        turnLimit: turnLimit,
        reputationGoal: reputationGoal,
        startingResources: {
            [RESOURCES.IRON]: 0,
            [RESOURCES.STEEL]: Math.floor(10 / difficulty),
            [RESOURCES.CONCRETE]: Math.floor(10 / difficulty),
            [RESOURCES.WATER]: 0,
            [RESOURCES.FUEL]: 0,
            [RESOURCES.DRONES]: 0,
            [RESOURCES.ENERGY]: 0,
            [RESOURCES.REPUTATION]: 0
        },
        rewards: {
            rewardIds: [],
            resources: {}
        },
        nextLevelId: null,
        isRandom: true
    };
    
    // Set this as the current level
    this.LEVEL_PROGRESS.currentLevelId = randomId;
    this.LEVEL_PROGRESS.customLevel = randomLevel;
    
    // Initialize the counter if it doesn't exist
    if (!this.LEVEL_PROGRESS.randomLevelsCompleted) {
        this.LEVEL_PROGRESS.randomLevelsCompleted = 0;
    }
    
    // Save to level manager
    this.saveLevelProgress();
    
    return randomLevel;
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