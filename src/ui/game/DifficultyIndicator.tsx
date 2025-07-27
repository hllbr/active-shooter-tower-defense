/**
 * 🎯 Difficulty Indicator Component
 * Displays current difficulty level, performance metrics, and adjustment reasons
 */

import React, { useState, useEffect } from 'react';
import { dynamicDifficultyManager } from '../../game-systems/DynamicDifficultyManager';
import type { DifficultyAdjustment, PlayerPowerLevel } from '../../game-systems/DynamicDifficultyManager';
import './DifficultyIndicator.css';

interface DifficultyIndicatorProps {
  isVisible?: boolean;
}

export const DifficultyIndicator = ({ 
  isVisible = true 
}: DifficultyIndicatorProps) => {
  const [difficultyAdjustment, setDifficultyAdjustment] = useState<DifficultyAdjustment | null>(null);
  const [playerPower, setPlayerPower] = useState<PlayerPowerLevel | null>(null);
  const [performanceTrend, setPerformanceTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateDifficultyInfo = () => {
      try {
        const adjustment = dynamicDifficultyManager.getCurrentDifficultyAdjustment();
        const power = dynamicDifficultyManager.getPlayerPowerLevel();
        const trend = dynamicDifficultyManager.getPerformanceTrend();

        setDifficultyAdjustment(adjustment);
        setPlayerPower(power);
        setPerformanceTrend(trend);
      } catch {
        // Silent fail for production
      }
    };

    // Update immediately
    updateDifficultyInfo();

    // Update every 5 seconds
    const interval = setInterval(updateDifficultyInfo, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || !difficultyAdjustment) {
    return null;
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#4ade80'; // Green
      case 'normal': return '#fbbf24'; // Yellow
      case 'hard': return '#f97316'; // Orange
      case 'extreme': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️';
      case 'declining': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getPowerLevelColor = (powerScore: number) => {
    if (powerScore < 0.3) return '#ef4444'; // Red for weak
    if (powerScore < 0.6) return '#fbbf24'; // Yellow for average
    if (powerScore < 0.85) return '#4ade80'; // Green for strong
    return '#8b5cf6'; // Purple for overpowered
  };

  return (
    <div className="difficulty-indicator">
      <div 
        className="difficulty-header"
        onClick={() => setShowDetails(!showDetails)}
        style={{ cursor: 'pointer' }}
      >
        <div className="difficulty-level">
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(difficultyAdjustment.difficultyLevel) }}
          >
            {difficultyAdjustment.difficultyLevel.toUpperCase()}
          </span>
          <span className="trend-icon">{getTrendIcon(performanceTrend)}</span>
        </div>
        
        {playerPower && (
          <div className="power-indicator">
            <div 
              className="power-bar"
              style={{ 
                width: `${playerPower.powerScore * 100}%`,
                backgroundColor: getPowerLevelColor(playerPower.powerScore)
              }}
            />
          </div>
        )}
      </div>

      {showDetails && (
        <div className="difficulty-details">
          <div className="detail-section">
            <h4>Enemy Adjustments</h4>
            <div className="adjustment-grid">
              <div className="adjustment-item">
                <span className="label">Health:</span>
                <span className="value">×{difficultyAdjustment.enemyHealthMultiplier.toFixed(2)}</span>
              </div>
              <div className="adjustment-item">
                <span className="label">Speed:</span>
                <span className="value">×{difficultyAdjustment.enemySpeedMultiplier.toFixed(2)}</span>
              </div>
              <div className="adjustment-item">
                <span className="label">Damage:</span>
                <span className="value">×{difficultyAdjustment.enemyDamageMultiplier.toFixed(2)}</span>
              </div>
              <div className="adjustment-item">
                <span className="label">Spawn Rate:</span>
                <span className="value">×{difficultyAdjustment.spawnRateMultiplier.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Boss Adjustments</h4>
            <div className="adjustment-grid">
              <div className="adjustment-item">
                <span className="label">Health:</span>
                <span className="value">×{difficultyAdjustment.bossHealthMultiplier.toFixed(2)}</span>
              </div>
              <div className="adjustment-item">
                <span className="label">Damage:</span>
                <span className="value">×{difficultyAdjustment.bossDamageMultiplier.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {playerPower && (
            <div className="detail-section">
              <h4>Player Power</h4>
              <div className="power-details">
                <div className="power-item">
                  <span className="label">Level:</span>
                  <span className="value">{playerPower.averageTowerLevel.toFixed(1)}</span>
                </div>
                <div className="power-item">
                  <span className="label">Damage:</span>
                  <span className="value">{playerPower.totalTowerDamage.toLocaleString()}</span>
                </div>
                <div className="power-item">
                  <span className="label">Health:</span>
                  <span className="value">{playerPower.totalTowerHealth.toLocaleString()}</span>
                </div>
                <div className="power-item">
                  <span className="label">Investment:</span>
                  <span className="value">{playerPower.upgradeInvestment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>Adjustment Reason</h4>
            <p className="adjustment-reason">{difficultyAdjustment.adjustmentReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultyIndicator; 