// Define tile indices from the terrain.png tileset
// This maps specific terrain types to their frame numbers in the spritesheet

// Looking at the tileset, selecting appropriate tiles for each terrain type:
// - First row has brown/sandy terrain (good for Mars surface)
// - Darker stone areas for metal deposits
// - Blue areas for water
// - Brown cliff areas for mountains

export const TILE_INDICES = {
    // Plain terrain (sand/desert) - brown area in top-left
    PLAIN: {
        CENTER: 8, // Center of desert tile
        VARIANTS: [8, 9, 10, 16, 17, 18] // Different variants of desert tiles
    },
    
    // Metal deposit (using stone/mountain tiles) - darker stone areas
    METAL: {
        CENTER: 40, // Center of metal deposit
        VARIANTS: [40, 41, 48, 49] // Different variants
    },
    
    // Water deposit - blue water tiles
    WATER: {
        CENTER: 177, // Center of water
        VARIANTS: [177, 178, 185, 186] // Different variants
    },
    
    // Mountain - using the brown cliff/rock tiles
    MOUNTAIN: {
        CENTER: 96, // Mountain center
        VARIANTS: [96, 97, 104, 105] // Different variants
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