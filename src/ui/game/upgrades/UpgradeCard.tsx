import React from 'react';
import type { UpgradeCardProps } from './types';
import { DiscountBadge } from './DiscountBadge';
import { calculateDiscountedCost } from './utils';
// import { playSound } from '../../../utils/sound/soundEffects'; // REMOVED: Use dynamic import

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, gold, diceResult, discountMultiplier }) => {
  const {
    name,
    description,
    currentLevel,
    baseCost,
    maxLevel,
    onUpgrade,
    icon,
    color,
    isElite = false,
    additionalInfo
  } = upgrade;

  const isMaxed = currentLevel >= maxLevel;
  const finalCost = calculateDiscountedCost(baseCost, diceResult, discountMultiplier);
  const canAfford = gold >= finalCost && !isMaxed;

  const handleUpgrade = () => {
    if (canAfford) {
      try {
        onUpgrade();
        // 🔊 ENHANCED: Play purchase success sound with dynamic import
        import('../../../utils/sound/soundEffects').then(({ playSound }) => {
          playSound('upgrade-purchase');
        });
      } catch (error) {
        console.error('❌ Upgrade failed:', error);
        // 🔊 ENHANCED: Play error sound on upgrade failure
        import('../../../utils/sound/soundEffects').then(({ playSound }) => {
          playSound('error');
        });
      }
    } else {
      // 🔊 ENHANCED: Play error sound when cannot afford
      import('../../../utils/sound/soundEffects').then(({ playSound }) => {
        playSound('error');
      });
    }
  };

  // Get rarity color based on affordability and state
  const getRarityColor = (): string => {
    if (isMaxed) return '#4ade80'; // Green for completed
    if (canAfford) return color; // Original color for affordable
    return '#6B7280'; // Gray for not affordable
  };

  return (
    <div
      role="button"
      aria-label={`${name} yükseltmesi. Seviye: ${currentLevel}/${maxLevel}. Maliyet: ${finalCost} altın. ${isMaxed ? 'Maksimum seviye.' : canAfford ? 'Yükseltme yapılabilir.' : 'Yetersiz altın.'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canAfford) {
          handleUpgrade();
        }
      }}
      style={{
        backgroundColor: '#2D3748',
        border: `2px solid ${getRarityColor()}`,
        borderRadius: '12px',
        padding: '20px',
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: isMaxed ? 0.8 : canAfford ? 1 : 0.6,
        boxShadow: canAfford ? `0 4px 12px ${color}40` : '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: canAfford ? 'none' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '200px'
      }}
      onClick={handleUpgrade}
      onMouseEnter={(e) => {
        if (canAfford) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${color}60`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = canAfford ? `0 4px 12px ${color}40` : '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
    >
      <DiscountBadge diceResult={diceResult} />
      
      {/* Card Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <span style={{ fontSize: '28px' }}>{icon}</span>
          <div>
            <h3 style={{ 
              color: '#FFF', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              {name}
            </h3>
            <div style={{ 
              color: color, 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginTop: '4px'
            }}>
              {isElite && <span style={{ color: '#8B5CF6' }}>⚡ ELITE </span>}
              Seviye: {currentLevel}/{maxLevel}
            </div>
          </div>
        </div>
        <div style={{ 
          color: '#F59E0B', 
          fontSize: '16px', 
          fontWeight: 'bold',
          textAlign: 'right'
        }}>
          {isMaxed ? '✅ MAX' : `${finalCost}💰`}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ flex: 1 }}>
        <p style={{ 
          color: '#D1D5DB', 
          fontSize: '14px', 
          lineHeight: '1.4', 
          margin: '0 0 12px 0' 
        }}>
          {description}
        </p>
        
        {additionalInfo && (
          <div style={{ 
            color: '#D1D5DB', 
            fontSize: '13px', 
            backgroundColor: '#1A202C',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #4A5568',
            marginTop: '8px'
          }}>
            <strong>Detaylar:</strong> {additionalInfo}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleUpgrade}
        disabled={!canAfford || isMaxed}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isMaxed ? '#4ade80' : canAfford ? color : '#4A5568',
          color: '#FFF',
          border: 'none',
          borderRadius: '8px',
          cursor: canAfford && !isMaxed ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (canAfford && !isMaxed) {
            e.currentTarget.style.backgroundColor = `${color}dd`;
          }
        }}
        onMouseLeave={(e) => {
          if (canAfford && !isMaxed) {
            e.currentTarget.style.backgroundColor = color;
          }
        }}
      >
        {isMaxed ? (
          <>
            <span>✅</span>
            <span>Tamamlandı</span>
          </>
        ) : canAfford ? (
          <>
            <span>💰</span>
            <span>Satın Al ({finalCost})</span>
          </>
        ) : (
          <>
            <span>💸</span>
            <span>Yetersiz Altın</span>
          </>
        )}
      </button>
    </div>
  );
}; 