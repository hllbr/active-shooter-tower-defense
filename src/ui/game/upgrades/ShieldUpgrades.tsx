import React from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { ShieldStatsDisplay } from './ShieldStatsDisplay';
import { ShieldUpgradeCard } from './ShieldUpgradeCard';
import { ScrollableGridList } from '../../common/ScrollableList';
import { Logger } from '../../../utils/Logger';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((state: Store) => state.gold);
  const globalWallStrength = useGameStore((state: Store) => state.globalWallStrength);
  const upgradeWall = useGameStore((state: Store) => state.upgradeWall);
  const wallLevel = useGameStore((state: Store) => state.wallLevel);

  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  const diceUsed = useGameStore((state: Store) => state.diceUsed);
  
  // Calculate current shield strength
  const getCurrentShieldStrength = () => {
    return globalWallStrength * 10; // Each wall point = 10 shield strength
  };

  // Calculate next shield strength (if purchasing the next available shield)
  const getNextShieldStrength = () => {
    const currentShieldLevel = wallLevel || 0;
    const nextShield = GAME_CONSTANTS.WALL_SHIELDS[currentShieldLevel];
    if (!nextShield) return getCurrentShieldStrength();
    return (globalWallStrength + nextShield.strength) * 10;
  };

  const currentShieldStrength = getCurrentShieldStrength();
  const nextShieldStrength = getNextShieldStrength();

  const handlePurchase = (index: number, finalCost: number) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[index];
    if (!shield) {
      Logger.error(`❌ Invalid shield index: ${index}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    const currentShieldLevel = wallLevel || 0;
    if (index !== currentShieldLevel) {
      Logger.error(`❌ Invalid purchase attempt: index ${index} !== currentLevel ${currentShieldLevel}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    // Validate cost matches what the UI calculated
    if (gold < finalCost) {
      Logger.error(`❌ Insufficient gold: ${gold} < ${finalCost}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    // Shield purchase processed - this will now use the correct shield.cost from WALL_SHIELDS
    Logger.log(`✅ Purchasing shield ${shield.name} for ${finalCost} gold. Current level: ${currentShieldLevel}`);
    upgradeWall();
    
    // Show success feedback
    import('../../../utils/sound').then(({ playSound }) => {
      playSound('shield-activate');
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🛡️ Kalkanlar
      </span>
      
      <ShieldStatsDisplay 
        currentShieldStrength={currentShieldStrength}
        nextShieldStrength={nextShieldStrength}
        globalWallStrength={globalWallStrength}
        showUpgradeAnimation={false}
        hasAvailableShields={GAME_CONSTANTS.WALL_SHIELDS.length > 0}
      />

      <ScrollableGridList
        items={GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => ({
          shield,
          index: i,
          currentShieldLevel: wallLevel || 0,
          isCurrentLevel: i === (wallLevel || 0),
          isPastLevel: i < (wallLevel || 0),
          isFutureLevel: i > (wallLevel || 0)
        }))}
        renderItem={({ shield, index, isPastLevel }) => (
          <ShieldUpgradeCard
            shield={shield}
            index={index}
            gold={gold}
            globalWallStrength={globalWallStrength}
            discountMultiplier={discountMultiplier}
            diceUsed={diceUsed}
            purchaseCount={isPastLevel ? 1 : 0}
            maxAllowed={1}
            isMaxed={isPastLevel}
            onPurchase={handlePurchase}
          />
        )}
        keyExtractor={({ index }) => `shield-${index}`}
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap="12px"
        itemMinWidth="250px"
        containerStyle={{ width: '100%' }}
      />
    </div>
  );
}; 