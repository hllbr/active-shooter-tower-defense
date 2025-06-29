import React from 'react';
import type { DiceSystemSectionProps } from './types';
import { upgradeScreenStyles } from './styles';
import { DiceRoller } from '../upgrades/DiceRoller';
import { DiscountStatusSection } from './DiscountStatusSection';
import { DiceSystemDescription } from './DiceSystemDescription';

export const DiceSystemSection: React.FC<DiceSystemSectionProps> = ({ discountMultiplier }) => {
  return (
    <div style={upgradeScreenStyles.diceSystemContainer}>
      {/* Enhanced Dice System */}
      <div style={upgradeScreenStyles.diceSystemMain}>
        <div style={upgradeScreenStyles.diceSystemTitle}>
          🎲 Evrensel İndirim Sistemi
        </div>
        
        <DiceRoller />
        
        <DiceSystemDescription />
      </div>

      {/* Current Discount Status */}
      <DiscountStatusSection discountMultiplier={discountMultiplier} />
    </div>
  );
}; 