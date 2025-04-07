// Game configuration data
export const GRID_SIZE = 9; // Initial grid size (configurable)
export const CELL_SIZE = 64; // Size of each grid cell in pixels
export const MAX_TURNS = 30; // Game ends after this many turns
export const MAX_HAND_SIZE = 6; // Maximum cards in hand
export const MAX_CARD_SLOTS = 8; // Maximum slots to display in the UI

// The amount of reputation needed to win the game
export const VICTORY_GOAL = 10;

// Resource types
export const RESOURCES = {
    IRON: 'iron',
    STEEL: 'steel',
    CONCRETE: 'concrete',
    WATER: 'water',
    FUEL: 'fuel',
    DRONES: 'drones',
    ENERGY: 'energy',
    REPUTATION: 'reputation'
};

// Initial resource values when game starts
export const STARTING_RESOURCES = {
    [RESOURCES.IRON]: 0,
    [RESOURCES.STEEL]: 200, 
    [RESOURCES.CONCRETE]: 20,
    [RESOURCES.WATER]: 0,
    [RESOURCES.FUEL]: 100,
    [RESOURCES.DRONES]: 10,
    [RESOURCES.ENERGY]: 0,
    [RESOURCES.REPUTATION]: 0
};

// Terrain types and their properties
export const TERRAIN_TYPES = {
    PLAIN: {
        id: 'plain',
        name: 'Plain Ground',
        description: 'Regular Martian surface',
        texture: 'terrainPlain1'
    }
};

// Terrain features that can be placed on terrain
export const TERRAIN_FEATURES = {
    METAL: {
        id: 'metal',
        name: 'Metal Deposit',
        description: 'Rich in iron ore',
        textures: ['ironDeposit1', 'ironDeposit2', 'ironDeposit3'],
        texture: 'ironDeposit1' // Default texture for UI
    },
    WATER: {
        id: 'water',
        name: 'Water Deposit',
        description: 'Frozen water under the surface',
        texture: 'waterDeposit'
    },
    MOUNTAIN: {
        id: 'mountain',
        name: 'Mountain',
        description: 'Rough terrain, difficult to build on',
        textures: ['mountainTile1', 'mountainTile2'],
        texture: 'mountainTile1' // Default texture for UI
    }
};

// Building definitions
export const BUILDINGS = {
    DRONE_DEPO: {
        id: 'droneDepo',
        name: 'Drone Depo',
        shortName: 'Drone Depo',
        description: 'Produces drones immediately when built',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
        },
        production: {
            [RESOURCES.DRONES]: 7
        },
        consumption: {},
        terrainRequirement: null, // Can be built anywhere
        texture: 'droneDepo',
        createCard: true
    },
    IRON_MINE: {
        id: 'ironMine',
        name: 'Iron Mine',
        shortName: 'Iron Mine',
        description: 'Extracts iron from metal deposits',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 2,
            [RESOURCES.ENERGY]: 1
        },
        production: {
            [RESOURCES.IRON]: 3
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.METAL.id,
        texture: 'ironMine',
        createCard: true
    },
    STEELWORKS: {
        id: 'steelworks',
        name: 'Steelworks',
        shortName: 'Steelworks',
        description: 'Converts iron to steel each turn, requires iron',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 3
        },
        production: {
            [RESOURCES.STEEL]: 1
        },
        consumption: {
            [RESOURCES.IRON]: 2
        },
        terrainRequirement: null,
        texture: 'steelworks',
        createCard: true
    },
    CONCRETE_HARVESTER: {
        id: 'concreteMixer',
        name: 'Concrete Harvester',
        shortName: 'Concrete',
        description: 'Produces concrete from regolith each turn',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 3,
            [RESOURCES.ENERGY]: 1
        },
        production: {
            [RESOURCES.CONCRETE]: 3
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'concreteMixer',
        createCard: true
    },
    WATER_PUMP: {
        id: 'waterPump',
        name: 'Water Pump',
        shortName: 'Water Pump',
        description: 'Extracts water from deposits each turn',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 1
        },
        production: {
            [RESOURCES.WATER]: 3
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.WATER.id,
        texture: 'waterPump',
        createCard: true
    },
    FUEL_REFINERY: {
        id: 'fuelRefinery',
        name: 'Fuel Refinery',
        shortName: 'Fuel',
        description: 'Converts water to rocket fuel each turn',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 2
        },
        production: {
            [RESOURCES.FUEL]: 1
        },
        consumption: {
            [RESOURCES.WATER]: 2
        },
        terrainRequirement: null,
        texture: 'fuelRefinery',
        createCard: true
    },
    WIND_TURBINE: {
        id: 'windTurbine',
        name: 'Wind Turbine',
        shortName: 'Wind',
        description: 'Generates energy immediately when built',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.STEEL]: 1
        },
        production: {
            [RESOURCES.ENERGY]: 6
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'windTurbine',
        createCard: true
    },
    SOLAR_PANELS: {
        id: 'solarPanel',
        name: 'Solar Panels',
        shortName: 'Solar',
        description: 'Generates energy immediately when built',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.ENERGY]: 3
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'solarPanel',
        createCard: true
    },
    LAUNCH_PAD: {
        id: 'launchPad',
        name: 'Launch Pad',
        shortName: 'Launcher',
        description: 'Allows manual rocket launches for reputation. Rockets return after 1 turn.',
        cost: {
            [RESOURCES.CONCRETE]: 4,
            [RESOURCES.STEEL]: 3,
            [RESOURCES.DRONES]: 1
        },
        production: {
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'launchPad',
        // Rocket launch costs
        launchCost: {
            [RESOURCES.FUEL]: 10,
            [RESOURCES.STEEL]: 10
        },
        // Reputation earned per launch
        launchReward: 10,
        createCard: true
    },
    LAUNCH_PAD_SURROUNDING: {
        id: 'launchPadSurrounding',
        name: 'Launch Pad Surrounding',
        shortName: 'Launch Area',
        description: 'Part of the launch pad area, cannot be built on',
        cost: {}, // No cost as it's placed automatically
        production: {},
        consumption: {},
        terrainRequirement: null,
        texture: 'launchPadSurrounding', // Now using its own unique texture
        createCard: false
    },
    WIND_TURBINE_SURROUNDING: {
        id: 'windTurbineSurrounding',
        name: 'Wind Turbine Surrounding',
        shortName: 'Wind Area',
        description: 'Part of the wind turbine area, cannot be built on',
        cost: {}, // No cost as it's placed automatically
        production: {},
        consumption: {},
        terrainRequirement: null,
        texture: 'windTurbineSurrounding',
        createCard: false
    }
};

// Deck composition - defines how many copies of each card type will be in the deck
export const DECK_COMPOSITION = {
    // Format: buildingId: numberOfCopies
    'droneDepo': 3,       // More drone depos for early resource generation
    'ironMine': 5,        // Regular resource production buildings
    'steelworks': 3,
    'concreteMixer': 5,
    'waterPump': 5,
    'fuelRefinery': 3,
    'windTurbine': 4,     // More wind turbines for energy generation
    'solarPanel': 4,      // More solar panels for energy generation
    'launchPad': 1        // Only one launch pad as it's a special building
};

// Starting hand configuration - specific cards to always include in starting hand
export const STARTING_HAND = {
    // Format: buildingId: true/false
    'droneDepo': true,   // Always include drone depo in starting hand
    'windTurbine': true, // Always include wind turbine in starting hand
    'launchPad': true    // Always include launch pad in starting hand
}; 