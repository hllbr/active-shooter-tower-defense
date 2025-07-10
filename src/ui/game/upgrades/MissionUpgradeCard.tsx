import React from 'react';
import { useGameStore } from '../../../models/store';
import type { 
  MissionBasedUpgrade, 
  MissionRequirement
} from './requirementHelpers';
import { 
  checkMissionBasedUpgradeRequirements,
  getMissionDisplayText,
  getMissionProgressColor
} from './requirementHelpers';
import { playSound } from '../../../utils/sound/soundEffects';

interface MissionUpgradeCardProps {
  mission: MissionBasedUpgrade;
  onClaim: (missionId: string) => void;
}

export const MissionUpgradeCard: React.FC<MissionUpgradeCardProps> = ({ 
  mission, 
  onClaim 
}) => {
  const { enemiesKilled, wavesCompleted, towersBuilt, goldEarned } = useGameStore();
  
  const { canClaim, progress } = checkMissionBasedUpgradeRequirements(
    { enemiesKilled, wavesCompleted, towersBuilt, goldEarned },
    mission
  );

  const handleClaim = () => {
    if (canClaim && !mission.isCompleted) {
      playSound('upgrade-success');
      onClaim(mission.upgradeId);
    } else {
      playSound('error');
    }
  };

  const getRewardText = () => {
    switch (mission.reward.type) {
      case 'fire_level':
        return `Ateş Gücü Level ${mission.reward.value}`;
      case 'shield_level':
        return `Kalkan Level ${mission.reward.value}`;
      case 'special_ability':
        return `Özel Yetenek: ${mission.reward.value}`;
      default:
        return 'Bilinmeyen ödül';
    }
  };

  const getProgressPercentage = (req: MissionRequirement) => {
    return Math.min((req.current / req.target) * 100, 100);
  };

  return (
    <div style={{
      backgroundColor: '#2D3748',
      border: '2px solid #4A5568',
      borderRadius: '12px',
      padding: '20px',
      margin: '10px',
      minHeight: '200px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          color: '#FFF', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0' 
        }}>
          🎯 {mission.upgradeName}
        </h3>
        <div style={{ 
          color: getMissionProgressColor(mission, progress),
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {getMissionDisplayText(mission, progress)}
        </div>
      </div>

      {/* Mission Requirements */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          color: '#E2E8F0', 
          fontSize: '14px', 
          margin: '0 0 12px 0' 
        }}>
          📋 Görev Gereksinimleri:
        </h4>
        {progress.map((req, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#CBD5E0', fontSize: '12px' }}>
                {req.description}
              </span>
              <span style={{ 
                color: req.current >= req.target ? '#10b981' : '#E2E8F0',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {req.current}/{req.target}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#4A5568',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${getProgressPercentage(req)}%`,
                height: '100%',
                backgroundColor: req.current >= req.target ? '#10b981' : '#3B82F6',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Reward */}
      <div style={{ 
        backgroundColor: '#1A202C',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 'bold' }}>
          🎁 Ödül:
        </div>
        <div style={{ color: '#E2E8F0', fontSize: '13px' }}>
          {getRewardText()}
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={!canClaim || mission.isCompleted}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: canClaim && !mission.isCompleted ? '#10b981' : '#4A5568',
          color: '#FFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: canClaim && !mission.isCompleted ? 'pointer' : 'not-allowed',
          opacity: canClaim && !mission.isCompleted ? 1 : 0.6,
          transition: 'all 0.2s ease'
        }}
      >
        {mission.isCompleted ? '✅ Ödül Alındı' : canClaim ? '🎁 Ödülü Al' : '🔒 Görev Tamamlanmadı'}
      </button>
    </div>
  );
}; 