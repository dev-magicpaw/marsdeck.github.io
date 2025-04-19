# Mars Colony Card Game

A web-based card game where you build a robot colony on Mars by placing building cards on a grid.

## Deployment

This project is configured to be deployed to GitHub Pages. There are two ways to deploy:

### Automatic Deployment

Push changes to the main branch. GitHub Actions will automatically build and deploy the game to GitHub Pages.

### Manual Deployment

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```
   npm install
   ```

3. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

## Development

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `frontend/` - Contains the Phaser.js game
  - `src/` - Source code
    - `js/` - JavaScript files
    - `assets/` - Game assets
    - `css/` - Stylesheets

## Game Overview

A turn-based Mars colony building game where players:
- Extract resources
- Build structures
- Manage a drone-operated colony
- Make deliveries to Mars orbit for scoring

See `project_plan.md` for more detailed information about the game design. 