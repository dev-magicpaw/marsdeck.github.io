// Game configuration data
export const GRID_SIZE = 9; // Initial grid size (configurable)
export const CELL_SIZE = 64; // Size of each grid cell in pixels
export const MAX_TURNS = 30; // Game ends after this many turns
export const MAX_HAND_SIZE = 6; // Maximum cards in hand

// Resource types
export const RESOURCES = {
    IRON: 'iron',
    STEEL: 'steel',
    CONCRETE: 'concrete',
    WATER: 'water',
    FUEL: 'fuel',
    DRONES: 'drones',
    ENERGY: 'energy',
    VICTORY_POINTS: 'victoryPoints'
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
        description: 'Produces drones for construction',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 2
        },
        production: {
            [RESOURCES.DRONES]: 1
        },
        consumption: {},
        terrainRequirement: null, // Can be built anywhere
        texture: 'droneDepo'
    },
    IRON_MINE: {
        id: 'ironMine',
        name: 'Iron Mine',
        shortName: 'Iron Mine',
        description: 'Extracts iron from metal deposits',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.IRON]: 2
        },
        consumption: {
            [RESOURCES.ENERGY]: 1
        },
        terrainRequirement: TERRAIN_FEATURES.METAL.id,
        texture: 'ironMine'
    },
    STEELWORKS: {
        id: 'steelworks',
        name: 'Steelworks',
        shortName: 'Steelworks',
        description: 'Converts iron to steel',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.STEEL]: 1
        },
        consumption: {
            [RESOURCES.IRON]: 2,
            [RESOURCES.ENERGY]: 1
        },
        terrainRequirement: null,
        texture: 'steelworks'
    },
    CONCRETE_HARVESTER: {
        id: 'concreteMixer',
        name: 'Concrete Harvester',
        shortName: 'Concrete',
        description: 'Produces concrete from regolith',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.CONCRETE]: 2
        },
        consumption: {
            [RESOURCES.ENERGY]: 1
        },
        terrainRequirement: null,
        texture: 'concreteMixer'
    },
    WATER_PUMP: {
        id: 'waterPump',
        name: 'Water Pump',
        shortName: 'Water Pump',
        description: 'Extracts water from deposits',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.WATER]: 2
        },
        consumption: {
            [RESOURCES.ENERGY]: 1
        },
        terrainRequirement: TERRAIN_FEATURES.WATER.id,
        texture: 'waterPump'
    },
    FUEL_REFINERY: {
        id: 'fuelRefinery',
        name: 'Fuel Refinery',
        shortName: 'Fuel',
        description: 'Converts water to rocket fuel',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 2
        },
        production: {
            [RESOURCES.FUEL]: 1
        },
        consumption: {
            [RESOURCES.WATER]: 2,
            [RESOURCES.ENERGY]: 2
        },
        terrainRequirement: null,
        texture: 'fuelRefinery'
    },
    WIND_TURBINE: {
        id: 'windTurbine',
        name: 'Wind Turbine',
        shortName: 'Wind',
        description: 'Generates energy from wind',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.ENERGY]: 2
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'windTurbine'
    },
    SOLAR_PANELS: {
        id: 'solarPanel',
        name: 'Solar Panels',
        shortName: 'Solar',
        description: 'Generates energy from sunlight',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
        production: {
            [RESOURCES.ENERGY]: 2
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'solarPanel'
    },
    LAUNCH_PAD: {
        id: 'launchPad',
        name: 'Launch Pad',
        shortName: 'Launcher',
        description: 'Allows rocket launches for victory points',
        cost: {
            [RESOURCES.CONCRETE]: 4,
            [RESOURCES.STEEL]: 3,
            [RESOURCES.DRONES]: 2
        },
        production: {
            [RESOURCES.VICTORY_POINTS]: 0 // Special case - handled by game logic
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'launchPad'
    }
}; 