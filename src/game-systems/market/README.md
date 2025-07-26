# 🏪 Market System Documentation

## Overview

The Market System provides a clean, categorized interface for purchasing game items with progressive unlock mechanics. It follows SOLID principles and provides a professional user experience across all device types.

## Architecture

### Core Components

1. **MarketManager** (`MarketManager.ts`)
   - Singleton pattern for centralized market management
   - Handles item categorization and progressive unlocks
   - Manages market item lifecycle and purchase logic
   - Integrates with UnlockManager for requirement checking

2. **UnlockManager** (`UnlockManager.ts`)
   - Handles progressive unlock system
   - Tracks unlock progress and conditions
   - Manages unlock events and history
   - Provides unlock statistics and analytics

3. **SimplifiedMarketUI** (`SimplifiedMarketUI.tsx`)
   - Clean, categorized market interface
   - Progressive unlock display with requirements
   - Responsive design for all screen sizes
   - Smooth transitions and animations

4. **ResponsiveMarketContainer** (`ResponsiveMarketContainer.tsx`)
   - Responsive design utilities
   - Screen size detection and adaptation
   - Mobile and tablet optimizations

## Features

### ✅ Simplified Market UI
- **Clear Categories**: Items organized into "Offense (Firepower)", "Defense", and "Support"
- **Category Tabs**: Easy switching between categories with item counts
- **Smooth Transitions**: No UI overlaps or jarring transitions
- **Professional Design**: Clean, modern interface with consistent styling

### ✅ Progressive Unlock System
- **Wave-Based Unlocks**: Items unlock based on wave progression
- **Achievement Requirements**: Some items require specific achievements
- **Purchase Requirements**: Items may require purchasing other categories first
- **Gold Requirements**: Minimum gold thresholds for expensive items
- **Level Requirements**: Player level-based unlocks

### ✅ Gameplay Balance
- **Early Game**: Affordable items available from wave 1
- **Mid Game**: Balanced items unlock around waves 5-15
- **Late Game**: Powerful items unlock at waves 30+
- **Rarity System**: Common, Rare, Epic, Legendary with appropriate costs

### ✅ Responsive Design
- **Desktop**: Full-featured interface with multi-column layout
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Single-column layout with full-screen modal
- **Landscape Support**: Adaptive layouts for different orientations

## Usage

### Basic Market Integration

```typescript
import { marketManager } from '../game-systems/market/MarketManager';
import { SimplifiedMarketUI } from '../ui/game/market/SimplifiedMarketUI';

// In your component
const MarketComponent = () => {
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  
  return (
    <SimplifiedMarketUI 
      isOpen={isMarketOpen}
      onClose={() => setIsMarketOpen(false)}
      isModal={true}
    />
  );
};
```

### Progressive Unlock Configuration

```typescript
// Items automatically get unlock requirements based on rarity
const marketItem: MarketItem = {
  id: 'lightning_storm',
  name: 'Lightning Storm',
  category: 'offense',
  cost: 300,
  rarity: 'rare', // Automatically sets minWave: 5, minGold: 210
  unlockRequirements: {
    minWave: 5,
    minGold: 210,
    requiredAchievements: ['wave_survivor_10'] // Custom requirement
  }
};
```

### Unlock Progress Tracking

```typescript
import { unlockManager } from '../game-systems/market/UnlockManager';

// Check unlock progress
const progress = unlockManager.getUnlockProgress('item_id');
console.log(`Progress: ${progress.progressPercentage}%`);

// Get unlock statistics
const stats = unlockManager.getUnlockStatistics();
console.log(`Unlocked: ${stats.unlockedItems}/${stats.totalItems}`);
```

## Market Categories

