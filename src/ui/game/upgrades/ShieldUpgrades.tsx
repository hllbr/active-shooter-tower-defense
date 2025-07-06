import React, { useState, useEffect } from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { ShieldStatsDisplay } from './ShieldStatsDisplay';
import { ShieldUpgradeCard } from './ShieldUpgradeCard';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((state: Store) => state.gold);
  const globalWallStrength = useGameStore((state: Store) => state.globalWallStrength);

  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  const diceUsed = useGameStore((state: Store) => state.diceUsed);
  const purchaseIndividualShieldUpgrade = useGameStore((state: Store) => state.purchaseIndividualShieldUpgrade);
  const getIndividualShieldUpgradeInfo = useGameStore((state: Store) => state.getIndividualShieldUpgradeInfo);
  
  const [prevWallStrength, setPrevWallStrength] = useState(globalWallStrength);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

  // Calculate current shield strength
  const getCurrentShieldStrength = () => {
    return globalWallStrength * 10; // Each wall point = 10 shield strength
  };

  // Calculate next shield strength (if purchasing the cheapest shield)
  const getNextShieldStrength = () => {
    const cheapestShield = GAME_CONSTANTS.WALL_SHIELDS[0];
    return (globalWallStrength + cheapestShield.strength) * 10;
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
    if (!shield) return;
    
    const shieldId = `shield_${index}`;
    const success = purchaseIndividualShieldUpgrade(shieldId, finalCost, shield.purchaseLimit);
    
    if (success) {
      // Kalkan gücünü artır
      const state = useGameStore.getState();
      useGameStore.setState({
        globalWallStrength: state.globalWallStrength + shield.strength
      });
      
      console.log(`Shield purchased: ${shield.name} (+${shield.strength} strength)`);
    }
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
          const shieldId = `shield_${i}`;
          const shieldInfo = getIndividualShieldUpgradeInfo(shieldId, shield.purchaseLimit);
          
          return (
            <ShieldUpgradeCard
              key={i}
              shield={shield}
              index={i}
              gold={gold}
              globalWallStrength={globalWallStrength}
              discountMultiplier={discountMultiplier}
              diceUsed={diceUsed}
              purchaseCount={shieldInfo.currentLevel}
              maxAllowed={shield.purchaseLimit}
              isMaxed={shieldInfo.isMaxed}
              onPurchase={handlePurchase}
            />
          );
        })}
      </div>
    </div>
  );
}; 