# Mars Colony Card Game

A web-based card game where you build and manage a Mars colony.

## Development

### Prerequisites
- Node.js (v14+)
- npm

### Installation
```bash
npm install
```

### Running locally
```bash
npm start
```
This will start a development server and open the game in your default browser.

### Building for production
```bash
npm run build
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment
Push to the main branch and the GitHub workflow will automatically build and deploy to the gh-pages branch.

### Manual Deployment
You can also deploy manually:
```bash
npm run deploy
```

### Accessing the Game
Once deployed, the game is available at: https://[your-github-username].github.io/[repository-name]/

## Technology Stack
- Phaser 3 - Game framework
- Webpack - Asset bundling
- GitHub Actions - CI/CD pipeline

## Game Overview

In this game, you:
- Place buildings on a grid-based map
- Manage resources (iron, steel, concrete, water, fuel, drones, energy)
- Use buildings to produce resources and convert them into more valuable resources
- Launch rockets for victory points
- Play for a fixed number of turns to achieve the highest score

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:
```
cd frontend
npm install
```

### Running the Game

To start the development server:
```
npm start
```

This will open a browser window with the game running. The server will automatically reload if you make changes to the code.

### Building for Production

To create a production build:
```
npm run build
```

The built files will be in the `dist` directory.

## Game Controls

- Click on a card in your hand to select it
- Click on the grid to place a selected building (if requirements are met)
- Click on a building or terrain to see information about it
- Click "END TURN" to complete your turn

## Development

This game is built using:
- [Phaser 3](https://phaser.io/phaser3) - The game framework
- JavaScript (ES6+)
- Webpack for bundling

### Project Structure

- `src/js/config/` - Game configuration and data
- `src/js/scenes/` - Phaser scenes (Boot, Game, UI)
- `src/js/objects/` - Game object classes
- `src/assets/` - Images and audio files

## Future Features

- Custom graphical assets
- Sound effects and music
- Save game functionality
- Event cards
- More building types
- Multiple map layouts

## License

This project is licensed under the ISC License. 