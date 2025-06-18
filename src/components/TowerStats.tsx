import React from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Tower } from '../models/gameTypes';

interface TowerStatsProps {
  tower: Tower;
  slotIdx: number;
}

export const TowerStats: React.FC<TowerStatsProps> = ({ tower, slotIdx }) => {
  const gold = useGameStore((s) => s.gold);
  const upgradePower = useGameStore((s) => s.upgradePower);
  const upgradeBullet = useGameStore((s) => s.upgradeBullet);

  return (
    <div className="tower-stats">
      <div className="tower-header">
        <div className="tower-level">
          Kule Seviyesi: {tower.level}
          <span className="max-level">/ {GAME_CONSTANTS.TOWER_MAX_LEVEL}</span>
        </div>
        <div className="tower-health">
          ❤️ {Math.round(tower.health)} / {tower.maxHealth}
        </div>
      </div>

      <div className="upgrade-section">
        <div className="upgrade-row">
          <div className="stat-info">
            <span>⚔️ Hasar: {tower.damage}</span>
            <span>⚡ Ateş Hızı: {(1000 / tower.fireRate).toFixed(1)}/sn</span>
          </div>
        </div>

        <div className="upgrade-row">
          <div className="power-info">
            <span>🔥 Ateş Gücü: {Math.round((tower.powerMultiplier - 1) * 4)}/20</span>
            {tower.powerMultiplier < 6 && gold >= GAME_CONSTANTS.POWER_UPGRADE_COST && (
              <button 
                className="upgrade-button power"
                onClick={() => upgradePower(slotIdx)}
              >
                Güç Yükselt ({GAME_CONSTANTS.POWER_UPGRADE_COST})
              </button>
            )}
          </div>
        </div>

        <div className="bullets-section">
          <h4>📦 Mermi Tipleri</h4>
          {GAME_CONSTANTS.BULLET_TYPES.map((bulletType) => {
            const currentLevel = tower.bulletTypeId === bulletType.id ? tower.bulletLevel : 0;
            const canUpgradeBullet = tower.level >= bulletType.requiredTowerLevel && 
                                   (currentLevel < bulletType.maxLevel) &&
                                   gold >= GAME_CONSTANTS.BULLET_UPGRADE_COST;
            const isLocked = tower.level < bulletType.requiredTowerLevel;
            
            return (
              <div key={bulletType.id} className={`bullet-type ${isLocked ? 'locked' : ''}`}>
                <div className="bullet-info">
                  <span className="bullet-name">{bulletType.name}</span>
                  <span className="bullet-level">Seviye: {currentLevel}/{bulletType.maxLevel}</span>
                </div>
                {isLocked ? (
                  <div className="requirement">
                    🔒 Kule Seviyesi {bulletType.requiredTowerLevel} gerekli
                  </div>
                ) : (
                  canUpgradeBullet && (
                    <button 
                      className="upgrade-button bullet"
                      onClick={() => upgradeBullet(slotIdx, bulletType.id)}
                    >
                      Yükselt ({GAME_CONSTANTS.BULLET_UPGRADE_COST})
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .tower-stats {
          background: rgba(0, 0, 0, 0.85);
          border-radius: 12px;
          padding: 16px;
          width: 400px;
          color: white;
          border: 2px solid #2a4365;
        }

        .tower-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 2px solid #2d3748;
          margin-bottom: 16px;
        }

        .tower-level {
          font-size: 18px;
          font-weight: bold;
        }

        .max-level {
          color: #718096;
          font-size: 16px;
        }

        .tower-health {
          font-size: 18px;
          color: #f56565;
        }

        .upgrade-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upgrade-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info {
          display: flex;
          gap: 16px;
          font-size: 16px;
        }

        .power-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: 16px;
        }

        .bullets-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #2d3748;
        }

        .bullets-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #a0aec0;
        }

        .bullet-type {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(45, 55, 72, 0.5);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .bullet-type.locked {
          opacity: 0.7;
          background: rgba(45, 55, 72, 0.3);
        }

        .bullet-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bullet-name {
          font-weight: bold;
          color: #90cdf4;
        }

        .bullet-level {
          font-size: 14px;
          color: #a0aec0;
        }

        .requirement {
          font-size: 14px;
          color: #fc8181;
        }

        .upgrade-button {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .upgrade-button:hover {
          transform: translateY(-1px);
        }

        .upgrade-button.power {
          background: #d69e2e;
        }

        .upgrade-button.power:hover {
          background: #b7791f;
        }

        .upgrade-button.bullet {
          background: #4299e1;
        }

        .upgrade-button.bullet:hover {
          background: #3182ce;
        }
      `}</style>
    </div>
  );
}; 