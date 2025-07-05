import React, { useState, useCallback } from 'react';
import { useGameStore } from '../../../../models/store';
import { infoIconStyle, tooltipStyle } from '../../styles';

interface GameStatsPanelProps {
  onCommandCenterOpen?: () => void;
}

export const GameStatsPanel: React.FC<GameStatsPanelProps> = ({ onCommandCenterOpen }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const {
    gold,
    towers,
    maxTowers,
    actionsRemaining,
    actionRegenTime,
    maxActions,
    energy,
    maxEnergy,
    currentWave,
    enemiesKilled,
    enemiesRequired
  } = useGameStore();

  // ⚠️ FIXED: Event Listener Memory Leak
  // Use useCallback to prevent recreation and stable closure
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setShowTooltip(true);
    }
  }, []); // Empty deps - this handler is stable

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      setShowTooltip(false);
    }
  }, []); // Empty deps - this handler is stable

  // Tab tuşu ile tooltip açma/kapama - Enhanced with stable handlers
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Guaranteed cleanup - handlers are stable
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]); // Include handlers in deps

  return (
    <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Enhanced Info Icon - Standalone */}
      <div
        style={infoIconStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
          setShowTooltip(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          setShowTooltip(false);
        }}
      >
        📊
      </div>

      {/* Command Center Button */}
      <div
        style={{
          ...infoIconStyle,
          background: 'linear-gradient(135deg, #1e3a8a, #3730a3)',
          border: '2px solid #ffd700',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
        }}
        onClick={onCommandCenterOpen}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
        }}
        title="Komuta Merkezi (S)"
      >
        🎯
      </div>

      {/* Enhanced Tooltip - Left Aligned */}
      {showTooltip && (
        <div style={tooltipStyle}>
          {/* Header */}
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: '#3b82f6',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            📊 Oyun İstatistikleri
          </div>

          {/* Wave Progress Section */}
          <div style={{
            background: 'rgba(0, 207, 255, 0.1)',
            border: '1px solid rgba(0, 207, 255, 0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
          }}>
            <div style={{
              color: '#00cfff',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
              textShadow: '0 0 10px rgba(0, 207, 255, 0.5)'
            }}>
              🌊 Wave {currentWave}/100
            </div>
            
            <div style={{
              color: '#ffffff',
              fontSize: 12,
              textAlign: 'center',
              marginBottom: 8,
              opacity: 0.9
            }}>
              Kalan Düşman: {Math.max(0, enemiesRequired - enemiesKilled).toLocaleString()}
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 5,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              marginBottom: 6
            }}>
              {(() => {
                const progressPercentage = Math.min(100, (enemiesKilled / enemiesRequired) * 100);
                const progressWidth = `${progressPercentage}%`;
                const progressBackground = (() => {
                  if (progressPercentage < 25) return 'linear-gradient(90deg, #ef4444, #f87171)';
                  if (progressPercentage < 50) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                  if (progressPercentage < 75) return 'linear-gradient(90deg, #eab308, #facc15)';
                  if (progressPercentage < 95) return 'linear-gradient(90deg, #22c55e, #4ade80)';
                  return 'linear-gradient(90deg, #06b6d4, #0891b2)';
                })();
                
                return (
                  <>
                    <div style={{
                      width: progressWidth,
                      height: '100%',
                      background: progressBackground,
                      transition: 'all 0.4s ease'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      textShadow: '0 0 4px rgba(0, 0, 0, 0.8)'
                    }}>
                      {Math.round(progressPercentage)}%
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div style={{
              color: '#94a3b8',
              fontSize: 11,
              textAlign: 'center',
              opacity: 0.8
            }}>
              {enemiesKilled.toLocaleString()} / {enemiesRequired.toLocaleString()}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gap: 8 }}>
            {/* Gold Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: 6,
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 12 }}>💰 Altın</span>
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 12 }}>{gold.toLocaleString()}</span>
            </div>

            {/* Tower Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(74, 222, 128, 0.1)',
              borderRadius: 6,
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}>
              <span style={{ color: '#4ade80', fontSize: 12 }}>🏰 Kuleler</span>
              <span style={{ color: '#4ade80', fontSize: 12 }}>{towers.length}/{maxTowers}</span>
            </div>

            {/* Actions Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: 6,
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}>
              <span style={{ color: '#fbbf24', fontSize: 12 }}>⚡ Aksiyonlar</span>
              <span style={{ color: '#fbbf24', fontSize: 12 }}>
                {actionsRemaining}/{maxActions}
                {actionRegenTime < 30000 && (
                  <span style={{ fontSize: 10, opacity: 0.8 }}>
                    {' '}(+1 {Math.ceil(actionRegenTime / 1000)}s)
                  </span>
                )}
              </span>
            </div>

            {/* Energy Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 6,
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <span style={{ color: '#8b5cf6', fontSize: 12 }}>🔋 Enerji</span>
              <span style={{ color: '#8b5cf6', fontSize: 12 }}>{Math.round(energy)}/{maxEnergy}</span>
            </div>
          </div>

          {/* Action Guide */}
          <div style={{ 
            marginTop: 12, 
            padding: '8px 10px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#e2e8f0', marginBottom: 4 }}>
              💡 Hızlı Kılavuz:
            </div>
            <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.3 }}>
              • <strong>Sol tık:</strong> Kule inşa et<br/>
              • <strong>Sağ tık:</strong> Kule yükselt<br/>
              • <strong>ESC:</strong> Yükseltme menüsü<br/>
              • <strong>Enerji:</strong> Her aksiyon enerji harcar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 