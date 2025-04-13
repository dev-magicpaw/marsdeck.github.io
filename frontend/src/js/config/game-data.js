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
        description: 'Produces drones immediately when built. Adjacent buildings get +1 to each production resource.',
        production: {
            [RESOURCES.DRONES]: 7
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
        production: {
            [RESOURCES.IRON]: 3
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.METAL.id,
        texture: 'ironMine'
    },
    STEELWORKS: {
        id: 'steelworks',
        name: 'Steelworks',
        shortName: 'Steelworks',
        description: 'Converts iron to steel each turn, requires iron',
        production: {
            [RESOURCES.STEEL]: 1
        },
        consumption: {
            [RESOURCES.IRON]: 2
        },
        terrainRequirement: null,
        texture: 'steelworks'
    },
    CONCRETE_HARVESTER: {
        id: 'concreteMixer',
        name: 'Concrete Harvester',
        shortName: 'Concrete',
        description: 'Produces concrete from regolith each turn',
        production: {
            [RESOURCES.CONCRETE]: 3
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'concreteMixer'
    },
    WATER_PUMP: {
        id: 'waterPump',
        name: 'Water Pump',
        shortName: 'Water Pump',
        description: 'Extracts water from deposits each turn',
        production: {
            [RESOURCES.WATER]: 3
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.WATER.id,
        texture: 'waterPump'
    },
    FUEL_REFINERY: {
        id: 'fuelRefinery',
        name: 'Fuel Refinery',
        shortName: 'Fuel',
        description: 'Converts water to rocket fuel each turn',
        production: {
            [RESOURCES.FUEL]: 1
        },
        consumption: {
            [RESOURCES.WATER]: 2
        },
        terrainRequirement: null,
        texture: 'fuelRefinery'
    },
    WIND_TURBINE: {
        id: 'windTurbine',
        name: 'Wind Turbine',
        shortName: 'Wind',
        description: 'Generates energy immediately when built',
        production: {
            [RESOURCES.ENERGY]: 6
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'windTurbine'
    },
    SOLAR_PANELS: {
        id: 'solarPanel',
        name: 'Solar Panels',
        shortName: 'Solar',
        description: 'Generates energy immediately when built',
        production: {
            [RESOURCES.ENERGY]: 3
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'solarPanel'
    },
    LAUNCH_PAD: {
        id: 'launchPad',
        name: 'Launch Pad',
        shortName: 'Launcher',
        description: 'Allows manual rocket launches for reputation. Rockets return after 1 turn.',
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
        launchReward: 10
    },
    LAUNCH_PAD_SURROUNDING: {
        id: 'launchPadSurrounding',
        name: 'Launch Pad Surrounding',
        shortName: 'Launch Area',
        description: 'Part of the launch pad area, cannot be built on',
        production: {},
        consumption: {},
        terrainRequirement: null,
        texture: 'launchPadSurrounding' // Now using its own unique texture
    },
    WIND_TURBINE_SURROUNDING: {
        id: 'windTurbineSurrounding',
        name: 'Wind Turbine Surrounding',
        shortName: 'Wind Area',
        description: 'Part of the wind turbine area, cannot be built on',
        production: {},
        consumption: {},
        terrainRequirement: null,
        texture: 'windTurbineSurrounding'
    },
    TESLA_COIL: {
        id: 'teslaCoil',
        name: 'Tesla Coil',
        shortName: 'Tesla',
        description: 'Generates a lot of energy immediately when built. Must be placed on water deposits.',
        production: {
            [RESOURCES.ENERGY]: 15
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.WATER.id,
        texture: 'teslaCoil'
    }
};

// Card types definition - allows for more flexible card configuration
export const CARD_TYPES = {
    // Standard building cards
    DRONE_DEPO_CARD: {
        id: 'droneDepoCard',
        name: 'Drone Depo',
        description: 'Build a drone depo to produce drones and provide +1 production bonus to adjacent buildings',
        buildingId: 'droneDepo',
        cardTexture: 'droneDepo', // Optionaly a custom texture for the card can be used
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 1,
        },
    },
    IRON_MINE_CARD: {
        id: 'ironMineCard',
        name: 'Iron Mine',
        description: 'Build an iron mine on a metal deposit',
        buildingId: 'ironMine',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.DRONES]: 2,
            [RESOURCES.ENERGY]: 1
        },
    },
    STEELWORKS_CARD: {
        id: 'steelworksCard',
        name: 'Steelworks',
        description: 'Build a steelworks to convert iron to steel',
        buildingId: 'steelworks',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 3
        },
    },
    CONCRETE_HARVESTER_CARD: {
        id: 'concreteMixerCard',
        name: 'Concrete',
        description: 'Build a concrete harvester to produce concrete',
        buildingId: 'concreteMixer',
        cardType: 'building',
        cost: {
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 3,
            [RESOURCES.ENERGY]: 1
        },
    },
    WATER_PUMP_CARD: {
        id: 'waterPumpCard',
        name: 'Water Pump',
        description: 'Build a water pump on a water deposit',
        buildingId: 'waterPump',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 1
        },
    },
    FUEL_REFINERY_CARD: {
        id: 'fuelRefineryCard',
        name: 'Fuel',
        description: 'Build a fuel refinery to convert water to fuel',
        buildingId: 'fuelRefinery',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.DRONES]: 1,
            [RESOURCES.ENERGY]: 2
        },
    },
    WIND_TURBINE_CARD: {
        id: 'windTurbineCard',
        name: 'Wind',
        description: 'Build a wind turbine to generate energy',
        buildingId: 'windTurbine',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 3,
            [RESOURCES.STEEL]: 1
        },
    },
    SOLAR_PANEL_CARD: {
        id: 'solarPanelCard',
        name: 'Solar',
        description: 'Build solar panels to generate energy',
        buildingId: 'solarPanel',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 1,
            [RESOURCES.STEEL]: 1,
            [RESOURCES.DRONES]: 1
        },
    },
    LAUNCH_PAD_CARD: {
        id: 'launchPadCard',
        name: 'Launch Pad',
        description: 'Build a launch pad to send rockets for reputation',
        buildingId: 'launchPad',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 5,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1
        },
        effects: [
            {
                type: 'action',
                action: 'launchRocket',
                name: 'Launch',
                cost: {
                    [RESOURCES.FUEL]: 10,
                    [RESOURCES.STEEL]: 10
                },
                cooldown: 2,
                effects: [
                    {
                        type: 'addResource',
                        resource: RESOURCES.REPUTATION,
                        amount: 10
                    }
                ]
            }
        ]
    },
    TESLA_COIL_CARD: {
        id: 'teslaCoilCard',
        name: 'Tesla Coil',
        description: 'Build a tesla coil to generate a lot of energy',
        buildingId: 'teslaCoil',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 4,
            [RESOURCES.STEEL]: 2,
            [RESOURCES.DRONES]: 1
        },
    },
    // Prefab cards
    IRON_MINE_PREFAB_CARD: {
        id: 'ironMinePrefabCard',
        name: '*Iron Mine*',
        description: 'Build an iron mine on a metal deposit. Being a prefab this card requires way less resources to build.',
        buildingId: 'ironMine',
        cardType: 'prefab',
        cost: {
            [RESOURCES.ENERGY]: 1
        },
    },
    STEELWORKS_PREFAB_CARD: {
        id: 'steelworksPrefabCard',
        name: '*Steelworks*',
        description: 'Build a steelworks to convert iron to steel. Being a prefab this card requires way less resources to build.',
        buildingId: 'steelworks',
        cardType: 'prefab',
        cost: {
            [RESOURCES.ENERGY]: 3
        },
    },
    // Event cards
    SCRAP_DRONES_EVENT: {
        id: 'scrapDronesEvent',
        name: 'Scrap Drones',
        description: 'Convert scrap metal into 5 drones',
        cardType: 'event',
        cardTexture: 'droneIcon',
        cost: {
            [RESOURCES.IRON]: 1
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.DRONES,
                amount: 5
            }
        ]
    },
    RESOURCE_SUPPLY_EVENT: {
        id: 'resourceSupplyEvent',
        name: 'Resources',
        description: 'Increase the supply of steel and concrete by 5 each',
        cardType: 'event',
        cardTexture: 'resourceSupplyIcon',
        cost: {
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.STEEL,
                amount: 5
            },
            {
                type: 'addResource',
                resource: RESOURCES.CONCRETE,
                amount: 5
            }
        ]
    },
    BARTER_EVENT: {
        id: 'barterEvent',
        name: 'Barter',
        description: 'Trade 10 concrete for 3 steel and 3 fuel',
        cardType: 'event',
        cardTexture: 'barterIcon',
        cost: {
            [RESOURCES.CONCRETE]: 10
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.STEEL,
                amount: 3
            },
            {
                type: 'addResource',
                resource: RESOURCES.FUEL,
                amount: 3
            }
        ]
    }

};

