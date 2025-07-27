import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../../models/store';
import { waveCompositions } from '../../../config/waves';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { UI_TEXTS } from '../../../utils/constants/uiTexts';

interface WavePreviewOverlayProps {
  isVisible: boolean;
  onCountdownComplete: () => void;
}

export const WavePreviewOverlay = ({ isVisible, onCountdownComplete }: WavePreviewOverlayProps) => {
  const currentWave = useGameStore((state: any) => state.currentWave);
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Get wave composition for preview
  const waveComposition = useMemo(() => {
    const composition = waveCompositions[currentWave] || [];
    return composition.map((enemy: any) => ({
      ...enemy,
      icon: getEnemyIcon(enemy.type),
      color: getEnemyColor(enemy.type)
    }));
  }, [currentWave]);

  // Start countdown when overlay becomes visible
  useEffect(() => {
    if (isVisible && !isCountingDown) {
      setIsCountingDown(true);
      setCountdown(5);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsCountingDown(false);
            onCountdownComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible, isCountingDown, onCountdownComplete]);

  if (!isVisible) return null;

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        {/* Wave Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            🌊 {UI_TEXTS.WAVE.NEXT(currentWave)}
          </h2>
          <div style={subtitleStyle}>
            Get ready for the incoming wave!
          </div>
        </div>

        {/* Countdown Display */}
        <div style={countdownContainerStyle}>
          <div style={countdownStyle}>
            {countdown}
          </div>
          <div style={countdownLabelStyle}>
            {countdown === 1 ? 'second' : 'seconds'} remaining
          </div>
        </div>

        {/* Wave Composition Preview */}
        <div style={compositionStyle}>
          <h3 style={compositionTitleStyle}>Enemy Composition:</h3>
          <div style={enemyListStyle}>
            {waveComposition.map((enemy: any, index: number) => (
              <div key={index} style={enemyItemStyle}>
                <span style={{ fontSize: '20px' }}>{enemy.icon}</span>
                <span style={{ color: enemy.color, fontWeight: 'bold' }}>
                  {enemy.count}x {enemy.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Difficulty Indicator */}
        <div style={difficultyStyle}>
          <div style={difficultyLabelStyle}>
            Difficulty: {getDifficultyLevel(currentWave)}
          </div>
          <div style={difficultyBarStyle}>
            <div 
              style={{
                ...difficultyFillStyle,
                width: `${Math.min(100, (currentWave / 100) * 100)}%`,
                backgroundColor: getDifficultyColor(currentWave)
              }}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div style={tipsStyle}>
          <h4 style={tipsTitleStyle}>💡 Tips for this wave:</h4>
          <ul style={tipsListStyle}>
            {getWaveTips(currentWave).map((tip, index) => (
              <li key={index} style={tipItemStyle}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getEnemyIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Basic': '👾',
    'Scout': '⚡',
    'Tank': '🛡️',
    'Ghost': '👻',
    'Assassin': '🗡️',
    'Berserker': '😤',
    'Shaman': '🔮',
    'Archer': '🏹',
    'TankBoss': '👑',
    'GhostBoss': '👻👑'
  };
  return icons[type] || '👾';
};

const getEnemyColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Basic': '#4ade80',
    'Scout': '#fbbf24',
    'Tank': '#3b82f6',
    'Ghost': '#8b5cf6',
    'Assassin': '#ef4444',
    'Berserker': '#dc2626',
    'Shaman': '#ec4899',
    'Archer': '#10b981',
    'TankBoss': '#f59e0b',
    'GhostBoss': '#8b5cf6'
  };
  return colors[type] || '#4ade80';
};

const getDifficultyLevel = (wave: number): string => {
  if (wave <= 10) return 'Easy';
  if (wave <= 25) return 'Medium';
  if (wave <= 50) return 'Hard';
  if (wave <= 75) return 'Expert';
  return 'Master';
};

const getDifficultyColor = (wave: number): string => {
  if (wave <= 10) return '#4ade80';
  if (wave <= 25) return '#fbbf24';
  if (wave <= 50) return '#f97316';
  if (wave <= 75) return '#ef4444';
  return '#dc2626';
};

const getWaveTips = (wave: number): string[] => {
  const tips: string[] = [];
  
  if (wave <= 5) {
    tips.push('Focus on building basic towers first');
    tips.push('Use the preparation time wisely');
  } else if (wave <= 15) {
    tips.push('Consider upgrading your towers');
    tips.push('Watch out for faster enemies');
  } else if (wave <= 30) {
    tips.push('Mix different tower types for better coverage');
    tips.push('Save energy for critical moments');
  } else if (wave <= 50) {
    tips.push('Use special abilities strategically');
    tips.push('Don\'t forget to repair damaged towers');
  } else {
    tips.push('Every decision matters at this level');
    tips.push('Consider using defensive structures');
  }
  
  return tips;
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  backdropFilter: 'blur(8px)',
  animation: 'fadeIn 0.3s ease-out'
};

const containerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '3px solid #4a90e2',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  animation: 'slideUp 0.4s ease-out'
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px'
};

const titleStyle: React.CSSProperties = {
  color: '#4a90e2',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
};

const subtitleStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '16px',
  margin: 0
};

const countdownContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px'
};

const countdownStyle: React.CSSProperties = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#fbbf24',
  textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
  animation: 'pulse 1s ease-in-out infinite'
};

const countdownLabelStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '14px',
  marginTop: '8px'
};

const compositionStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const compositionTitleStyle: React.CSSProperties = {
  color: '#4a90e2',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0'
};

const enemyListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const enemyItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const difficultyStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const difficultyLabelStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '14px',
  marginBottom: '8px'
};

const difficultyBarStyle: React.CSSProperties = {
  height: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const difficultyFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.5s ease-out'
};

const tipsStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  paddingTop: '16px'
};

const tipsTitleStyle: React.CSSProperties = {
  color: '#fbbf24',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0'
};

const tipsListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  color: '#cbd5e0',
  fontSize: '14px',
  lineHeight: '1.5'
};

const tipItemStyle: React.CSSProperties = {
  marginBottom: '6px'
};

// Add keyframe animations to the document
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(style); 