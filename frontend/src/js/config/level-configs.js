import { RESOURCES, REWARDS } from './game-data';
import { LEVEL_2_MAP, RESOURCE_RICH_MAP, SAMPLE_MAP, TUTORIAL_MAP } from './map-configs';

// Level progression configuration
export const GAME_LEVELS = [
  {
    id: 'level1',
    name: 'Tutorial Colony',
    description: 'Learn the basics of colony building',
    mapId: 'SAMPLE_MAP',
    turnLimit: 20,
    reputationGoal: 10,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 100,
      [RESOURCES.CONCRETE]: 10,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 50,
      [RESOURCES.DRONES]: 5,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.CONCRETE_CARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.IMPROVED_WIND_TURBINE.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level2'
  },
  {
    id: 'level2',
    name: 'First Settlement',
    description: 'Establish your first sustainable colony',
    mapId: 'SAMPLE_MAP',
    turnLimit: 25,
    reputationGoal: 8,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 150,
      [RESOURCES.CONCRETE]: 15,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 75,
      [RESOURCES.DRONES]: 8,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.DECK_CARDS_REWARDS.EXTRA_FUEL_REFINERIES.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level3'
  },
  {
    id: 'level3',
    name: 'Expanding Horizons',
    description: 'Grow your colony into a thriving settlement',
    mapId: 'LEVEL_2_MAP',
    turnLimit: 30,
    reputationGoal: 10,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 200,
      [RESOURCES.CONCRETE]: 20,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 100,
      [RESOURCES.DRONES]: 10,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.DECK_CARDS_REWARDS.EXTRA_LAUNCH_PAD.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level4'
  },
  {
    id: 'level4',
    name: 'Advanced Colony',
    description: 'Develop advanced infrastructure and technology',
    mapId: 'RESOURCE_RICH_MAP',
    turnLimit: 35,
    reputationGoal: 15,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 250,
      [RESOURCES.CONCRETE]: 30,
      [RESOURCES.WATER]: 10,
      [RESOURCES.FUEL]: 120,
      [RESOURCES.DRONES]: 15,
      [RESOURCES.ENERGY]: 5,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.STEELWORKS_CARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.EFFICIENT_IRON_MINE.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level5'
  },
  {
    id: 'level5',
    name: 'Metropolis',
    description: 'Build a massive, self-sustaining Mars metropolis',
    mapId: 'SAMPLE_MAP',  // You might want to create a new map for this level
    turnLimit: 40,
    reputationGoal: 20,
    startingResources: {
      [RESOURCES.IRON]: 20,
      [RESOURCES.STEEL]: 300,
      [RESOURCES.CONCRETE]: 50,
      [RESOURCES.WATER]: 30,
      [RESOURCES.FUEL]: 150,
      [RESOURCES.DRONES]: 20,
      [RESOURCES.ENERGY]: 10,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.DECK_CARDS_REWARDS.EXTRA_LAUNCH_PAD.id,
        REWARDS.DECK_CARDS_REWARDS.EXTRA_FUEL_REFINERIES.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: null // Last level for now
  }
];

// Progress tracking
export const LEVEL_PROGRESS = {
  completedLevels: {},
  unlockedLevels: ['level1'],
  currentLevelId: 'level1',
  persistentRewards: {
    rewardIds: [], // Array of reward IDs that player has permanently unlocked
    resourceBonuses: {} // Permanently increased starting resources
  }
};

// Helper function to get current level configuration
export function getCurrentLevel() {
  const currentLevelId = LEVEL_PROGRESS.currentLevelId;
  return GAME_LEVELS.find(level => level.id === currentLevelId);
}

// Helper function to get map configuration for current level
export function getMapForCurrentLevel() {
  const currentLevel = getCurrentLevel();
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
export function advanceToNextLevel() {
  const currentLevel = getCurrentLevel();
  if (currentLevel && currentLevel.nextLevelId) {
    // Mark current level as completed
    LEVEL_PROGRESS.completedLevels[currentLevel.id] = true;
    
    // Add rewards to persistent rewards
    if (currentLevel.rewards) {
      // Initialize rewardIds array if it doesn't exist
      if (!LEVEL_PROGRESS.persistentRewards.rewardIds) {
        LEVEL_PROGRESS.persistentRewards.rewardIds = [];
      }
      
      // Add reward IDs
      if (currentLevel.rewards.rewardIds) {
        LEVEL_PROGRESS.persistentRewards.rewardIds.push(...currentLevel.rewards.rewardIds);
      }
      
      // Add resource rewards
      if (currentLevel.rewards.resources) {
        if (!LEVEL_PROGRESS.persistentRewards.resourceBonuses) {
          LEVEL_PROGRESS.persistentRewards.resourceBonuses = {};
        }
        
        for (const [resource, amount] of Object.entries(currentLevel.rewards.resources)) {
          LEVEL_PROGRESS.persistentRewards.resourceBonuses[resource] = 
            (LEVEL_PROGRESS.persistentRewards.resourceBonuses[resource] || 0) + amount;
        }
      }
    }
    
    // Unlock and set next level as current
    LEVEL_PROGRESS.unlockedLevels.push(currentLevel.nextLevelId);
    LEVEL_PROGRESS.currentLevelId = currentLevel.nextLevelId;
    
    return true;
  }
  return false;
}

// Helper function to get starting resources with persistent bonuses applied
export function getStartingResourcesForCurrentLevel() {
  const currentLevel = getCurrentLevel();
  if (!currentLevel) return null;
  
  const startingResources = {...currentLevel.startingResources};
  
  // Apply persistent resource bonuses
  for (const [resource, bonus] of Object.entries(LEVEL_PROGRESS.persistentRewards.resourceBonuses)) {
    if (startingResources[resource] !== undefined) {
      startingResources[resource] += bonus;
    }
  }
  
  return startingResources;
}

// Helper function to get current victory goal (reputation needed)
export function getCurrentVictoryGoal() {
  const currentLevel = getCurrentLevel();
  return currentLevel.reputationGoal;
}

// Helper function to get current turn limit
export function getCurrentTurnLimit() {
  const currentLevel = getCurrentLevel();
  return currentLevel.turnLimit;
}

// Helper function to check if a specific reward ID is part of persistent rewards
export function isRewardPersistentlyUnlocked(rewardId) {
  return LEVEL_PROGRESS.persistentRewards.rewardIds.includes(rewardId);
}

// Save level progress to localStorage
export function saveLevelProgress() {
  localStorage.setItem('levelProgress', JSON.stringify(LEVEL_PROGRESS));
}

// Load level progress from localStorage
export function loadLevelProgress() {
  const savedProgress = localStorage.getItem('levelProgress');
  if (savedProgress) {
    Object.assign(LEVEL_PROGRESS, JSON.parse(savedProgress));
    return true;
  }
  return false;
} 