// Deck composition - defines how many copies of each card type will be in the deck
export const DECK_COMPOSITION = {
    // Format: cardId: numberOfCopies
    'droneDepoCard': 3,
    'ironMineCard': 5,
    'steelworksCard': 3,
    'concreteMixerCard': 5,
    'waterPumpCard': 5,
    'fuelRefineryCard': 3,
    'windTurbineCard': 4,
    'solarPanelCard': 4,
};

// Starting hand configuration - specific cards to always include in starting hand
export const STARTING_HAND = {
    // Format: cardId: true/false
    'droneDepoCard': true,
    'windTurbineCard': true,
    'launchPadCard': true
}; 

// Rewards configuration - defines rewards that can be unlocked using reputation points
export const REWARDS = {
    // Starting hand card rewards - add specific card to starting hand
    STARTING_HAND_REWARDS: {
        IRON_MINE_PREFAB_STARTING_REWARD: {
            id: 'ironMinePrefabStartingReward',
            name: 'Iron Mine Prefab',
            description: 'Start with an additional Iron Mine Prefab card in your hand',
            image: 'ironMine', // Using existing texture
            applicationType: 'startingHand',
            reputationCost: 10,
            effects: [
                {
                    cardId: 'ironMinePrefabCard'
                }
            ]
        },
        STEELWORKS_PREFAB_STARTING_REWARD: {
            id: 'steelworksPrefabStartingReward',
            name: 'Steelworks Prefab',
            description: 'Start with an additional Steelworks Prefab card in your hand',
            image: 'steelworks',
            applicationType: 'startingHand',
            reputationCost: 20,
            effects: [
                {
                    cardId: 'steelworksPrefabCard'
                }
            ]
        },
        TESLA_COIL_STARTING_REWARD: {
            id: 'teslaCoilStartingReward',
            name: 'Tesla Coil',
            description: 'Start with an Tesla Coil card in your hand',
            image: 'teslaCoil',
            applicationType: 'startingHand',
            reputationCost: 30,
            effects: [
                {
                    cardId: 'teslaCoilCard'
                }
            ]
        }
    },
    
    // Deck cards rewards - add cards to the player's deck
    DECK_CARDS_REWARDS: {
        DRONE_EVENT_DECK_REWARD: {
            id: 'droneEventDeckReward',
            name: 'Drone Event',
            description: 'Add two Drone Event cards to your deck',
            image: 'droneIcon',
            applicationType: 'deckCards',
            reputationCost: 10,
            effects: [
                {
                    cardId: 'scrapDronesEvent',
                    count: 2
                }
            ]
        },
        RESOURCE_SUPPLY_EVENT_DECK_REWARD: {
            id: 'resourceSupplyEventDeckReward',
            name: 'Resource Supply Event',
            description: 'Add two Resource Supply Event cards to your deck',
            image: 'resourceSupplyIcon',
            applicationType: 'deckCards',
            reputationCost: 10,
            effects: [
                {
                    cardId: 'resourceSupplyEvent',
                    count: 2
                }
            ]
        },
        BARTER_EVENT_DECK_REWARD: {
            id: 'barterEventDeckReward',
            name: 'Barter Event',
            description: 'Add two Barter Event cards to your deck',
            image: 'barterIcon',
            applicationType: 'deckCards',
            reputationCost: 20,
            effects: [
                {
                    cardId: 'barterEvent',
                    count: 3
                }
            ]
        }
    },
    
    // Building upgrade rewards - improve building performance
    BUILDING_UPGRADE_REWARDS: {
        IMPROVED_WIND_TURBINE: {
            id: 'improvedWindTurbineReward',
            name: 'Improved Wind Turbine',
            description: 'Wind Turbines produce 2 more energy',
            image: 'windTurbine',
            applicationType: 'buildingUpgrade',
            reputationCost: 5,
            effects: [
                {
                    buildingId: 'windTurbine',
                    resourceBonus: {
                        'energy': 2
                    }
                }
            ]
        },
        EFFICIENT_SUPPLY_CHAIN: {
            id: 'efficientSupplyChainReward',
            name: 'Efficient Supply Chain',
            description: 'Steelworks produce 1 more steel if adjacent to an Iron Mine. Fuel Refineries produce 1 more fuel if adjacent to a Water Pump.',
            image: 'supplyChainIcon',
            applicationType: 'buildingUpgrade',
            reputationCost: 8,
            effects: [
                {
                    buildingId: 'steelworks',
                    adjacentBuildingId: 'ironMine',
                    adjacencyBonus: {
                        'steel': 1
                    }
                },
                {
                    buildingId: 'fuelRefinery',
                    adjacentBuildingId: 'waterPump',
                    adjacencyBonus: {
                        'fuel': 1
                    }
                }
            ]
        },
        IMPROVED_LAUNCH_PAD: {
            id: 'improvedLaunchPadReward',
            name: 'Improved Launch Pad',
            description: 'Launch Pads can now launch fast rockets',
            image: 'launchPad',
            applicationType: 'buildingUpgrade',
            reputationCost: 10,
            effects: [
                {
                    buildingId: 'launchPad',
                    newAction: {
                        name: 'Fast Launch',
                        cost: {
                            [RESOURCES.FUEL]: 15,
                            [RESOURCES.STEEL]: 10
                        },
                        cooldown: 1,
                        effects: [
                            {
                                type: 'addResource',
                                resource: RESOURCES.REPUTATION,
                                amount: 10
                            }
                        ]
                    }
                }
            ]
        }
    }
}; 