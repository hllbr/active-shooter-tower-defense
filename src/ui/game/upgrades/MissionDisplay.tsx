import React, { useMemo } from 'react';
import { useGameStore } from '../../../models/store';
import { missionManager, type SequentialMission, type GameplayReward } from '../../../game-systems/MissionManager';
import { playSound } from '../../../utils/sound';

/**
 * Mission Display Component - Shows current mission and progress
 */
export const MissionDisplay: React.FC = () => {
  const currentMission = missionManager.getCurrentMission();
  const missionProgress = missionManager.getMissionProgress();
  const activeRewards = missionManager.getActiveGameplayRewards();

  // Memoized mission data
  const missionData = useMemo(() => {
    if (!currentMission) return null;

    const progressPercentage = (currentMission.progress / currentMission.maxProgress) * 100;
    const isCompleted = currentMission.completed;
    const hasGameplayReward = !!currentMission.gameplayReward;

    return {
      mission: currentMission,
      progressPercentage,
      isCompleted,
      hasGameplayReward
    };
  }, [currentMission]);

  // Handle mission completion notification
  const handleMissionComplete = (mission: SequentialMission) => {
    // Play completion sound
    playSound('mission-complete');
    
    // Show notification
    useGameStore.getState().addNotification({
      id: `mission-${mission.id}`,
      type: 'success',
      message: `🎯 Görev Tamamlandı: ${mission.name}`,
      timestamp: Date.now(),
      duration: 5000
    });
  };

  if (!missionData) {
    return (
      <div style={missionDisplayStyles.container}>
        <div style={missionDisplayStyles.noMission}>
          <h3 style={missionDisplayStyles.noMissionTitle}>🎯 Tüm Görevler Tamamlandı!</h3>
          <p style={missionDisplayStyles.noMissionText}>
            Tebrikler! Tüm 300 görevi başarıyla tamamladınız.
          </p>
        </div>
      </div>
    );
  }

  const { mission, progressPercentage, isCompleted, hasGameplayReward } = missionData;

  return (
    <div style={missionDisplayStyles.container}>
      {/* Mission Header */}
      <div style={missionDisplayStyles.header}>
        <div style={missionDisplayStyles.missionInfo}>
          <h3 style={missionDisplayStyles.missionTitle}>
            🎯 {mission.name}
          </h3>
          <span style={missionDisplayStyles.missionNumber}>
            Görev #{mission.missionNumber}/300
          </span>
        </div>
        <div style={missionDisplayStyles.difficulty}>
          <span style={getDifficultyStyle(mission.difficulty)}>
            {getDifficultyText(mission.difficulty)}
          </span>
        </div>
      </div>

      {/* Mission Description */}
      <div style={missionDisplayStyles.description}>
        <p style={missionDisplayStyles.descriptionText}>
          {mission.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={missionDisplayStyles.progressContainer}>
        <div style={missionDisplayStyles.progressBar}>
          <div 
            style={{
              ...missionDisplayStyles.progressFill,
              width: `${progressPercentage}%`,
              backgroundColor: isCompleted ? '#4ade80' : '#3b82f6'
            }}
          />
        </div>
        <div style={missionDisplayStyles.progressText}>
          {mission.progress} / {mission.maxProgress}
        </div>
      </div>

      {/* Mission Rewards */}
      <div style={missionDisplayStyles.rewardsContainer}>
        <h4 style={missionDisplayStyles.rewardsTitle}>🎁 Ödüller:</h4>
        
        {/* Regular Reward */}
        <div style={missionDisplayStyles.rewardItem}>
          <span style={missionDisplayStyles.rewardIcon}>
            {getRewardIcon(mission.reward.type)}
          </span>
          <span style={missionDisplayStyles.rewardText}>
            {mission.reward.description}
          </span>
        </div>

        {/* Gameplay Reward */}
        {hasGameplayReward && mission.gameplayReward && (
          <div style={missionDisplayStyles.rewardItem}>
            <span style={missionDisplayStyles.rewardIcon}>
              ⚡
            </span>
            <span style={missionDisplayStyles.rewardText}>
              {mission.gameplayReward.description}
            </span>
            {mission.gameplayReward.duration > 0 && (
              <span style={missionDisplayStyles.durationText}>
                ({Math.round(mission.gameplayReward.duration / 1000)}s)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active Rewards */}
      {activeRewards.length > 0 && (
        <div style={missionDisplayStyles.activeRewardsContainer}>
          <h4 style={missionDisplayStyles.activeRewardsTitle}>⚡ Aktif Bonuslar:</h4>
          {activeRewards.map((reward, index) => (
            <div key={index} style={missionDisplayStyles.activeRewardItem}>
              <span style={missionDisplayStyles.activeRewardIcon}>
                {getGameplayRewardIcon(reward.type)}
              </span>
              <span style={missionDisplayStyles.activeRewardText}>
                {reward.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Overall Progress */}
      <div style={missionDisplayStyles.overallProgress}>
        <div style={missionDisplayStyles.overallProgressBar}>
          <div 
            style={{
              ...missionDisplayStyles.overallProgressFill,
              width: `${missionProgress}%`
            }}
          />
        </div>
        <div style={missionDisplayStyles.overallProgressText}>
          Genel İlerleme: {missionProgress.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

/**
 * Get difficulty style
 */
const getDifficultyStyle = (difficulty: string): React.CSSProperties => {
  const styles = {
    easy: { backgroundColor: '#10b981', color: 'white' },
    medium: { backgroundColor: '#f59e0b', color: 'white' },
    hard: { backgroundColor: '#ef4444', color: 'white' },
    expert: { backgroundColor: '#8b5cf6', color: 'white' },
    legendary: { backgroundColor: '#dc2626', color: 'white' }
  };
  return styles[difficulty as keyof typeof styles] || styles.easy;
};

/**
 * Get difficulty text
 */
const getDifficultyText = (difficulty: string): string => {
  const texts = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
    expert: 'Uzman',
    legendary: 'Efsanevi'
  };
  return texts[difficulty as keyof typeof texts] || 'Kolay';
};

/**
 * Get reward icon
 */
const getRewardIcon = (type: string): string => {
  const icons = {
    gold: '💰',
    energy: '⚡',
    actions: '🎯',
    experience: '📈',
    unlock: '🔓',
    upgrade: '⬆️',
    gameplay_bonus: '⚡'
  };
  return icons[type as keyof typeof icons] || '🎁';
};

/**
 * Get gameplay reward icon
 */
const getGameplayRewardIcon = (type: string): string => {
  const icons = {
    multi_fire: '🎯',
    temporary_mines: '💣',
    tower_repair: '🔧',
    damage_boost: '⚔️',
    gold_bonus: '💰',
    energy_bonus: '⚡'
  };
  return icons[type as keyof typeof icons] || '⚡';
};

/**
 * Mission Display Styles
 */
const missionDisplayStyles = {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '12px',
    padding: '20px',
    margin: '10px 0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  } as React.CSSProperties,

  noMission: {
    textAlign: 'center' as const,
    padding: '20px'
  },

  noMissionTitle: {
    color: '#4ade80',
    margin: '0 0 10px 0',
    fontSize: '18px'
  },

  noMissionText: {
    color: '#9ca3af',
    margin: 0,
    fontSize: '14px'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },

  missionInfo: {
    flex: 1
  },

  missionTitle: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff'
  },

  missionNumber: {
    fontSize: '12px',
    color: '#9ca3af'
  },

  difficulty: {
    marginLeft: '10px'
  },

  description: {
    marginBottom: '15px'
  },

  descriptionText: {
    margin: 0,
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.4'
  },

  progressContainer: {
    marginBottom: '15px'
  },

  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '5px'
  },

  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },

  progressText: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'right' as const
  },

  rewardsContainer: {
    marginBottom: '15px'
  },

  rewardsTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#fbbf24'
  },

  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px'
  },

  rewardIcon: {
    fontSize: '16px',
    marginRight: '8px'
  },

  rewardText: {
    fontSize: '14px',
    color: '#d1d5db',
    flex: 1
  },

  durationText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginLeft: '8px'
  },

  activeRewardsContainer: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },

  activeRewardsTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#3b82f6'
  },

  activeRewardItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px'
  },

  activeRewardIcon: {
    fontSize: '14px',
    marginRight: '8px'
  },

  activeRewardText: {
    fontSize: '12px',
    color: '#93c5fd'
  },

  overallProgress: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },

  overallProgressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '5px'
  },

  overallProgressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    transition: 'width 0.3s ease',
    borderRadius: '3px'
  },

  overallProgressText: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const
  }
}; 