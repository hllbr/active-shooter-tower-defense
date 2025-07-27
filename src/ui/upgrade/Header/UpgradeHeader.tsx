import React from 'react';
import { useGameStore } from '../../../models/store';
import type { Store } from '../../../models/store';
import { headerStyles } from './headerStyles';

// Props artık gerekmiyor, gold'u direkt store'dan alıyoruz
export const UpgradeHeader = () => {
  // Gold hook - Ana componentten taşındı
  const gold = useGameStore((s: Store) => s.gold);

  return (
    <div style={headerStyles.headerContainer}>
      <div style={headerStyles.headerTitle}>
        <span style={headerStyles.titleText}>
          🛠️ Yükseltme Merkezi
        </span>
      </div>
      
      {/* Gold Display */}
      <div style={headerStyles.goldDisplay}>
        <div style={{ fontSize: 18 }}>💰</div>
        <div style={headerStyles.goldText}>
          {gold.toLocaleString()}
        </div>
      </div>
    </div>
  );
}; 