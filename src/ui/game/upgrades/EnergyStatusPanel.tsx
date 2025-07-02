import React from 'react';

interface EnergyStats {
  passiveRegen: number;
  killBonus: number;
  efficiency: number;
}

interface EnergyStatusPanelProps {
  energy: number;
  maxEnergy: number;
  stats: EnergyStats;
  actionsRemaining: number;
  maxActions: number;
  actionRegenTime: number;
}

export const EnergyStatusPanel: React.FC<EnergyStatusPanelProps> = ({
  energy,
  maxEnergy,
  stats,
  actionsRemaining,
  maxActions,
  actionRegenTime
}) => {
  return (
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
  );
}; 