// Define tile indices from the terrain.png tileset
// This maps specific terrain types to their frame numbers in the spritesheet

// Looking at the tileset, selecting appropriate tiles for each terrain type:
// - First row has brown/sandy terrain (good for Mars surface)
// - Darker stone areas for metal deposits
// - Blue areas for water
// - Brown cliff areas for mountains

export const TILE_INDICES = {
    PLAIN: {
        CENTER: 600,
        VARIANTS: [600, 601, 602, 603]
    },
    
    METAL: {
        CENTER: 574,
        VARIANTS: [574, 575]
    },
    
    WATER: {
        CENTER: 27,
        VARIANTS: [27, 59]
    },
    
    MOUNTAIN: {
        CENTER: 606,
        VARIANTS: [606, 607]
    }
};

// Helper function to get a random variant of a terrain type
export function getRandomTileVariant(terrainType) {
    const variants = TILE_INDICES[terrainType].VARIANTS;
    return variants[Math.floor(Math.random() * variants.length)];
}

// Get basic terrain tile index
export function getTerrainTileIndex(terrainType) {
    return TILE_INDICES[terrainType].CENTER;
}

// Debug function to help identify tile indices
export function getTileCoordinates(tileIndex) {
    const tilesPerRow = 16; // Typical tileset width
    const row = Math.floor(tileIndex / tilesPerRow);
    const col = tileIndex % tilesPerRow;
    return { row, col };
} 