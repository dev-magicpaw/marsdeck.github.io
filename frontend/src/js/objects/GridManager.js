import { CELL_SIZE, GRID_SIZE, TERRAIN_TYPES } from '../config/game-data';

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
                    building: null, // No building initially
                    sprite: null // Will store the Phaser sprite reference
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
        
        // Apply terrain and building configurations
        if (mapConfig.cells && Array.isArray(mapConfig.cells)) {
            mapConfig.cells.forEach(cell => {
                if (cell.x >= 0 && cell.x < this.gridSize && 
                    cell.y >= 0 && cell.y < this.gridSize) {
                    
                    // Set terrain
                    if (cell.terrain) {
                        this.grid[cell.y][cell.x].terrain = cell.terrain;
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
        
        // Check terrain requirements
        if (building.terrainRequirement && 
            cell.terrain !== building.terrainRequirement) {
            return false; // Terrain requirements not met
        }
        
        return true;
    }
    
    // Place a building on a cell
    placeBuilding(x, y, building) {
        if (!this.canPlaceBuilding(x, y, building)) {
            return false;
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
    
    // Generate a random map with various terrain types
    generateRandomMap(metalPercentage = 10, waterPercentage = 10, mountainPercentage = 5) {
        this.initializeGrid(); // Start with a clean grid
        
        const totalCells = this.gridSize * this.gridSize;
        const metalCells = Math.floor(totalCells * (metalPercentage / 100));
        const waterCells = Math.floor(totalCells * (waterPercentage / 100));
        const mountainCells = Math.floor(totalCells * (mountainPercentage / 100));
        
        // Helper to place random terrain features
        const placeTerrain = (terrainType, count) => {
            let placed = 0;
            while (placed < count) {
                const x = Math.floor(Math.random() * this.gridSize);
                const y = Math.floor(Math.random() * this.gridSize);
                
                if (this.grid[y][x].terrain === TERRAIN_TYPES.PLAIN.id) {
                    this.grid[y][x].terrain = terrainType;
                    placed++;
                }
            }
        };
        
        // Place terrain features
        placeTerrain(TERRAIN_TYPES.METAL.id, metalCells);
        placeTerrain(TERRAIN_TYPES.WATER.id, waterCells);
        placeTerrain(TERRAIN_TYPES.MOUNTAIN.id, mountainCells);
    }
} 