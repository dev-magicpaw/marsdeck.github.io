import { CELL_SIZE, GRID_SIZE, TERRAIN_FEATURES, TERRAIN_TYPES } from '../config/game-data';

export default class GridManager {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = GRID_SIZE;
        this.cellSize = CELL_SIZE;
        this.grid = [];
        
        // Initialize the grid with empty cells
        this.initializeGrid();
    }
    
    // Create empty grid cells
    initializeGrid() {
        this.grid = [];
        
        // Create grid with default properties
        for (let y = 0; y < this.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.gridSize; x++) {
                row.push({
                    x: x,
                    y: y,
                    terrain: TERRAIN_TYPES.PLAIN.id, // Default terrain
                    feature: null, // Terrain feature (metal, water, mountain)
                    building: null, // No building initially
                    terrainSprite: null, // Sprite for terrain
                    featureSprite: null, // Sprite for terrain feature
                    buildingSprite: null // Sprite for building
                });
            }
            this.grid.push(row);
        }
    }
    
    // Load a custom map configuration
    loadMapConfig(mapConfig) {
        // If config specifies a different grid size
        if (mapConfig.gridSize) {
            this.gridSize = mapConfig.gridSize;
            this.initializeGrid(); // Recreate grid with new size
        }
        
        // Apply terrain, features and building configurations
        if (mapConfig.cells && Array.isArray(mapConfig.cells)) {
            mapConfig.cells.forEach(cell => {
                if (cell.x >= 0 && cell.x < this.gridSize && 
                    cell.y >= 0 && cell.y < this.gridSize) {
                    
                    // Set terrain
                    if (cell.terrain) {
                        this.grid[cell.y][cell.x].terrain = cell.terrain;
                    }
                    
                    // Set terrain feature
                    if (cell.feature) {
                        this.grid[cell.y][cell.x].feature = cell.feature;
                    }
                    
                    // Set building (if any)
                    if (cell.building) {
                        this.grid[cell.y][cell.x].building = cell.building;
                    }
                }
            });
        }
    }
    
    // Get a specific cell by coordinates
    getCell(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return this.grid[y][x];
        }
        return null;
    }
    
    // Check if a building can be placed on a specific cell
    canPlaceBuilding(x, y, building) {
        const cell = this.getCell(x, y);
        
        if (!cell) {
            return false; // Invalid cell coordinates
        }
        
        if (cell.building) {
            return false; // Cell already has a building
        }
        
        // Check terrain feature requirements
        if (building.terrainRequirement) {
            if (!cell.feature) {
                return false; // No feature but requirement exists
            }
            if (cell.feature !== building.terrainRequirement) {
                return false; // Feature doesn't match requirement
            }
        }
        
        // Can't build on mountains
        if (cell.feature === TERRAIN_FEATURES.MOUNTAIN.id) {
            return false;
        }
        
        // Special case for Launch Pad - check adjacent tiles
        if (building.id === 'launchPad') {
            // Get all adjacent cells
            const adjacentCells = this.getAdjacentCells(x, y);
            
            // Check if any adjacent cell has a mountain or building
            for (const adjCell of adjacentCells) {
                if (adjCell.feature === TERRAIN_FEATURES.MOUNTAIN.id || adjCell.building) {
                    return false; // Can't place if adjacent to mountain or building
                }
            }
        }
        
        return true;
    }
    
    // Get all adjacent cells (orthogonally)
    getAdjacentCells(x, y) {
        const directions = [
            { dx: 0, dy: -1 }, // North
            { dx: 1, dy: 0 },  // East
            { dx: 0, dy: 1 },  // South
            { dx: -1, dy: 0 }  // West
        ];
        
        const adjacentCells = [];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            const cell = this.getCell(newX, newY);
            
            if (cell) {
                adjacentCells.push(cell);
            }
        }
        
        return adjacentCells;
    }
    
    // Place a building on a cell
    placeBuilding(x, y, building) {
        if (!this.canPlaceBuilding(x, y, building)) {
            return false;
        }
        
        // Remove any terrain feature when a building is placed
        // Exception: if the building has a terrain requirement, keep the feature
        if (!building.terrainRequirement) {
            this.grid[y][x].feature = null;
        }
        
        this.grid[y][x].building = building.id;
        return true;
    }
    
    // Remove a building from a cell
    removeBuilding(x, y) {
        const cell = this.getCell(x, y);
        
        if (!cell || !cell.building) {
            return false;
        }
        
        cell.building = null;
        if (cell.buildingSprite) {
            cell.buildingSprite.destroy();
            cell.buildingSprite = null;
        }
        return true;
    }
    
    // Get all buildings on the grid
    getAllBuildings() {
        const buildings = [];
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].building) {
                    buildings.push({
                        x: x,
                        y: y,
                        buildingId: this.grid[y][x].building
                    });
                }
            }
        }
        
        return buildings;
    }
    
    // Generate a random map with various terrain features
    generateRandomMap(metalPercentage = 10, waterPercentage = 10, mountainPercentage = 5) {
        this.initializeGrid(); // Start with a clean grid
        
        const totalCells = this.gridSize * this.gridSize;
        const metalCells = Math.floor(totalCells * (metalPercentage / 100));
        const waterCells = Math.floor(totalCells * (waterPercentage / 100));
        const mountainCells = Math.floor(totalCells * (mountainPercentage / 100));
        
        // Helper to place random terrain features
        const placeFeature = (featureType, count) => {
            let placed = 0;
            while (placed < count) {
                const x = Math.floor(Math.random() * this.gridSize);
                const y = Math.floor(Math.random() * this.gridSize);
                
                if (!this.grid[y][x].feature) {
                    this.grid[y][x].feature = featureType;
                    placed++;
                }
            }
        };
        
        // Place terrain features
        placeFeature(TERRAIN_FEATURES.METAL.id, metalCells);
        placeFeature(TERRAIN_FEATURES.WATER.id, waterCells);
        placeFeature(TERRAIN_FEATURES.MOUNTAIN.id, mountainCells);
    }
} 