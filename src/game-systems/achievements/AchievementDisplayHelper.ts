import type { Achievement } from '../../models/gameTypes';

export class AchievementDisplayHelper {
  // Get achievement category display info
  public getCategoryInfo(category: Achievement['category']): { icon: string; name: string; color: string } {
    switch (category) {
      case 'progression':
        return { icon: '🌊', name: 'İlerleme', color: '#3b82f6' };
      case 'upgrade':
        return { icon: '🔥', name: 'Yükseltme', color: '#ef4444' };
      case 'economy':
        return { icon: '💰', name: 'Ekonomi', color: '#f59e0b' };
      case 'building':
        return { icon: '🏰', name: 'İnşaat', color: '#8b5cf6' };
      case 'combat':
        return { icon: '⚔️', name: 'Savaş', color: '#dc2626' };
      case 'special':
        return { icon: '⚡', name: 'Özel', color: '#7c3aed' };
      case 'defense':
        return { icon: '🛡️', name: 'Savunma', color: '#059669' };
      default:
        return { icon: '🏆', name: 'Genel', color: '#6b7280' };
    }
  }

  // Get rarity display info
  public getRarityInfo(rarity: Achievement['rarity']): { color: string; glow: string } {
    switch (rarity) {
      case 'common':
        return { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' };
      case 'rare':
        return { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'epic':
        return { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' };
      case 'legendary':
        return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' };
      default:
        return { color: '#6b7280', glow: 'rgba(107, 114, 128, 0.3)' };
    }
  }

  // Create achievement unlock notification
  public createUnlockNotification(achievement: Achievement): {
    type: 'success';
    message: string;
    duration: number;
  } {
    const rarityText = achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1);
    
    return {
      type: 'success',
      message: `🏆 ${achievement.title} - ${rarityText} başarı açıldı! ${achievement.rewards.description}`,
      duration: 5000 // 5 seconds for achievements
    };
  }

  // Get progress percentage for display
  public getProgressPercentage(achievement: Achievement): number {
    return Math.min((achievement.progress / achievement.target) * 100, 100);
  }

  // Get progress text for display
  public getProgressText(achievement: Achievement): string {
    if (achievement.completed) {
      return 'Tamamlandı!';
    }
    return `${achievement.progress}/${achievement.target}`;
  }

  // Check if achievement is hidden
  public isAchievementHidden(achievement: Achievement): boolean {
    return achievement.hidden === true;
  }

  // Get achievement status for display
  public getAchievementStatus(achievement: Achievement): 'locked' | 'in_progress' | 'completed' {
    if (achievement.completed) {
      return 'completed';
    }
    if (achievement.progress > 0) {
      return 'in_progress';
    }
    return 'locked';
  }
} 