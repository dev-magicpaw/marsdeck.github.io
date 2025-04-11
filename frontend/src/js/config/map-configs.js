import { TERRAIN_FEATURES } from './game-data';

// Sample map configuration with specific terrain features
export const SAMPLE_MAP = {
    gridSize: 8, // Size of the map grid (8x8)
    cells: [
        // Metal deposits in specific locations
        { x: 0, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 7, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 4, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits
        { x: 0, y: 0, feature: TERRAIN_FEATURES.WATER.id },
        { x: 5, y: 7, feature: TERRAIN_FEATURES.WATER.id },
        
        // Mountain range across the middle
        { x: 2, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id }
    ]
};

// Sample map configuration with specific terrain features
export const LEVEL_2_MAP = {
    gridSize: 8, // Size of the map grid (8x8)
    cells: [
        // Metal deposits in specific locations
        { x: 0, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 7, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 4, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits
        { x: 0, y: 0, feature: TERRAIN_FEATURES.WATER.id },
        { x: 5, y: 7, feature: TERRAIN_FEATURES.WATER.id },
        
        // Mountain range across the middle
        { x: 2, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 4, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id }
    ]
};

export const LEVEL_3_MAP = {
    gridSize: 8, // Size of the map grid (8x8)
    cells: [
        // Metal deposits in specific locations
        { x: 2, y: 1, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 7, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits
        { x: 3, y: 4, feature: TERRAIN_FEATURES.WATER.id },
        { x: 4, y: 4, feature: TERRAIN_FEATURES.WATER.id },
        
        // Mountain range across the middle
        { x: 6, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 4, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 5, feature: TERRAIN_FEATURES.MOUNTAIN.id },
    ]
};

// A map with lots of resources
export const RESOURCE_RICH_MAP = {
    gridSize: 8,
    cells: [
        // Metal deposits (more than usual)
        { x: 1, y: 1, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 3, feature: TERRAIN_FEATURES.METAL.id },
        { x: 3, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 5, y: 1, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits (more than usual)
        { x: 3, y: 2, feature: TERRAIN_FEATURES.WATER.id },
        { x: 4, y: 5, feature: TERRAIN_FEATURES.WATER.id },
        { x: 2, y: 6, feature: TERRAIN_FEATURES.WATER.id },
        { x: 6, y: 2, feature: TERRAIN_FEATURES.WATER.id },
        
        // Just a few mountains
        { x: 7, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id }
    ]
};

// Map with buildings pre-placed
export const TUTORIAL_MAP = {
    gridSize: 8,
    cells: [
        // Resources
        { x: 1, y: 1, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 3, y: 2, feature: TERRAIN_FEATURES.WATER.id },
        { x: 4, y: 5, feature: TERRAIN_FEATURES.WATER.id },
        
        // Pre-placed buildings (just examples - these aren't actual building IDs)
        // You'll need to use the correct building IDs from your BUILDINGS object
        // { x: 2, y: 2, building: 'droneDepo' },
        // { x: 5, y: 5, building: 'windTurbine' }
    ]
}; 