# Shooter Tower Defense Game

A hybrid shooter and tower defense game built with React, TypeScript, and the Canvas API.

## Overview (English)

This game mixes fast-paced shooting with classic tower defense strategy. Build and upgrade towers while directly attacking waves of enemies. Earn gold from defeated foes to buy weapon upgrades and stronger defenses.

## Genel Bakış (Türkçe)

Bu oyun, hızlı tempolu nişancı mekaniğini geleneksel kule savunması ile birleştirir. Düşman dalgalarını püskürtmek için kuleler inşa edip yükseltirken aynı zamanda doğrudan ateş ederek savaşırsınız. Yenilen düşmanlardan elde edilen altın ile silah ve savunmalarınızı geliştirebilirsiniz.

## Features

- Player-controlled shooting mechanics
- Tower defense elements
- Wave-based enemy spawning
- Weapon upgrade system
- Gold economy
- Tower placement and upgrades
- Towers can be destroyed and rebuilt
- Bullet hits trigger a fire effect

## Technologies Used

- React 18+
- TypeScript
- Canvas API
- Zustand for state management

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Game Controls

- Mouse: Aim and shoot
- Click on tower spots to build/upgrade towers
- Gold is automatically spent on weapon upgrades

## Project Structure

```
/src
  /components      # React components
  /logic          # Game logic and systems
  /models         # TypeScript interfaces and types
  /utils          # Utility functions and constants
  /assets         # Game assets
```

## Development

The game is built using a component-based architecture with the following key systems:

- Game loop and rendering
- Enemy spawning and movement
- Collision detection
- Tower management
- Weapon systems
- Economy system

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
