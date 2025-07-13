/**
 * 💰 Optimized Currency Display Component
 * Performance-optimized with useMemo and React.memo
 */

import React, { useMemo } from 'react';
import { useGameStore } from '../../models/store';
import { formatCurrency } from '../../utils/formatters';
import { getResourceStatus } from '../../utils/resourceValidation';

interface CurrencyDisplayProps {
  showEnergy?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  compact?: boolean;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = React.memo(({
  showEnergy = true,
  showActions = true,
  showStatus = false,
  compact = false,
  className = ''
}) => {
  // Use selector-based access for performance optimization
  const gold = useGameStore((state) => state.gold);
  const energy = useGameStore((state) => state.energy);
  const maxEnergy = useGameStore((state) => state.maxEnergy);
  const actionsRemaining = useGameStore((state) => state.actionsRemaining);
  const maxActions = useGameStore((state) => state.maxActions);
  
  // Memoized formatted values
  const formattedGold = useMemo(() => formatCurrency(gold), [gold]);
  const formattedEnergy = useMemo(() => `${Math.round(energy)}/${maxEnergy}`, [energy, maxEnergy]);
  const formattedActions = useMemo(() => `${actionsRemaining}/${maxActions}`, [actionsRemaining, maxActions]);
  
  // Memoized status calculation
  const resourceStatus = useMemo(() => {
    if (!showStatus) return null;
    return getResourceStatus(useGameStore.getState());
  }, [showStatus]);
  
  // Memoized status colors
  const statusColors = useMemo(() => {
    if (!resourceStatus) return {};
    
    const getStatusColor = (status: 'low' | 'medium' | 'high') => {
      switch (status) {
        case 'low': return '#ef4444';
        case 'medium': return '#fbbf24';
        case 'high': return '#4ade80';
        default: return '#ffffff';
      }
    };
    
    return {
      gold: getStatusColor(resourceStatus.goldStatus),
      energy: getStatusColor(resourceStatus.energyStatus),
      actions: getStatusColor(resourceStatus.actionStatus)
    };
  }, [resourceStatus]);
  
  // Memoized container style
  const containerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? '8px' : '12px',
    padding: compact ? '4px 8px' : '8px 12px',
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: compact ? '12px' : '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    ...(className && { className })
  }), [compact, className]);
  
  // Memoized resource item style
  const resourceItemStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }), []);
  
  return (
    <div style={containerStyle}>
      {/* Gold Display */}
      <div style={{
        ...resourceItemStyle,
        borderColor: statusColors.gold || 'rgba(255, 255, 255, 0.2)'
      }}>
        <span style={{ color: '#fbbf24' }}>💰</span>
        <span>{formattedGold}</span>
      </div>
      
      {/* Energy Display */}
      {showEnergy && (
        <div style={{
          ...resourceItemStyle,
          borderColor: statusColors.energy || 'rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{ color: '#00cfff' }}>⚡</span>
          <span>{formattedEnergy}</span>
        </div>
      )}
      
      {/* Actions Display */}
      {showActions && (
        <div style={{
          ...resourceItemStyle,
          borderColor: statusColors.actions || 'rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{ color: '#ffaa00' }}>🎯</span>
          <span>{formattedActions}</span>
        </div>
      )}
      
      {/* Status Indicators */}
      {showStatus && resourceStatus && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          fontSize: '10px',
          opacity: 0.8
        }}>
          {resourceStatus.recommendations.slice(0, 2).map((tip, index) => (
            <div key={index} style={{ color: '#fbbf24' }}>
              💡 {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

CurrencyDisplay.displayName = 'CurrencyDisplay';

// Export default for easier imports
export default CurrencyDisplay; 