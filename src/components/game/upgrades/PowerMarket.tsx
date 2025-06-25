import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, getUnifiedCostDisplay, getUnifiedLevelDisplay } from '../../../utils/numberFormatting';

export const PowerMarket: React.FC = () => {
  const { 
    gold, 
    setGold, 
    energyBoostLevel, 
    setEnergyBoostLevel, 
    maxActionsLevel, 
    setMaxActionsLevel,
    eliteModuleLevel,
    setEliteModuleLevel,
    discountMultiplier,
    diceResult 
  } = useGameStore();

  const createUpgrade = (
    name: string,
    description: string,
    currentLevel: number,
    baseCost: number,
    maxLevel: number,
    onUpgrade: () => void,
    icon: string,
    color: string,
    isElite = false,
    additionalInfo?: string
  ) => {
    const isMaxed = currentLevel >= maxLevel;
    
    // Zar indirim sistemi - tüm yükseltmeler için geçerli
    let finalCost = baseCost;
    if (diceResult && diceResult === 6) {
      finalCost = Math.floor(baseCost * 0.5); // %50 indirim
    } else if (diceResult && diceResult === 5) {
      finalCost = Math.floor(baseCost * 0.7); // %30 indirim
    } else if (diceResult && diceResult === 4) {
      finalCost = Math.floor(baseCost * 0.85); // %15 indirim
    }
    
    // Evrensel indirim çarpanı uygula
    if (discountMultiplier !== 1) {
      finalCost = Math.floor(finalCost / discountMultiplier);
    }
    
    const canAfford = gold >= finalCost && !isMaxed;

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
          border: `3px solid ${isMaxed ? '#4ade80' : canAfford ? color : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 180,
          position: 'relative',
          transition: 'all 0.3s ease',
          cursor: canAfford ? 'pointer' : 'not-allowed',
          opacity: isMaxed ? 0.8 : 1,
          boxShadow: canAfford ? `0 8px 24px ${color}40` : 'none',
          transform: canAfford ? 'translateY(-2px)' : 'none',
        }}
        onClick={canAfford ? onUpgrade : undefined}
      >
        {/* Elite Badge */}
        {isElite && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: 'linear-gradient(45deg, #ffd700, #ffed4a)',
            color: '#000',
            fontSize: 10,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: 12,
            border: '2px solid #fff',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.5)',
          }}>
            ⭐ ELİTE
          </div>
        )}

        {/* Discount Badge */}
        {(diceResult && diceResult >= 4) && (
          <div style={{
            position: 'absolute',
            top: -8,
            left: -8,
            background: '#ef4444',
            color: 'white',
            fontSize: 11,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: 12,
            border: '2px solid #fff',
            animation: 'pulse 2s infinite'
          }}>
            🎯 İNDİRİM
          </div>
        )}

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          borderBottom: `2px solid ${color}30`,
          paddingBottom: 12
        }}>
          <div style={{ fontSize: 28 }}>{icon}</div>
          <div>
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: color,
              textShadow: `0 0 10px ${color}50`
            }}>
              {name}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: isMaxed ? '#4ade80' : '#ccc',
              opacity: 0.9,
              fontWeight: isMaxed ? 'bold' : 'normal'
            }}>
              {getUnifiedLevelDisplay(currentLevel, maxLevel, isMaxed)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ 
          fontSize: 13, 
          color: '#ddd', 
          lineHeight: 1.4,
          flex: 1
        }}>
          {description}
          {additionalInfo && (
            <div style={{ 
              marginTop: 8, 
              fontSize: 11, 
              color: color, 
              opacity: 0.8,
              fontStyle: 'italic' 
            }}>
              {additionalInfo}
            </div>
          )}
        </div>

        {/* Cost & Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: `2px solid ${color}30`,
          paddingTop: 12
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 4
          }}>
            {baseCost !== finalCost && (
              <div style={{ 
                fontSize: 12, 
                color: '#999', 
                textDecoration: 'line-through'
              }}>
                {formatCurrency(baseCost)} 💰
              </div>
            )}
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: isMaxed ? '#4ade80' : getAffordabilityColor(finalCost, gold)
            }}>
              {getUnifiedCostDisplay(finalCost, baseCost !== finalCost ? baseCost : undefined, isMaxed).mainText}
            </div>
          </div>
          
          {!isMaxed && (
            <div style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: canAfford 
                ? `linear-gradient(135deg, ${color}, ${color}cc)` 
                : 'rgba(255,255,255,0.1)',
              color: canAfford ? '#fff' : '#666',
              fontSize: 14,
              fontWeight: 'bold',
              border: `2px solid ${canAfford ? color : '#666'}`,
              textShadow: canAfford ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
            }}>
              {getUnifiedButtonText(isMaxed, canAfford, false, 'purchase')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: 20
    }}>
      {createUpgrade(
        'Enerji Güçlendirici',
        'Maksimum enerji kapasitesini artırır ve enerji yenileme hızını yükseltir.',
        energyBoostLevel,
        GAME_CONSTANTS.ENERGY_BOOST_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, energyBoostLevel),
        GAME_CONSTANTS.MAX_ENERGY_BOOST_LEVEL,
        () => {
          const cost = GAME_CONSTANTS.ENERGY_BOOST_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, energyBoostLevel);
          let finalCost = cost;
          
          if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
          else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
          else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
          
          if (discountMultiplier !== 1) {
            finalCost = Math.floor(finalCost / discountMultiplier);
          }
          
          setGold(gold - finalCost);
          setEnergyBoostLevel(energyBoostLevel + 1);
        },
        '⚡',
        '#fbbf24',
        false,
        'Her seviye +20 enerji kapasitesi'
      )}

      {createUpgrade(
        'Aksiyon Sistemi',
        'Wave başına maksimum aksiyon sayısını artırır ve daha fazla harita değişikliği yapma imkanı sağlar.',
        maxActionsLevel,
        GAME_CONSTANTS.MAX_ACTIONS_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, maxActionsLevel),
        GAME_CONSTANTS.MAX_MAX_ACTIONS_LEVEL,
        () => {
          const cost = GAME_CONSTANTS.MAX_ACTIONS_COST * Math.pow(GAME_CONSTANTS.COST_MULTIPLIER, maxActionsLevel);
          let finalCost = cost;
          
          if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
          else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
          else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
          
          if (discountMultiplier !== 1) {
            finalCost = Math.floor(finalCost / discountMultiplier);
          }
          
          setGold(gold - finalCost);
          setMaxActionsLevel(maxActionsLevel + 1);
        },
        '🎯',
        '#06b6d4',
        false,
        'Her seviye +1 aksiyon'
      )}

      {createUpgrade(
        'Elite Modül',
        'Gelişmiş oyun mekaniği açar ve özel yetenekler kazandırır. En üst seviye güçlendirme.',
        eliteModuleLevel,
        GAME_CONSTANTS.ELITE_MODULE_COST * Math.pow(GAME_CONSTANTS.ELITE_COST_MULTIPLIER, eliteModuleLevel),
        GAME_CONSTANTS.MAX_ELITE_MODULE_LEVEL,
        () => {
          const cost = GAME_CONSTANTS.ELITE_MODULE_COST * Math.pow(GAME_CONSTANTS.ELITE_COST_MULTIPLIER, eliteModuleLevel);
          let finalCost = cost;
          
          if (diceResult && diceResult === 6) finalCost = Math.floor(cost * 0.5);
          else if (diceResult && diceResult === 5) finalCost = Math.floor(cost * 0.7);
          else if (diceResult && diceResult === 4) finalCost = Math.floor(cost * 0.85);
          
          if (discountMultiplier !== 1) {
            finalCost = Math.floor(finalCost / discountMultiplier);
          }
          
          setGold(gold - finalCost);
          setEliteModuleLevel(eliteModuleLevel + 1);
        },
        '🚀',
        '#8b5cf6',
        true,
        'Özel yetenekler ve bonuslar'
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}; 