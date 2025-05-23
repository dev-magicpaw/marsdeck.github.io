import { RESOURCES, REWARDS } from './game-data';

export const FINAL_LEVEL_MAP = 'level5';
// Level progression configuration
export const GAME_LEVELS = [
  {
    id: 'level1',
    name: 'Brave New World',
    description: 'Learn the basics of colony building',
    mapId: 'TUTORIAL_MAP',
    turnLimit: 20,
    reputationGoal: 10,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 30,
      [RESOURCES.CONCRETE]: 30,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 0,
      [RESOURCES.DRONES]: 0,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.IRON_MINE_PREFAB_STARTING_REWARD.id,
        REWARDS.STARTING_HAND_REWARDS.RESOURCE_SUPPLY_EVENT_STARTING_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.IMPROVED_ELECTRIC_GENERATION.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level2'
  },
  {
    id: 'level2',
    name: 'First Steps',
    description: 'Establish your first sustainable colony',
    mapId: 'LEVEL_2_MAP',
    turnLimit: 20,
    reputationGoal: 20,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 10,
      [RESOURCES.CONCRETE]: 15,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 0,
      [RESOURCES.DRONES]: 0,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.STEELWORKS_PREFAB_STARTING_REWARD.id,
        REWARDS.STARTING_HAND_REWARDS.BARTER_EVENT_STARTING_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.FUEL_COMPRESSOR.id
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
    mapId: 'LEVEL_3_MAP',
    turnLimit: 20,
    reputationGoal: 30,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 10,
      [RESOURCES.CONCRETE]: 15,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 0,
      [RESOURCES.DRONES]: 0,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.TESLA_COIL_PREFAB_STARTING_REWARD.id,
        REWARDS.STARTING_HAND_REWARDS.RAW_EXPORT_EVENT_STARTING_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.IMPROVED_LAUNCH_PAD.id
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: 'level4'
  },
  {
    id: 'level4',
    name: 'Rocky Road',
    description: 'Develop a colony in a rocky environment',
    mapId: 'LEVEL_4_MAP',
    turnLimit: 20,
    reputationGoal: 40,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 10,
      [RESOURCES.CONCRETE]: 10,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 0,
      [RESOURCES.DRONES]: 0,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.DECK_CARDS_REWARDS.ARTIFICIAL_LIGHTS_DECK_REWARD.id,
        REWARDS.STARTING_HAND_REWARDS.CHARITY_EVENT_STARTING_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.HEAVY_LAUNCH_PAD.id
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
    description: 'Build a massive colony on an open plain',
    mapId: 'LEVEL_5_MAP',  // You might want to create a new map for this level
    turnLimit:25,
    reputationGoal: 90,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 10,
      [RESOURCES.CONCRETE]: 10,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 0,
      [RESOURCES.DRONES]: 0,
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.DRONE_EVENT_STARTING_REWARD.id,
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: null // Last level for now
  }
]; 