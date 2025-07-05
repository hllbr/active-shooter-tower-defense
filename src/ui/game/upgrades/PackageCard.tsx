import React from 'react';
import { formatCurrency, getUnifiedButtonText } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';

import { UI_TEXTS } from '../../../utils/constants';

interface PackageCardProps {
  packageId: string;
  name: string;
  description: string;
  baseCost: number;
  waveRequirement: { min: number; max?: number };
  maxAllowed: number;
  purchaseCount: number;
  canPurchase: boolean;
  isMaxed: boolean;
  currentWave: number;
  gold: number;
  diceResult: number;
  discountMultiplier: number;
  diceUsed: boolean;
  onPurchase: (packageId: string, cost: number) => void;
  color?: string;
  icon?: string;
  benefits: string[];
  isElite?: boolean;
  purchaseLimit?: number;
  getPackageInfo: (packageId: string, purchaseLimit: number) => { isMaxed: boolean; purchaseCount: number };
  purchasePackage: (packageId: string, cost: number, purchaseLimit: number) => boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageId,
  name,
  description,
  baseCost,
  waveRequirement,
  maxAllowed,
  purchaseCount,
  canPurchase: _canPurchase,
  isMaxed: _isMaxed,
  currentWave,
  gold,
  diceResult,
  discountMultiplier,
  diceUsed,
  onPurchase,
  color = '#4ade80',
  icon = '📦',
  benefits,
  isElite = false,
  purchaseLimit = 1,
  getPackageInfo,
  purchasePackage
}) => {
  const packageInfo = getPackageInfo(packageId, purchaseLimit);
  const isMaxedPackage = packageInfo.isMaxed;
  const _currentPurchases = packageInfo.purchaseCount;
  
  const isWaveValid = currentWave >= waveRequirement.min && 
                    (!waveRequirement.max || currentWave <= waveRequirement.max);
  
  // Discount calculation
  const discount = diceUsed ? discountMultiplier : 0;
  const discountedCost = Math.floor(baseCost * (1 - discount));
  const finalCost = Math.max(1, discountedCost);
  
  const canAfford = gold >= finalCost && !isMaxedPackage && isWaveValid;
  
  const handlePurchase = () => {
    if (canAfford) {
      const success = purchasePackage(packageId, finalCost, purchaseLimit);
      if (success) {
        onPurchase(packageId, finalCost);
        playSound('upgrade-purchase');
      }
    }
  };

  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${color}22, ${color}11)`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        border: `3px solid ${isMaxedPackage ? '#666' : canAfford ? color : !isWaveValid ? '#444' : 'rgba(255,255,255,0.2)'}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: canAfford && !isMaxedPackage ? 'scale(1.02)' : 'scale(1)',
        opacity: !isWaveValid ? 0.5 : isMaxedPackage ? 0.7 : 1,
      }}
    >
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

      <div style={{
        position: 'absolute',
        top: -8,
        left: -8,
        background: !isWaveValid ? '#666' : '#4ade80',
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: 12,
        border: '2px solid #fff',
      }}>
        Dalga {waveRequirement.min}{waveRequirement.max ? `-${waveRequirement.max}` : '+'}
      </div>

      {(diceResult && diceResult >= 4) && (
        <div style={{
          position: 'absolute',
          top: 25,
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

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {icon} {name}
          </h4>
          <p style={{
            color: '#d1d5db',
            fontSize: 13,
            lineHeight: 1.4,
            margin: '0 0 8px 0'
          }}>
            {description}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}>
          <div style={{
            background: !isWaveValid ? '#666' : '#4ade80',
            color: '#000',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 'bold'
          }}>
            {UI_TEXTS.WAVE.RANGE(waveRequirement.min, waveRequirement.max || currentWave)}
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: isMaxedPackage ? '#4ade80' : '#fbbf24'
          }}>
            {purchaseCount}/{maxAllowed}
          </div>
        </div>
      </div>

      {diceUsed && discount > 0 && !isMaxedPackage && (
        <div style={{
          background: 'rgba(74, 222, 128, 0.2)',
          border: '1px solid #4ade80',
          borderRadius: 6,
          padding: '6px 10px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ fontSize: 12, color: '#4ade80' }}>
            🎲 İndirim: %{Math.round(discount * 100)} • Zar: {diceResult}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {!isMaxedPackage && (
            <>
              <span style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: canAfford ? '#fff' : !isWaveValid ? '#666' : '#ef4444'
              }}>
                {formatCurrency(finalCost)} 💰
              </span>
              {diceUsed && discount > 0 && (
                <span style={{
                  fontSize: 12,
                  color: '#888',
                  textDecoration: 'line-through'
                }}>
                  {formatCurrency(baseCost)} 💰
                </span>
              )}
            </>
          )}
        </div>

        <button
          onClick={handlePurchase}
          disabled={!canAfford || isMaxedPackage}
          style={{
            background: isMaxedPackage 
              ? '#4ade80' 
              : canAfford 
                ? color 
                : !isWaveValid 
                  ? '#666' 
                  : '#ef4444',
            color: canAfford ? '#fff' : !isWaveValid ? '#666' : '#666',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 'bold',
            cursor: canAfford && !isMaxedPackage ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            opacity: canAfford && !isMaxedPackage ? 1 : 0.8
          }}
          aria-label={isMaxedPackage 
            ? UI_TEXTS.ARIA_LABELS.MAX_LEVEL(name)
            : !isWaveValid
              ? UI_TEXTS.ARIA_LABELS.LOCKED(`Dalga ${waveRequirement.min} gerekli`)
              : UI_TEXTS.ARIA_LABELS.PURCHASE_BUTTON(name, finalCost)
          }
        >
          {isMaxedPackage ? UI_TEXTS.BUTTONS.MAXED : getUnifiedButtonText(isMaxedPackage, canAfford, !isWaveValid, 'package')}
        </button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: color, marginBottom: 8 }}>
          📋 Paket İçeriği:
        </div>
        {benefits.map((benefit, idx) => (
          <div key={idx} style={{ 
            fontSize: 11, 
            color: '#bbb', 
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: '#4ade80' }}>✓</span> {benefit}
          </div>
        ))}
      </div>
    </div>
  );
}; 