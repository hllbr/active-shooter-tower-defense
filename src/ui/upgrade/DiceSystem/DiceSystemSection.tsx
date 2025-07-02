import React from 'react';
import type { DiceSystemSectionProps } from '../types';
import { diceSystemStyles } from './diceSystemStyles';
import { DiceRoller } from '../../game/upgrades/DiceRoller';
import { DiceSystemDescription } from './DiceSystemDescription';
import { DiscountStatusSection } from '../Discount/DiscountStatusSection';
  

export const DiceSystemSection: React.FC<DiceSystemSectionProps> = ({ discountMultiplier }) => {
  return (
    <div style={diceSystemStyles.diceSystemContainer}>
      {/* Enhanced Dice System */}
      <div style={diceSystemStyles.diceSystemMain}>
        <div style={diceSystemStyles.diceSystemTitle}>
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