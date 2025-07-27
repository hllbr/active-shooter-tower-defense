import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../../models/store';
import { waveCompositions, getWaveDifficulty, getWaveEnemyCount, getWaveComplexity } from '../../../../config/waves';
import { waveRules, hasGuaranteedMiniEvent, getMiniEventInfo } from '../../../../config/waveRules';
import { getWavePrepTime, getWaveSpawnRate } from '../../../../config/waves';

// ✅ ENHANCED: Wave Preview Overlay with Mini-Event Display
export const WavePreviewOverlay = () => {
  const { showWavePreview, wavePreviewCountdown, currentWave } = useGameStore();
  const [timeRemaining, setTimeRemaining] = useState(wavePreviewCountdown);

  useEffect(() => {
    setTimeRemaining(wavePreviewCountdown);
  }, [wavePreviewCountdown]);

  useEffect(() => {
    if (!showWavePreview || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 100));
    }, 100);

    return () => clearInterval(interval);
  }, [showWavePreview, timeRemaining]);

  if (!showWavePreview) return null;

  const waveComposition = waveCompositions[currentWave];
  const waveDifficulty = getWaveDifficulty(currentWave);
  const enemyCount = getWaveEnemyCount(currentWave);
  const complexity = getWaveComplexity(currentWave);
  const prepTime = getWavePrepTime(currentWave);
  const spawnRate = getWaveSpawnRate(currentWave);
  const waveModifier = waveRules[currentWave];
  const hasMiniEvent = hasGuaranteedMiniEvent(currentWave);
  const miniEventInfo = getMiniEventInfo(currentWave);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Tutorial': return '#4CAF50';
      case 'Beginner': return '#8BC34A';
      case 'Intermediate': return '#FFC107';
      case 'Advanced': return '#FF9800';
      case 'Nightmare': return '#F44336';
      case 'God Tier': return '#9C27B0';
      case 'Universe Ending': return '#E91E63';
      default: return '#2196F3';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 20) return '#4CAF50';
    if (complexity <= 50) return '#8BC34A';
    if (complexity <= 100) return '#FFC107';
    if (complexity <= 200) return '#FF9800';
    if (complexity <= 500) return '#F44336';
    return '#9C27B0';
  };

  return (
    <div className="wave-preview-overlay">
      <div className="wave-preview-content">
        {/* Header */}
        <div className="wave-preview-header">
          <h2>Wave {currentWave} Preview</h2>
          <div className="wave-difficulty" style={{ color: getDifficultyColor(waveDifficulty) }}>
            {waveDifficulty}
          </div>
        </div>

        {/* Wave Stats */}
        <div className="wave-stats">
          <div className="stat-item">
            <span className="stat-label">Enemies:</span>
            <span className="stat-value">{enemyCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Complexity:</span>
            <span className="stat-value" style={{ color: getComplexityColor(complexity) }}>
              {Math.round(complexity)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Prep Time:</span>
            <span className="stat-value">{formatTime(prepTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Spawn Rate:</span>
            <span className="stat-value">{formatTime(spawnRate)}</span>
          </div>
        </div>

        {/* Enemy Composition */}
        {waveComposition && (
          <div className="enemy-composition">
            <h3>Enemy Composition</h3>
            <div className="enemy-list">
              {waveComposition.map((enemy, index) => (
                <div key={index} className="enemy-item">
                  <span className="enemy-type">{enemy.type}</span>
                  <span className="enemy-count">x{enemy.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wave Modifiers */}
        {waveModifier && (
          <div className="wave-modifiers">
            <h3>Wave Modifiers</h3>
            <div className="modifier-list">
              {waveModifier.speedMultiplier && (
                <div className="modifier-item speed">
                  <span className="modifier-icon">⚡</span>
                  <span className="modifier-text">
                    Enemies {waveModifier.speedMultiplier > 1 ? 'faster' : 'slower'} 
                    (x{waveModifier.speedMultiplier})
                  </span>
                </div>
              )}
              {waveModifier.bonusEnemies && (
                <div className="modifier-item bonus">
                  <span className="modifier-icon">🎯</span>
                  <span className="modifier-text">Bonus enemies spawn</span>
                </div>
              )}
              {waveModifier.towerRangeReduced && (
                <div className="modifier-item range">
                  <span className="modifier-icon">📏</span>
                  <span className="modifier-text">Tower range reduced</span>
                </div>
              )}
              {waveModifier.disableTowerType && (
                <div className="modifier-item disable">
                  <span className="modifier-icon">🚫</span>
                  <span className="modifier-text">
                    {waveModifier.disableTowerType} towers disabled
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mini-Event Information */}
        {hasMiniEvent && miniEventInfo && (
          <div className="mini-event-info">
            <h3>🎉 Special Event: {miniEventInfo.description}</h3>
            <div className="event-details">
              <div className="event-type">{miniEventInfo.eventType.replace('_', ' ').toUpperCase()}</div>
              <div className="event-guaranteed">Guaranteed Event</div>
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className="wave-countdown">
          <div className="countdown-text">
            Wave starts in: {formatTime(timeRemaining)}
          </div>
          <div className="countdown-bar">
            <div 
              className="countdown-progress" 
              style={{ width: `${(timeRemaining / wavePreviewCountdown) * 100}%` }}
            />
          </div>
        </div>

        {/* Strategic Tips */}
        <div className="strategic-tips">
          <h3>💡 Strategic Tips</h3>
          <div className="tips-list">
            {waveModifier?.speedMultiplier && waveModifier.speedMultiplier > 1 && (
              <div className="tip-item">
                • Upgrade fire rate and use slowing effects for faster enemies
              </div>
            )}
            {waveModifier?.bonusEnemies && (
              <div className="tip-item">
                • Focus on damage upgrades and area effects for bonus enemies
              </div>
            )}
            {waveModifier?.towerRangeReduced && (
              <div className="tip-item">
                • Build more towers and focus on strategic positioning
              </div>
            )}
            {waveModifier?.disableTowerType && (
              <div className="tip-item">
                • Adapt your strategy and use other tower types
              </div>
            )}
            {hasMiniEvent && (
              <div className="tip-item">
                • Prepare for the special event challenge!
              </div>
            )}
            {complexity > 100 && (
              <div className="tip-item">
                • This is a complex wave - focus on efficient tower placement
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wave-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .wave-preview-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #4a90e2;
          border-radius: 15px;
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          color: white;
        }

        .wave-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #4a90e2;
        }

        .wave-preview-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #4a90e2;
        }

        .wave-difficulty {
          font-size: 18px;
          font-weight: bold;
          padding: 5px 15px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid currentColor;
        }

        .wave-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-label {
          font-size: 14px;
          color: #b0b0b0;
        }

        .stat-value {
          font-size: 16px;
          font-weight: bold;
          color: #4a90e2;
        }

        .enemy-composition {
          margin-bottom: 25px;
        }

        .enemy-composition h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4a90e2;
        }

        .enemy-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .enemy-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .enemy-type {
          font-size: 14px;
          color: #e0e0e0;
        }

        .enemy-count {
          font-size: 14px;
          font-weight: bold;
          color: #ff6b6b;
        }

        .wave-modifiers {
          margin-bottom: 25px;
        }

        .wave-modifiers h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4a90e2;
        }

        .modifier-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modifier-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modifier-item.speed {
          background: rgba(255, 193, 7, 0.1);
          border-color: #ffc107;
        }

        .modifier-item.bonus {
          background: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
        }

        .modifier-item.range {
          background: rgba(244, 67, 54, 0.1);
          border-color: #f44336;
        }

        .modifier-item.disable {
          background: rgba(156, 39, 176, 0.1);
          border-color: #9c27b0;
        }

        .modifier-icon {
          font-size: 18px;
        }

        .modifier-text {
          font-size: 14px;
          color: #e0e0e0;
        }

        .mini-event-info {
          margin-bottom: 25px;
          padding: 15px;
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
          border: 2px solid #ffc107;
          border-radius: 10px;
        }

        .mini-event-info h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #ffc107;
        }

        .event-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-type {
          font-size: 14px;
          font-weight: bold;
          color: #ff9800;
        }

        .event-guaranteed {
          font-size: 12px;
          color: #4caf50;
          background: rgba(76, 175, 80, 0.2);
          padding: 3px 8px;
          border-radius: 12px;
        }

        .wave-countdown {
          margin-bottom: 25px;
          text-align: center;
        }

        .countdown-text {
          font-size: 18px;
          font-weight: bold;
          color: #4a90e2;
          margin-bottom: 10px;
        }

        .countdown-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .countdown-progress {
          height: 100%;
          background: linear-gradient(90deg, #4a90e2 0%, #7bb3f0 100%);
          transition: width 0.1s linear;
        }

        .strategic-tips {
          margin-bottom: 20px;
        }

        .strategic-tips h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4a90e2;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tip-item {
          font-size: 14px;
          color: #b0b0b0;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border-left: 3px solid #4a90e2;
        }

        @media (max-width: 768px) {
          .wave-preview-content {
            padding: 20px;
            margin: 20px;
          }

          .wave-stats {
            grid-template-columns: 1fr;
          }

          .enemy-list {
            grid-template-columns: 1fr;
          }

          .wave-preview-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}; 