import React, { useState } from 'react';
import { useGameStore } from '../../../../models/store';
import { SettingsPanel } from '../../../settings/SettingsPanel';

interface GameStatsPanelProps {
  onSettingsClick?: () => void;
  onChallengeClick?: () => void;
}

export const GameStatsPanel: React.FC<GameStatsPanelProps> = ({ onSettingsClick, onChallengeClick }) => {
  const { gold, energy } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 1000,
        }}
      >
        {/* Modern Resource Panel */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
            border: '2px solid #4A5568',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '260px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Gold */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flex: 1
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
              height: '32px',
              fontSize: '16px'
            }}>
              💰
            </div>
            <div>
              <div style={{ 
                color: '#F59E0B', 
                fontSize: '10px', 
                fontWeight: 'bold',
                marginBottom: '1px'
              }}>
                ALTIN
              </div>
              <div style={{ 
                color: '#FFF', 
                fontSize: '14px', 
                fontWeight: 'bold' 
              }}>
                {gold.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Energy */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flex: 1
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
              height: '32px',
              fontSize: '16px'
            }}>
              ⚡
            </div>
            <div>
              <div style={{ 
                color: '#3B82F6', 
                fontSize: '10px', 
                fontWeight: 'bold',
                marginBottom: '1px'
              }}>
                ENERJİ
              </div>
              <div style={{ 
                color: '#FFF', 
                fontSize: '14px', 
                fontWeight: 'bold' 
              }}>
                {Math.round(energy)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Settings Button */}
          <button
            style={{
              background: 'linear-gradient(135deg, #6B7280, #4B5563)',
              border: '2px solid #9CA3AF',
              borderRadius: '12px',
              padding: '10px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              flex: 1,
            }}
            onClick={() => onSettingsClick ? onSettingsClick() : setShowSettings(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
              e.currentTarget.style.borderColor = '#F59E0B';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6B7280, #4B5563)';
              e.currentTarget.style.borderColor = '#9CA3AF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
            }}
          >
            ⚙️ Ayarlar
          </button>

          {/* Achievements Button */}
          <button
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: '2px solid #34D399',
              borderRadius: '12px',
              padding: '10px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              flex: 1,
            }}
            onClick={() => onChallengeClick?.()}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
              e.currentTarget.style.borderColor = '#F59E0B';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #10B981, #059669)';
              e.currentTarget.style.borderColor = '#34D399';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
            }}
          >
            🏆 Görevler
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}; 