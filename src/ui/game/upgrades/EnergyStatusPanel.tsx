import React, { useMemo } from 'react';
import type { EnergyCooldownState } from '../../../game-systems/EnergyManager';

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
  cooldownState?: EnergyCooldownState;
}

// Performance-optimized cooldown display component
const CooldownDisplay: React.FC<{ cooldownState: EnergyCooldownState }> = React.memo(({ cooldownState }) => {
  const remainingSeconds = useMemo(() => {
    return Math.ceil(cooldownState.remainingTime / 1000);
  }, [cooldownState.remainingTime]);

  const progressPercentage = useMemo(() => {
    if (cooldownState.duration === 0) return 0;
    return ((cooldownState.duration - cooldownState.remainingTime) / cooldownState.duration) * 100;
  }, [cooldownState.duration, cooldownState.remainingTime]);

  if (!cooldownState.isActive) return null;

  return (
    <div style={{
      background: 'rgba(255, 0, 0, 0.1)',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid #ff4444',
      marginTop: '8px',
      textAlign: 'center',
    }}>
      <div style={{ color: '#ff4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
        ⏳ Enerji Bekleme Süresi
      </div>
      <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
        {remainingSeconds}s kaldı
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressPercentage}%`,
          height: '100%',
          background: '#ff4444',
          transition: 'width 0.1s ease-out'
        }} />
      </div>
    </div>
  );
});

CooldownDisplay.displayName = 'CooldownDisplay';

// Performance-optimized energy bar component
const EnergyBar: React.FC<{ energy: number; maxEnergy: number }> = React.memo(({ energy, maxEnergy }) => {
  const percentage = useMemo(() => {
    return Math.min(100, (energy / maxEnergy) * 100);
  }, [energy, maxEnergy]);

  const barColor = useMemo(() => {
    if (percentage < 20) return '#ff4444';
    if (percentage < 50) return '#ffaa00';
    return '#00cfff';
  }, [percentage]);

  return (
    <div style={{
      width: '100%',
      height: '6px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '4px'
    }}>
      <div style={{
        width: `${percentage}%`,
        height: '100%',
        background: barColor,
        transition: 'width 0.3s ease-out, background-color 0.3s ease-out'
      }} />
    </div>
  );
});

EnergyBar.displayName = 'EnergyBar';

// Performance-optimized action display component
const ActionDisplay: React.FC<{ 
  actionsRemaining: number; 
  maxActions: number; 
  actionRegenTime: number 
}> = React.memo(({ actionsRemaining, maxActions, actionRegenTime }) => {
  const regenText = useMemo(() => {
    if (actionRegenTime >= 30000) return null;
    return `+1 in ${Math.ceil(actionRegenTime / 1000)}s`;
  }, [actionRegenTime]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#ffaa00', fontSize: '14px', fontWeight: 'bold' }}>Aksiyonlar</div>
      <div style={{ color: '#fff', fontSize: '18px' }}>{actionsRemaining}/{maxActions}</div>
      {regenText && (
        <div style={{ color: '#ccc', fontSize: '12px' }}>{regenText}</div>
      )}
    </div>
  );
});

ActionDisplay.displayName = 'ActionDisplay';

export const EnergyStatusPanel: React.FC<EnergyStatusPanelProps> = React.memo(({
  energy,
  maxEnergy,
  stats,
  actionsRemaining,
  maxActions,
  actionRegenTime,
  cooldownState
}) => {
  // Memoize expensive calculations

  const efficiencyDisplay = useMemo(() => {
    return `-${(stats.efficiency * 100).toFixed(0)}%`;
  }, [stats.efficiency]);

  const killBonusDisplay = useMemo(() => {
    return `+${stats.killBonus + 2}`;
  }, [stats.killBonus]);

  const passiveRegenDisplay = useMemo(() => {
    return `+${stats.passiveRegen.toFixed(1)}/sn`;
  }, [stats.passiveRegen]);

  // Memoize the main container style to prevent unnecessary re-renders
  const containerStyle = useMemo(() => ({
    background: 'rgba(0, 207, 255, 0.1)',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid #00cfff',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  }), []);

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Enerji</div>
        <div style={{ color: '#fff', fontSize: '18px' }}>{Math.round(energy)}/{maxEnergy}</div>
        <EnergyBar energy={energy} maxEnergy={maxEnergy} />
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Pasif Regen</div>
        <div style={{ color: '#fff', fontSize: '18px' }}>{passiveRegenDisplay}</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Kill Bonus</div>
        <div style={{ color: '#fff', fontSize: '18px' }}>{killBonusDisplay}</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#00cfff', fontSize: '14px', fontWeight: 'bold' }}>Verimlilik</div>
        <div style={{ color: '#fff', fontSize: '18px' }}>{efficiencyDisplay}</div>
      </div>
      
      <ActionDisplay 
        actionsRemaining={actionsRemaining}
        maxActions={maxActions}
        actionRegenTime={actionRegenTime}
      />
      
      {cooldownState && <CooldownDisplay cooldownState={cooldownState} />}
    </div>
  );
});

EnergyStatusPanel.displayName = 'EnergyStatusPanel'; 