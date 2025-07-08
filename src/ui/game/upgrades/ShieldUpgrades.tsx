import React, { useState, useEffect } from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { ShieldStatsDisplay } from './ShieldStatsDisplay';
import { ShieldUpgradeCard } from './ShieldUpgradeCard';
import { Logger } from '../../../utils/Logger';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((state: Store) => state.gold);
  const globalWallStrength = useGameStore((state: Store) => state.globalWallStrength);
  const upgradeWall = useGameStore((state: Store) => state.upgradeWall);
  const wallLevel = useGameStore((state: Store) => state.wallLevel);

  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  const diceUsed = useGameStore((state: Store) => state.diceUsed);
  
  const [prevWallStrength, setPrevWallStrength] = useState(globalWallStrength);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

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

  // Detect upgrade and trigger animation
  useEffect(() => {
    if (globalWallStrength > prevWallStrength) {
      setShowUpgradeAnimation(true);
      setTimeout(() => setShowUpgradeAnimation(false), 2000);
    }
    setPrevWallStrength(globalWallStrength);
  }, [globalWallStrength, prevWallStrength]);

  const currentShieldStrength = getCurrentShieldStrength();
  const nextShieldStrength = getNextShieldStrength();

  const handlePurchase = (index: number, finalCost: number) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[index];
    if (!shield) {
      Logger.error(`❌ Invalid shield index: ${index}`);
      return;
    }
    
    const currentShieldLevel = wallLevel || 0;
    if (index !== currentShieldLevel) {
      return;
    }
    
      shield: shield.name,
      cost: finalCost,
      currentLevel: currentShieldLevel
    });
    
    upgradeWall();
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
        showUpgradeAnimation={showUpgradeAnimation}
        hasAvailableShields={GAME_CONSTANTS.WALL_SHIELDS.length > 0}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => {
          const currentShieldLevel = wallLevel || 0;
          const isCurrentLevel = i === currentShieldLevel;
          const isPastLevel = i < currentShieldLevel;
          const isFutureLevel = i > currentShieldLevel;
          
          const canPurchase = isCurrentLevel && gold >= shield.cost;
          const isMaxed = isPastLevel;
          const isLocked = isFutureLevel;
          
          if (i <= 3) {
              currentShieldLevel,
              isCurrentLevel,
              isPastLevel,
              isFutureLevel,
              canPurchase,
              isMaxed,
              isLocked
            });
          }
          
          return (
            <ShieldUpgradeCard
              key={i}
              shield={shield}
              index={i}
              gold={gold}
              globalWallStrength={globalWallStrength}
              discountMultiplier={discountMultiplier}
              diceUsed={diceUsed}
              purchaseCount={isPastLevel ? 1 : 0}
              maxAllowed={1}
              isMaxed={isMaxed}
              onPurchase={handlePurchase}
            />
          );
        })}
      </div>
    </div>
  );
}; 