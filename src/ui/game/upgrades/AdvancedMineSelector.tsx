import React from 'react';
import { advancedMineManager } from '../../../game-systems/mine/AdvancedMineManager';
import { useGameStore } from '../../../models/store';
import { playSound } from '../../../utils/sound';
import type { Mine } from '../../../models/gameTypes';

export const AdvancedMineSelector: React.FC = () => {
  const gold = useGameStore((state) => state.gold);
  // availableMineTypes is not used in this component
  const allMineTypes = advancedMineManager.getAllMineTypes();

  const handleCreateMine = (typeId: string) => {
    const mineType = advancedMineManager.getMineType(typeId);
    if (!mineType || !mineType.isUnlocked || gold < mineType.cost) return;

    // Get a random position for the mine (in practice, this would be player-selected)
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100
    };

    const gameState = useGameStore.getState();
    const mine = advancedMineManager.createAdvancedMine(
      typeId,
      position,
      (mine: Mine) => {
        // Add mine to store state
        useGameStore.setState((state) => ({
          mines: [...state.mines, mine]
        }));
      },
      gameState.addEffect
    );

    if (mine) {
      playSound('mine-place');
    } else {
      playSound('error');
    }
  };

  const getUnlockStatus = (mineType: NonNullable<ReturnType<typeof advancedMineManager.getMineType>>) => {
    if (mineType.unlockCondition.type === 'mission') {
      return {
        isUnlocked: mineType.isUnlocked,
        status: mineType.isUnlocked ? 'Unlocked' : 'Complete Mission to Unlock',
        color: mineType.isUnlocked ? '#10B981' : '#F59E0B'
      };
    } else if (mineType.unlockCondition.type === 'market') {
      return {
        isUnlocked: mineType.isUnlocked,
        status: mineType.isUnlocked ? 'Unlocked' : 'Purchase in Market',
        color: mineType.isUnlocked ? '#10B981' : '#F59E0B'
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
        💣 Advanced Mines
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allMineTypes.map((mineType) => {
          const unlockStatus = getUnlockStatus(mineType);
          const canAfford = gold >= mineType.cost;

          return (
            <div
              key={mineType.id}
              style={{
                background: '#111827',
                border: `1px solid ${unlockStatus.isUnlocked && canAfford ? '#10B981' : '#374151'}`,
                borderRadius: 6,
                padding: 12,
                cursor: unlockStatus.isUnlocked && canAfford ? 'pointer' : 'not-allowed',
                opacity: unlockStatus.isUnlocked ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              onClick={() => unlockStatus.isUnlocked && canAfford && handleCreateMine(mineType.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    color: '#F9FAFB',
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginBottom: 4
                  }}>
                    {mineType.name}
                  </div>
                  <div style={{
                    color: '#9CA3AF',
                    fontSize: 12,
                    marginBottom: 4
                  }}>
                    {mineType.description}
                  </div>
                  <div style={{
                    color: unlockStatus.color,
                    fontSize: 11,
                    fontWeight: 'bold',
                    marginBottom: 4
                  }}>
                    {unlockStatus.status}
                  </div>
                  {unlockStatus.isUnlocked && (
                    <div style={{
                      color: canAfford ? '#10B981' : '#EF4444',
                      fontSize: 11,
                      fontWeight: 'bold'
                    }}>
                      Cost: {mineType.cost} Gold {!canAfford && '(Not enough gold)'}
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <div style={{
                    fontSize: 24,
                    opacity: unlockStatus.isUnlocked ? 1 : 0.5
                  }}>
                    {mineType.icon}
                  </div>
                  {unlockStatus.isUnlocked && (
                    <div style={{
                      fontSize: 10,
                      color: '#9CA3AF',
                      textAlign: 'center'
                    }}>
                      DMG: {mineType.damage}
                      <br />
                      RAD: {mineType.radius}
                    </div>
                  )}
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
        💡 Advanced mines provide strategic advantages
        <br />
        EMP: Stuns enemies | Sticky: Delayed explosion | Chain: Triggers nearby mines
      </div>
    </div>
  );
}; 