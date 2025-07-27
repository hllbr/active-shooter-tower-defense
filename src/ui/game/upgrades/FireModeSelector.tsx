import React from 'react';
import { fireModeManager } from '../../../game-systems/tower-system/FireModeManager';
import { useGameStore } from '../../../models/store';
import { playSound } from '../../../utils/sound';

export const FireModeSelector: React.FC = () => {
  const currentWave = useGameStore((state) => state.currentWave);
  const activeFireModes = fireModeManager.getActiveFireModes();

  const handleToggleFireMode = (modeId: string) => {
    const isActive = fireModeManager.toggleFireMode(modeId);
    if (isActive) {
      playSound('upgrade-purchase');
    } else {
      playSound('button-click');
    }
  };

  const getUnlockStatus = (mode: { unlockCondition: { type: string; value: number | string } }) => {
    if (mode.unlockCondition.type === 'wave') {
      const isUnlocked = currentWave >= mode.unlockCondition.value;
      return {
        isUnlocked,
        status: isUnlocked ? 'Unlocked' : `Unlock at Wave ${mode.unlockCondition.value}`,
        color: isUnlocked ? '#10B981' : '#6B7280'
      };
    } else if (mode.unlockCondition.type === 'market') {
      return {
        isUnlocked: false,
        status: 'Purchase in Market',
        color: '#F59E0B'
      };
    }
    return {
      isUnlocked: false,
      status: 'Locked',
      color: '#6B7280'
    };
  };

  return (
    <div style={{
      background: '#1F2937',
      border: '1px solid #374151',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16
    }}>
      <h3 style={{
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center'
      }}>
        🔥 Fire Modes
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['spreadShot', 'chainLightning', 'piercingShot'].map((modeId) => {
          const mode = {
            id: modeId,
            name: modeId === 'spreadShot' ? 'Spread Shot' : modeId === 'chainLightning' ? 'Chain Lightning' : 'Piercing Shot',
            description: modeId === 'spreadShot' ? 'Fires 3-5 smaller bullets in a spread pattern' : 
                        modeId === 'chainLightning' ? 'Damages one target, then jumps to 2-3 nearby enemies' : 
                        'Bullets pass through multiple enemies in a straight line',
            unlockCondition: {
              type: modeId === 'piercingShot' ? 'market' : 'wave',
              value: modeId === 'spreadShot' ? 5 : modeId === 'chainLightning' ? 15 : 'piercing_shot_unlock'
            }
          };
          const unlockStatus = getUnlockStatus(mode);
          const isActive = activeFireModes.some(active => active.id === mode.id);

          return (
            <div
              key={mode.id}
              style={{
                background: isActive ? '#374151' : '#111827',
                border: `1px solid ${isActive ? '#10B981' : '#374151'}`,
                borderRadius: 6,
                padding: 12,
                cursor: unlockStatus.isUnlocked ? 'pointer' : 'not-allowed',
                opacity: unlockStatus.isUnlocked ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              onClick={() => unlockStatus.isUnlocked && handleToggleFireMode(mode.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    color: '#F9FAFB',
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginBottom: 4
                  }}>
                    {mode.name}
                  </div>
                  <div style={{
                    color: '#9CA3AF',
                    fontSize: 12,
                    marginBottom: 4
                  }}>
                    {mode.description}
                  </div>
                  <div style={{
                    color: unlockStatus.color,
                    fontSize: 11,
                    fontWeight: 'bold'
                  }}>
                    {unlockStatus.status}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}>
                  {isActive && (
                    <div style={{
                      background: '#10B981',
                      color: 'white',
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 'bold'
                    }}>
                      ACTIVE
                    </div>
                  )}
                  <div style={{
                    fontSize: 20,
                    opacity: unlockStatus.isUnlocked ? 1 : 0.5
                  }}>
                    {mode.id === 'spreadShot' && '🎯'}
                    {mode.id === 'chainLightning' && '⚡'}
                    {mode.id === 'piercingShot' && '🔫'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: '#374151',
        border: '1px solid #6B7280',
        borderRadius: 6,
        padding: 8,
        marginTop: 12,
        fontSize: 10,
        color: '#9CA3AF',
        textAlign: 'center'
      }}>
        💡 Fire modes override tower class abilities when active
        <br />
        Only one fire mode can be active at a time
      </div>
    </div>
  );
}; 