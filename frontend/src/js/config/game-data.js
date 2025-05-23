// Game configuration data
export const GRID_SIZE = 8; // Initial grid size (configurable)
export const CELL_SIZE = 64; // Size of each grid cell in pixels
export const MAX_TURNS = 30; // Game ends after this many turns
export const MAX_HAND_SIZE = 6; // Maximum cards in hand
export const MAX_CARD_SLOTS = 8; // Maximum slots to display in the UI
export const SAVE_DATA_VERSION = '1.0'; // Version of the save data schema

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
        description: 'Produces drones immediately when built.',
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
        description: 'Part of the launch pad area, cannot be built on.',
        production: {},
        consumption: {},
        terrainRequirement: null,
        texture: 'launchPadSurrounding' // Now using its own unique texture
    },
    WIND_TURBINE_SURROUNDING: {
        id: 'windTurbineSurrounding',
        name: 'Wind Turbine Surrounding',
        shortName: 'Wind Area',
        description: 'Part of the wind turbine area, cannot be built on.',
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
            [RESOURCES.ENERGY]: 12
        },
        consumption: {},
        terrainRequirement: TERRAIN_FEATURES.WATER.id,
        texture: 'teslaCoil'
    },
    ARTIFICIAL_LIGHTS: {
        id: 'artificialLights',
        name: 'Artificial Lights',
        shortName: 'Lights',
        description: 'Generates respect by makeing the colony look nice.',
        production: {
            [RESOURCES.REPUTATION]: 2
        },
        consumption: {},
        terrainRequirement: null,
        texture: 'artificialLights'
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
            [RESOURCES.CONCRETE]: 3,
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
            [RESOURCES.CONCRETE]: 3,
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
            [RESOURCES.STEEL]: 1,
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
            [RESOURCES.CONCRETE]: 4,
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
        description: 'Build a launch pad to send rocket shipments to the orbit earning reputation',
        buildingId: 'launchPad',
        cardType: 'building',
        cardTexture: 'launchPadIcon',
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
    ARTIFICIAL_LIGHTS_CARD: {
        id: 'artificialLightsCard',
        name: 'Artificial Lights',
        description: 'Build artificial lights - makes the area pretty and continuously brings respect to the colony',
        buildingId: 'artificialLights',
        cardType: 'building',
        cost: {
            [RESOURCES.CONCRETE]: 2,
            [RESOURCES.ENERGY]: 2,
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
    TESLA_COIL_PREFAB_CARD: {   
        id: 'teslaCoilPrefabCard',
        name: '*Tesla Coil*',
        description: 'Build a tesla coil to generate a lot of energy. Being a prefab this card requires way less resources to build.',
        buildingId: 'teslaCoil',
        cardType: 'prefab',
        cost: {
            [RESOURCES.CONCRETE]: 2
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
        ],
        repeatable: {
            cooldown: 3
        }
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
        ],
        repeatable: {
            cooldown: 2
        }
    },
    EXPORT_WATER_EVENT: {
        id: 'exportWaterEvent',
        name: 'Export Water',
        description: 'Export 10 water for 5 fuel',
        cardType: 'event',
        cardTexture: 'waterIcon',
        cost: {
            [RESOURCES.WATER]: 10
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.FUEL,
                amount: 5
            }
        ],
        repeatable: {
            cooldown: 2
        }
    },
    EXPORT_IRON_EVENT: {
        id: 'exportIronEvent',
        name: 'Export Iron',
        description: 'Export 15 iron for 5 fuel',
        cardType: 'event',
        cardTexture: 'ironIcon',
        cost: {
            [RESOURCES.IRON]: 15
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.FUEL,
                amount: 5
            }
        ],
        repeatable: {
            cooldown: 2
        }
    },
    CHARITY_EVENT: {
        id: 'charityEvent',
        name: 'Charity',
        description: 'Charity event - provide resources to another colony for 5 reputation',
        cardType: 'event',
        cardTexture: 'charityIcon',
        cost: {
            [RESOURCES.CONCRETE]: 5,
            [RESOURCES.IRON]: 5,
            [RESOURCES.WATER]: 5,
            [RESOURCES.STEEL]: 3,
            [RESOURCES.FUEL]: 3
        },
        effects: [
            {
                type: 'addResource',
                resource: RESOURCES.REPUTATION,
                amount: 5
            }
        ],
        repeatable: {
            cooldown: 1
        }
    },

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
            effects: [
                {
                    cardId: 'ironMinePrefabCard',
                    count: 1
                }
            ]
        },
        STEELWORKS_PREFAB_STARTING_REWARD: {
            id: 'steelworksPrefabStartingReward',
            name: 'Steelworks Prefab',
            description: 'Start with an additional Steelworks Prefab card in your hand',
            image: 'steelworks',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'steelworksPrefabCard',
                    count: 1
                }
            ]
        },
        TESLA_COIL_PREFAB_STARTING_REWARD: {
            id: 'teslaCoilPrefabStartingReward',
            name: 'Tesla Coil',
            description: 'Start with a Tesla Coil card in your hand, Tesla Coil produces a lot of energy',
            image: 'teslaCoil',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'teslaCoilPrefabCard',
                    count: 1
                }
            ]
        },
        DRONE_EVENT_STARTING_REWARD: {
            id: 'droneEventStartingReward',
            name: 'Drone Event',
            description: 'Start with a Drone Event card in your hand',
            image: 'droneIcon',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'scrapDronesEvent',
                    count: 1 // 2
                }
            ]
        },
        RESOURCE_SUPPLY_EVENT_STARTING_REWARD: {
            id: 'resourceSupplyEventStartingReward',
            name: 'Resource Supply Event',
            description: 'Start with a Resource Supply Event card in your hand. Increase the supply of steel and concrete.\nRepeat every 3 turns',
            image: 'resourceSupplyIcon',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'resourceSupplyEvent',
                    count: 1
                }
            ]
        },
        BARTER_EVENT_STARTING_REWARD: {
            id: 'barterEventStartingReward',
            name: 'Barter Event',
            description: 'Start with a Barter Event card in your hand. Trade concrete for steel and fuel.\nTrades can be repeated every 2 turns',
            image: 'barterIcon',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'barterEvent',
                    count: 1
                }
            ]
        },
        RAW_EXPORT_EVENT_STARTING_REWARD: {
            id: 'rawExportEventStartingReward',
            name: 'Raw Export Event',
            description: 'Start with Raw Export Event cards in your hand, trade water/iron for fuel.\nTrades can be repeated every 2 turns',
            image: 'rawExportIcon',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'exportWaterEvent',
                    count: 1 
                },
                {
                    cardId: 'exportIronEvent',
                    count: 1
                }
            ]
        },
        CHARITY_EVENT_STARTING_REWARD: {
            id: 'charityEventStartingReward',
            name: 'Charity Event',
            description: 'Add a Charity Event card to your starting hand. Help another colony for 5 reputation.\nRepeat each turn',
            image: 'charityIcon',
            applicationType: 'startingHand',
            effects: [
                {
                    cardId: 'charityEvent',
                    count: 1
                }
            ]
        }
    },
    
    // Deck cards rewards - add cards to the player's deck
    DECK_CARDS_REWARDS: {
        ARTIFICIAL_LIGHTS_DECK_REWARD: {
            id: 'artificialLightsDeckReward',
            name: 'Artificial Lights',
            description: 'Add 3 Artificial Lights cards to your deck - makes the area pretty and brings respect to the colony',
            image: 'artificialLights',
            applicationType: 'deckCards',
            effects: [
                {
                    cardId: 'artificialLightsCard',
                    count: 3
                }
            ]
        }
    },
    
    // Building upgrade rewards - improve building performance
    BUILDING_UPGRADE_REWARDS: {
        DRON_SUPPORT: {
            id: 'droneSupportReward',
            name: 'Drone Support',
            description: 'Any building adjacent to a Drone Depo has its production increased by 1',
            image: 'mechIcon',
            applicationType: 'buildingUpgrade',
            effects: [
                {
                    buildingId: 'any',
                    adjacentBuildingId: 'droneDepo',
                    adjacentBuildingBonus: {
                        'any': 1
                    }
                }
            ]
        },
        IMPROVED_ELECTRIC_GENERATION: {
            id: 'improvedElectricGenerationReward',
            name: 'Improved Electrics',
            description: 'Wind Turbines produce 2 more energy. Solar panels produce +1 energy per each adjacent building',
            image: 'improvedElectricGeneration',
            applicationType: 'buildingUpgrade',
            effects: [
                {
                    buildingId: 'windTurbine',
                    resourceBonus: {
                        'energy': 2
                    }
                },
                {
                    buildingId: 'solarPanel',
                    adjacentBuildingId: 'any',
                    excludeBuildingTypes: ['launchPadSurrounding', 'windTurbineSurrounding'],
                    adjacencyBonus: {
                        'energy': 1
                    }
                }
            ]
        },
        FUEL_COMPRESSOR: {
            id: 'fuelCompressorReward',
            name: 'Fuel Compressor',
            description: 'Fuel Refineries produce 1 more fuel but require 2 more energy',
            image: 'fuelPumpIcon',
            applicationType: 'buildingUpgrade',
            effects: [
                {
                    buildingId: 'fuelRefinery',
                    resourceBonus: {
                        'fuel': 1
                    },
                    cardCost: {
                        [RESOURCES.ENERGY]: 2
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
            description: 'Launch Pads can now launch fast rockets - trip takes only 1 turn but requires +50% fuel',
            image: 'rocketInFlight',
            applicationType: 'buildingUpgrade',
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
        },
        HEAVY_LAUNCH_PAD: {
            id: 'heavyLaunchPadReward',
            name: 'Heavy Launch',
            description: 'Launch Pads can now launch heavy rockets - can carry +50% more steel but requires +100% more fuel',
            image: 'rocketFueled',
            applicationType: 'buildingUpgrade',
            effects: [
                {
                    buildingId: 'launchPad',
                    newAction: {
                        name: 'Heavy Launch',
                        cost: {
                            [RESOURCES.FUEL]: 20,
                            [RESOURCES.STEEL]: 15
                        },
                        cooldown: 2,
                        effects: [
                            {
                                type: 'addResource',
                                resource: RESOURCES.REPUTATION,
                                amount: 15
                            }
                        ]
                    }
                }
            ]
        }
    }
};

// Rewards that the player starts with (unlocked from the beginning)
export const STARTING_REWARDS = [
    'efficientSupplyChainReward',
    'droneSupportReward',
]; 