### ⚔️ Offense (Firepower)
- **Purpose**: Attack and damage-focused items
- **Color**: Red (#EF4444)
- **Examples**: Explosion Burst, Lightning Storm
- **Unlock Pattern**: Available early, scales with damage output

### 🛡️ Defense
- **Purpose**: Protection and survival items
- **Color**: Green (#10B981)
- **Examples**: Slow Mist, Frost Wave
- **Unlock Pattern**: Unlocks mid-game, focuses on crowd control

### 🔧 Support
- **Purpose**: Utility and enhancement items
- **Color**: Purple (#8B5CF6)
- **Examples**: Time Slow, Healing Rain
- **Unlock Pattern**: Late-game unlocks, powerful utility effects

## Unlock Requirements

### Wave-Based Unlocks
```typescript
{
  minWave: 15 // Unlocks at wave 15
}
```

### Achievement-Based Unlocks
```typescript
{
  requiredAchievements: ['wave_survivor_25', 'fire_master_15']
}
```

### Purchase-Based Unlocks
```typescript
{
  requiredPurchases: {
    category: 'defense',
    count: 5 // Requires 5 defense items purchased
  }
}
```

### Gold-Based Unlocks
```typescript
{
  minGold: 1000 // Requires 1000 gold to unlock
}
```

## Responsive Design

### Desktop (1024px+)
- Multi-column grid layout
- Full category tabs
- Hover effects and animations
- Maximum 900px width

### Tablet (768px - 1024px)
- Adaptive grid layout
- Touch-friendly buttons
- 95% width utilization
- Optimized spacing

### Mobile (< 768px)
- Single-column layout
- Full-screen modal
- Touch-optimized controls
- Simplified navigation

## Testing

### Run Market System Tests
```typescript
import { MarketSystemTest } from '../tests/MarketSystemTest';

// Run all tests
MarketSystemTest.runAllTests();

// Run specific test categories
MarketSystemTest.testMarketBalance();
MarketSystemTest.testUnlockRequirements();

// Generate test report
MarketSystemTest.generateTestReport();
```

### Test Coverage
- ✅ MarketManager functionality
- ✅ UnlockManager logic
- ✅ Progressive unlock system
- ✅ Market UI components
- ✅ Responsive design
- ✅ Purchase flow validation

## Performance Optimizations

### Memory Management
- Singleton patterns for managers
- Efficient item filtering and sorting
- Minimal re-renders with useMemo
- Cleanup of event listeners

### UI Performance
- Virtual scrolling for large item lists
- Debounced category switching
- Optimized grid layouts
- Efficient state updates

### Responsive Performance
- Screen size detection with throttling
- Conditional rendering based on device
- Optimized animations for mobile
- Touch event optimization

## Integration Points

### Game Store Integration
```typescript
// Market items integrate with existing weather system
const success = marketManager.purchaseItem(itemId);
if (success) {
  // Item purchased, update game state
  playSound('coin-collect');
}
```

### Achievement System
```typescript
// Unlock requirements check achievements
const progress = unlockManager.checkUnlockConditions(itemId, requirements);
// Automatically updates when achievements are completed
```

### Wave Progression
```typescript
// Items unlock based on current wave
const gameState = useGameStore.getState();
const isUnlocked = marketManager.checkItemUnlock(itemId);
// Updates automatically when wave changes
```

## Future Enhancements

### Planned Features
- **Market Analytics**: Track popular items and purchase patterns
- **Dynamic Pricing**: Prices that adjust based on demand
- **Limited Time Offers**: Special events with discounted items
- **Bundle Deals**: Package multiple items at a discount
- **Marketplace**: Player-to-player trading system

### Technical Improvements
- **Offline Support**: Cache market data for offline access
- **Real-time Updates**: Live market updates across sessions
- **Advanced Filtering**: Filter by cost, rarity, or unlock status
- **Search Functionality**: Find items by name or description
- **Favorites System**: Mark favorite items for quick access

## Troubleshooting

### Common Issues

**Items not unlocking:**
- Check wave progression requirements
- Verify achievement completion status
- Ensure sufficient gold for purchase requirements

**UI not responsive:**
- Verify screen size detection is working
- Check CSS media queries
- Test on different device orientations

**Purchase failures:**
- Verify item is unlocked
- Check player has sufficient gold
- Ensure item is not already owned

### Debug Mode
```typescript
// Enable debug logging
import { Logger } from '../utils/Logger';
Logger.setLevel('debug');

// Check market state
console.log('Market Categories:', marketManager.getMarketCategories());
console.log('Unlock Stats:', unlockManager.getUnlockStatistics());
```

## Contributing

### Code Standards
- Follow SOLID principles
- Use TypeScript for type safety
- Implement comprehensive testing
- Maintain responsive design
- Follow existing naming conventions

### Testing Guidelines
- Test on multiple screen sizes
- Verify unlock progression logic
- Test purchase flow edge cases
- Validate responsive behavior
- Check performance on mobile devices 