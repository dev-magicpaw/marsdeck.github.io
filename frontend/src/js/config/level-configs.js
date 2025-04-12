import { RESOURCES, REWARDS } from './game-data';

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
      [RESOURCES.STEEL]: 100, //30
      [RESOURCES.CONCRETE]: 30,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 50, //0
      [RESOURCES.DRONES]: 5, //0
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.IRON_MINE_PREFAB_STARTING_REWARD.id,
        REWARDS.DECK_CARDS_REWARDS.RESOURCE_SUPPLY_EVENT_DECK_REWARD.id,
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
    turnLimit: 20,
    reputationGoal: 20,
    startingResources: {
      [RESOURCES.IRON]: 0,
      [RESOURCES.STEEL]: 30, // 10
      [RESOURCES.CONCRETE]: 15,
      [RESOURCES.WATER]: 0,
      [RESOURCES.FUEL]: 50, // 0
      [RESOURCES.DRONES]: 1, // 0
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.STEELWORKS_PREFAB_STARTING_REWARD.id,
        REWARDS.DECK_CARDS_REWARDS.BARTER_EVENT_DECK_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.EFFICIENT_SUPPLY_CHAIN.id
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
        REWARDS.DECK_CARDS_REWARDS.DRONE_EVENT_DECK_REWARD.id
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
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.STARTING_HAND_REWARDS.IRON_MINE_PREFAB_STARTING_REWARD.id,
        REWARDS.DECK_CARDS_REWARDS.RESOURCE_SUPPLY_EVENT_DECK_REWARD.id,
        REWARDS.BUILDING_UPGRADE_REWARDS.EFFICIENT_SUPPLY_CHAIN.id
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
      [RESOURCES.ENERGY]: 0,
      [RESOURCES.REPUTATION]: 0
    },
    rewards: {
      rewardIds: [
        REWARDS.DECK_CARDS_REWARDS.DRONE_EVENT_DECK_REWARD.id,
      ],
      resources: {
        // Don't add any resources for this level
      }
    },
    nextLevelId: null // Last level for now
  }
]; 