import React from 'react';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, getUnifiedStatusDisplay } from '../../../utils/numberFormatting';

interface PackageCardProps {
  packageId: string;
  name: string;
  description: string;
  cost: number;
  waveRequirement: { min: number; max?: number };
  icon: string;
  color: string;
  onPurchase: () => void;
  benefits: string[];
  isElite?: boolean;
  purchaseLimit?: number;
  // Game state props
  gold: number;
  currentWave: number;
  diceResult: number | null;
  discountMultiplier: number;
  getPackageInfo: (packageId: string, purchaseLimit: number) => { isMaxed: boolean; purchaseCount: number };
  purchasePackage: (packageId: string, cost: number, purchaseLimit: number) => boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageId,
  name,
  description,
  cost,
  waveRequirement,
  icon,
  color,
  onPurchase,
  benefits,
  isElite = false,
  purchaseLimit = 1,
  gold,
  currentWave,
  diceResult,
  discountMultiplier,
  getPackageInfo,
  purchasePackage
}) => {
  const packageInfo = getPackageInfo(packageId, purchaseLimit);
  const isMaxed = packageInfo.isMaxed;
  const currentPurchases = packageInfo.purchaseCount;
  
  const isWaveValid = currentWave >= waveRequirement.min && 
                    (!waveRequirement.max || currentWave <= waveRequirement.max);
  
  let finalCost = cost;
  if (diceResult && diceResult === 6) {
    finalCost = Math.floor(cost * 0.5);
  } else if (diceResult && diceResult === 5) {
    finalCost = Math.floor(cost * 0.7);
  } else if (diceResult && diceResult === 4) {
    finalCost = Math.floor(cost * 0.85);
  }
  
  if (discountMultiplier !== 1) {
    finalCost = Math.floor(finalCost / discountMultiplier);
  }
  
  const canAfford = gold >= finalCost && !isMaxed && isWaveValid;
  
  const handlePurchase = () => {
    if (canAfford) {
      const success = purchasePackage(packageId, finalCost, purchaseLimit);
      if (success) {
        onPurchase();
      }
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
        border: `3px solid ${isMaxed ? '#666' : canAfford ? color : !isWaveValid ? '#444' : 'rgba(255,255,255,0.2)'}`,
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 200,
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: !isWaveValid ? 0.5 : isMaxed ? 0.7 : 1,
        boxShadow: canAfford ? `0 8px 24px ${color}40` : 'none',
        transform: canAfford ? 'translateY(-2px)' : 'none',
      }}
      onClick={canAfford ? handlePurchase : undefined}
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
        Wave {waveRequirement.min}{waveRequirement.max ? `-${waveRequirement.max}` : '+'}
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
        alignItems: 'center', 
        gap: 12,
        borderBottom: `2px solid ${color}30`,
        paddingBottom: 12,
        marginTop: 12
      }}>
        <div style={{ fontSize: 32 }}>{icon}</div>
        <div>
          <div style={{ 
            fontSize: 18, 
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
            {getUnifiedStatusDisplay(currentPurchases, purchaseLimit, isMaxed)}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: 13, 
        color: '#ddd', 
        lineHeight: 1.4,
        flex: 1
      }}>
        {description}
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
          {cost !== finalCost && (
            <div style={{ 
              fontSize: 12, 
              color: '#999', 
              textDecoration: 'line-through'
            }}>
              {formatCurrency(cost)} 💰
            </div>
          )}
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold',
            color: isMaxed ? '#4ade80' : getAffordabilityColor(finalCost, gold)
          }}>
            {isMaxed ? '✅ TAMAMLANDI' : `${formatCurrency(finalCost)} 💰`}
          </div>
        </div>
        
        {!isMaxed && (
          <div style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: canAfford 
              ? `linear-gradient(135deg, ${color}, ${color}cc)` 
              : !isWaveValid 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.1)',
            color: canAfford ? '#fff' : !isWaveValid ? '#666' : '#666',
            fontSize: 14,
            fontWeight: 'bold',
            border: `2px solid ${canAfford ? color : '#666'}`,
            textShadow: canAfford ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
          }}>
            {getUnifiedButtonText(isMaxed, canAfford, !isWaveValid, 'package')}
          </div>
        )}
      </div>
    </div>
  );
}; 