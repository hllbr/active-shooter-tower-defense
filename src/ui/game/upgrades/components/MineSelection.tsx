import React, { useState } from 'react';
import { GAME_CONSTANTS } from '../../../../utils/constants/gameConstants';
import { formatCurrency } from '../../../../utils/formatters';
import { ScrollableList } from '../../../common/ScrollableList';

interface MineSelectionProps {
  onMineSelect: (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string) => void;
  gold: number;
  currentMines: number;
  maxMines: number;
}

export const MineSelection: React.FC<MineSelectionProps> = ({ onMineSelect, gold, currentMines, maxMines }) => {
  const [selectedCategory, setSelectedCategory] = useState<'explosive' | 'utility' | 'area_denial' | null>(null);

  const mineCategories = {
    explosive: { name: 'Explosive', icon: '💥', color: '#dc2626' },
    utility: { name: 'Utility', icon: '⚡', color: '#2563eb' },
    area_denial: { name: 'Area Denial', icon: '🚫', color: '#7c2d12' }
  } as const;

  const renderMineCategory = (category: 'explosive' | 'utility' | 'area_denial') => {
    const categoryInfo = mineCategories[category];
    const mines = GAME_CONSTANTS.MINE_TYPES[category];

    return (
      <div key={category} style={{ marginBottom: 16 }}>
        <div
          style={{
            background: categoryInfo.color,
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer'
          }}
          onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
        >
          {categoryInfo.icon} {categoryInfo.name} {selectedCategory === category ? '▼' : '▶'}
        </div>

        {selectedCategory === category && (
          <div style={{
            background: '#1f2937',
            border: `2px solid ${categoryInfo.color}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: 12
          }}>
            <ScrollableList
              items={Object.entries(mines)}
              renderItem={([mineSubtype, mineConfig]) => {
                const canAfford = gold >= mineConfig.cost;
                const isAvailable = currentMines < maxMines;

                return (
                  <div
                    style={{
                      background: canAfford && isAvailable ? '#374151' : '#4b5563',
                      border: '1px solid #6b7280',
                      borderRadius: 6,
                      padding: 8,
                      marginBottom: 8,
                      cursor: canAfford && isAvailable ? 'pointer' : 'not-allowed',
                      opacity: canAfford && isAvailable ? 1 : 0.6
                    }}
                    onClick={() => {
                      if (canAfford && isAvailable) {
                        onMineSelect(category, mineSubtype);
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          color: '#fbbf24',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {mineConfig.icon} {mineConfig.name}
                        </div>
                        <div style={{
                          color: '#d1d5db',
                          fontSize: 10,
                          marginTop: 2
                        }}>
                          {mineConfig.description}
                        </div>
                        <div style={{
                          color: '#9ca3af',
                          fontSize: 9,
                          marginTop: 2
                        }}>
                          DMG: {mineConfig.damage} | Radius: {mineConfig.radius}
                        </div>
                      </div>
                      <div style={{
                        color: canAfford ? '#10b981' : '#ef4444',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        {formatCurrency(mineConfig.cost)} 💰
                      </div>
                    </div>
                  </div>
                );
              }}
              keyExtractor={([mineSubtype]) => mineSubtype}
              maxHeight="200px"
              containerStyle={{ padding: 0 }}
              itemContainerStyle={{ marginBottom: 8 }}
              emptyMessage="Bu kategoride mayın bulunmuyor"
              emptyIcon="💣"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        color: '#fbbf24',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center'
      }}>
        💣 Select Mine Type ({currentMines}/{maxMines})
      </div>

      {Object.keys(mineCategories).map(category =>
        renderMineCategory(category as 'explosive' | 'utility' | 'area_denial')
      )}

      <div style={{
        background: '#374151',
        border: '1px solid #6b7280',
        borderRadius: 6,
        padding: 8,
        marginTop: 12,
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        ⚠️ Mine Placement Limits: Max {GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_WAVE} per wave
        <br />
        Min distance between mines: {GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MIN_DISTANCE_BETWEEN_MINES}px
      </div>
    </div>
  );
};

