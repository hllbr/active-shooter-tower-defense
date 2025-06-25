import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { playSound } from '../../../utils/sound';
import { formatCurrency, formatPercentage, formatProfessional, formatSmartPercentage } from '../../../utils/numberFormatting';
import './CommandCenter.css';



const TABS: { [key: string]: string } = {
  overview: 'Genel Bakış',
  builds: 'Mevcut Build',
  achievements: 'Başarımlar',
  statistics: 'İstatistikler',
  strategy: 'Strateji Danışmanı'
};

interface PowerOverview {
  totalCombatPower: number;
  firepower: {
    current: number;
    rank: string;
    progress: number;
  };
  defense: {
    current: number;
    coverage: number;
    wallLevel: number;
  };
  economy: {
    goldPerWave: number;
    efficiency: number;
    investments: number;
  };
  special: {
    energyCapacity: number;
    actionPoints: number;
    abilities: string[];
  };
}

export const CommandCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const gameState = useGameStore();

  useEffect(() => {
    if (isOpen) {
      playSound('levelupwav'); // Temporary - will use command-center-open.wav
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    playSound('levelupwav'); // Temporary - will use ui-tab-switch.wav
  };

  const calculatePowerOverview = (): PowerOverview => {
    const { towers, currentWave, maxEnergy, maxActions } = gameState;
    
    // Calculate total combat power
    const totalDamage = towers.reduce((sum, tower) => sum + tower.damage, 0);
    const totalDefense = towers.reduce((sum, tower) => sum + tower.wallStrength, 0);
    const totalCombatPower = Math.floor(totalDamage * 1.5 + totalDefense * 2);

    // Firepower analysis
    const averageTowerLevel = towers.length > 0 ? towers.reduce((sum, tower) => sum + tower.level, 0) / towers.length : 0;
    const firepowerRank = averageTowerLevel >= 15 ? 'Legend' : 
                         averageTowerLevel >= 10 ? 'Master' : 
                         averageTowerLevel >= 7 ? 'Elite' : 
                         averageTowerLevel >= 4 ? 'Veteran' : 'Rookie';

    // Defense analysis
    const totalWalls = towers.filter(tower => tower.wallStrength > 0).length;
    const defenseCoverage = towers.length > 0 ? (totalWalls / towers.length) * 100 : 0;

    // Economy analysis
    const economyTowers = towers.filter(tower => tower.towerType === 'economy').length;
    const estimatedGoldPerWave = 50 + (currentWave * 10) + (economyTowers * 25);

    return {
      totalCombatPower,
      firepower: {
        current: totalDamage,
        rank: firepowerRank,
        progress: Math.min(100, (averageTowerLevel / 20) * 100)
      },
      defense: {
        current: totalDefense,
        coverage: defenseCoverage,
        wallLevel: gameState.wallLevel
      },
      economy: {
        goldPerWave: estimatedGoldPerWave,
        efficiency: Math.min(100, (economyTowers / Math.max(1, towers.length)) * 100),
        investments: economyTowers
      },
      special: {
        energyCapacity: maxEnergy,
        actionPoints: maxActions,
        abilities: ['Yeniden Konumlandırma', 'Enerji Patlaması', 'Savaş Modu']
      }
    };
  };

  const renderOverviewTab = () => {
    const powerData = calculatePowerOverview();

    return (
      <div className="overview-dashboard">
        <div className="power-summary">
          <h3>🎯 Toplam Savaş Gücü</h3>
          <div className="power-meter">
            <div className="power-number">{formatCurrency(powerData.totalCombatPower)}</div>
            <div className="power-rank">Seviye: {powerData.firepower.rank}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card firepower">
            <h4>🔥 Ateş Gücü</h4>
            <div className="stat-value">{formatCurrency(powerData.firepower.current)}</div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill firepower-fill" 
                  style={{ width: `${powerData.firepower.progress}%` }}
                />
              </div>
              <span>{formatPercentage(powerData.firepower.progress / 100)}</span>
            </div>
          </div>

          <div className="stat-card defense">
            <h4>🛡️ Savunma</h4>
            <div className="stat-value">{powerData.defense.current}</div>
            <div className="stat-detail">
              Kapsama: {formatPercentage(powerData.defense.coverage / 100)}
            </div>
            <div className="stat-detail">
              Duvar Seviyesi: {powerData.defense.wallLevel}
            </div>
          </div>

          <div className="stat-card economy">
            <h4>💰 Ekonomi</h4>
            <div className="stat-value">{formatCurrency(powerData.economy.goldPerWave)}/dalga</div>
            <div className="stat-detail">
              Verimlilik: {formatPercentage(powerData.economy.efficiency / 100)}
            </div>
            <div className="stat-detail">
              Yatırımlar: {powerData.economy.investments}
            </div>
          </div>

          <div className="stat-card special">
            <h4>⚡ Özel Yetenekler</h4>
            <div className="stat-value">{powerData.special.energyCapacity}</div>
            <div className="stat-detail">
              Eylem Puanı: {gameState.actionsRemaining}/{powerData.special.actionPoints}
            </div>
            <div className="abilities-list">
              {powerData.special.abilities.map((ability, index) => (
                <div key={index} className="ability-tag">{ability}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBuildsTab = () => {
    const { towers, bulletLevel, fireUpgradesPurchased, shieldUpgradesPurchased } = gameState;
    
    return (
      <div className="builds-dashboard">
        <div className="build-section">
          <h3>🔥 Ateş Gücü Detayları</h3>
          <div className="build-details">
            <div className="build-item">
              <span className="build-label">Mermi Türü:</span>
              <span className="build-value">Seviye {bulletLevel}</span>
            </div>
            <div className="build-item">
              <span className="build-label">Ateş Yükseltmeleri:</span>
              <span className="build-value">{fireUpgradesPurchased} satın alındı</span>
            </div>
            <div className="build-item">
              <span className="build-label">Ortalama Kule Seviyesi:</span>
              <span className="build-value">
                {towers.length > 0 ? formatProfessional(towers.reduce((sum, tower) => sum + tower.level, 0) / towers.length, 'stats') : '0'}
              </span>
            </div>
            <div className="build-item">
              <span className="build-label">Toplam Hasar/Saniye:</span>
              <span className="build-value">
                {formatProfessional(towers.reduce((sum, tower) => sum + (tower.damage * (1000 / Math.max(100, tower.fireRate))), 0), 'damage')}
              </span>
            </div>
          </div>
        </div>

        <div className="build-section">
          <h3>🛡️ Savunma Sistemi</h3>
          <div className="build-details">
            <div className="build-item">
              <span className="build-label">Kalkan Yükseltmeleri:</span>
              <span className="build-value">{shieldUpgradesPurchased} satın alındı</span>
            </div>
            <div className="build-item">
              <span className="build-label">Toplam Duvar Gücü:</span>
              <span className="build-value">{gameState.globalWallStrength}</span>
            </div>
            <div className="build-item">
              <span className="build-label">Mayın Seviyesi:</span>
              <span className="build-value">{gameState.mineLevel}</span>
            </div>
            <div className="build-item">
              <span className="build-label">Aktif Mayınlar:</span>
              <span className="build-value">{gameState.mines.length}</span>
            </div>
          </div>
        </div>

        <div className="build-section">
          <h3>📦 Paket Satın Alımları</h3>
          <div className="build-details">
            <div className="build-item">
              <span className="build-label">Toplam Paket:</span>
              <span className="build-value">{gameState.packagesPurchased}</span>
            </div>
            <div className="build-item">
              <span className="build-label">Enerji Kapasitesi:</span>
              <span className="build-value">{gameState.maxEnergy}</span>
            </div>
            <div className="build-item">
              <span className="build-label">Maksimum Eylem:</span>
              <span className="build-value">{gameState.maxActions}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatisticsTab = () => {
    const { currentWave, enemiesKilled, totalEnemiesKilled, totalGoldSpent, towers } = gameState;
    
    return (
      <div className="statistics-dashboard">
        <div className="stats-grid">
          <div className="stat-block">
            <h4>📊 Oyun İstatistikleri</h4>
            <div className="stat-line">
              <span>Mevcut Dalga:</span>
              <span className="stat-number">{currentWave}</span>
            </div>
            <div className="stat-line">
              <span>Bu Dalga Öldürülen:</span>
              <span className="stat-number">{enemiesKilled}</span>
            </div>
            <div className="stat-line">
              <span>Toplam Öldürülen:</span>
              <span className="stat-number">{totalEnemiesKilled}</span>
            </div>
            <div className="stat-line">
              <span>Toplam Harcanan:</span>
              <span className="stat-number">{formatCurrency(totalGoldSpent)}</span>
            </div>
          </div>

          <div className="stat-block">
            <h4>🏗️ Yapı İstatistikleri</h4>
            <div className="stat-line">
              <span>Aktif Kuleler:</span>
              <span className="stat-number">{towers.length}/{gameState.maxTowers}</span>
            </div>
            <div className="stat-line">
              <span>Ekonomi Kuleleri:</span>
              <span className="stat-number">{towers.filter(t => t.towerType === 'economy').length}</span>
            </div>
            <div className="stat-line">
              <span>Saldırı Kuleleri:</span>
              <span className="stat-number">{towers.filter(t => t.towerType === 'attack').length}</span>
            </div>
            <div className="stat-line">
              <span>Ortalama Sağlık:</span>
              <span className="stat-number">
                {towers.length > 0 ? formatSmartPercentage(towers.reduce((sum, tower) => sum + (tower.health / tower.maxHealth), 0) / towers.length, 'effectiveness') : '0%'}
              </span>
            </div>
          </div>

          <div className="stat-block">
            <h4>⚡ Enerji & Eylem</h4>
            <div className="stat-line">
              <span>Mevcut Enerji:</span>
              <span className="stat-number">{formatProfessional(gameState.energy, 'stats')}/{gameState.maxEnergy}</span>
            </div>
            <div className="stat-line">
              <span>Kalan Eylem:</span>
              <span className="stat-number">{gameState.actionsRemaining}/{gameState.maxActions}</span>
            </div>
            <div className="stat-line">
              <span>Enerji Verimi:</span>
              <span className="stat-number">{formatSmartPercentage(gameState.energyEfficiency, 'effectiveness')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategyTab = () => {
    const { currentWave, towers, gold, enemies } = gameState;
    
    const getStrategicAdvice = () => {
      const advice = [];
      
      if (towers.length < 3) {
        advice.push({
          priority: 'Yüksek',
          action: 'Daha fazla kule inşa et',
          reason: 'Savunma yetersiz - en az 3 kule gerekli',
          cost: GAME_CONSTANTS.TOWER_COST
        });
      }
      
      const lowHealthTowers = towers.filter(tower => tower.health / tower.maxHealth < 0.5);
      if (lowHealthTowers.length > 0) {
        advice.push({
          priority: 'Yüksek',
          action: 'Hasarlı kuleleri onar',
          reason: `${lowHealthTowers.length} kule kritik hasarda`,
          cost: 0
        });
      }
      
      if (gold > 1000 && currentWave > 5) {
        advice.push({
          priority: 'Orta',
          action: 'Mevcut kuleleri yükselt',
          reason: 'Yeterli kaynak var, güçlenme zamanı',
          cost: 200
        });
      }
      
      if (enemies.length > 5 && towers.filter(t => t.towerType === 'attack').length < 2) {
        advice.push({
          priority: 'Yüksek',
          action: 'Saldırı kulesi ekle',
          reason: 'Çok sayıda düşman var',
          cost: GAME_CONSTANTS.TOWER_COST
        });
      }
      
      return advice;
    };

    const strategicAdvice = getStrategicAdvice();
    
    return (
      <div className="strategy-dashboard">
        <div className="strategy-overview">
          <h3>🎯 Mevcut Durum Analizi</h3>
          <div className="strategy-rating">
            <span className="rating-label">Genel Değerlendirme:</span>
            <span className={`rating-badge ${towers.length >= 5 ? 'rating-a' : towers.length >= 3 ? 'rating-b' : 'rating-c'}`}>
              {towers.length >= 5 ? 'A' : towers.length >= 3 ? 'B' : 'C'}
            </span>
          </div>
        </div>

        <div className="recommendations">
          <h4>📋 Öneriler (Dalga {currentWave})</h4>
          {strategicAdvice.map((advice, index) => (
            <div key={index} className={`recommendation-card priority-${advice.priority.toLowerCase()}`}>
              <div className="rec-header">
                <span className="rec-priority">{advice.priority} Öncelik</span>
                <span className="rec-cost">{formatCurrency(advice.cost)}</span>
              </div>
              <div className="rec-action">{advice.action}</div>
              <div className="rec-reason">{advice.reason}</div>
            </div>
          ))}
          
          {strategicAdvice.length === 0 && (
            <div className="no-recommendations">
              ✅ Mükemmel! Şu anda hiçbir kritik öneri yok.
            </div>
          )}
        </div>

        <div className="next-wave-prep">
          <h4>🔮 Sonraki Dalga Hazırlığı</h4>
          <div className="prep-info">
            <div className="prep-item">
              <span>Dalga {currentWave + 1} Zorluğu:</span>
              <span className={`difficulty ${currentWave % 10 === 0 ? 'boss' : currentWave > 20 ? 'hard' : 'normal'}`}>
                {currentWave % 10 === 0 ? 'Boss' : currentWave > 20 ? 'Zor' : 'Normal'}
              </span>
            </div>
            <div className="prep-item">
              <span>Tahmini Düşman Sayısı:</span>
              <span>{GAME_CONSTANTS.getWaveEnemiesRequired(currentWave + 1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievementsTab = () => {
    const { achievements } = gameState;
    
    // Convert achievements object to array and filter visible ones  
    const achievementsList = achievements ? Object.values(achievements).filter(achievement => !achievement.hidden) : [];
    const completedCount = achievementsList.filter(a => a.completed).length;
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
            achievementsList.map((achievement) => (
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'builds':
        return renderBuildsTab();
      case 'achievements':
        return renderAchievementsTab();
      case 'statistics':
        return renderStatisticsTab();
      case 'strategy':
        return renderStrategyTab();
      default:
        return <div>Bu sekme henüz geliştiriliyor...</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-center-overlay">
      <div className="command-center-window">
        <div className="command-center-header">
          <div className="command-center-title">
            <span>🎯</span>
            KOMUTA MERKEZİ
            <span className="wave-indicator">🌊 Dalga {gameState.currentWave}</span>
          </div>
          <button className="close-button" onClick={onClose} title="Kapat (ESC)">
            ✕
          </button>
        </div>

        <div className="tab-navigation">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => switchTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; 