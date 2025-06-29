import React from 'react';
import { useGameStore } from '../../../models/store';
import { formatProfessional } from '../../../utils/numberFormatting';
import type { Tower } from '../../../models/gameTypes';

export const BuildsTab: React.FC = () => {
  const { towers, bulletLevel, fireUpgradesPurchased, shieldUpgradesPurchased, globalWallStrength, mineLevel, mines, packagesPurchased, maxEnergy, maxActions } = useGameStore();
  
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
              {towers.length > 0 ? formatProfessional(towers.reduce((sum: number, tower: Tower) => sum + tower.level, 0) / towers.length, 'stats') : '0'}
            </span>
          </div>
          <div className="build-item">
            <span className="build-label">Toplam Hasar/Saniye:</span>
            <span className="build-value">
              {formatProfessional(towers.reduce((sum: number, tower: Tower) => sum + (tower.damage * (1000 / Math.max(100, tower.fireRate))), 0), 'damage')}
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
            <span className="build-value">{globalWallStrength}</span>
          </div>
          <div className="build-item">
            <span className="build-label">Mayın Seviyesi:</span>
            <span className="build-value">{mineLevel}</span>
          </div>
          <div className="build-item">
            <span className="build-label">Aktif Mayınlar:</span>
            <span className="build-value">{mines.length}</span>
          </div>
        </div>
      </div>

      <div className="build-section">
        <h3>📦 Paket Satın Alımları</h3>
        <div className="build-details">
          <div className="build-item">
            <span className="build-label">Toplam Paket:</span>
            <span className="build-value">{packagesPurchased}</span>
          </div>
          <div className="build-item">
            <span className="build-label">Enerji Kapasitesi:</span>
            <span className="build-value">{maxEnergy}</span>
          </div>
          <div className="build-item">
            <span className="build-label">Maksimum Eylem:</span>
            <span className="build-value">{maxActions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 