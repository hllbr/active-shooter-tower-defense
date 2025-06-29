import React from 'react';
import { useGameStore } from '../../../../models/store';
import type { Achievement } from '../../../../models/gameTypes';

export const AchievementsTab: React.FC = () => {
  const { achievements } = useGameStore();
  
  // Convert achievements object to array and filter visible ones  
  const achievementsList: Achievement[] = achievements ? Object.values(achievements as Record<string, Achievement>).filter((achievement): achievement is Achievement => !achievement.hidden) : [];
  const completedCount = achievementsList.filter((a: Achievement) => a.completed).length;
  const completionRate = achievementsList.length > 0 ? (completedCount / achievementsList.length) * 100 : 0;

  return (
    <div className="achievements-dashboard">
      <div className="achievements-summary">
        <h3>🏆 Başarım Özeti</h3>
        <div className="completion-stats">
          <div className="completion-circle">
            <div className="completion-number">{completedCount}/{achievementsList.length}</div>
            <div className="completion-label">Tamamlanan</div>
          </div>
          <div className="completion-details">
            <div className="completion-rate">{Math.round(completionRate)}% Tamamlandı</div>
            <div className="completion-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill achievement-fill" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {achievementsList.length > 0 ? (
          achievementsList.map((achievement: Achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.completed ? 'completed' : 'incomplete'} ${achievement.category}`}
            >
              <div className="achievement-header">
                <div className="achievement-title">{achievement.title}</div>
                <div className={`achievement-status ${achievement.completed ? 'completed' : 'in-progress'}`}>
                  {achievement.completed ? '✅' : '⏳'}
                </div>
              </div>
              
              <div className="achievement-description">{achievement.description}</div>
              
              <div className="achievement-progress">
                <div className="progress-text">
                  {Math.min(achievement.progress, achievement.target)} / {achievement.target}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill achievement-progress-fill" 
                    style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                  />
                </div>
              </div>

              {achievement.completed && (
                <div className="achievement-reward">
                  <span>🎁 {achievement.rewards.description}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-achievements">Henüz başarım yok</div>
        )}
      </div>
    </div>
  );
}; 