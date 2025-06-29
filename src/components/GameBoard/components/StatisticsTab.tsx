import React from 'react';
import { useGameStore } from '../../../models/store';
import { formatCurrency, formatProfessional, formatSmartPercentage } from '../../../utils/numberFormatting';
import type { Tower } from '../../../models/gameTypes';

export const StatisticsTab: React.FC = () => {
  const { currentWave, enemiesKilled, totalEnemiesKilled, totalGoldSpent, towers, maxTowers, energy, maxEnergy, actionsRemaining, maxActions, energyEfficiency } = useGameStore();
  
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
            <span className="stat-number">{towers.length}/{maxTowers}</span>
          </div>
          <div className="stat-line">
            <span>Ekonomi Kuleleri:</span>
            <span className="stat-number">{towers.filter((t: Tower) => t.towerType === 'economy').length}</span>
          </div>
          <div className="stat-line">
            <span>Saldırı Kuleleri:</span>
            <span className="stat-number">{towers.filter((t: Tower) => t.towerType === 'attack').length}</span>
          </div>
          <div className="stat-line">
            <span>Ortalama Sağlık:</span>
            <span className="stat-number">
              {towers.length > 0 ? formatSmartPercentage(towers.reduce((sum: number, tower: Tower) => sum + (tower.health / tower.maxHealth), 0) / towers.length, 'effectiveness') : '0%'}
            </span>
          </div>
        </div>

        <div className="stat-block">
          <h4>⚡ Enerji & Eylem</h4>
          <div className="stat-line">
            <span>Mevcut Enerji:</span>
            <span className="stat-number">{formatProfessional(energy, 'stats')}/{maxEnergy}</span>
          </div>
          <div className="stat-line">
            <span>Kalan Eylem:</span>
            <span className="stat-number">{actionsRemaining}/{maxActions}</span>
          </div>
          <div className="stat-line">
            <span>Enerji Verimi:</span>
            <span className="stat-number">{formatSmartPercentage(energyEfficiency, 'effectiveness')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 