import React, { useState, useEffect } from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { ShieldStatsDisplay } from './ShieldStatsDisplay';
import { ShieldUpgradeCard } from './ShieldUpgradeCard';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((state: Store) => state.gold);
  const globalWallStrength = useGameStore((state: Store) => state.globalWallStrength);
  const purchaseShield = useGameStore((state: Store) => state.purchaseShield);
  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  
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
    // Önce özel fiyatla gold'u harca
    const state = useGameStore.getState();
    state.spendGold(finalCost);
    // Sonra upgrade'i ücretsiz gerçekleştir
    purchaseShield(index, true);
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
        {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => (
          <ShieldUpgradeCard
            key={i}
            shield={shield}
            index={i}
            gold={gold}
            globalWallStrength={globalWallStrength}
            discountMultiplier={discountMultiplier}
            onPurchase={handlePurchase}
          />
        ))}
      </div>
    </div>
  );
}; 