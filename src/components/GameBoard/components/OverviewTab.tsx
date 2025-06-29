import React from 'react';
import { useGameStore } from '../../../models/store';
import { formatCurrency, formatPercentage } from '../../../utils/numberFormatting';
import type { Tower } from '../../../models/gameTypes';

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

export const OverviewTab: React.FC = () => {
  const gameState = useGameStore();

  const calculatePowerOverview = (): PowerOverview => {
    const { towers, currentWave, maxEnergy, maxActions } = gameState;
    
    // Calculate total combat power
    const totalDamage = towers.reduce((sum: number, tower: Tower) => sum + tower.damage, 0);
    const totalDefense = towers.reduce((sum: number, tower: Tower) => sum + tower.wallStrength, 0);
    const totalCombatPower = Math.floor(totalDamage * 1.5 + totalDefense * 2);

    // Firepower analysis
    const averageTowerLevel = towers.length > 0 ? towers.reduce((sum: number, tower: Tower) => sum + tower.level, 0) / towers.length : 0;
    const firepowerRank = averageTowerLevel >= 15 ? 'Legend' : 
                         averageTowerLevel >= 10 ? 'Master' : 
                         averageTowerLevel >= 7 ? 'Elite' : 
                         averageTowerLevel >= 4 ? 'Veteran' : 'Rookie';

    // Defense analysis
    const totalWalls = towers.filter((tower: Tower) => tower.wallStrength > 0).length;
    const defenseCoverage = towers.length > 0 ? (totalWalls / towers.length) * 100 : 0;

    // Economy analysis
    const economyTowers = towers.filter((tower: Tower) => tower.towerType === 'economy').length;
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