import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatCurrency } from '../../../utils/numberFormatting';
import type { Tower } from '../../../models/gameTypes';

export const StrategyTab: React.FC = () => {
  const { currentWave, towers, gold, enemies } = useGameStore();
  
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
    
    const lowHealthTowers = towers.filter((tower: Tower) => tower.health / tower.maxHealth < 0.5);
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
    
    if (enemies.length > 5 && towers.filter((t: Tower) => t.towerType === 'attack').length < 2) {
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