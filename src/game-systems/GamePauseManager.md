# GamePauseManager - Pause System Documentation

## Overview

The `GamePauseManager` is a centralized system that handles all pause-related functionality in the game. It ensures that when the game is paused (e.g., when navigating to upgrade screen, settings, or mission list), all game activity is properly stopped and resumed when returning to gameplay.

## Features

### ✅ Pause Behavior
- **Enemy Spawning**: All enemy spawning is immediately stopped
- **Enemy AI Movement**: Enemy movement and AI behavior is paused
- **Game Sounds**: Only game scene sounds are paused (UI sounds continue)
- **AI Automation**: All AI automation systems are paused
- **Dynamic Spawning**: Dynamic spawn controllers are stopped

### ✅ Resume Behavior
- **State Restoration**: Game resumes exactly from previous state
- **Spawning Reactivation**: Enemy spawning resumes if it was active
- **Sound Restoration**: Game scene sounds are restored
- **AI Reactivation**: AI automation resumes if it was active
- **No Timer Reset**: Waves and timers are not restarted

## Architecture

### Core Components

1. **GamePauseManager** (`src/game-systems/GamePauseManager.ts`)
   - Centralized pause state management
   - Handles pause/resume logic
   - Maintains state snapshots for restoration

2. **Store Integration** (`src/models/store/index.ts`)
   - `setPaused()` method triggers GamePauseManager
   - Automatic pause/resume on state changes

3. **Sound System** (`src/utils/sound/soundEffects.ts`)
   - Game scene sounds blocked when paused
   - UI sounds continue during pause
   - Automatic sound restoration on resume

4. **Enemy Systems**
   - `WaveSpawnManager`: Stops/resumes wave spawning
   - `DynamicSpawnController`: Stops/resumes dynamic spawning
   - `EnemyMovement`: Pauses enemy movement

5. **AI Systems**
   - `AIManager`: Pauses/resumes all automation
   - Auto placement, upgrades, and targeting systems

## Usage

### Automatic Pause (Recommended)
The pause system works automatically when UI components set the pause state:

```typescript
// In UI components (UpgradeScreen, SettingsPanel, etc.)
const setPaused = useGameStore(state => state.setPaused);

useEffect(() => {
  setPaused(true);  // Automatically pauses game
  return () => setPaused(false);  // Automatically resumes game
}, [setPaused]);
```

### Manual Pause (Advanced)
For advanced use cases, you can directly use the GamePauseManager:

```typescript
import { GamePauseManager } from '../game-systems/GamePauseManager';

// Pause the game
GamePauseManager.pauseGame();

// Check if paused
if (GamePauseManager.isPaused()) {
  console.log('Game is paused');
}

// Resume the game
GamePauseManager.resumeGame();

// Reset pause state (for game restart)
GamePauseManager.reset();
```

## Sound Categories

### Game Scene Sounds (Paused)
- Explosions, tower attacks, boss sounds
- Ambient battle/wind sounds
- Tower creation/destruction sounds
- Wave completion sounds

### UI/Market Sounds (Continue)
- Button clicks, hover effects
- Dice rolling, coin collection
- Purchase sounds, notifications
- Error sounds

## State Management

### Pause State Snapshot
When pausing, the system captures:
- `wasSpawningActive`: Whether enemy spawning was active
- `wasAIActive`: Whether AI automation was active
- `currentWave`: Current wave number for restoration

### Resume Logic
On resume, the system:
1. Restores game scene sounds
2. Resumes AI if it was active
3. Resumes spawning if it was active and conditions are met
4. Clears the state snapshot

## Integration Points

### UI Components
- `UpgradeScreen`: Pauses on mount, resumes on unmount
- `SettingsPanel`: Pauses when open, resumes when closed
- `WeatherMarketPanel`: Pauses when open, resumes when closed

### Game Systems
- `GameLoop`: Checks pause state before updates
- `EnemyMovement`: Stops movement when paused
- `WaveSpawnManager`: Stops spawning when paused
- `AIManager`: Pauses automation when paused

## Testing

### Validation
Use the validation functions to check system integrity:

```typescript
import { validatePauseSystem, quickPauseTest } from '../utils/validation/PauseSystemValidator';

// Comprehensive validation
const validation = validatePauseSystem();
console.log('Is valid:', validation.isValid);
console.log('Issues:', validation.issues);

// Quick functionality test
const testPassed = quickPauseTest();
console.log('Test passed:', testPassed);
```

### Test Scenarios
1. **Normal Pause**: Navigate to upgrade screen → pause → return → resume
2. **Settings Pause**: Open settings → pause → close → resume
3. **Market Pause**: Open weather market → pause → close → resume
4. **Game Over**: Game over → pause state should be reset
5. **Game Reset**: Reset game → pause state should be cleared

## Performance Considerations

### Optimizations
- **State Snapshot**: Only captures essential state for restoration
- **Conditional Checks**: Systems check pause state before expensive operations
- **Sound Filtering**: Only game scene sounds are blocked, UI sounds continue
- **Memory Management**: State snapshots are cleared after resume

### Best Practices
- Always use the store's `setPaused()` method for UI-triggered pauses
- Don't manually call GamePauseManager methods unless necessary
- Ensure cleanup in useEffect return functions
- Test pause/resume cycles thoroughly

## Troubleshooting

### Common Issues

1. **Sounds Still Playing When Paused**
   - Check if sound is in `GAME_SCENE` category
   - Verify `isGameSceneSound()` function is working

2. **Enemies Still Spawning When Paused**
   - Check if `WaveSpawnManager.isSpawningActive()` is working
   - Verify `DynamicSpawnController` pause checks

3. **AI Still Active When Paused**
   - Check if `AIManager.pauseAutomation()` is called
   - Verify automation status after pause

4. **State Not Restored on Resume**
   - Check if pause state snapshot is captured
   - Verify resume conditions are met

### Debug Commands
```typescript
// Check pause state
console.log('Pause state:', GamePauseManager.getPauseState());

// Check store pause state
console.log('Store paused:', useGameStore.getState().isPaused);

// Check spawning status
console.log('Spawning active:', WaveSpawnManager.isSpawningActive());

// Check AI status
console.log('AI status:', aiManager.getAutomationStatus());
```

## Future Enhancements

### Planned Features
- **Pause Menu**: Dedicated pause menu with options
- **Save State**: Save game state during pause
- **Performance Metrics**: Track pause/resume performance
- **Accessibility**: Screen reader support for pause state

### Extensibility
The system is designed to be easily extensible:
- Add new pause-sensitive systems by implementing pause/resume methods
- Extend sound categories for new sound types
- Add custom pause state snapshots for complex systems 