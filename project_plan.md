# Mars Colony City Building Card Game Project Plan

## 1. Client-Side with Phaser.js

### Core Structure & Game Flow

- **Grid & Map:**
  - Create a 7×7 grid using Phaser.
  - Build a JSON (or JavaScript) configuration file for the map that lets you set each cell’s terrain feature (e.g., metal deposit, water deposit, mountains) and, optionally, pre-place a building.
  - Example config structure:
    ```json
    {
      "gridSize": 7,
      "cells": [
        { "x": 0, "y": 0, "terrain": "metal", "building": null },
        { "x": 1, "y": 0, "terrain": "water", "building": "Drone Depo" },
        ...
      ]
    }
    ```

- **Turn-Based Mechanics:**
  - Each turn, add 2 random cards to the player’s hand (with a max hand size of 6 and an option to discard).
  - Allow the player to use as many cards as desired per turn.

- **Card System:**
  - **Card Types:** Buildings (and later, events) that can be played.
  - **Building Cards:** Each building card has a cost in concrete, steel, and drones.
  - **Sample Building Cards & Costs:**
    - **Drone Depo:** Cost: concrete: 1, steel: 1, drones: 2
    - **Iron Mine:** Cost: concrete: 2, steel: 1, drones: 1
    - **Steelworks:** Cost: concrete: 2, steel: 2, drones: 1
    - **Concrete Harvester:** Cost: concrete: 1, steel: 1, drones: 1
    - **Water Pump:** Cost: concrete: 1, steel: 1, drones: 1
    - **Fuel Refinery:** Cost: concrete: 3, steel: 2, drones: 2
    - **Wind Turbine:** Cost: concrete: 1, steel: 1, drones: 1
    - **Solar Panels:** Cost: concrete: 1, steel: 1, drones: 1
    - **Launch Pad:** Cost: concrete: 4, steel: 3, drones: 2
  - These are placeholder values that can be tuned later.

- **Resource Management:**
  - **Accumulatable Resources:** iron, steel, concrete, water, fuel, drones, victory points
  - **Non-Accumulatable:** energy
  - Develop a resource manager module to track and update resource values based on building functions (e.g., iron mine gathers iron, steelworks transforms iron into steel).

- **Gameplay Objectives:**
  - The player builds a robot colony on Mars by placing building cards on the grid.
  - The goal is to extract resources, load them into a rocket, and make deliveries to Mars orbit for scoring.

## 2. Backend Roadmap (Phase Two)

- **Initial Phase:**
  - The prototype will run entirely on the client side with Phaser.js.

- **Future Integration:**
  - **Features:** Persist game progress, authentication, and sessions.
  - **Database:** Use MongoDB for data persistence.
  - **Tech Stack:** Python with Flask to create RESTful endpoints that the client can call (using AJAX or Fetch API) for periodic saves or at session end.
  - **Interaction:** Initially, add placeholders in the client code to simulate periodic saves; later, replace these with actual API calls.

## 3. Assets & Audio Recommendations

- **Graphics:**
  - **Kenney.nl:** Check for free space or sci-fi asset packs that fit the Mars colony theme.
    - **UI pack**: https://kenney.nl/assets/ui-pack-sci-fi
  - **OpenGameArt.org:** Search for Mars or futuristic assets suitable for the prototype.
    - **Terrain atlas:** https://opengameart.org/content/tiled-terrains
  - **Itch.io Asset Packs:** A good source for both free and low-cost assets.
    - **Cool 3D space base** https://kaylousberg.itch.io/space-base-bits
    - **Cool UI buttons pack** https://snowhex.itch.io/hex-interface-pack

- **Audio:**
  - **Freesound.org:** Find ambient or effect sounds.
  - **Free Music Archive / Incompetech:** Useful for background music with a space vibe.
  - Use Phaser’s built-in audio manager for integration.