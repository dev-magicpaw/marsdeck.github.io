import { TERRAIN_FEATURES } from './game-data';

// Sample map configuration with specific terrain features
export const TUTORIAL_MAP = {
    gridSize: 6,
    cells: [
        // Metal deposits in specific locations
        { x: 0, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 0, y: 4, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 4, feature: TERRAIN_FEATURES.METAL.id },
        { x: 3, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits
        { x: 0, y: 0, feature: TERRAIN_FEATURES.WATER.id },
        { x: 4, y: 0, feature: TERRAIN_FEATURES.WATER.id },
        { x: 5, y: 4, feature: TERRAIN_FEATURES.WATER.id },
        
        // Mountain range across the middle
        { x: 0, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
    ]
};

// Sample map configuration with specific terrain features
export const LEVEL_2_MAP = {
    gridSize: 8,
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
    gridSize: 8,
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

export const LEVEL_4_MAP = {
    gridSize: 8,
    cells: [
        // Metal deposits in specific locations
        { x: 2, y: 6, feature: TERRAIN_FEATURES.METAL.id },
        { x: 1, y: 5, feature: TERRAIN_FEATURES.METAL.id },
        { x: 7, y: 7, feature: TERRAIN_FEATURES.METAL.id },
        { x: 6, y: 0, feature: TERRAIN_FEATURES.METAL.id },
        { x: 2, y: 2, feature: TERRAIN_FEATURES.METAL.id },
        { x: 3, y: 2, feature: TERRAIN_FEATURES.METAL.id },
        { x: 3, y: 1, feature: TERRAIN_FEATURES.METAL.id },
        
        // Water deposits
        { x: 1, y: 6, feature: TERRAIN_FEATURES.WATER.id },
        { x: 6, y: 5, feature: TERRAIN_FEATURES.WATER.id },
        { x: 7, y: 2, feature: TERRAIN_FEATURES.WATER.id },
        
        // Mountain range across the middle
        { x: 2, y: 5, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 5, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 4, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 6, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 6, y: 7, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 6, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 5, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 4, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 4, y: 5, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 6, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 6, y: 4, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 3, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 7, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 5, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 2, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 1, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 0, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 1, y: 2, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        { x: 3, y: 0, feature: TERRAIN_FEATURES.MOUNTAIN.id },
        
    ]
};