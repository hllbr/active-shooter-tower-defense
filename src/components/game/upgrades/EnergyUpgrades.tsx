import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { getUnifiedButtonText, getUnifiedLevelDisplay } from '../../../utils/numberFormatting';

export const EnergyUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const energyUpgrades = useGameStore((s) => s.energyUpgrades);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);

  const upgradeEnergySystem = useGameStore((s) => s.upgradeEnergySystem);
  const calculateEnergyStats = useGameStore((s) => s.calculateEnergyStats);
  const actionsRemaining = useGameStore((s) => s.actionsRemaining);
  const maxActions = useGameStore((s) => s.maxActions);
  const actionRegenTime = useGameStore((s) => s.actionRegenTime);

  const stats = calculateEnergyStats();

  return (
    <div style={{ width: '100%', marginTop: '24px' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: '#00cfff', marginBottom: 12, display: 'block' }}>
        ⚡ Enerji Sistemi Geliştirmeleri
      </span>

      {/* Mevcut Durum */}
      <div style={{
        background: 'rgba(0, 207, 255, 0.1)',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid #00cfff',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Enerji</div>
          <div style={{ color: '#fff', fontSize: '18px' }}>{Math.round(energy)}/{maxEnergy}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Pasif Regen</div>
          <div style={{ color: '#fff', fontSize: '18px' }}>+{stats.passiveRegen.toFixed(1)}/sn</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Kill Bonus</div>
          <div style={{ color: '#fff', fontSize: '18px' }}>+{stats.killBonus + 2}</div>
        </div>
        {/* CRITICAL FIX: Activity bonus system removed to prevent energy flowing backwards */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Verimlilik</div>
          <div style={{ color: '#fff', fontSize: '18px' }}>-{(stats.efficiency * 100).toFixed(0)}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffaa00', fontSize: '14px', fontWeight: 'bold' }}>Aksiyonlar</div>
          <div style={{ color: '#fff', fontSize: '18px' }}>{actionsRemaining}/{maxActions}</div>
          {actionRegenTime < 30000 && (
            <div style={{ color: '#ccc', fontSize: '12px' }}>+1 in {Math.ceil(actionRegenTime / 1000)}s</div>
          )}
        </div>

      </div>

      {/* Upgradeler */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {GAME_CONSTANTS.POWER_MARKET.ENERGY_UPGRADES?.map((upgrade: any) => {
          const currentLevel = energyUpgrades[upgrade.id] || 0;
          const isMaxLevel = currentLevel >= upgrade.maxLevel;
          const nextCost = upgrade.cost * (currentLevel + 1);
          const canAfford = gold >= nextCost && !isMaxLevel;

          return (
            <div
              key={upgrade.id}
              style={{
                background: isMaxLevel ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 207, 255, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${isMaxLevel ? '#4ade80' : canAfford ? '#00cfff' : '#555'}`,
                opacity: isMaxLevel ? 0.8 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: isMaxLevel ? '#4ade80' : '#00cfff', fontSize: '16px' }}>
                  {upgrade.name}
                </h4>
                <div style={{ 
                  color: '#fff', 
                  fontSize: '14px', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '2px 8px', 
                  borderRadius: '4px' 
                }}>
                  {getUnifiedLevelDisplay(currentLevel, upgrade.maxLevel, isMaxLevel)}
                </div>
              </div>
              
              <p style={{ margin: '8px 0', color: '#ccc', fontSize: '14px' }}>
                {upgrade.description}
              </p>

              {currentLevel > 0 && (
                <div style={{ margin: '8px 0', color: '#4ade80', fontSize: '12px' }}>
                  ✓ Seviye {currentLevel} aktif
                </div>
              )}

              <button
                onClick={() => !isMaxLevel && canAfford && upgradeEnergySystem(upgrade.id)}
                disabled={isMaxLevel || !canAfford}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  cursor: (isMaxLevel || !canAfford) ? 'not-allowed' : 'pointer',
                  background: isMaxLevel ? '#333' : canAfford ? '#00cfff' : '#555',
                  color: isMaxLevel ? '#666' : '#fff',
                  border: `2px solid ${isMaxLevel ? '#444' : canAfford ? '#fff' : '#777'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {getUnifiedButtonText(isMaxLevel, canAfford, false, 'upgrade')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 