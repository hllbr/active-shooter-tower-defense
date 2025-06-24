import React from 'react';
import type { HeaderProps } from './types';
import { upgradeScreenStyles } from './styles';

export const UpgradeHeader: React.FC<HeaderProps> = ({ gold }) => {
  return (
    <div style={upgradeScreenStyles.headerContainer}>
      <div style={upgradeScreenStyles.headerTitle}>
        <span style={upgradeScreenStyles.titleText}>
          🛠️ Yükseltme Merkezi
        </span>
      </div>
      
      {/* Gold Display */}
      <div style={upgradeScreenStyles.goldDisplay}>
        <div style={{ fontSize: 18 }}>💰</div>
        <div style={upgradeScreenStyles.goldText}>
          {gold.toLocaleString()}
        </div>
      </div>
    </div>
  );
}; 