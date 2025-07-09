import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';

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

  // Get rarity-like color based on state
  const getRarityColor = (): string => {
    if (isMaxedPackage) return '#4ade80'; // Green for completed
    if (!isWaveValid) return '#6B7280'; // Gray for not available
    if (canAfford) return color; // Original color for affordable
    return '#6B7280'; // Gray for not affordable
  };

  return (
    <div
      style={{
        backgroundColor: '#2D3748',
        border: `2px solid ${getRarityColor()}`,
        borderRadius: '12px',
        padding: '20px',
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: !isWaveValid ? 0.5 : isMaxedPackage ? 0.8 : canAfford ? 1 : 0.6,
        boxShadow: canAfford ? `0 4px 12px ${color}40` : '0 4px 12px rgba(0, 0, 0, 0.3)',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onClick={handlePurchase}
      onMouseEnter={(e) => {
        if (canAfford && !isMaxedPackage) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${color}60`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = canAfford ? `0 4px 12px ${color}40` : '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
    >
      {/* Elite Badge */}
      {isElite && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: 'linear-gradient(45deg, #8B5CF6, #A855F7)',
          color: '#FFF',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '12px',
          border: '2px solid #FFF',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.5)',
          zIndex: 10
        }}>
          ⚡ ELİTE
        </div>
      )}

      {/* Wave Requirement Badge */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        left: '-8px',
        background: !isWaveValid ? '#6B7280' : '#10B981',
        color: '#FFF',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '12px',
        border: '2px solid #FFF',
        zIndex: 10
      }}>
        Dalga {waveRequirement.min}{waveRequirement.max ? `-${waveRequirement.max}` : '+'}
      </div>

      {/* Discount Badge */}
      {(diceResult && diceResult >= 4) && (
        <div style={{
          position: 'absolute',
          top: '28px',
          left: '-8px',
          background: '#EF4444',
          color: '#FFF',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '12px',
          border: '2px solid #FFF',
          animation: 'pulse 2s infinite',
          zIndex: 10
        }}>
          🎯 İNDİRİM
        </div>
      )}

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
              Paket ({purchaseCount}/{maxAllowed})
            </div>
          </div>
        </div>
        <div style={{ 
          color: '#F59E0B', 
          fontSize: '16px', 
          fontWeight: 'bold',
          textAlign: 'right'
        }}>
          {isMaxedPackage ? '✅ MAX' : `${finalCost}💰`}
        </div>
      </div>

      {/* Card Description */}
      <div style={{ flex: 1 }}>
        <p style={{ 
          color: '#D1D5DB', 
          fontSize: '14px', 
          lineHeight: '1.4', 
          margin: '0 0 12px 0' 
        }}>
          {description}
        </p>

        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <div style={{ 
            backgroundColor: '#1A202C',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #4A5568',
            marginTop: '12px'
          }}>
            <h4 style={{ 
              color: '#FFF', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0' 
            }}>
              🎁 Paket İçeriği:
            </h4>
            <ul style={{ 
              color: '#D1D5DB', 
              fontSize: '13px', 
              margin: 0, 
              paddingLeft: '16px' 
            }}>
              {benefits.map((benefit, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discount Info */}
        {diceUsed && discount > 0 && !isMaxedPackage && (
          <div style={{ 
            backgroundColor: '#1A202C',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #EF4444',
            marginTop: '8px'
          }}>
            <div style={{ 
              color: '#EF4444', 
              fontSize: '13px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>🎯</span>
              <span>Zar İndirimi: {formatCurrency(baseCost)} → {formatCurrency(finalCost)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handlePurchase}
        disabled={!canAfford || isMaxedPackage}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isMaxedPackage ? '#4ade80' : canAfford ? color : '#4A5568',
          color: '#FFF',
          border: 'none',
          borderRadius: '8px',
          cursor: canAfford && !isMaxedPackage ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (canAfford && !isMaxedPackage) {
            e.currentTarget.style.backgroundColor = `${color}dd`;
          }
        }}
        onMouseLeave={(e) => {
          if (canAfford && !isMaxedPackage) {
            e.currentTarget.style.backgroundColor = color;
          }
        }}
      >
        {isMaxedPackage ? (
          <>
            <span>✅</span>
            <span>Tamamlandı</span>
          </>
        ) : !isWaveValid ? (
          <>
            <span>🔒</span>
            <span>Dalga {waveRequirement.min} Gerekli</span>
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